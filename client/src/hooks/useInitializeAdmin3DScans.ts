import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AdminThreeDScanDto } from '../generated-client';
import { http } from '../lib/api';

interface Options {
  milestoneId?: string;
  pageSize?: number;
}

export function useInitializeAdmin3DScans(projectId?: string, options?: Options) {
  const [scans, setScans] = useState<AdminThreeDScanDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = options?.pageSize ?? 6;
  const milestoneId = options?.milestoneId;

  useEffect(() => {
    setPage(1);
  }, [projectId, milestoneId, pageSize]);

  const fetchScans = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await http.admin3DScans.get3DScan(projectId, milestoneId, page, pageSize);
      setScans(response.items ?? []);
      setTotal(response.totalItems ?? 0);
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to load 3D scans.');
    } finally {
      setLoading(false);
    }
  }, [projectId, milestoneId, page, pageSize]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  return {
    scans,
    total,
    page,
    setPage,
    pageSize,
    loading,
    refresh: fetchScans,
  };
}
