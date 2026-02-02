import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

export default function HoloSphereOnly({ isMobile = false }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!groupRef.current) return
    groupRef.current.rotation.y = t * 0.3
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.05
  })

  return (
    <group ref={groupRef}>
      <Sphere
        args={[1, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color={hovered ? '#ffffff' : '#cccccc'}
          distort={isMobile ? 0.6 : 0.4}
          speed={isMobile ? 3 : 2}
          roughness={0.2}
          metalness={0.8}
          wireframe
          emissive="#333333"
        />
      </Sphere>

      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>
    </group>
  )
}