import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { isTouch, prefersReducedMotion, sceneState } from '../lib/motion';

const ACCENT = new THREE.Color('#ff5a1f');
const WHITE = new THREE.Color('#ffffff');

type DistortMat = THREE.MeshPhysicalMaterial & { distort: number };

function Blob() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<DistortMat>(null);
  const ring = useRef<THREE.Mesh>(null);
  const tint = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m || !mat.current) return;
    const k = 1 - Math.pow(0.0025, delta); // frame-rate independent easing
    const aspect = state.viewport.aspect;
    // Pull the blob toward the centre on narrow screens so it stays in frame.
    const xRange = aspect < 1 ? 0.3 : 1;
    g.position.x += (sceneState.x * xRange - g.position.x) * k;
    g.position.y += (sceneState.y - g.position.y) * k;
    g.position.z += (sceneState.z - g.position.z) * k;
    const s = sceneState.scale * (aspect < 1 ? 0.6 : 1);
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k);

    if (!prefersReducedMotion) m.rotation.y += delta * 0.12;
    m.rotation.x = sceneState.spin * Math.PI * 0.5;
    g.rotation.y += (sceneState.pointerX * 0.35 - g.rotation.y) * k;
    g.rotation.x += (-sceneState.pointerY * 0.25 - g.rotation.x) * k;

    if (ring.current && !prefersReducedMotion) {
      ring.current.rotation.z += delta * 0.25;
      ring.current.rotation.x = 1.1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }

    mat.current.distort += (sceneState.distort - mat.current.distort) * k;
    tint.copy(WHITE).lerp(ACCENT, sceneState.accent * 0.18);
    mat.current.color.copy(tint);
  });

  const detail = isTouch ? 48 : 96;
  return (
    <group ref={group}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.35, detail]} />
        <MeshDistortMaterial
          ref={mat as never}
          distort={0.38}
          speed={prefersReducedMotion ? 0 : 1.6}
          roughness={0.03}
          metalness={0.05}
          transmission={1}
          thickness={2.4}
          ior={1.5}
          iridescence={0.6}
          iridescenceIOR={1.25}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.4}
        />
      </mesh>
      {/* Accent ring behind the glass gives the refraction something to bend. */}
      <mesh ref={ring} position={[0, 0, -0.9]} rotation={[1.1, 0.3, 0]}>
        <torusGeometry args={[1.75, 0.035, 16, 160]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const count = isTouch ? 500 : 1400;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 6;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(p) * Math.cos(t);
      arr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      arr[i * 3 + 2] = r * Math.cos(p) - 2;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current || prefersReducedMotion) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x = sceneState.spin * 0.4;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#d9d7d0" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function AccentLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (ref.current) ref.current.intensity = 6 + sceneState.accent * 30;
  });
  return <pointLight ref={ref} position={[-3, -2, 2]} color={ACCENT} distance={12} />;
}

export default function Scene() {
  return (
    <Canvas
      className="!fixed inset-0 !h-[100svh] !w-full"
      style={{ pointerEvents: 'none' }}
      dpr={[1, isTouch ? 1.5 : 2]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0b0b0b']} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <AccentLight />
      <Blob />
      <Dust />
      {/* Procedural studio lighting — no HDR download needed. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -4]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} position={[-5, 0, 0]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#e9e6df" />
        <Lightformer form="rect" intensity={2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#ff5a1f" />
        <Lightformer form="ring" intensity={2.5} position={[0, 0, 6]} scale={3} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
