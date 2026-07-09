// Data-driven Lucide icon. Data files store an icon *name* (e.g. "FlaskConical");
// this maps it to the component. Explicit imports keep tree-shaking working.
import {
  FlaskConical,
  Dna,
  Telescope,
  CircuitBoard,
  Hexagon,
  TestTubes,
  Atom,
  Microscope,
  PersonStanding,
  Scissors,
  Orbit,
  Waves,
  Cpu,
  Dumbbell,
  HeartPulse,
  Brain,
  Bone,
  Heart,
  Link,
  Skull,
  Hand,
  Footprints,
  Circle,
} from "lucide-react";

const ICONS = {
  FlaskConical,
  Dna,
  Telescope,
  CircuitBoard,
  Hexagon,
  TestTubes,
  Atom,
  Microscope,
  PersonStanding,
  Scissors,
  Orbit,
  Waves,
  Cpu,
  Dumbbell,
  HeartPulse,
  Brain,
  Bone,
  Heart,
  Link,
  Skull,
  Hand,
  Footprints,
};

const Icon = ({ name, ...props }) => {
  const Cmp = ICONS[name] || Circle;
  return <Cmp {...props} />;
};

export default Icon;
