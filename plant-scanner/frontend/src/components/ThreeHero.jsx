import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Sparkles, Float, Environment, Lightformer } from '@react-three/drei'

/* ─── Procedural Plant Core ────────────────────────────────────────────────── */
function PlantCore() {
    const meshRef = useRef()

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (meshRef.current) {
            // Gentle rotation
            meshRef.current.rotation.x = Math.cos(t / 4) / 8
            meshRef.current.rotation.y = Math.sin(t / 4) / 8
            meshRef.current.position.y = Math.sin(t / 1.5) / 10
        }
    })

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1, 128, 128]} scale={2}>
                <MeshDistortMaterial
                    color="#4ade80"
                    attach="material"
                    distort={0.4} // Strength of distortion
                    speed={2} // Speed of distortion
                    roughness={0.2}
                    metalness={0.1}
                    bumpScale={0.005}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    radius={1}
                />
            </Sphere>
        </Float>
    )
}

/* ─── Floating Particles (Spores/Pollen) ────────────────────────────────────── */
function Spores() {
    return (
        <Sparkles
            count={60}
            scale={8}
            size={4}
            speed={0.4}
            opacity={0.6}
            color="#a7f3d0"
        />
    )
}

/* ─── Scene Lighting ────────────────────────────────────────────────────────── */
function Lighting() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />

            {/* <Environment preset="forest" blur={0.8} /> */}
            {/* Rim lights for dramatic effect - disabled to debug */}
            {/* <group rotation={[0, 0.5, 0]}>
                <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
                <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
                <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[10, 2, 1]} />
                <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
            </group> */}
        </>
    )
}

/* ─── Main Hero Component ───────────────────────────────────────────────────── */
export default function ThreeHero() {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <Lighting />
                    <PlantCore />
                    <Spores />
                </Suspense>
            </Canvas>
        </div>
    )
}
