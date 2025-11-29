// PdfSignatureEditor.tsx - FIXED VERSION з видимими лініями
import { useState, useRef, useEffect } from 'react';
import { X, PenLine, Trash2, Check, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Document, Page, pdfjs } from 'react-pdf';
import { Slider } from '../components/ui/slider';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SignaturePosition {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
}

interface PdfSignatureEditorProps {
    pdfUrl: string;
    onSign: (signatureBase64: string, position: SignaturePosition) => Promise<void>;
    onCancel: () => void;
}

const COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#1e40af' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#9333ea' },
];

export function PdfSignatureEditor({ pdfUrl, onSign, onCancel }: PdfSignatureEditorProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isSigning, setIsSigning] = useState(false);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);

    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Array<{x: number, y: number}>>([]);
    const [allStrokes, setAllStrokes] = useState<Array<{
        points: Array<{x: number, y: number}>,
        color: string,
        lineWidth: number,
        isEraser: boolean
    }>>([]);

    const [penColor, setPenColor] = useState('#000000');
    const [penSize, setPenSize] = useState(2.0);
    const [isEraserMode, setIsEraserMode] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // DPI scaling для чітких ліній
    const DPI_SCALE = 2; // Фіксований scale для стабільності

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log('✅ PDF loaded, pages:', numPages);
        setNumPages(numPages);
    };

    const onPageLoadSuccess = (page: any) => {
        const viewport = page.getViewport({ scale });
        setPageWidth(viewport.width);
        setPageHeight(viewport.height);
    };

    // Налаштування canvas - ВИПРАВЛЕНО
    useEffect(() => {
        if (canvasRef.current && pageWidth && pageHeight) {
            const canvas = canvasRef.current;

            // ❌ СТАРА ПРОБЛЕМА: canvas.width !== CSS width
            // Встановлюємо canvas розміри з урахуванням DPI
            canvas.width = pageWidth * DPI_SCALE;
            canvas.height = pageHeight * DPI_SCALE;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Масштабуємо контекст
                ctx.scale(DPI_SCALE, DPI_SCALE);

                // Гладкі лінії
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Білий фон для видимості
                ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
                ctx.fillRect(0, 0, pageWidth, pageHeight);

                // Перемалювати всі штрихи
                redrawAllStrokes();
            }
        }
    }, [pageWidth, pageHeight, scale, allStrokes]);

    const redrawAllStrokes = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Очистити і заново налаштувати
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(DPI_SCALE, DPI_SCALE);

        // Білий фон
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.fillRect(0, 0, pageWidth, pageHeight);

        // Налаштування для гладких ліній
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        allStrokes.forEach(stroke => {
            if (stroke.points.length < 2) return;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (stroke.isEraser) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.lineWidth = stroke.lineWidth * 4;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = stroke.color;
                ctx.lineWidth = stroke.lineWidth;
            }

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }

            ctx.stroke();
        });

        ctx.globalCompositeOperation = 'source-over';
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingMode) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // ✅ ВИПРАВЛЕННЯ: Правильне масштабування координат
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        setIsDrawing(true);
        setCurrentStroke([{x, y}]);

        console.log('🎨 Start drawing at:', x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !isDrawingMode) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Налаштування контексту
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (isEraserMode) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = penSize * 4;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penSize;
        }

        setCurrentStroke(prev => {
            const newStroke = [...prev, {x, y}];

            if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1];

                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();

                console.log('✏️ Drawing from', lastPoint, 'to', {x, y}, 'color:', penColor, 'width:', penSize);
            }

            return newStroke;
        });
    };

    const stopDrawing = () => {
        if (!isDrawing) return;

        console.log('✋ Stop drawing, stroke length:', currentStroke.length);
        setIsDrawing(false);

        if (currentStroke.length > 1) {
            setAllStrokes(prev => {
                const newStrokes = [...prev, {
                    points: currentStroke,
                    color: penColor,
                    lineWidth: penSize,
                    isEraser: isEraserMode
                }];
                console.log('💾 Saved stroke, total strokes:', newStrokes.length);
                return newStrokes;
            });
        }

        setCurrentStroke([]);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(DPI_SCALE, DPI_SCALE);

        // Білий фон
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.fillRect(0, 0, pageWidth, pageHeight);

        setAllStrokes([]);
        setCurrentStroke([]);

        console.log('🗑️ Cleared signature');
    };

    const undoLastStroke = () => {
        if (allStrokes.length === 0) return;

        setAllStrokes(prev => {
            const newStrokes = prev.slice(0, -1);
            console.log('↶ Undo, remaining strokes:', newStrokes.length);
            return newStrokes;
        });
    };

    const startSignatureMode = () => {
        console.log('🖊️ Starting signature mode');
        setIsDrawingMode(true);
        clearSignature();
    };

    const confirmSignature = async () => {
        if (allStrokes.length === 0) {
            console.log('❌ No signature to confirm');
            return;
        }

        console.log('✅ Confirming signature with', allStrokes.length, 'strokes');

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Знайти bounding box всіх штрихів
        const allPoints = allStrokes.flatMap(s => s.points);
        const xs = allPoints.map(p => p.x);
        const ys = allPoints.map(p => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const padding = 10;
        const boxX = Math.max(0, minX - padding);
        const boxY = Math.max(0, minY - padding);
        const boxWidth = (maxX - minX) + padding * 2;
        const boxHeight = (maxY - minY) + padding * 2;

        console.log('📦 Signature box:', { boxX, boxY, boxWidth, boxHeight });

        // Створити canvas для підпису
        const signatureCanvas = document.createElement('canvas');
        signatureCanvas.width = boxWidth * DPI_SCALE;
        signatureCanvas.height = boxHeight * DPI_SCALE;
        const ctx = signatureCanvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(DPI_SCALE, DPI_SCALE);

        // Білий фон
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, boxWidth, boxHeight);

        // Налаштування
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Малюємо штрихи
        allStrokes.forEach(stroke => {
            if (stroke.points.length < 2 || stroke.isEraser) return;

            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.lineWidth;

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x - boxX, stroke.points[0].y - boxY);

            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x - boxX, stroke.points[i].y - boxY);
            }

            ctx.stroke();
        });

        const signatureBase64 = signatureCanvas.toDataURL('image/png');
        console.log('📸 Generated signature image, length:', signatureBase64.length);

        setIsSigning(true);
        try {
            await onSign(signatureBase64, {
                x: boxX,
                y: boxY,
                width: boxWidth,
                height: boxHeight,
                pageNumber: currentPage
            });
            console.log('✅ Signature confirmed and saved');
        } catch (error) {
            console.error('❌ Error saving signature:', error);
        } finally {
            setIsSigning(false);
        }
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <Card className="w-full max-w-7xl h-[90vh] flex flex-col bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-xl font-semibold">Sign Document</h2>
                        <p className="text-sm text-muted-foreground">
                            {isDrawingMode
                                ? '✍️ Draw your signature directly on the document'
                                : 'Click "Start Signing" to add your signature'}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="size-5" />
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b gap-4">
                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || isDrawingMode}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <span className="text-sm px-3 min-w-[100px] text-center">
                            Page {currentPage} / {numPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                            disabled={currentPage === numPages || isDrawingMode}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={zoomOut} disabled={isDrawingMode}>
                            <ZoomOut className="size-4" />
                        </Button>
                        <span className="text-sm w-16 text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="outline" size="sm" onClick={zoomIn} disabled={isDrawingMode}>
                            <ZoomIn className="size-4" />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {!isDrawingMode ? (
                            <Button
                                className="bg-[#F97316] hover:bg-[#F97316]/90"
                                onClick={startSignatureMode}
                            >
                                <PenLine className="size-4 mr-2" />
                                Start Signing
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={undoLastStroke}
                                    disabled={allStrokes.length === 0}
                                >
                                    ↶ Undo
                                </Button>
                                <Button variant="outline" size="sm" onClick={clearSignature}>
                                    <Trash2 className="size-4 mr-2" />
                                    Clear
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsDrawingMode(false);
                                        clearSignature();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={confirmSignature}
                                    disabled={allStrokes.length === 0 || isSigning}
                                >
                                    <Check className="size-4 mr-2" />
                                    {isSigning ? 'Signing...' : 'Confirm'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Drawing Controls */}
                {isDrawingMode && (
                    <div className="flex items-center gap-6 p-4 bg-white border-b">
                        {/* Pen/Eraser Toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={!isEraserMode ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIsEraserMode(false)}
                                className={!isEraserMode ? 'bg-[#F97316] hover:bg-[#F97316]/90' : ''}
                            >
                                <PenLine className="size-4 mr-2" />
                                Pen
                            </Button>
                            <Button
                                variant={isEraserMode ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setIsEraserMode(true)}
                            >
                                <Eraser className="size-4 mr-2" />
                                Eraser
                            </Button>
                        </div>

                        {/* Color Picker */}
                        {!isEraserMode && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Color:</span>
                                <div className="flex gap-1">
                                    {COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                penColor === color.value
                                                    ? 'border-orange-500 scale-110 shadow-lg'
                                                    : 'border-gray-300 hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => setPenColor(color.value)}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Slider */}
                        <div className="flex items-center gap-3 min-w-[220px]">
                            <span className="text-sm font-medium whitespace-nowrap">
                                {isEraserMode ? 'Eraser' : 'Pen'} Size:
                            </span>
                            <Slider
                                value={[penSize]}
                                onValueChange={(value) => setPenSize(value[0])}
                                min={0.5}
                                max={10}
                                step={0.5}
                                className="flex-1"
                            />
                            <span className="text-sm w-12 text-center">{penSize.toFixed(1)}px</span>
                        </div>

                        {/* Preview */}
                        {!isEraserMode && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Preview:</span>
                                <div
                                    className="rounded-full border border-gray-300"
                                    style={{
                                        width: `${Math.max(penSize * 3, 12)}px`,
                                        height: `${Math.max(penSize * 3, 12)}px`,
                                        backgroundColor: penColor
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    <div className="flex justify-center">
                        <div ref={containerRef} className="relative inline-block">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="flex items-center justify-center p-12">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                            <p>Loading PDF...</p>
                                        </div>
                                    </div>
                                }
                                error={
                                    <div className="flex items-center justify-center p-12">
                                        <div className="text-center text-red-500">
                                            <p className="font-semibold mb-2">Failed to load PDF</p>
                                            <p className="text-sm">Please try again.</p>
                                        </div>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    onLoadSuccess={onPageLoadSuccess}
                                />
                            </Document>

                            {/* Drawing Canvas */}
                            {isDrawingMode && pageWidth > 0 && pageHeight > 0 && (
                                <canvas
                                    ref={canvasRef}
                                    className={`absolute top-0 left-0 ${
                                        isEraserMode ? 'cursor-cell' : 'cursor-crosshair'
                                    }`}
                                    style={{
                                        width: `${pageWidth}px`,
                                        height: `${pageHeight}px`,
                                        touchAction: 'none',
                                        // ✅ КРИТИЧНО: прозорий фон щоб бачити PDF
                                        backgroundColor: 'transparent',
                                    }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                {isDrawingMode && (
                    <div className="p-3 bg-blue-50 border-t">
                        <div className="flex items-center justify-center gap-6 text-sm text-blue-800">
                            <span>💡 Draw your signature with smooth lines</span>
                            <span>↶ Undo to remove last stroke</span>
                            <span>🗑️ Clear to start over</span>
                            <span>✅ Confirm when ready</span>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}