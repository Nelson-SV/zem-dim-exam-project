import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import { http } from "../../lib/api";
import type { UpdatePhotoDto } from "../../generated-client";
import { toStringUtcForApi } from "../../lib/date-handler/date";

export type PhotoVm = {
  id: string;
  milestoneId?: string | null;
  milestoneTitle?: string | null;
  caption?: string | null;
  takenAt?: string | null;
  fileUrl: string;
  fileName: string;
  createdAt?: string | null;
};

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  projectId: string;
  milestones: { id: string; name: string }[];
  photo: PhotoVm | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  caption: string;
  takenAt: string;
  milestoneId: string;
  file: File | null;
};

const emptyForm: FormState = {
  caption: "",
  takenAt: "",
  milestoneId: "",
  file: null,
};

export function PhotoModal({ open, mode, projectId, milestones, photo, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && photo) {
      setForm({
        caption: photo.caption ?? "",
        takenAt: photo.takenAt ? photo.takenAt.substring(0, 10) : "",
        milestoneId: photo.milestoneId ?? "",
        file: null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, isEdit, photo]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!isEdit && !form.file) e.file = "Image is required";
    return e;
  }, [form.file, isEdit]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, file: e.target.files?.[0] ?? null }));
  };

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please select an image file");
      return;
    }
    setSaving(true);
    try {
      const takenAtIso = toStringUtcForApi(form.takenAt ? `${form.takenAt}T00:00:00` : null);

      if (isEdit && photo) {
        const dto: UpdatePhotoDto = {
          caption: form.caption || undefined,
          takenAt: takenAtIso ? new Date(takenAtIso) : undefined,
          milestoneId: form.milestoneId || undefined,
        };
        await http.adminPhotos.updatePhoto(projectId, photo.id, dto);
        toast.success("Photo updated.");
        onSaved();
      } else if (form.file) {
        await http.uploadProjectPhoto(
          projectId,
          form.file,
          form.caption || undefined,
          takenAtIso || undefined,
          form.milestoneId || undefined
        );
        toast.success("Photo uploaded.");
        onSaved();
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save photo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit photo" : "Add photo"}</DialogTitle>
          <DialogDescription>Upload a new photo or update its details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEdit && (
            <div className="space-y-2">
              <Label>Image file</Label>
              <Input type="file" accept="image/*" onChange={handleFile} />
              {errors.file && <p className="text-destructive text-sm">{errors.file}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Taken at</Label>
              <Input type="date" value={form.takenAt} onChange={(e) => setForm({ ...form, takenAt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={form.milestoneId || "none"} onValueChange={(v) => setForm(prev => ({ ...prev, milestoneId: v === "none" ? "" : v }))}>
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
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#F97316] hover:bg-[#F97316]/90">
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
