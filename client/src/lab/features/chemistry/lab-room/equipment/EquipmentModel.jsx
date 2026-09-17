import { Component, Suspense, lazy } from "react";

// models/ConicalFlask.jsx ↔ id "conical-flask"; loaded on demand so a broken model can't take down the room.
const toId = (path) =>
  path
    .replace(/^.*\/(\w+)\.jsx$/, "$1")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

const MODELS = Object.fromEntries(
  Object.entries(import.meta.glob("./models/*.jsx")).map(([path, load]) => [toId(path), lazy(load)]),
);

class ModelBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(`[lab-room] equipment model "${this.props.id}" failed`, error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const EquipmentModel = ({ id, ...props }) => {
  const Model = MODELS[id];
  if (!Model) return null;
  return (
    <ModelBoundary id={id}>
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </ModelBoundary>
  );
};

export default EquipmentModel;
