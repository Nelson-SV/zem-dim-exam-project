import {useCallback, useEffect, useMemo, useState} from 'react';
import {Card} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Badge} from '../../components/ui/badge';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../../components/ui/dialog';
import {Label} from '../../components/ui/label';
import {Input} from '../../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../../components/ui/select';
import {PaginationComponent} from '../../components/PaginationComponent';
import {toast} from 'sonner';
import {http} from '../../lib/api';
import {format} from 'date-fns';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '../../components/ui/alert-dialog';
import {Download, Pencil, Trash2, Upload} from 'lucide-react';

interface Props {
  projectId: string;
}

interface DocumentVm {
  id: string;
  title: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  uploadedByName?: string | null;
  isVisibleToClient?: boolean | null;
  createdAt?: string | null;
}

export function AdminDocumentsView({ projectId }: Props) {
  const [docs, setDocs] = useState<DocumentVm[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentVm | null>(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('General');
  const [isVisibleToClient, setIsVisibleToClient] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentVm | null>(null);
  const [busy, setBusy] = useState(false);

  const resetModal = () => {
    setEditing(null);
    setTitle('');
    setDocumentType('General');
    setIsVisibleToClient(true);
    setFile(null);
  };

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.adminDocuments.getDocuments(projectId, page, pageSize);
      const items = (res.items ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        documentType: d.documentType,
        fileUrl: d.fileUrl,
        fileName: d.fileName ?? d.filename ?? 'Document',
        uploadedByName: d.uploadedByName,
        isVisibleToClient: d.isVisibleToClient,
        createdAt: d.createdAt,
      })) as DocumentVm[];
      setDocs(items);
      setTotal(res.totalItems ?? items.length);
    } catch (err: any) {
      toast.error(err?.message ?? 'Unable to load documents.');
    } finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [projectId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const openCreate = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEdit = (doc: DocumentVm) => {
    setEditing(doc);
    setTitle(doc.title);
    setDocumentType(doc.documentType ?? 'General');
    setIsVisibleToClient(doc.isVisibleToClient ?? true);
    setFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await http.adminDocuments.updateDocument(projectId, editing.id, {
          title,
          documentType,
          isVisibleToClient,
        });
        toast.success('Document updated.');
      } else {
        if (!file) {
          toast.error('Select a file to upload.');
          setBusy(false);
          return;
        }
        await http.adminDocuments.uploadDocument(projectId, { file, title, documentType, isVisibleToClient });
        toast.success('Document uploaded.');
      }
      setModalOpen(false);
      resetModal();
      fetchDocs();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save document.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await http.adminDocuments.deleteDocument(projectId, pendingDelete.id);
      toast.success('Document deleted.');
      setPendingDelete(null);
      fetchDocs();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete document.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Documents</h3>
        <Button className="bg-[#F97316] hover:bg-[#F97316]/90" onClick={openCreate}>
          <Upload className="size-4 mr-2" />
          Add document
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 animate-pulse text-muted-foreground">Loading documents…</Card>
      ) : docs.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No documents uploaded yet.</Card>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{doc.title}</p>
                    <Badge variant="outline">{doc.documentType}</Badge>
                    {doc.isVisibleToClient === false && <Badge variant="destructive">Admin only</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                    {doc.uploadedByName && <span>By {doc.uploadedByName}</span>}
                    {doc.createdAt && <span>• {format(new Date(doc.createdAt), 'dd MMM yyyy')}</span>}
                    <span>• {doc.fileName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => window.open(doc.fileUrl, '_blank')}>
                    <Download className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openEdit(doc)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setPendingDelete(doc)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {total > pageSize && (
        <PaginationComponent currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) resetModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit document' : 'Add document'}</DialogTitle>
            <DialogDescription>Upload and manage project files.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Permit">Permit</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={isVisibleToClient ? 'true' : 'false'} onValueChange={(v) => setIsVisibleToClient(v === 'true')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Visible to client</SelectItem>
                  <SelectItem value="false">Admin only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); resetModal(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={busy} className="bg-[#F97316] hover:bg-[#F97316]/90">
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>This deletes the DB record and the stored file.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy} onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={handleDelete}>{busy ? 'Deleting…' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
