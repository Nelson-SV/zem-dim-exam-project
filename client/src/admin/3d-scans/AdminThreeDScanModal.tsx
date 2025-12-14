import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import RoomViewer from '../../components/3d-files/RoomViewer';
import type { AdminThreeDScanDto } from '../../generated-client';

export interface AdminThreeDScanModalFormValues {
  roomName: string;
  milestoneId?: string;
  roomArea?: number;
  scannedAt?: string;
  notes?: string;
  file?: File | null;
}

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  scan?: AdminThreeDScanDto | null;
  milestones: { id: string; name: string }[];
  projectStart?: string | null;
  projectEnd?: string | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: AdminThreeDScanModalFormValues) => Promise<void>;
}

export function AdminThreeDScanModal({
  open,
  mode,
  scan,
  milestones,
  projectStart,
  projectEnd,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<AdminThreeDScanModalFormValues>({
    roomName: '',
    milestoneId: undefined,
    roomArea: undefined,
    scannedAt: undefined,
    notes: '',
    file: undefined,
  });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = useMemo(() => previewUrl ?? scan?.fileUrl ?? null, [previewUrl, scan?.fileUrl]);

  useEffect(() => {
    if (!open) return;
    setForm({
      roomName: scan?.roomName ?? '',
      milestoneId: scan?.milestoneId ?? undefined,
      roomArea: scan?.roomArea ?? undefined,
      scannedAt: scan?.scannedAt
        ? new Date(scan.scannedAt).toISOString().substring(0, 10)
        : undefined,
      notes: scan?.notes ?? '',
      file: undefined,
    });
    setPreviewUrl(null);
    setZoom(1);
    setRotation(0);
    setError(null);
  }, [open, scan, mode]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toDate = (value?: string | null) => (value ? new Date(`${value}T00:00:00`) : null);

  const handleFileChange = (file?: File) => {
    setError(null);
    if (!file) {
      setForm(prev => ({ ...prev, file: undefined }));
      setPreviewUrl(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.glb')) {
      setError(t('scanModal.onlyGlbAllowed'));
      setForm(prev => ({ ...prev, file: undefined }));
      return;
    }

    setForm(prev => ({ ...prev, file }));
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async () => {
    if (!form.roomName.trim()) {
      setError(t('scanModal.roomNameRequired'));
      return;
    }
    if (mode === 'create' && !form.file) {
      setError(t('scanModal.fileRequired'));
      return;
    }

    const projectStartDate = toDate(projectStart);
    const projectEndDate = toDate(projectEnd);
    const scannedAtDate = toDate(form.scannedAt);

    if (scannedAtDate && projectStartDate && scannedAtDate < projectStartDate) {
      setError('Scan date cannot be before the project start date.');
      return;
    }
    if (scannedAtDate && projectEndDate && scannedAtDate > projectEndDate) {
      setError('Scan date must be on or before the project end date.');
      return;
    }

    await onSubmit({
      roomName: form.roomName.trim(),
      milestoneId: form.milestoneId || undefined,
      roomArea: form.roomArea ? Number(form.roomArea) : undefined,
      scannedAt: form.scannedAt,
      notes: form.notes?.trim() || undefined,
      file: form.file,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !submitting && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('scanModal.uploadScan') : t('scanModal.editScan')}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('scanModal.uploadNewScan')
              : t('scanModal.updateScanDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>{t('scanModal.roomName')}</Label>
              <Input
                value={form.roomName}
                onChange={(e) => setForm(prev => ({ ...prev, roomName: e.target.value }))}
                placeholder={t('scanModal.roomNamePlaceholder')}
              />
            </div>

            <div>
              <Label>{t('scanModal.milestone')}</Label>
              <Select
                value={form.milestoneId ?? 'none'}
                onValueChange={(value) => setForm(prev => ({ ...prev, milestoneId: value === 'none' ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('scanModal.selectMilestone')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('scanModal.noMilestone')}</SelectItem>
                  {milestones.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('scanModal.roomArea')}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.roomArea ?? ''}
                  onChange={(e) => setForm(prev => ({ ...prev, roomArea: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label>{t('scanModal.scanDate')}</Label>
                <Input
                  type="date"
                  value={form.scannedAt ?? ''}
                  min={projectStart || undefined}
                  max={projectEnd || undefined}
                  onChange={(e) => setForm(prev => ({ ...prev, scannedAt: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div>
              <Label>{t('scanModal.notes')}</Label>
              <Textarea
                rows={4}
                value={form.notes ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('scanModal.notesPlaceholder')}
              />
            </div>

            {mode === 'create' && (
              <div>
                <Label>{t('scanModal.scanFile')}</Label>
                <Input
                  type="file"
                  accept=".glb,model/gltf-binary"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-xl p-3">
            {displayUrl ? (
              <RoomViewer
                zoom={zoom}
                rotation={rotation}
                onZoomIn={() => setZoom(z => Math.min(2, z + 0.1))}
                onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))}
                onRotate={() => setRotation(r => r + 30)}
                modelUrl={displayUrl}
              />
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center text-center text-muted-foreground">
                {mode === 'create' ? t('scanModal.selectFileToPreview') : t('scanModal.noPreview')}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {t('scanModal.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || (mode === 'create' && !form.file)}>
            {submitting ? t('scanModal.saving') : mode === 'create' ? t('scanModal.uploadScanButton') : t('scanModal.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
