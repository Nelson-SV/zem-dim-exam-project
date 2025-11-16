import { useState } from 'react';
import { Calculator as CalcIcon, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Badge } from '../components/ui/badge';

export function Calculator() {
  const [area, setArea] = useState('');
  const [foundation, setFoundation] = useState('monolithic');
  const [walls, setWalls] = useState('gas-block');
  const [roof, setRoof] = useState('tile');
  const [finishing, setFinishing] = useState('standard');
  const [floors, setFloors] = useState('1');
  const [result, setResult] = useState<{
    min: number;
    max: number;
    perSqm: number;
  } | null>(null);

  const calculate = () => {
    if (!area) return;

    const areaNum = parseFloat(area);
    
    // Base price per sqm
    let basePrice = 12000;

    // Foundation multipliers
    const foundationPrices = {
      'monolithic': 1.0,
      'pile': 0.85,
      'strip': 0.9
    };

    // Wall multipliers
    const wallPrices = {
      'gas-block': 1.0,
      'brick': 1.3,
      'frame': 0.8
    };

    // Roof multipliers
    const roofPrices = {
      'tile': 1.0,
      'metal': 0.85,
      'flat': 0.7
    };

    // Finishing multipliers
    const finishingPrices = {
      'basic': 0.85,
      'standard': 1.0,
      'premium': 1.4
    };

    // Floors multiplier
    const floorsMultiplier = {
      '1': 1.0,
      '2': 1.15,
      '3': 1.25
    };

    const multiplier = 
      foundationPrices[foundation as keyof typeof foundationPrices] *
      wallPrices[walls as keyof typeof wallPrices] *
      roofPrices[roof as keyof typeof roofPrices] *
      finishingPrices[finishing as keyof typeof finishingPrices] *
      floorsMultiplier[floors as keyof typeof floorsMultiplier];

    const pricePerSqm = basePrice * multiplier;
    const totalMin = Math.round(pricePerSqm * areaNum * 0.95);
    const totalMax = Math.round(pricePerSqm * areaNum * 1.05);

    setResult({
      min: totalMin,
      max: totalMax,
      perSqm: Math.round(pricePerSqm)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1">Cost calculator</h2>
        <p className="text-muted-foreground">Estimate the approximate construction cost</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            {/* Area */}
            <div>
              <Label htmlFor="area">House area (m²)</Label>
              <Input
                id="area"
                type="number"
                placeholder="For example, 180"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Foundation */}
            <div>
              <Label>Foundation type</Label>
              <RadioGroup value={foundation} onValueChange={setFoundation} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monolithic" id="foundation-monolithic" />
                  <Label htmlFor="foundation-monolithic" className="cursor-pointer">
                    Monolithic (recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pile" id="foundation-pile" />
                  <Label htmlFor="foundation-pile" className="cursor-pointer">
                    Pile foundation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strip" id="foundation-strip" />
                  <Label htmlFor="foundation-strip" className="cursor-pointer">
                    Strip foundation
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Walls */}
            <div>
              <Label>Wall material</Label>
              <RadioGroup value={walls} onValueChange={setWalls} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gas-block" id="walls-gas" />
                  <Label htmlFor="walls-gas" className="cursor-pointer">
                    Aerated concrete (economy)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="brick" id="walls-brick" />
                  <Label htmlFor="walls-brick" className="cursor-pointer">
                    Brick (premium)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="frame" id="walls-frame" />
                  <Label htmlFor="walls-frame" className="cursor-pointer">
                    Framed (fast build)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Roof */}
            <div>
              <Label>Roof type</Label>
              <RadioGroup value={roof} onValueChange={setRoof} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tile" id="roof-tile" />
                  <Label htmlFor="roof-tile" className="cursor-pointer">
                    Tile
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metal" id="roof-metal" />
                  <Label htmlFor="roof-metal" className="cursor-pointer">
                    Metal tile
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flat" id="roof-flat" />
                  <Label htmlFor="roof-flat" className="cursor-pointer">
                    Flat roof
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Finishing */}
            <div>
              <Label>Finishing level</Label>
              <RadioGroup value={finishing} onValueChange={setFinishing} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basic" id="finishing-basic" />
                  <Label htmlFor="finishing-basic" className="cursor-pointer">
                    Basic
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="finishing-standard" />
                  <Label htmlFor="finishing-standard" className="cursor-pointer">
                    Standard
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="finishing-premium" />
                  <Label htmlFor="finishing-premium" className="cursor-pointer">
                    Premium
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Floors */}
            <div>
              <Label>Number of floors</Label>
              <RadioGroup value={floors} onValueChange={setFloors} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="floors-1" />
                  <Label htmlFor="floors-1" className="cursor-pointer">1 floor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="floors-2" />
                  <Label htmlFor="floors-2" className="cursor-pointer">2 floors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="floors-3" />
                  <Label htmlFor="floors-3" className="cursor-pointer">3 floors</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={calculate} 
              className="w-full bg-[#F97316] hover:bg-[#F97316]/90"
            >
              <CalcIcon className="size-4 mr-2" />
              Calculate cost
            </Button>
          </div>
        </Card>

        {/* Result */}
        <Card className="p-6 h-fit sticky top-6">
          {result ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-[#10B981]/10">
                    <TrendingUp className="size-5 text-[#10B981]" />
                  </div>
                  <h3>Result</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-linear-to-r from-[#F97316] to-[#F59E0B] rounded-lg text-white">
                    <p className="text-white/80 mb-1">Estimated cost</p>
                    <h2 className="mb-1">
                      {result.min.toLocaleString()} - {result.max.toLocaleString()} ₴
                    </h2>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-1">Cost per m²</p>
                    <p className="text-2xl">{result.perSqm.toLocaleString()} ₴</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4>Includes:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">✓</Badge>
                        <span>All construction materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">✓</Badge>
                        <span>Crew labor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">✓</Badge>
                        <span>Delivery to the site</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Badge variant="secondary" className="mt-0.5">✓</Badge>
                        <span>Quality control</span>
                      </li>
                    </ul>
                  </div>

                  <Button className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                    Request a consultation
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalcIcon className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Fill out the form to calculate the construction cost
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
