// PdfSignatureEditor.tsx - TWO-COLUMN LAYOUT with fixed scaling
import { useState, useRef, useEffect } from 'react';
import { X, PenLine, Trash2, Check, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import { Button } from './ui/button.tsx';
import { Card } from './ui/card.tsx';
import { Document, Page, pdfjs } from 'react-pdf';
import { Slider } from './ui/slider.tsx';
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

    const DPI_SCALE = 2;

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log('✅ PDF loaded, pages:', numPages);
        setNumPages(numPages);
    };

    const onPageLoadSuccess = (page: any) => {
        const viewport = page.getViewport({ scale });
        setPageWidth(viewport.width);
        setPageHeight(viewport.height);
    };

    useEffect(() => {
        if (canvasRef.current && pageWidth && pageHeight) {
            const canvas = canvasRef.current;
            canvas.width = pageWidth * DPI_SCALE;
            canvas.height = pageHeight * DPI_SCALE;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(DPI_SCALE, DPI_SCALE);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                redrawAllStrokes();
            }
        }
    }, [pageWidth, pageHeight, scale, allStrokes]);

    const redrawAllStrokes = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(DPI_SCALE, DPI_SCALE);

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
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        setIsDrawing(true);
        setCurrentStroke([{x, y}]);
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
            }

            return newStroke;
        });
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentStroke.length > 1) {
            setAllStrokes(prev => [...prev, {
                points: currentStroke,
                color: penColor,
                lineWidth: penSize,
                isEraser: isEraserMode
            }]);
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

        setAllStrokes([]);
        setCurrentStroke([]);
    };

    const undoLastStroke = () => {
        if (allStrokes.length === 0) return;
        setAllStrokes(prev => prev.slice(0, -1));
    };

    const startSignatureMode = () => {
        setIsDrawingMode(true);
        clearSignature();
    };

    const confirmSignature = async () => {
        if (allStrokes.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

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

        const signatureCanvas = document.createElement('canvas');
        signatureCanvas.width = boxWidth * DPI_SCALE;
        signatureCanvas.height = boxHeight * DPI_SCALE;
        const ctx = signatureCanvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(DPI_SCALE, DPI_SCALE);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

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

        setIsSigning(true);
        try {
            await onSign(signatureBase64, {
                x: boxX,
                y: boxY,
                width: boxWidth,
                height: boxHeight,
                pageNumber: currentPage
            });
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
            <Card className="w-full max-w-[95vw] h-[95vh] flex flex-col bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                    <div>
                        <h2 className="text-xl font-semibold">Sign Document</h2>
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {numPages}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <X className="size-5" />
                    </Button>
                </div>

                {/* TWO-COLUMN LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT SIDE - PDF VIEWER (70% width) */}
                    <div className="flex-[7] flex flex-col border-r">
                        {/* PDF Toolbar */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
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

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={zoomOut}>
                                    <ZoomOut className="size-4" />
                                </Button>
                                <span className="text-sm w-16 text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <Button variant="outline" size="sm" onClick={zoomIn}>
                                    <ZoomIn className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* PDF Display */}
                        <div className="flex-1 overflow-auto bg-gray-100 p-4">
                            <div className="flex justify-center items-start min-h-full">
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
                    </div>

                    {/* RIGHT SIDE - TOOLS PANEL (30% width) */}
                    <div className="flex-[3] flex flex-col bg-white overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Signature Tools</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isDrawingMode
                                        ? 'Draw your signature on the document'
                                        : 'Start signing to add your signature'
                                    }
                                </p>
                            </div>

                            {/* Main Action */}
                            <div className="space-y-3">
                                {!isDrawingMode ? (
                                    <Button
                                        className="w-full bg-[#F97316] hover:bg-[#F97316]/90"
                                        size="lg"
                                        onClick={startSignatureMode}
                                    >
                                        <PenLine className="size-5 mr-2" />
                                        Start Signing
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            size="lg"
                                            onClick={confirmSignature}
                                            disabled={allStrokes.length === 0 || isSigning}
                                        >
                                            <Check className="size-5 mr-2" />
                                            {isSigning ? 'Signing...' : 'Confirm Signature'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setIsDrawingMode(false);
                                                clearSignature();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Drawing Tools - Only show when in drawing mode */}
                            {isDrawingMode && (
                                <>
                                    <div className="border-t pt-6 space-y-6">
                                        {/* Pen/Eraser Toggle */}
                                        <div>
                                            <label className="text-sm font-medium mb-3 block">Tool</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={!isEraserMode ? 'default' : 'outline'}
                                                    onClick={() => setIsEraserMode(false)}
                                                    className={!isEraserMode ? 'bg-[#F97316] hover:bg-[#F97316]/90' : ''}
                                                >
                                                    <PenLine className="size-4 mr-2" />
                                                    Pen
                                                </Button>
                                                <Button
                                                    variant={isEraserMode ? 'default' : 'outline'}
                                                    onClick={() => setIsEraserMode(true)}
                                                >
                                                    <Eraser className="size-4 mr-2" />
                                                    Eraser
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Color Picker */}
                                        {!isEraserMode && (
                                            <div>
                                                <label className="text-sm font-medium mb-3 block">Pen Color</label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {COLORS.map(color => (
                                                        <button
                                                            key={color.value}
                                                            className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                                                                penColor === color.value
                                                                    ? 'border-orange-500 scale-110 shadow-lg'
                                                                    : 'border-gray-300'
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
                                        <div>
                                            <label className="text-sm font-medium mb-3 block">
                                                {isEraserMode ? 'Eraser' : 'Pen'} Size: {penSize.toFixed(1)}px
                                            </label>
                                            <Slider
                                                value={[penSize]}
                                                onValueChange={(value) => setPenSize(value[0])}
                                                min={0.5}
                                                max={10}
                                                step={0.5}
                                                className="w-full"
                                            />
                                            {/* Preview */}
                                            {!isEraserMode && (
                                                <div className="flex items-center justify-center mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <div
                                                        className="rounded-full"
                                                        style={{
                                                            width: `${Math.max(penSize * 4, 16)}px`,
                                                            height: `${Math.max(penSize * 4, 16)}px`,
                                                            backgroundColor: penColor
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Stroke count info */}
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="text-sm text-blue-800">
                                                <strong>{allStrokes.length}</strong> stroke{allStrokes.length !== 1 ? 's' : ''} drawn
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={undoLastStroke}
                                                disabled={allStrokes.length === 0}
                                            >
                                                ↶ Undo Last Stroke
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={clearSignature}
                                                disabled={allStrokes.length === 0}
                                            >
                                                <Trash2 className="size-4 mr-2" />
                                                Clear All
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div className="border-t pt-6">
                                        <h4 className="text-sm font-medium mb-3">Tips</h4>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• Draw smoothly for best results</li>
                                            <li>• Use undo to fix mistakes</li>
                                            <li>• Adjust pen size as needed</li>
                                            <li>• Zoom in/out for precision</li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}