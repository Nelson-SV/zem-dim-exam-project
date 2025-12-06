// AdminDocuments.tsx (UPDATED with Project Filtering)
import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { FileText, Download, Trash2, Upload, Send, CheckCircle, Clock, Eye, Filter, X, PenLine } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { http } from '../lib/api.ts';
import type { DocumentDto, ProjectDto, UpdateDocumentRequest } from '../generated-client';
import { PdfSignatureEditor } from '../components/PdfSignatureEditor';

interface SignaturePosition {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
}

export function AdminDocuments() {
    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [signingDoc, setSigningDoc] = useState<DocumentDto | null>(null);

    // Filter state
    const [selectedFilterProjectId, setSelectedFilterProjectId] = useState<string>('all');

    // Upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isVisibleToClient, setIsVisibleToClient] = useState(false);
    const [requiresSignature, setRequiresSignature] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [docs, projs] = await Promise.all([
                http.documents.getAll(),
                http.projects.getAllProjects(),
            ]);
            setDocuments(docs);
            setProjects(projs);
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to load documents', {
                description: error.message ?? 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusBadge = (doc: DocumentDto) => {
        if (doc.isSigned) {
            return (
                <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="size-3 mr-1" />
                    Signed
                </Badge>
            );
        }

        if (doc.requiresSignature) {
            return (
                <Badge variant="default" className="bg-orange-600">
                    <Clock className="size-3 mr-1" />
                    Awaiting signature
                </Badge>
            );
        }

        return null;
    };

    const onUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Only PDF files are allowed');
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setIsVisibleToClient(false);
        setRequiresSignature(false);
        setShowUploadModal(true);
        e.target.value = '';
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setIsUploading(true);
        try {
            await http.uploadProjectDocument(
                selectedFile,
                selectedProjectId,
                selectedFile.name,
                isVisibleToClient,
                requiresSignature
            );

            toast.success('Document uploaded successfully! 📄');

            setShowUploadModal(false);
            setSelectedFile(null);
            setSelectedProjectId('');
            setIsVisibleToClient(false);
            setRequiresSignature(false);

            await loadData();
        } catch (error: never) {
            console.error(error);
            toast.error('Upload error', { description: error.message ?? 'Unknown error' });
        } finally {
            setIsUploading(false);
        }
    };

    const markRequiresSignature = async (doc: DocumentDto) => {
        if (!doc.id) return;

        const payload: UpdateDocumentRequest = {
            requiresSignature: true,
            isVisibleToClient: true,
        };

        try {
            await http.documents.update(doc.id, payload);
            toast.success('Document marked as requiring signature');
            await loadData();
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to update document', {
                description: error.message ?? 'Unknown error',
            });
        }
    };

    const handleDelete = async (doc: DocumentDto) => {
        if (!doc.id) return;

        if (!confirm(`Delete document "${doc.title ?? doc.fileName}"?`)) return;

        try {
            await http.documents.delete(doc.id);
            toast.success('Document deleted');
            await loadData();
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to delete document', {
                description: error.message ?? 'Unknown error',
            });
        }
    };

    const handleSign = async (signatureBase64: string, position: SignaturePosition) => {
        if (!signingDoc?.id) return;

        try {
            await http.documents.signDocument(signingDoc.id, {
                signatureBase64,
                positionX: position.x,
                positionY: position.y,
                positionWidth: position.width,
                positionHeight: position.height,
                pageNumber: position.pageNumber,
            });

            toast.success('Document signed successfully! ✅');
            await loadData();
            setSigningDoc(null);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to sign document', {
                description: err.message ?? 'Unknown error',
            });
            throw err;
        }
    };

    // Filter documents based on selected project
    const getFilteredDocuments = () => {
        if (selectedFilterProjectId === 'all') {
            return documents;
        }
        return documents.filter(doc => doc.projectId === selectedFilterProjectId);
    };

    const filteredDocuments = getFilteredDocuments();
    const companyDocs = filteredDocuments.filter(
        (d) => d.uploadedBy === 'company' || d.uploadedBy === 'admin',
    );
    const clientDocs = filteredDocuments.filter((d) => d.uploadedBy === 'client');

    // Get project name by ID
    const getProjectName = (projectId?: string) => {
        if (!projectId) return 'Unknown Project';
        return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
    };

    const DocumentCard = ({ doc }: { doc: DocumentDto }) => (
        <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="size-5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate font-medium">{doc.title ?? doc.fileName}</h4>
                    {getStatusBadge(doc)}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-[#F97316] font-medium">{getProjectName(doc.projectId)}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                    {doc.createdAt && (
                        <>
                            <span>•</span>
                            <span>{format(new Date(doc.createdAt), 'dd MMM yyyy', { locale: enUS })}</span>
                        </>
                    )}

                    {doc.isSigned && doc.signedAt && (
                        <>
                            <span>•</span>
                            <span className="text-green-600">
                                Signed on {format(new Date(doc.signedAt), 'dd MMM yyyy')}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <Badge variant="secondary">{doc.documentType || 'PDF'}</Badge>

            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    title="View original document"
                >
                    <Eye className="size-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    title="Download original"
                >
                    <Download className="size-4" />
                </Button>

                {!doc.isSigned && !doc.requiresSignature && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => markRequiresSignature(doc)}
                        className="text-[#F97316] hover:text-[#F97316]"
                        title="Send to client for signature"
                    >
                        <Send className="size-4" />
                    </Button>
                )}

                {doc.requiresSignature && !doc.isSigned && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => setSigningDoc(doc)}
                        title="Sign document"
                        className="text-blue-600 hover:text-blue-600"
                    >
                        <PenLine className="size-4" />
                    </Button>
                )}

                {doc.isSigned && doc.signedFileUrl && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => window.open(doc.signedFileUrl!, '_blank')}
                        className="text-green-600 hover:text-green-600"
                        title="View signed document"
                    >
                        <CheckCircle className="size-4" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="text-destructive hover:text-destructive"
                    title="Delete document"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="mb-1">Documents</h2>
                    <p className="text-muted-foreground">Project documentation and agreements</p>
                </div>
                <div>
                    <Button
                        className="bg-[#F97316] hover:bg-[#F97316]/90"
                        type="button"
                        onClick={onUploadClick}
                    >
                        <Upload className="size-4 mr-2" />
                        Upload document
                    </Button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={onFileSelected}
                    />
                </div>
            </div>

            {/* Filter Section */}
            <Card className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="size-5 text-muted-foreground" />
                        <span className="font-medium">Filter by Project:</span>
                    </div>
                    <Select
                        value={selectedFilterProjectId}
                        onValueChange={setSelectedFilterProjectId}
                    >
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Select a project..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                    <span>All Projects</span>
                                    <Badge variant="secondary">{documents.length}</Badge>
                                </div>
                            </SelectItem>
                            {projects.map((project) => {
                                const count = documents.filter(d => d.projectId === project.id).length;
                                return (
                                    <SelectItem key={project.id} value={project.id!}>
                                        <div className="flex items-center gap-2">
                                            <span>{project.title}</span>
                                            {count > 0 && (
                                                <Badge variant="secondary">{count}</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {selectedFilterProjectId !== 'all' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFilterProjectId('all')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4 mr-1" />
                            Clear filter
                        </Button>
                    )}

                    <div className="ml-auto text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{filteredDocuments.length}</span> of {documents.length} documents
                    </div>
                </div>
            </Card>

            {/* Company Documents */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3>Company documents</h3>
                    <Badge variant="secondary">{companyDocs.length}</Badge>
                </div>
                <Card className="p-6">
                    {companyDocs.length > 0 ? (
                        <div className="space-y-2">
                            {companyDocs.map((doc) => (
                                <DocumentCard key={doc.id} doc={doc} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {selectedFilterProjectId === 'all'
                                ? 'No documents uploaded yet'
                                : 'No company documents for this project'}
                        </div>
                    )}
                </Card>
            </div>

            {/* Client Documents */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3>Client documents</h3>
                    <Badge variant="secondary">{clientDocs.length}</Badge>
                </div>
                <Card className="p-6">
                    {clientDocs.length > 0 ? (
                        <div className="space-y-2">
                            {clientDocs.map((doc) => (
                                <DocumentCard key={doc.id} doc={doc} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {selectedFilterProjectId === 'all'
                                ? 'Client has not uploaded any documents yet'
                                : 'No client documents for this project'}
                        </div>
                    )}
                </Card>
            </div>

            {/* Upload Modal */}
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>File</Label>
                            <Input
                                value={selectedFile?.name || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Select Project *</Label>
                            <Select
                                value={selectedProjectId}
                                onValueChange={setSelectedProjectId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a project..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id!}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isVisibleToClient"
                                checked={isVisibleToClient}
                                onCheckedChange={(checked) => {
                                    const isChecked = checked === true;
                                    setIsVisibleToClient(isChecked);
                                    // If making invisible, also uncheck signature requirement
                                    if (!isChecked) setRequiresSignature(false);
                                }}
                            />
                            <Label
                                htmlFor="isVisibleToClient"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Make visible to client
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="requiresSignature"
                                checked={requiresSignature}
                                disabled={!isVisibleToClient}
                                onCheckedChange={(checked) => setRequiresSignature(checked === true)}
                            />
                            <Label
                                htmlFor="requiresSignature"
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isVisibleToClient ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                            >
                                Requires signature from client
                            </Label>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {!isVisibleToClient
                                ? 'This document will be internal (visible only to admins).'
                                : requiresSignature
                                ? 'The client will see this document and will be required to sign it.'
                                : 'The client will see this document for information only (no signature required).'}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowUploadModal(false);
                                setSelectedFile(null);
                                setSelectedProjectId('');
                                setIsVisibleToClient(false);
                                setRequiresSignature(false);
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedProjectId}
                            className="bg-[#F97316] hover:bg-[#F97316]/90"
                        >
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PDF Signature Editor Modal */}
            {signingDoc && (
                <PdfSignatureEditor
                    pdfUrl={signingDoc.fileUrl!}
                    onSign={handleSign}
                    onCancel={() => setSigningDoc(null)}
                />
            )}
        </div>
    );
}