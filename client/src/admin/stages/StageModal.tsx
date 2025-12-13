import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  status: "In Progress",
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

export function StageModal({ open, mode, projectId, stage, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEdit = mode === "edit";

  const statusOptions = [
    { value: "In Progress", label: t('stageModal.inProgress') },
    { value: "Completed", label: t('stageModal.completed') },
  ];

  useEffect(() => {
    if (!open) return;
    if (isEdit && stage) {
      setForm({
        title: stage.title ?? "",
        notes: stage.notes ?? "",
        status: stage.status ?? "In Progress",
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
    if (!form.title.trim()) e.title = t('stageModal.stageNameRequired');
    return e;
  }, [form.title, t]);

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
      toast.error(t('stageModal.fillAllFields'));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      let result: MilestoneDto;
      if (isEdit && stage) {
        result = await http.adminStages.updateStage(projectId, stage.id, payload as UpdateMilestoneDto);
        toast.success(t('stageModal.stageUpdated'));
      } else {
        result = await http.adminStages.createStage(projectId, payload as CreateMilestoneDto);
        toast.success(t('stageModal.stageUpdated'));
      }
      onSaved(result, isEdit ? "edit" : "create");
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? t('stageModal.operationFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('stageModal.editStage') : t('stageModal.editStage')}</DialogTitle>
          <DialogDescription>{t('stageModal.updateStageDetails')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('stageModal.stageName')}</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('stageModal.stageNamePlaceholder')} />
            {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t('stageModal.description')}</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder={t('stageModal.descriptionPlaceholder')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('stageModal.plannedStart')}</Label>
              <Input type="date" value={form.plannedStartDate} onChange={(e) => setForm({ ...form, plannedStartDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('stageModal.plannedFinish')}</Label>
              <Input type="date" value={form.plannedEndDate} onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })} />
            </div>
          </div>

          {isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('stageModal.actualStart')}</Label>
                <Input type="date" value={form.actualStartDate} onChange={(e) => setForm({ ...form, actualStartDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('stageModal.actualFinish')}</Label>
                <Input type="date" value={form.actualEndDate} onChange={(e) => setForm({ ...form, actualEndDate: e.target.value })} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('stageModal.status')}</Label>
            <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('stageModal.progress')}: {form.progressPercentage}%</Label>
            <Slider value={[form.progressPercentage]} onValueChange={([v]) => setForm({ ...form, progressPercentage: v })} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <Label>{t('stageModal.order')}</Label>
            <Input type="number" value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: e.target.value })} placeholder={t('stageModal.orderPlaceholder')} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t('stageModal.cancel')}</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#F97316] hover:bg-[#F97316]/90">
            {saving ? t('stageModal.saving') : t('stageModal.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
