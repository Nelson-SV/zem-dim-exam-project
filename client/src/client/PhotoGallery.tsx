import { useEffect, useMemo, useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Filter, Loader2, ImageOff } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { http } from '../lib/api';
import type { ClientDashboardProjectDto, PhotoDto } from '../generated-client';
import { PaginationComponent } from '../components/PaginationComponent';

const PAGE_SIZE = 100;
const MILESTONES_PER_PAGE = 2;

const formatDisplayDate = (value?: Date | string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, 'dd MMMM yyyy', { locale: enUS });
};

export function PhotoGallery() {
  const [projects, setProjects] = useState<ClientDashboardProjectDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load projects (and their stages) from the client dashboard
  useEffect(() => {
    const load = async () => {
      setLoadingProjects(true);
      setError(null);
      try {
        const res = await http.clientDashboard.getDashboard(undefined, 3);
        const list = res.projects ?? [];
        setProjects(list);
        setSelectedProjectId(prev => prev ?? list[0]?.id ?? null);
      } catch (err) {
        console.error('Failed to load projects for gallery', err);
        setError('Could not load your projects. Please try again.');
      } finally {
        setLoadingProjects(false);
      }
    };

    load();
  }, []);

  // Load photos when project or stage changes
  useEffect(() => {
    if (!selectedProjectId) {
      setPhotos([]);
      setCurrentPage(1);
      return;
    }

    const loadPhotos = async () => {
      setLoadingPhotos(true);
      setError(null);
      try {
        const res = await http.clientProjectPhotos.getProjectPhotos(
          selectedProjectId,
          selectedStage === 'all' ? null : selectedStage,
          1,
          PAGE_SIZE,
        );
        setPhotos(res.items ?? []);
        setSelectedPhoto(null);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load photos', err);
        setError('Could not load photos for this project.');
      } finally {
        setLoadingPhotos(false);
      }
    };

    loadPhotos();
  }, [selectedProjectId, selectedStage]);

  const project = useMemo(
    () => projects.find(p => p.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (!projects.length) return;
    if (selectedProjectId && projects.some(p => p.id === selectedProjectId)) return;
    setSelectedProjectId(projects[0]?.id ?? null);
  }, [projects, selectedProjectId]);

  const groupedPhotos = useMemo(() => {
    return photos.reduce<Record<string, PhotoDto[]>>((acc, photo) => {
      const stageName = photo.milestoneTitle ?? 'General';
      if (!acc[stageName]) acc[stageName] = [];
      acc[stageName].push(photo);
      return acc;
    }, {});
  }, [photos]);

  const stageGroups = useMemo(() => Object.entries(groupedPhotos), [groupedPhotos]);
  const totalPages = Math.max(1, Math.ceil(stageGroups.length / MILESTONES_PER_PAGE));
  const pagedGroups = stageGroups.slice(
    (currentPage - 1) * MILESTONES_PER_PAGE,
    currentPage * MILESTONES_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentPhotoIndex = selectedPhoto ? photos.findIndex(p => p.fileUrl === selectedPhoto) : -1;

  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(photos[currentPhotoIndex - 1].fileUrl ?? null);
    }
  };

  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentPhotoIndex + 1].fileUrl ?? null);
    }
  };

  if (loadingProjects) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Loading projects…</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!project) {
    return (
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground">When a project is assigned to you, photos will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project switcher (if multiple) */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProjectId(p.id ?? null);
                setSelectedStage('all');
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                p.id === project.id ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="mb-1">Photo gallery</h2>
          <p className="text-muted-foreground">{photos.length} photos</p>
        </div>
        
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-[220px]">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {(project.stages ?? []).map(stage => (
              <SelectItem key={stage.id} value={stage.id!}>
                {stage.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photos Grid by Stage */}
      <div className="space-y-8">
        {loadingPhotos && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Loading photos…</span>
          </div>
        )}

        {!loadingPhotos && photos.length === 0 && (
          <Card className="p-6 flex items-center gap-3 text-muted-foreground">
            <ImageOff className="size-5" />
            <span>No photos yet for this project.</span>
          </Card>
        )}

        {!loadingPhotos && pagedGroups.map(([stageName, stagePhotos]) => (
          <div key={stageName}>
            <div className="flex items-center gap-3 mb-4">
              <h3>{stageName}</h3>
              <Badge variant="secondary">{stagePhotos.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stagePhotos.map(photo => (
                <Card 
                  key={photo.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => photo.fileUrl && setSelectedPhoto(photo.fileUrl)}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {photo.fileUrl ? (
                      <img 
                        src={photo.fileUrl} 
                        alt={photo.caption ?? 'Project photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageOff className="size-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-3 bg-white rounded-full">
                          <Download className="size-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="mb-1">{photo.caption || 'Untitled photo'}</p>
                    <p className="text-muted-foreground">
                      {formatDisplayDate(photo.takenAt ?? photo.createdAt)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!loadingPhotos && stageGroups.length > MILESTONES_PER_PAGE && (
        <div className="flex justify-center">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="size-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentPhotoIndex <= 0}
          >
            <ChevronLeft className="size-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentPhotoIndex === photos.length - 1}
          >
            <ChevronRight className="size-8" />
          </Button>

          <img 
            src={selectedPhoto} 
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
