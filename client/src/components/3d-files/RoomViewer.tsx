import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { PerspectiveCamera, MathUtils } from 'three';
import { Suspense, useEffect, useRef, useState } from 'react';
import RoomModel from './RoomModel';
import { Button } from '../ui/button';
import { Maximize2, Minimize2, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';

interface RoomViewerProps {
    zoom: number;
    rotation: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotate: () => void;
}

const RoomViewer = ({
    zoom,
    rotation,
    onZoomIn,
    onZoomOut,
    onRotate,
}: RoomViewerProps) => {

    const controlsRef = useRef<ThreeOrbitControls | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    //Zoom changes
    useEffect(() => {
        if (cameraRef.current) {
            cameraRef.current.zoom = zoom;
            cameraRef.current.updateProjectionMatrix();
        }
    }, [zoom])


    //Rotation changes around Y axis
    useEffect(() => {
        if (controlsRef.current) {
            const angle = MathUtils.degToRad(rotation);
            const radius = 5;
            const camera = controlsRef.current.object as PerspectiveCamera;
            camera.position.x = Math.sin(angle) * radius;
            camera.position.z = Math.cos(angle) * radius;
            camera.lookAt(0, 0, 0);
            controlsRef.current.update();
        }
    }, [rotation]);


    // Handle fullscreen toggle
    const toggleFullscreen = async () => {
        const elem = containerRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            setIsFullscreen(true);
            await elem.requestFullscreen?.();
        } else {
            setIsFullscreen(false);
            await document.exitFullscreen?.();
        }

        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    };


    // Handle fullscreen changes properly (fix stretching after exit)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const active = !!document.fullscreenElement;
            setIsFullscreen(active);

            // Force React Three Fiber to recalc
            const event = new Event('resize');
            window.dispatchEvent(event);

            // Also manually resize the canvas to container size
            const container = containerRef.current;
            const canvas = container?.querySelector('canvas');
            if (container && canvas) {
                const { width, height } = container.getBoundingClientRect();
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;
            }

            // Add a small delay to ensure proper recalculation after fullscreen exit
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);




    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-xl overflow-hidden transition-all duration-300 
                ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full aspect-video'}`}
        >
            <Canvas
                camera={{ position: [0, 2, 5], fov: 50 }}
                onCreated={({ camera }) => (cameraRef.current = camera as PerspectiveCamera)}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                    <RoomModel />
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls ref={controlsRef} enablePan enableZoom />
            </Canvas>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-50">
                <Button size="icon" onClick={onRotate}>
                    <RotateCw className="size-4" />
                </Button>
                <Button size="icon" onClick={onZoomOut}>
                    <ZoomOut className="size-4" />
                </Button>
                <Button size="icon" onClick={onZoomIn}>
                    <ZoomIn className="size-4" />
                </Button>
                <Button size="icon" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </Button>
            </div>
        </div >

    )
}

export default RoomViewer