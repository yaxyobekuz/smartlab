// Sun at center, planets orbiting on circular paths. Click a planet to select it.
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { SUN, PLANETS } from "@/lab/data/planets";

const orbitPoints = (radius, segments = 96) => {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  return pts;
};

const Planet = ({ planet, selected, onSelect }) => {
  const ref = useRef();
  const [hover, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime * planet.speed * 12 + planet.distance;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * planet.distance;
      ref.current.position.z = Math.sin(t) * planet.distance;
    }
  });

  return (
    <group ref={ref}>
      <mesh
        scale={hover || selected ? 1.25 : 1}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planet.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          roughness={0.6}
          emissive={selected ? planet.color : "#000000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      {planet.ring && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[planet.size * 1.4, planet.size * 2.1, 48]} />
          <meshStandardMaterial
            color="#d6c89a"
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
      {(hover || selected) && (
        <Html center distanceFactor={20} className="pointer-events-none">
          <div className="whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background">
            {planet.name}
          </div>
        </Html>
      )}
    </group>
  );
};

const SolarSystemModel = ({ activeId, onSelect }) => (
  <group>
    <pointLight position={[0, 0, 0]} intensity={2.5} distance={60} />
    <mesh>
      <sphereGeometry args={[SUN.size, 32, 32]} />
      <meshStandardMaterial
        color={SUN.color}
        emissive={SUN.color}
        emissiveIntensity={1}
      />
    </mesh>

    {PLANETS.map((p) => (
      <Line
        key={`orbit-${p.id}`}
        points={orbitPoints(p.distance)}
        color="#475569"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
    ))}

    {PLANETS.map((p) => (
      <Planet
        key={p.id}
        planet={p}
        selected={activeId === p.id}
        onSelect={onSelect}
      />
    ))}
  </group>
);

export default SolarSystemModel;
