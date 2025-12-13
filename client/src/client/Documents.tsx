// Documents.tsx - UPDATED
import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Upload, PenLine, CheckCircle, Clock, Filter } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { http } from '../lib/api';
import type { DocumentDto, ProjectDto } from '../generated-client';
import { PdfSignatureEditor } from '../components/PdfSignatureEditor';

interface SignaturePosition {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
}

export function Documents() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'uk' ? uk : enUS;
    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [projects, setProjects] = useState<ProjectDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [signingDoc, setSigningDoc] = useState<DocumentDto | null>(null);

    // Filter state
    const [selectedFilterProjectId, setSelectedFilterProjectId] = useState<string>('all');

    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [documentTitle, setDocumentTitle] = useState<string>('');
    const [requiresSignature, setRequiresSignature] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchDocuments = async () => {
        try {
            const data = await http.documents.getAll();
            setDocuments(data ?? []);
        } catch (err: any) {
            console.error(err);
            toast.error(t('clientDocuments.failedToLoad'), {
                description: err.message ?? 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await http.getMyProjects();
            setProjects(data ?? []);
        } catch (err: any) {
            console.error(err);
            toast.error(t('clientDocuments.failedToLoadProjects'), {
                description: err.message ?? 'Unknown error',
            });
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchProjects();
    }, []);

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-';
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

    const handleSign = async (signatureBase64: string, position: SignaturePosition) => {
        if (!signingDoc?.id) return;

        try {
            // Send the signature plus its position to the backend
            await http.documents.signDocument(signingDoc.id, {
                signatureBase64,
                positionX: position.x,
                positionY: position.y,
                positionWidth: position.width,
                positionHeight: position.height,
                pageNumber: position.pageNumber,
            });

            toast.success(t('clientDocuments.documentSigned'));
            await fetchDocuments();
            setSigningDoc(null);
        } catch (err: any) {
            console.error(err);
            toast.error(t('clientDocuments.failedToSign'), {
                description: err.message ?? 'Unknown error',
            });
            throw err;
        }
    };

    const onUploadClick = () => {
        fileInputRef.current?.click();
    };

    const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            toast.error(t('clientDocuments.onlyPdfAllowed'));
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setDocumentTitle('');
        setRequiresSignature(false);
        setShowUploadModal(true);
        e.target.value = '';
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedProjectId) {
            toast.error(t('clientDocuments.pleaseSelectProject'));
            return;
        }

        setIsUploading(true);
        try {
            await http.uploadClientDocument(
                selectedFile,
                selectedProjectId,
                documentTitle || selectedFile.name,
                requiresSignature
            );

            toast.success(t('clientDocuments.documentUploadedSuccess'));

            setShowUploadModal(false);
            setSelectedFile(null);
            setSelectedProjectId('');
            setDocumentTitle('');
            setRequiresSignature(false);

            await fetchDocuments();
        } catch (error: any) {
            console.error(error);
            toast.error(t('clientDocuments.uploadError'), { description: error.message ?? 'Unknown error' });
        } finally {
            setIsUploading(false);
        }
    };

    const DocumentsList = ({ docs }: { docs: DocumentDto[] }) => (
        <div className="space-y-2">
            {docs.map((doc) => (
                <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="truncate font-medium">
                                {doc.title || doc.fileName}
                            </h4>
                            {getStatusBadge(doc)}
                        </div>

                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                            {doc.projectTitle && (
                                <>
                                    <span className="font-medium">{doc.projectTitle}</span>
                                    <span>•</span>
                                </>
                            )}

                            <span>{formatFileSize(doc.fileSize)}</span>

                            {doc.createdAt && (
                                <>
                                    <span>•</span>
                                    <span>
                                        {format(new Date(doc.createdAt as any), 'dd MMM yyyy', {
                                            locale,
                                        })}
                                    </span>
                                </>
                            )}

                            {doc.isSigned && doc.signedAt && (
                                <>
                                    <span>•</span>
                                    <span className="text-green-600">
                                        {t('clientDocuments.signedOn')}{' '}
                                        {format(new Date(doc.signedAt as any), 'dd MMM yyyy', { locale })}
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
                            onClick={() =>
                                window.open(doc.signedFileUrl || doc.fileUrl!, '_blank')
                            }
                            title={doc.isSigned ? t('clientDocuments.viewSignedDocument') : t('clientDocuments.viewDocument')}
                        >
                            <Eye className="size-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() =>
                                window.open(doc.signedFileUrl || doc.fileUrl!, '_blank')
                            }
                            title={t('common.download')}
                        >
                            <Download className="size-4" />
                        </Button>

                        {doc.requiresSignature && !doc.isSigned && (
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => setSigningDoc(doc)}
                                title={t('clientDocuments.signDocument')}
                                className="text-[#F97316] hover:text-[#F97316]"
                            >
                                <PenLine className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">{t('common.loading')}...</div>;
    }

    // Filter documents based on selected project
    const getFilteredDocuments = () => {
        if (selectedFilterProjectId === 'all') {
            return documents;
        }
        return documents.filter(doc => doc.projectId === selectedFilterProjectId);
    };

    // Get project name by ID
    const getProjectName = (projectId?: string) => {
        if (!projectId) return 'Unknown Project';
        return projects.find(p => p.id === projectId)?.title || 'Unknown Project';
    };

    const filteredDocuments = getFilteredDocuments();
    const clientDocs = filteredDocuments.filter((d) => d.uploadedBy === 'client');
    const companyDocs = filteredDocuments.filter((d) => d.uploadedBy !== 'client');

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h2 className="mb-1">{t('clientDocuments.title')}</h2>
                        <p className="text-muted-foreground">
                            {t('clientDocuments.subtitle')}
                        </p>
                    </div>

                    <Button
                        className="bg-[#F97316] hover:bg-[#F97316]/90"
                        type="button"
                        onClick={onUploadClick}
                    >
                        <Upload className="size-4 mr-2" />
                        {t('clientDocuments.uploadDocument')}
                    </Button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={onFileSelected}
                    />
                </div>

                {/* Filter Section */}
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="size-5 text-muted-foreground" />
                            <span className="font-medium">{t('clientDocuments.filterByProject')}</span>
                        </div>
                        <Select
                            value={selectedFilterProjectId}
                            onValueChange={setSelectedFilterProjectId}
                        >
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder={t('clientDocuments.selectProject')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    <div className="flex items-center gap-2">
                                        <span>{t('clientDocuments.allProjects')}</span>
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
                                {t('clientDocuments.clearFilter')}
                            </Button>
                        )}
                    </div>
                </Card>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3>{t('clientDocuments.fromCompany')}</h3>
                        <Badge variant="secondary">{companyDocs.length}</Badge>
                    </div>
                    <Card className="p-6">
                        {companyDocs.length > 0 ? (
                            <DocumentsList docs={companyDocs} />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('clientDocuments.noCompanyDocuments')}
                            </div>
                        )}
                    </Card>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3>{t('clientDocuments.myDocuments')}</h3>
                        <Badge variant="secondary">{clientDocs.length}</Badge>
                    </div>
                    <Card className="p-6">
                        {clientDocs.length > 0 ? (
                            <DocumentsList docs={clientDocs} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                {t('clientDocuments.noOwnDocuments')}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* PDF Signature Editor Modal */}
            {signingDoc && (
                <PdfSignatureEditor
                    pdfUrl={signingDoc.fileUrl!}
                    onSign={handleSign}
                    onCancel={() => setSigningDoc(null)}
                />
            )}

            {/* Upload Modal */}
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('clientDocuments.uploadTitle')}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('clientDocuments.file')}</Label>
                            <Input
                                value={selectedFile?.name || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('clientDocuments.selectProjectRequired')}</Label>
                            <Select
                                value={selectedProjectId}
                                onValueChange={setSelectedProjectId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('clientDocuments.chooseProject')} />
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

                        <div className="space-y-2">
                            <Label>{t('clientDocuments.titleOptional')}</Label>
                            <Input
                                value={documentTitle}
                                onChange={(e) => setDocumentTitle(e.target.value)}
                                placeholder={t('clientDocuments.titlePlaceholder')}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="requiresSignature"
                                checked={requiresSignature}
                                onCheckedChange={(checked) => setRequiresSignature(checked === true)}
                            />
                            <Label
                                htmlFor="requiresSignature"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {t('clientDocuments.requiresSignature')}
                            </Label>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {requiresSignature
                                ? t('clientDocuments.signatureNote')
                                : t('clientDocuments.noSignatureNote')}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowUploadModal(false);
                                setSelectedFile(null);
                                setSelectedProjectId('');
                                setDocumentTitle('');
                                setRequiresSignature(false);
                            }}
                            disabled={isUploading}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || !selectedProjectId}
                            className="bg-[#F97316] hover:bg-[#F97316]/90"
                        >
                            {isUploading ? t('clientDocuments.uploading') : t('clientDocuments.upload')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
