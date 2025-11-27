import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PaginationComponent } from '../../components/PaginationComponent';
import { toast } from 'sonner';
import { http } from '../../lib/api';
import { format } from 'date-fns';
import ConfirmationWindowModal from '../../components/ConfirmationWindowModal';
import { Pencil, Trash2 } from 'lucide-react';
import { StageModal, type MilestoneViewModel } from './StageModal';
export type { MilestoneViewModel } from './StageModal';

interface Props {
  projectId: string;
  onMilestonesChanged?: (milestones: MilestoneViewModel[]) => void;
}

export function AdminStagesView({ projectId, onMilestonesChanged }: Props) {
  const [stages, setStages] = useState<MilestoneViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStage, setSelectedStage] = useState<MilestoneViewModel | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MilestoneViewModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStages = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await http.adminStages.getStages(projectId, page, pageSize);
      const items = (res.items ?? []).map((m: any) => ({
        id: m.id,
        title: m.title,
        notes: m.notes,
        status: m.status,
        progressPercentage: m.progressPercentage ?? 0,
        orderIndex: m.orderIndex ?? 0,
        plannedStartDate: m.plannedStartDate,
        plannedEndDate: m.plannedEndDate,
        actualStartDate: m.actualStartDate,
        actualEndDate: m.actualEndDate,
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
    setModalMode('create');
    setSelectedStage(null);
    setModalOpen(true);
  };

  const openEdit = (stage: MilestoneViewModel) => {
    setModalMode('edit');
    setSelectedStage(stage);
    setModalOpen(true);
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
                      {stage.notes && <p className="text-muted-foreground">{stage.notes}</p>}
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
                  <div className="text-sm text-muted-foreground flex gap-4 flex-wrap">
                    {stage.plannedStartDate && (
                      <span>Planned start: {format(new Date(stage.plannedStartDate), 'dd MMM yyyy')}</span>
                    )}
                    {stage.plannedEndDate && (
                      <span>Planned finish: {format(new Date(stage.plannedEndDate), 'dd MMM yyyy')}</span>
                    )}
                    {stage.actualStartDate && (
                      <span>Actual start: {format(new Date(stage.actualStartDate), 'dd MMM yyyy')}</span>
                    )}
                    {stage.actualEndDate && (
                      <span>Actual finish: {format(new Date(stage.actualEndDate), 'dd MMM yyyy')}</span>
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

      <StageModal
        open={modalOpen}
        mode={modalMode}
        projectId={projectId}
        stage={selectedStage}
        onClose={() => { setModalOpen(false); setSelectedStage(null); }}
        onSaved={() => fetchStages()}
      />

      <ConfirmationWindowModal
        isOpen={!!pendingDelete}
        title="Delete this stage?"
        message={`Are you sure you want to delete the stage "${pendingDelete?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
