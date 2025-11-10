import { useGLTF } from '@react-three/drei'

const RoomModel = () => {
    const { scene } = useGLTF('https://trrlwsxkumccntdwasqa.supabase.co/storage/v1/object/public/3d-files/8.10.2025.glb')
    return <primitive object={scene} scale={1} />
}

export default RoomModel