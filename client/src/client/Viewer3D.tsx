import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2  } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import RoomViewer from '../components/3d-files/RoomViewer';
import type { User3DScanDto, User3DScanProjectDto } from '../generated-client';
import { useAuth } from '../contexts/useAuth';
import { useInitializeUser3DScans } from '../hooks/useInitializeUser3DScans';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export function Viewer3D() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'uk' ? uk : enUS;
  const { user } = useAuth();

  const [userProjects, setUserProjects] = useState<User3DScanProjectDto[]>([]);
  const [selectedScan, setSelectedScan] = useState<User3DScanDto | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageByProject, setPageByProject] = useState<Record<string, number>>({});
  const PAGE_SIZE = 3;

  const { scans: projectsWithScans, loading } = useInitializeUser3DScans({ userId: user?.id });

  useEffect(() => {
    console.log(projectsWithScans);
    setUserProjects(projectsWithScans);
  }, [projectsWithScans]);

  useEffect(() => {
    setPageByProject({});
  }, [projectsWithScans]);

  useEffect(() => {
    if (!selectedScan) return;

    setZoom(1);
    setRotation(0);
  }, [selectedScan?.id]);



  const totalScans = userProjects.reduce(
    (sum, p) => sum + (p.scans?.length ?? 0),
    0
  );

  const getPage = (projectId: string) => pageByProject[projectId] ?? 0;

  const setPage = (projectId: string, next: number) =>
    setPageByProject(prev => ({ ...prev, [projectId]: Math.max(0, next) }));



  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>{t('viewer3D.loadingScans')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2>{t('viewer3D.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* 3D Viewer */}
        <Card className="lg:col-span-3 p-0 overflow-hidden">

          {/* Viewer section */}
          <div className="w-full aspect-video bg-linear-to-br from-muted to-muted/50 
                  flex items-center justify-center">

            {!selectedScan ? (
              <p className="text-muted-foreground text-lg">
                {t('viewer3D.noScanSelected')}
              </p>
            ) : (
              <RoomViewer
                zoom={zoom}
                rotation={rotation}
                onZoomIn={() => setZoom(z => Math.min(2, z + 0.1))}
                onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))}
                onRotate={() => setRotation(r => r + 45)}
                modelUrl={selectedScan.fileUrl!}
              />
            )}

          </div>

          {/* Details — only show if a scan is selected */}
          {selectedScan && (
            <div className="pb-6 px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3">
                <div><p>{t('viewer3D.room')}</p><p>{selectedScan.roomName}</p></div>
                <div><p>{t('viewer3D.area')}</p><p>{selectedScan.roomArea} m²</p></div>
                <div><p>{t('viewer3D.scanDate')}</p><p>{format(new Date(selectedScan.scannedAt!), 'dd MMM yyyy', { locale })}</p></div>
               
              </div>

              <Button
                className="mt-6 bg-[#F97316]"
                onClick={() => window.open(selectedScan.fileUrl)}
              >
                <Download className="size-4" />
                {t('viewer3D.downloadModel')}
              </Button>
            </div>
          )}
        </Card>

        {/* Scans List */}
        <Card className="pl-4 pr-4">
          <div className="pb-4 border-b">
            <p>{t('viewer3D.totalScans')}</p>
            <p className="text-2xl">{totalScans}</p>
          </div>

          <h4 className="mb-2">{t('viewer3D.projects')}</h4>

          <Accordion type="single" collapsible className="w-full">
            {userProjects.map((project) => {
              return (
                <AccordionItem key={project.projectId} value={project.projectId!}>
                  <AccordionTrigger className={project.scans!.length === 0 ? "opacity-60" : ""}>
                    {project.projectTitle ?? t('viewer3D.untitledProject')}
                  </AccordionTrigger>

                  <AccordionContent>
                    {project.scans && project.scans.length > 0 ? (
                      (() => {
                        const projectId = project.projectId!;
                        const page = getPage(projectId);
                        const total = project.scans.length;
                        const totalPages = Math.ceil(total / PAGE_SIZE);

                        const start = page * PAGE_SIZE;
                        const visible = project.scans.slice(start, start + PAGE_SIZE);

                        return (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              {visible.map(scan => (
                                <button
                                  key={scan.id}
                                  onClick={() => setSelectedScan(scan)}
                                  className={`w-full p-3 rounded-lg border text-left transition-all
                  ${selectedScan?.id === scan.id
                                      ? "bg-primary/10 border-primary"
                                      : "hover:bg-muted/50"}`}
                                >
                                  <p className="font-medium">{scan.roomName}</p>
                                  <p className="text-muted-foreground">{scan.roomArea} m²</p>
                                </button>
                              ))}
                            </div>

                            {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={page === 0}
                                  onClick={() => setPage(projectId, page - 1)}
                                >
                                  Prev
                                </Button>

                                <p className="text-xs text-muted-foreground">
                                  Page {page + 1} / {totalPages}
                                </p>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={page >= totalPages - 1}
                                  onClick={() => setPage(projectId, page + 1)}
                                >
                                  Next
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-4 text-sm text-muted-foreground text-center">
                        No scans available for this project yet.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
