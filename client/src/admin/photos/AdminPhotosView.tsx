import {useCallback, useEffect, useMemo, useState} from 'react';
import {Card} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Badge} from '../../components/ui/badge';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../../components/ui/dialog';
import {Label} from '../../components/ui/label';
import {Input} from '../../components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../../components/ui/select';
import {Textarea} from '../../components/ui/textarea';
import {PaginationComponent} from '../../components/PaginationComponent';
import {toast} from 'sonner';
import {http} from '../../lib/api';
import {format} from 'date-fns';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '../../components/ui/alert-dialog';
import {Download, Pencil, Trash2, Upload} from 'lucide-react';

interface Props {
  projectId: string;
  milestones: { id: string; name: string }[];
  projectName: string;
}

interface PhotoVm {
  id: string;
  milestoneId?: string | null;
  milestoneTitle?: string | null;
  caption?: string | null;
  takenAt?: string | null;
  fileUrl: string;
  fileName: string;
  createdAt?: string | null;
}

export function AdminPhotosView({ projectId, milestones, projectName }: Props) {
  const [photos, setPhotos] = useState<PhotoVm[]>([]);
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PhotoVm | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [pendingDelete, setPendingDelete] = useState<PhotoVm | null>(null);
  const [busy, setBusy] = useState(false);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const resetModal = () => {
    setEditing(null);
    setCaption('');
    setTakenAt('');
    setMilestoneId('');
    setFile(null);
  };

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const filter = milestoneFilter === 'all' ? undefined : milestoneFilter;
      const res = await http.adminPhotos.getPhotos(projectId, filter, page, pageSize);
      const items = (res.items ?? []).map((p: any) => ({
        id: p.id,
        milestoneId: p.milestoneId,
        milestoneTitle: p.milestoneTitle,
        caption: p.caption,
        takenAt: p.takenAt,
        fileUrl: p.fileUrl,
        fileName: p.fileName ?? p.filename ?? 'Photo',
        createdAt: p.createdAt,
      })) as PhotoVm[];
      setPhotos(items);
      setTotal(res.totalItems ?? items.length);
    } catch (err: any) {
      toast.error(err?.message ?? 'Unable to load photos.');
    } finally {
      setLoading(false);
    }
  }, [projectId, milestoneFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [projectId, milestoneFilter]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const openCreate = () => {
    resetModal();
    setModalOpen(true);
  };

  const openEdit = (photo: PhotoVm) => {
    setEditing(photo);
    setCaption(photo.caption ?? '');
    setTakenAt(photo.takenAt ? photo.takenAt.substring(0, 10) : '');
    setMilestoneId(photo.milestoneId ?? '');
    setFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing && !file) {
      toast.error('Select an image to upload.');
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await http.updatePhoto(projectId, editing.id, {
          caption: caption || null,
          takenAt: takenAt ? new Date(takenAt).toISOString() : null,
          milestoneId: milestoneId || null,
        });
        toast.success('Photo updated.');
      } else if (file) {
        await http.uploadProjectPhoto(projectId, file, caption, takenAt || undefined, milestoneId || undefined);
        toast.success('Photo uploaded.');
      }
      setModalOpen(false);
      resetModal();
      fetchPhotos();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save photo.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await http.adminPhotos.deletePhoto(projectId, pendingDelete.id);
      toast.success('Photo deleted.');
      setPendingDelete(null);
      fetchPhotos();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Photos</h3>
          <p className="text-sm text-muted-foreground">Project: {projectName}</p>
        </div>
        <div className="flex gap-3">
          <Select value={milestoneFilter} onValueChange={(v) => setMilestoneFilter(v)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {milestones.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-[#F97316] hover:bg-[#F97316]/90" onClick={openCreate}>
            <Upload className="size-4 mr-2" />
            Add photo
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-6 animate-pulse text-muted-foreground">Loading photos…</Card>
      ) : photos.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No photos uploaded yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photos.map(photo => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="h-48 bg-muted overflow-hidden">
                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                <img src={photo.fileUrl} alt={photo.caption ?? photo.fileName} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{photo.caption || photo.fileName}</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {photo.takenAt && <div>Taken: {format(new Date(photo.takenAt), 'dd MMM yyyy')}</div>}
                      {photo.createdAt && <div>Uploaded: {format(new Date(photo.createdAt), 'dd MMM yyyy')}</div>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => window.open(photo.fileUrl, '_blank')}>
                      <Download className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openEdit(photo)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setPendingDelete(photo)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {photo.milestoneTitle && <Badge variant="outline">{photo.milestoneTitle}</Badge>}
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
            <DialogTitle>{editing ? 'Edit photo' : 'Add photo'}</DialogTitle>
            <DialogDescription>Upload a new photo or update its details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label>Image file</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Caption</Label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taken at</Label>
                <Input type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={milestoneId || 'none'} onValueChange={(v) => setMilestoneId(v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No stage</SelectItem>
                    {milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the record and delete the stored file.</AlertDialogDescription>
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
