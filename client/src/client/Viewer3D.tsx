import { useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Download, Maximize2, Ruler } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function Viewer3D() {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const scans = [
    {
      id: '1',
      name: 'Living Room',
      area: '45 m²',
      date: '2025-01-05',
      stage: 'Finishing Works'
    },
    {
      id: '2',
      name: 'Kitchen',
      area: '25 m²',
      date: '2025-01-05',
      stage: 'Finishing Works'
    },
    {
      id: '3',
      name: 'Primary Bedroom',
      area: '35 m²',
      date: '2025-01-06',
      stage: 'Finishing Works'
    }
  ];

  const [selectedScan, setSelectedScan] = useState(scans[0]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1">3D Room Scans</h2>
        <p className="text-muted-foreground">Interactive models of your home</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Viewer */}
        <Card className="lg:col-span-3 overflow-hidden">
          {/* Canvas */}
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative flex items-center justify-center">
            {/* Placeholder 3D visualization */}
            <div 
              className="w-64 h-64 bg-gradient-to-br from-[#F97316] to-[#F59E0B] opacity-20 transition-all"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
              }}
            >
              <div className="absolute inset-4 border-4 border-white/30" />
              <div className="absolute inset-8 border-4 border-white/30" />
              <div className="absolute inset-12 border-4 border-white/30" />
            </div>
            
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-foreground">
                {selectedScan.name}
              </Badge>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setRotation(r => r - 45)}
              >
                <RotateCw className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setZoom(z => Math.min(2, z + 0.1))}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Ruler className="size-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Maximize2 className="size-4" />
              </Button>
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
        <Card className="p-4">
          <h4 className="mb-4">Available scans</h4>
          <div className="space-y-2">
            {scans.map(scan => (
              <button
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selectedScan.id === scan.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <p className="mb-1">{scan.name}</p>
                <p className="text-muted-foreground">{scan.area}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-muted-foreground mb-2">Total scans</p>
            <p className="text-2xl">{scans.length}</p>
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-[#3B82F6]/10 to-[#F97316]/10 border-[#3B82F6]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#3B82F6]/10">
            <Ruler className="size-6 text-[#3B82F6]" />
          </div>
          <div>
            <h4 className="mb-1">How to use the 3D scans?</h4>
            <p className="text-muted-foreground">
              Use the rotate and zoom tools to inspect each room in detail.
              Select the measurement tool to get accurate element dimensions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
