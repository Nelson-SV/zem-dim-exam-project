import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { mockPhotos, mockProjects } from '../lib/mock-data';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function PhotoGallery() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'uk' ? uk : enUS;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const project = mockProjects[0];
  
  const filteredPhotos = selectedStage === 'all' 
    ? mockPhotos 
    : mockPhotos.filter(p => p.stageId === selectedStage);

  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    const stage = photo.stageName;
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(photo);
    return acc;
  }, {} as Record<string, typeof mockPhotos>);

  const currentPhotoIndex = filteredPhotos.findIndex(p => p.url === selectedPhoto);
  
  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1].url);
    }
  };

  const handleNext = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1].url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="mb-1">{t('photoGallery.title')}</h2>
          <p className="text-muted-foreground">{t('photoGallery.photosCount', { count: filteredPhotos.length })}</p>
        </div>

        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-[200px]">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder={t('photoGallery.allStages')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('photoGallery.allStages')}</SelectItem>
            {project.stages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photos Grid by Stage */}
      <div className="space-y-8">
        {Object.entries(groupedPhotos).map(([stageName, photos]) => (
          <div key={stageName}>
            <div className="flex items-center gap-3 mb-4">
              <h3>{stageName}</h3>
              <Badge variant="secondary">{photos.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map(photo => (
                <Card 
                  key={photo.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img 
                      src={photo.url} 
                      alt={photo.description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-3 bg-white rounded-full">
                          <Download className="size-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="mb-1">{photo.description}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(photo.uploadDate), 'dd MMMM yyyy', { locale })}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

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
            disabled={currentPhotoIndex === 0}
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
            disabled={currentPhotoIndex === filteredPhotos.length - 1}
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
            {t('photoGallery.photosCounter', { current: currentPhotoIndex + 1, total: filteredPhotos.length })}
          </div>
        </div>
      )}
    </div>
  );
}
