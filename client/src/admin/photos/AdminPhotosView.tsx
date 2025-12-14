import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PaginationComponent } from '../../components/PaginationComponent';
import ConfirmationWindowModal from '../../components/ConfirmationWindowModal';
import { toast } from 'sonner';
import { http } from '../../lib/api';
import { format } from 'date-fns';
import { Download, Pencil, Trash2, Upload } from 'lucide-react';
import { PhotoModal, type PhotoVm } from './PhotoModal';

interface Props {
  projectId: string;
  milestones: { id: string; name: string }[];
  projectName: string;
  projectStart?: string | null;
  projectEnd?: string | null;
}

export function AdminPhotosView({ projectId, milestones, projectName, projectStart, projectEnd }: Props) {
  const [photos, setPhotos] = useState<PhotoVm[]>([]);
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoVm | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PhotoVm | null>(null);
  const [busy, setBusy] = useState(false);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const resetSelection = () => {
    setSelectedPhoto(null);
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
    setModalMode('create');
    resetSelection();
    setModalOpen(true);
  };

  const openEdit = (photo: PhotoVm) => {
    setModalMode('edit');
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  const handleSaved = () => {
    fetchPhotos();
  };

  const handleDelete = async () => {
    if (!pendingDelete || busy) return;
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
          <p className="text-muted-foreground text-sm">{projectName}</p>
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

      <PhotoModal
        open={modalOpen}
        mode={modalMode}
        projectId={projectId}
        milestones={milestones}
        photo={selectedPhoto}
        projectStart={projectStart}
        projectEnd={projectEnd}
        onClose={() => { setModalOpen(false); resetSelection(); }}
        onSaved={handleSaved}
      />

      <ConfirmationWindowModal
        isOpen={!!pendingDelete}
        title="Delete photo?"
        message={`Are you sure you want to delete the photo "${pendingDelete?.caption || pendingDelete?.fileName}"?`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
