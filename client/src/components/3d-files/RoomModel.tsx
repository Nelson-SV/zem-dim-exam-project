import { useGLTF } from '@react-three/drei'

const RoomModel = ({ url }: { url: string }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={1} />
}

export default RoomModel