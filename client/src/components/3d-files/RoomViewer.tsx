import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import RoomModel from './RoomModel';

const RoomViewer = () => {
    return (
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Suspense fallback={null}>
                <RoomModel />
                <Environment preset='city' />
            </Suspense>
            <OrbitControls />
        </Canvas>
    )
}

export default RoomViewer