"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function WireframeSphere() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.rotation.x += delta * 0.1;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshStandardMaterial
                color="#6c63ff"
                wireframe
                emissive="#6c63ff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
}
