import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { toast } from "sonner";
import type { CreateMilestoneDto, MilestoneDto, UpdateMilestoneDto } from "../../generated-client";
import { http } from "../../lib/api";

export interface MilestoneViewModel {
  id: string;
  title: string;
  notes?: string | null;
  status: string;
  progressPercentage: number;
  orderIndex: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
}

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  projectId: string;
  stage: MilestoneViewModel | null;
  onClose: () => void;
  onSaved: (stage: MilestoneDto, mode: Mode) => void;
};

type FormState = {
  title: string;
  notes: string;
  status: string;
  progressPercentage: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  orderIndex: string;
};

const emptyForm: FormState = {
  title: "",
  notes: "",
  status: "Pending",
  progressPercentage: 0,
  plannedStartDate: "",
  plannedEndDate: "",
  actualStartDate: "",
  actualEndDate: "",
  orderIndex: "",
};

const toInputDate = (value?: string | Date | null) => {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export function StageModal({ open, mode, projectId, stage, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && stage) {
      setForm({
        title: stage.title ?? "",
        notes: stage.notes ?? "",
        status: stage.status ?? "Pending",
        progressPercentage: stage.progressPercentage ?? 0,
        plannedStartDate: toInputDate(stage.plannedStartDate ?? null),
        plannedEndDate: toInputDate(stage.plannedEndDate ?? null),
        actualStartDate: toInputDate(stage.actualStartDate ?? null),
        actualEndDate: toInputDate(stage.actualEndDate ?? null),
        orderIndex: stage.orderIndex != null ? String(stage.orderIndex) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, isEdit, stage]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    return e;
  }, [form.title]);

  const buildPayload = (): CreateMilestoneDto | UpdateMilestoneDto => ({
    title: form.title.trim(),
    progressPercentage: form.progressPercentage,
    status: form.status,
    plannedStartDate: form.plannedStartDate || undefined,
    plannedEndDate: form.plannedEndDate || undefined,
    actualStartDate: isEdit ? form.actualStartDate || undefined : undefined,
    actualEndDate: isEdit ? form.actualEndDate || undefined : undefined,
    notes: form.notes || undefined,
    orderIndex: form.orderIndex ? Number(form.orderIndex) : undefined,
  });

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Please fill required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      let result: MilestoneDto;
      if (isEdit && stage) {
        result = await http.adminStages.updateStage(projectId, stage.id, payload as UpdateMilestoneDto);
        toast.success("Stage updated.");
      } else {
        result = await http.adminStages.createStage(projectId, payload as CreateMilestoneDto);
        toast.success("Stage created.");
      }
      onSaved(result, isEdit ? "edit" : "create");
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save stage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit stage" : "Add stage"}</DialogTitle>
          <DialogDescription>Set the key dates, status and progress for this stage.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Planned start</Label>
              <Input type="date" value={form.plannedStartDate} onChange={(e) => setForm({ ...form, plannedStartDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Planned finish</Label>
              <Input type="date" value={form.plannedEndDate} onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })} />
            </div>
          </div>

          {isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Actual start</Label>
                <Input type="date" value={form.actualStartDate} onChange={(e) => setForm({ ...form, actualStartDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Actual finish</Label>
                <Input type="date" value={form.actualEndDate} onChange={(e) => setForm({ ...form, actualEndDate: e.target.value })} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Progress: {form.progressPercentage}%</Label>
            <Slider value={[form.progressPercentage]} onValueChange={([v]) => setForm({ ...form, progressPercentage: v })} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <Label>Order (optional)</Label>
            <Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: e.target.value })} />
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
