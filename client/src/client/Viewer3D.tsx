import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import RoomViewer from '../components/3d-files/RoomViewer';
import type { User3DScanDto } from '../generated-client';
import { useAuth } from '../contexts/useAuth';
import { useInitializeUser3DScans } from '../hooks/useInitializeUser3DScans';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

export function Viewer3D() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'uk' ? uk : enUS;
  const { user } = useAuth();

  const [userScans, setUserScans] = useState<User3DScanDto[]>([]);
  const [selectedScan, setSelectedScan] = useState<User3DScanDto | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const { scans, loading } = useInitializeUser3DScans({ userId: user?.id });

  useEffect(() => {
    setUserScans(scans);
  }, [scans]);

  const grouped = useMemo(() => {
    const groups: Record<string, User3DScanDto[]> = {};
    for (const s of userScans) {
      if (!groups[s.projectId!]) groups[s.projectId!] = [];
      groups[s.projectId!].push(s);
    }
    return groups;
  }, [userScans]);

  if (loading) return <p>{t('viewer3D.loadingScans')}</p>;

  return (
    <div className="space-y-6">
      <h2>{t('viewer3D.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* 3D Viewer */}
        <Card className="lg:col-span-3 p-0 overflow-hidden">

          {/* Viewer section (no padding at all) */}
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
              <div className="grid grid-cols-2 sm:grid-cols-4">
                <div><p>{t('viewer3D.room')}</p><p>{selectedScan.roomName}</p></div>
                <div><p>{t('viewer3D.area')}</p><p>{selectedScan.roomArea} m²</p></div>
                <div><p>{t('viewer3D.scanDate')}</p><p>{format(new Date(selectedScan.scannedAt!), 'dd MMM yyyy', { locale })}</p></div>
                <div><p>{t('viewer3D.project')}</p><p>{selectedScan.projectTitle}</p></div>
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
            <p className="text-2xl">{userScans.length}</p>
          </div>

          <h4 className="mb-2">{t('viewer3D.projects')}</h4>

          <Accordion type="single" collapsible className="w-full">
            {Object.entries(grouped).map(([projectId, scans]) => {
              const title = scans[0]?.projectTitle ?? t('viewer3D.untitledProject');

              return (
                <AccordionItem key={projectId} value={projectId}>
                  <AccordionTrigger>{title}</AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2">
                      {scans.map(scan => (
                        <button
                          key={scan.id}
                          onClick={() => setSelectedScan(scan)}
                          className={`w-full p-3 rounded-lg border text-left transition-all
                            ${selectedScan?.id === scan.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"}`}>
                          <p className="font-medium">{scan.roomName}</p>
                          <p className="text-muted-foreground">{scan.roomArea} m²</p>
                        </button>
                      ))}
                    </div>
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
