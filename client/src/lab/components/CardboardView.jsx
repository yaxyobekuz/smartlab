// Phone "cardboard" VR: renders the scene as a left/right split-screen (StereoEffect)
// and steers the camera with the device gyroscope. DeviceOrientationControls was
// dropped from three core, so the orientation→quaternion math is inlined here.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { StereoEffect } from "three/examples/jsm/effects/StereoEffect.js";

const deg2rad = THREE.MathUtils.degToRad;
const zee = new THREE.Vector3(0, 0, 1);
const q0 = new THREE.Quaternion();
// -90° about X maps the device frame (z up) to the three.js camera frame (y up).
const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const euler = new THREE.Euler();

// Builds the camera quaternion from alpha/beta/gamma + screen orientation.
const setFromOrientation = (quat, { alpha, beta, gamma, orient }) => {
  euler.set(deg2rad(beta), deg2rad(alpha), -deg2rad(gamma), "YXZ");
  quat.setFromEuler(euler);
  quat.multiply(q1);
  quat.multiply(q0.setFromAxisAngle(zee, -deg2rad(orient)));
};

const CardboardView = ({ enabled }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const stereo = useMemo(() => new StereoEffect(gl), [gl]);
  const orientation = useRef({ alpha: 0, beta: 0, gamma: 0, orient: 0 });

  useEffect(() => {
    stereo.setSize(size.width, size.height);
  }, [stereo, size]);

  // Subscribe to gyroscope + screen-rotation while cardboard mode is on.
  useEffect(() => {
    if (!enabled) return;
    const o = orientation.current;
    const onDevice = (e) => {
      o.alpha = e.alpha ?? 0;
      o.beta = e.beta ?? 0;
      o.gamma = e.gamma ?? 0;
    };
    const onScreen = () => {
      o.orient = window.screen?.orientation?.angle ?? window.orientation ?? 0;
    };
    onScreen();
    window.addEventListener("deviceorientation", onDevice, true);
    window.addEventListener("orientationchange", onScreen, false);
    return () => {
      window.removeEventListener("deviceorientation", onDevice, true);
      window.removeEventListener("orientationchange", onScreen, false);
    };
  }, [enabled]);

  // Restore normal pixel size when leaving cardboard mode.
  useEffect(() => {
    if (enabled) return;
    return () => gl.setSize(size.width, size.height, false);
  }, [enabled, gl, size]);

  // priority > 0 suppresses fiber's default render; we render via the stereo effect.
  useFrame(() => {
    if (!enabled) return;
    setFromOrientation(camera.quaternion, orientation.current);
    stereo.render(scene, camera);
  }, enabled ? 1 : 0);

  return null;
};

export default CardboardView;
