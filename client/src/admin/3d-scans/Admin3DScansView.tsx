import { useState } from 'react';
import { Download, Upload, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PaginationComponent } from '../../components/PaginationComponent';
import { toast } from 'sonner';
import { http } from '../../lib/api';
import type { AdminThreeDScanDto, UploadThreeDScanForm } from '../../generated-client';
import { AdminThreeDScanModal, type AdminThreeDScanModalFormValues } from './AdminThreeDScanModal';
import { useInitializeAdmin3DScans } from '../../hooks/useInitializeAdmin3DScans';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

interface Props {
  projectId: string;
  projectName: string;
  milestones: { id: string; name: string }[];
}

export function Admin3DScansView({ projectId, projectName, milestones }: Props) {
  const { scans, loading, page, setPage, pageSize, total, refresh } = useInitializeAdmin3DScans(projectId);
  const [modalState, setModalState] = useState<{ open: boolean; mode: 'create' | 'edit'; scan?: AdminThreeDScanDto | null }>({
    open: false,
    mode: 'create',
  });
  const [scanPendingDelete, setScanPendingDelete] = useState<AdminThreeDScanDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => setModalState({ open: true, mode: 'create' });
  const openEditModal = (scan: AdminThreeDScanDto) => setModalState({ open: true, mode: 'edit', scan });
  const closeModal = () => setModalState({ open: false, mode: 'create', scan: null });

  const handleSubmit = async (values: AdminThreeDScanModalFormValues) => {
    try {
      setSubmitting(true);
      if (modalState.mode === 'create') {
        console.log("MILESTONE: ", values.milestoneId);
        const payload: UploadThreeDScanForm = {
          projectId,
          milestoneId: values.milestoneId,
          roomName: values.roomName,
          roomArea: values.roomArea,
          scannedAt: values.scannedAt ? new Date(values.scannedAt) : undefined,
          notes: values.notes,
          file: values.file!,
        };
        await http.upload3DScanFile(payload);
        toast.success('3D scan uploaded successfully.');
      } else if (modalState.scan?.id) {
        await http.admin3DScans.update3DScan(modalState.scan.id, {
          roomName: values.roomName,
          milestoneId: values.milestoneId,
          roomArea: values.roomArea,
          scannedAt: values.scannedAt ? new Date(values.scannedAt) : undefined,
          notes: values.notes,
        });
        toast.success('3D scan updated successfully.');
      }
      closeModal();
      refresh();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to save 3D scan.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (scan: AdminThreeDScanDto) => setScanPendingDelete(scan);

  const handleDelete = async () => {
    if (!scanPendingDelete?.id) return;
    try {
      setDeleting(true);
      await http.admin3DScans.delete3DScan(scanPendingDelete.id);
      toast.success('3D scan deleted.');
      setScanPendingDelete(null);
      refresh();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to delete scan.');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">3D room scans</h3>
          <p className="text-sm text-muted-foreground">Project: {projectName}</p>
        </div>
        <Button className="bg-[#F97316] hover:bg-[#F97316]/90" onClick={openCreateModal}>
          <Upload className="size-4 mr-2" />
          Upload scan
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 animate-pulse text-muted-foreground">Loading scans…</Card>
      ) : scans.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No scans uploaded for this project yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {scans.map(scan => (
            <Card
              key={scan.id}
              className="cursor-pointer p-5 hover:shadow-lg transition-all"
              onClick={() => openEditModal(scan)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{scan.roomName}</h4>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {scan.roomArea && <span>{scan.roomArea} m²</span>}
                    {scan.scannedAt && (
                      <span>{format(new Date(scan.scannedAt), 'dd MMM yyyy', { locale: enUS })}</span>
                    )}
                  </div>
                  {scan.milestoneTitle && (
                    <Badge variant="outline" className="mt-3">
                      {scan.milestoneTitle}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(scan.fileUrl ?? '#', '_blank');
                    }}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(scan);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(scan);
                    }}
                  >
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

      <AdminThreeDScanModal
        open={modalState.open}
        mode={modalState.mode}
        scan={modalState.scan}
        milestones={milestones}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!scanPendingDelete} onOpenChange={(open) => !open && !deleting && setScanPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this 3D scan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the record and delete the file from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={() => setScanPendingDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
