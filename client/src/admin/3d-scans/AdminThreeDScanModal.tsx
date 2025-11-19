import { useEffect, useMemo, useState } from 'react';
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
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: AdminThreeDScanModalFormValues) => Promise<void>;
}

export function AdminThreeDScanModal({
  open,
  mode,
  scan,
  milestones,
  submitting,
  onClose,
  onSubmit,
}: Props) {
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

  const handleFileChange = (file?: File) => {
    setError(null);
    if (!file) {
      setForm(prev => ({ ...prev, file: undefined }));
      setPreviewUrl(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.glb')) {
      setError('Only .glb files are allowed.');
      setForm(prev => ({ ...prev, file: undefined }));
      return;
    }

    setForm(prev => ({ ...prev, file }));
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async () => {
    if (!form.roomName.trim()) {
      setError('Room name is required.');
      return;
    }
    if (mode === 'create' && !form.file) {
      setError('Please select a .glb file to upload.');
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
          <DialogTitle>{mode === 'create' ? 'Upload new 3D scan' : '3D scan details'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Attach the .glb model and fill in the metadata.'
              : 'Review or edit the scan metadata. File preview is read-only.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>Room name</Label>
              <Input
                value={form.roomName}
                onChange={(e) => setForm(prev => ({ ...prev, roomName: e.target.value }))}
                placeholder="Kitchen, Living room..."
              />
            </div>

            <div>
              <Label>Milestone</Label>
              <Select
                value={form.milestoneId ?? 'none'}
                onValueChange={(value) => setForm(prev => ({ ...prev, milestoneId: value === 'none' ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No milestone</SelectItem>
                  {milestones.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room area (m²)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.roomArea ?? ''}
                  onChange={(e) => setForm(prev => ({ ...prev, roomArea: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label>Scan date</Label>
                <Input
                  type="date"
                  value={form.scannedAt ?? ''}
                  onChange={(e) => setForm(prev => ({ ...prev, scannedAt: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                rows={4}
                value={form.notes ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes for the scan…"
              />
            </div>

            {mode === 'create' && (
              <div>
                <Label>3D model (.glb)</Label>
                <Input
                  type="file"
                  accept=".glb,model/gltf-binary"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-xl border bg-muted/30 p-3">
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
                {mode === 'create' ? 'Select a .glb file to preview the scan.' : 'This scan does not have a preview yet.'}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || (mode === 'create' && !form.file)}>
            {submitting ? 'Saving…' : mode === 'create' ? 'Upload scan' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
