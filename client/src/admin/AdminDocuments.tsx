import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { FileText, Download, Trash2, Upload, Send, CheckCircle, Clock, Eye } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface Document {
    id: string;
    title: string;
    filename: string;
    fileurl: string;
    filesize: number;
    uploadedBy: string;
    createdat: string;
    documenttype: string;
    docusealsubmissionid?: string;
    requiressignature?: boolean;
    issigned?: boolean;
    signedat?: string;
    signedfileurl?: string;
    signedbyuserid?: string;
}

interface Project {
    id: string;
    title: string;
}

const API_URL = 'http://localhost:5001';

export function AdminDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);

    // Signature request state
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signerEmail, setSignerEmail] = useState('');
    const [signerName, setSignerName] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetchDocuments();
        fetchProjects();
    }, []);

    const getToken = () =>
        localStorage.getItem('auth_jwt') || localStorage.getItem('jwt_token') || '';

    const safeJson = async (r: Response) => {
        try {
            return await r.json();
        } catch {
            return { error: await r.text() };
        }
    };

    const fetchDocuments = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/api/documents`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const err = await safeJson(response);
                console.error('Fetch documents failed:', err);
                return;
            }

            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                console.error('Failed to fetch projects');
                return;
            }

            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
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
        setShowUploadModal(true);
        e.target.value = ''; // Reset input
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedProjectId) {
            toast.error('Please select a project');
            return;
        }

        setIsUploading(true);

        try {
            const token = getToken();
            const form = new FormData();

            form.append('file', selectedFile);
            form.append('title', selectedFile.name);
            form.append('projectId', selectedProjectId);

            const res = await fetch(`${API_URL}/api/documents`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });

            if (!res.ok) {
                const err = await safeJson(res);
                toast.error('Upload failed', {
                    description: err.error || `Status ${res.status}`,
                });
                return;
            }

            toast.success('Document uploaded successfully! 📄');

            // Reset state
            setShowUploadModal(false);
            setSelectedFile(null);
            setSelectedProjectId('');

            await fetchDocuments();
        } catch (error: any) {
            console.error(error);
            toast.error('Upload error', { description: error.message ?? 'Unknown error' });
        } finally {
            setIsUploading(false);
        }
    };

    const requestSignature = async () => {
        if (!selectedDoc || !signerEmail || !signerName) {
            toast.error('Please fill all fields');
            return;
        }

        setIsRequesting(true);

        try {
            const token = getToken();

            const response = await fetch(`${API_URL}/api/DocumentSignature/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    documentId: selectedDoc.id,
                    signerEmail: signerEmail,
                    signerName: signerName
                })
            });

            if (!response.ok) {
                const error = await safeJson(response);
                toast.error('Failed to send signature request', {
                    description: error.error || `Status ${response.status}`
                });
                return;
            }

            toast.success('Signature request sent! ✉️', {
                description: `${signerName} will receive an email with signing instructions`
            });

            setShowSignatureModal(false);
            setSelectedDoc(null);
            setSignerEmail('');
            setSignerName('');

            await fetchDocuments();
        } catch (error: any) {
            console.error(error);
            toast.error('Error', {
                description: error.message ?? 'Unknown error'
            });
        } finally {
            setIsRequesting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusBadge = (doc: Document) => {
        if (doc.issigned) {
            return (
                <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="size-3 mr-1" />
                    Signed
                </Badge>
            );
        }

        if (doc.requiressignature) {
            return (
                <Badge variant="default" className="bg-orange-600">
                    <Clock className="size-3 mr-1" />
                    Awaiting signature
                </Badge>
            );
        }

        return null;
    };

    const onOpenSignatureModal = (doc: Document) => {
        setSelectedDoc(doc);
        setTimeout(() => {
            setShowSignatureModal(true);
        }, 0);
    };

    const DocumentCard = ({ doc }: { doc: Document }) => (
        <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="size-5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate font-medium">{doc.title}</h4>
                    {getStatusBadge(doc)}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatFileSize(doc.filesize)}</span>
                    <span>•</span>
                    <span>{format(new Date(doc.createdat), 'dd MMM yyyy', { locale: enUS })}</span>

                    {doc.issigned && doc.signedat && (
                        <>
                            <span>•</span>
                            <span className="text-green-600">
                                Signed on {format(new Date(doc.signedat), 'dd MMM yyyy')}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <Badge variant="secondary">{doc.documenttype || 'PDF'}</Badge>

            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => window.open(doc.fileurl, '_blank')}
                    title="View original document"
                >
                    <Eye className="size-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => window.open(doc.fileurl, '_blank')}
                    title="Download original"
                >
                    <Download className="size-4" />
                </Button>

                {!doc.requiressignature && !doc.issigned && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => onOpenSignatureModal(doc)}
                        className="text-[#F97316] hover:text-[#F97316]"
                        title="Request signature"
                    >
                        <Send className="size-4" />
                    </Button>
                )}

                {doc.issigned && doc.signedfileurl && (
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => window.open(doc.signedfileurl, '_blank')}
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
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const companyDocs = documents.filter(
        (d) => d.uploadedBy === 'company' || d.uploadedBy === 'admin',
    );
    const clientDocs = documents.filter((d) => d.uploadedBy === 'client');

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
                            No documents uploaded yet
                        </div>
                    )}
                </Card>
            </div>

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
                            Client has not uploaded any documents yet
                        </div>
                    )}
                </Card>
            </div>

            {/* Upload Modal - SELECT PROJECT */}
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
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            This document will be associated with the selected project.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowUploadModal(false);
                                setSelectedFile(null);
                                setSelectedProjectId('');
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

            {/* Request Signature Modal */}
            <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Signature</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Document</Label>
                            <Input value={selectedDoc?.title || ''} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label>Client Email *</Label>
                            <Input
                                type="email"
                                placeholder="client@example.com"
                                value={signerEmail}
                                onChange={(e) => setSignerEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Client Name *</Label>
                            <Input
                                placeholder="John Doe"
                                value={signerName}
                                onChange={(e) => setSignerName(e.target.value)}
                            />
                        </div>

                        <div className="text-sm text-muted-foreground">
                            The client will receive an email with a link to sign this document.
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowSignatureModal(false)}
                            disabled={isRequesting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={requestSignature}
                            disabled={isRequesting}
                            className="bg-[#F97316] hover:bg-[#F97316]/90"
                        >
                            {isRequesting ? 'Sending...' : 'Send Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}