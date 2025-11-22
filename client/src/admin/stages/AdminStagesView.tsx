import {useCallback, useEffect, useMemo, useState} from 'react';
import {Badge} from '../../components/ui/badge';
import {Button} from '../../components/ui/button';
import {Card} from '../../components/ui/card';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../../components/ui/dialog';
import {Input} from '../../components/ui/input';
import {Label} from '../../components/ui/label';
import {Textarea} from '../../components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '../../components/ui/select';
import {Slider} from '../../components/ui/slider';
import {PaginationComponent} from '../../components/PaginationComponent';
import {toast} from 'sonner';
import {http} from '../../lib/api';
import {format} from 'date-fns';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '../../components/ui/alert-dialog';
import {Pencil, Trash2} from 'lucide-react';

export interface MilestoneViewModel {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  progressPercentage: number;
  orderIndex: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
}

interface Props {
  projectId: string;
  onMilestonesChanged?: (milestones: MilestoneViewModel[]) => void;
}

const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'InProgress', label: 'In progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'OnHold', label: 'On hold' },
];

export function AdminStagesView({ projectId, onMilestonesChanged }: Props) {
  const [stages, setStages] = useState<MilestoneViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MilestoneViewModel | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Pending',
    progressPercentage: 0,
    plannedStartDate: '',
    plannedEndDate: '',
    orderIndex: '',
  });

  const [pendingDelete, setPendingDelete] = useState<MilestoneViewModel | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      status: 'Pending',
      progressPercentage: 0,
      plannedStartDate: '',
      plannedEndDate: '',
      orderIndex: '',
    });
    setEditing(null);
  };

  const fetchStages = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await http.adminStages.getStages(projectId, page, pageSize);
      const items = (res.items ?? []).map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        status: m.status,
        progressPercentage: m.progressPercentage,
        orderIndex: m.orderIndex,
        plannedStartDate: m.plannedStartDate,
        plannedEndDate: m.plannedEndDate,
      })) as MilestoneViewModel[];
      setStages(items);
      setTotal(res.totalItems ?? items.length);
      onMilestonesChanged?.(items);
    } catch (err: any) {
      toast.error(err?.message ?? 'Unable to load stages.');
    } finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize, onMilestonesChanged]);

  useEffect(() => {
    setPage(1);
  }, [projectId]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (stage: MilestoneViewModel) => {
    setEditing(stage);
    setForm({
      title: stage.title,
      description: stage.description ?? '',
      status: stage.status,
      progressPercentage: stage.progressPercentage,
      plannedStartDate: stage.plannedStartDate ? String(stage.plannedStartDate) : '',
      plannedEndDate: stage.plannedEndDate ? String(stage.plannedEndDate) : '',
      orderIndex: String(stage.orderIndex ?? ''),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Stage title is required.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description || null,
        status: form.status,
        progressPercentage: form.progressPercentage,
        plannedStartDate: form.plannedStartDate || null,
        plannedEndDate: form.plannedEndDate || null,
        orderIndex: form.orderIndex ? Number(form.orderIndex) : undefined,
      };

      if (editing) {
        await http.adminStages.updateStage(projectId, editing.id, payload);
        toast.success('Stage updated.');
      } else {
        await http.adminStages.createStage(projectId, payload);
        toast.success('Stage created.');
      }
      setDialogOpen(false);
      resetForm();
      fetchStages();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save stage.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await http.adminStages.deleteStage(projectId, pendingDelete.id);
      toast.success('Stage deleted.');
      setPendingDelete(null);
      fetchStages();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete stage.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Construction stages</h3>
        <Button className="bg-[#F97316] hover:bg-[#F97316]/90" onClick={openCreate}>
          Add stage
        </Button>
      </div>

      {loading ? (
        <Card className="p-6 animate-pulse text-muted-foreground">Loading stages…</Card>
      ) : stages.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No stages for this project yet.</Card>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, idx) => (
            <Card key={stage.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                  {stage.orderIndex || idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold">{stage.title}</h4>
                        <Badge variant="outline">{stage.status}</Badge>
                      </div>
                      {stage.description && <p className="text-muted-foreground">{stage.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(stage)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setPendingDelete(stage)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-4">
                    {stage.plannedStartDate && (
                      <span>Start: {format(new Date(stage.plannedStartDate), 'dd MMM yyyy')}</span>
                    )}
                    {stage.plannedEndDate && (
                      <span>Finish: {format(new Date(stage.plannedEndDate), 'dd MMM yyyy')}</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{stage.progressPercentage}%</span>
                    </div>
                    <div className="h-2 rounded bg-muted mt-1 overflow-hidden">
                      <div className="h-full bg-[#F97316]" style={{ width: `${stage.progressPercentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {total > pageSize && (
        <PaginationComponent currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit stage' : 'Add stage'}</DialogTitle>
            <DialogDescription>Set the key dates, status and progress for this stage.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
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
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#F97316] hover:bg-[#F97316]/90">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this stage?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the stage.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} onClick={() => setPendingDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
