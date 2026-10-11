import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { isTouch, prefersReducedMotion, sceneState } from '../lib/motion';

const INK = new THREE.Color('#0a0a0a');
const CHROME = new THREE.Color('#e4e4e1');

type DistortMat = THREE.MeshPhysicalMaterial & { distort: number };

function Blob() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<DistortMat>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m || !mat.current) return;
    const k = 1 - Math.pow(0.0025, delta); // frame-rate independent easing
    // Parked spot: hanging off the viewport's top-right edge, in the page margin.
    // Phones always use it — their single text column leaves nowhere else.
    const { width: vw, height: vh, aspect } = state.viewport;
    const narrow = aspect < 1;
    const c = narrow ? 1 : sceneState.corner;
    const cx = vw / 2 + (narrow ? 0.05 : 0.3);
    const cy = vh / 2 - (narrow ? 0.3 : 0.3);
    const tx = sceneState.x + (cx - sceneState.x) * c;
    const ty = sceneState.y + (cy - sceneState.y) * c;
    const tz = sceneState.z * (1 - c);
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (ty - g.position.y) * k;
    g.position.z += (tz - g.position.z) * k;
    const s = sceneState.scale + ((narrow ? 0.32 : 0.4) - sceneState.scale) * c;
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
          color={CHROME}
          roughness={0.08}
          metalness={1}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.25}
        />
      </mesh>
      {/* Thin ink ring orbiting the chrome. */}
      <mesh ref={ring} position={[0, 0, -0.9]} rotation={[1.1, 0.3, 0]}>
        <torusGeometry args={[1.75, 0.035, 16, 160]} />
        <meshBasicMaterial color={INK} toneMapped={false} />
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
      <pointsMaterial size={0.016} color="#8a8a86" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
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
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <Blob />
      <Dust />
      {/* Procedural studio lighting — no HDR download needed. */}
      {/* Procedural studio — bright softboxes plus dark flags so chrome reads on white. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#bdbdb9']} />
        <Lightformer form="rect" intensity={4} position={[0, 4, -3]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 0]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#0a0a0a" />
        <Lightformer form="rect" intensity={1} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#1a1a1a" />
        <Lightformer form="ring" intensity={3} position={[0, 0, 6]} scale={3} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
