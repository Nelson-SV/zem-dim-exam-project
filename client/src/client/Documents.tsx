// Documents.tsx - UPDATED
import { useEffect, useState } from 'react';
import { FileText, Download, Eye, Upload, PenLine } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { http } from '../lib/api';
import type { DocumentDto } from '../generated-client';
import { PdfSignatureEditor } from '../components/PdfSignatureEditor';

interface SignaturePosition {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
}

export function Documents() {
    const [documents, setDocuments] = useState<DocumentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [signingDoc, setSigningDoc] = useState<DocumentDto | null>(null);

    const fetchDocuments = async () => {
        try {
            const data = await http.documents.getAll();
            setDocuments(data ?? []);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to load documents', {
                description: err.message ?? 'Unknown error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getStatusBadge = (doc: DocumentDto) => {
        if (doc.isSigned) {
            return <Badge variant="default" className="bg-green-600">Signed</Badge>;
        }
        if (doc.requiresSignature) {
            return <Badge variant="default" className="bg-orange-600">Awaiting signature</Badge>;
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

            toast.success('Document signed successfully! ✅');
            await fetchDocuments();
            setSigningDoc(null);
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to sign document', {
                description: err.message ?? 'Unknown error',
            });
            throw err;
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
                                            locale: enUS,
                                        })}
                                    </span>
                                </>
                            )}

                            {doc.isSigned && doc.signedAt && (
                                <>
                                    <span>•</span>
                                    <span className="text-green-600">
                                        Signed on{' '}
                                        {format(new Date(doc.signedAt as any), 'dd MMM yyyy')}
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
                            title={doc.isSigned ? 'View signed document' : 'View document'}
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
                            title="Download"
                        >
                            <Download className="size-4" />
                        </Button>

                        {doc.requiresSignature && !doc.isSigned && (
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => setSigningDoc(doc)}
                                title="Sign document"
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
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    const clientDocs = documents.filter((d) => d.uploadedBy === 'client');
    const companyDocs = documents.filter((d) => d.uploadedBy !== 'client');

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                        <h2 className="mb-1">Documents</h2>
                        <p className="text-muted-foreground">
                            Here you can see documents from the company and your own uploads.
                        </p>
                    </div>

                    <Button
                        className="bg-[#F97316] hover:bg-[#F97316]/90"
                        type="button"
                        onClick={() => toast.info('Client upload is not implemented yet.')}
                    >
                        <Upload className="size-4 mr-2" />
                        Upload document
                    </Button>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3>From the company</h3>
                        <Badge variant="secondary">{companyDocs.length}</Badge>
                    </div>
                    <Card className="p-6">
                        {companyDocs.length > 0 ? (
                            <DocumentsList docs={companyDocs} />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No documents from the company yet.
                            </div>
                        )}
                    </Card>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3>My documents</h3>
                        <Badge variant="secondary">{clientDocs.length}</Badge>
                    </div>
                    <Card className="p-6">
                        {clientDocs.length > 0 ? (
                            <DocumentsList docs={clientDocs} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                You have not uploaded any documents yet.
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
        </>
    );
}
