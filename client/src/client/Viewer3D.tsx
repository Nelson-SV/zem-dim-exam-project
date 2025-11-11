import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import RoomViewer from '../components/3d-files/RoomViewer';

export function Viewer3D() {
  const scans = [
    {
      id: '1',
      name: 'Room 1',
      area: '123 m²',
      date: '2025-01-06',
      stage: 'Finishing Works'
    }
  ];

  const [selectedScan, setSelectedScan] = useState(scans[0]);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1">3D Room Scans</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Viewer */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="aspect-video bg-linear-to-br from-muted to-muted/50 relative flex items-center justify-center">
            <RoomViewer
              zoom={zoom}
              rotation={rotation}
              onZoomIn={() => setZoom(z => Math.min(2, z + 0.1))}
              onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))}
              onRotate={() => setRotation(r => r + 45)}
            />

            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-foreground">
                {selectedScan.name}
              </Badge>
            </div>

          </div>

          {/* Details */}
          <div className="p-6 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground mb-1">Room</p>
                <p>{selectedScan.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Area</p>
                <p>{selectedScan.area}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Scan date</p>
                <p>{format(new Date(selectedScan.date), 'dd MMM yyyy', { locale: enUS })}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Stage</p>
                <p>{selectedScan.stage}</p>
              </div>
            </div>

            <Button className="w-full mt-6 bg-[#F97316] hover:bg-[#F97316]/90">
              <Download className="size-4 mr-2" />
              Download 3D model
            </Button>
          </div>
        </Card>

        {/* Scans List */}
        <Card className="pl-4 pr-4">
          <div className="pb-4 border-b">
            <p className="text-muted-foreground mb-2">Total scans</p>
            <p className="text-2xl">{scans.length}</p>
          </div>

          <h4>Available scans</h4>

          <div className="space-y-2">
            {scans.map(scan => (
              <button
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${selectedScan.id === scan.id
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted/50'
                  }`}
              >
                <p className="mb-1">{scan.name}</p>
                <p className="text-muted-foreground">{scan.area}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
