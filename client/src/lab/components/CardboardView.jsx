// Phone "cardboard" VR: renders the scene as a left/right split-screen (StereoEffect)
// and steers the camera with the device gyroscope. DeviceOrientationControls was
// dropped from three core, so the orientation→quaternion math is inlined here.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { StereoEffect } from "three/examples/jsm/effects/StereoEffect.js";
import { useSceneControlOptional } from "./sceneControl";

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
  const invalidate = useThree((s) => s.invalidate);
  // Gyro hech qachon ishlamasa, foydalanuvchini bo'sh stereo ko'rinishda
  // qoldirmay, avtomatik chiqib xabar beramiz.
  const { exitCardboard, setVrMessage } = useSceneControlOptional();

  const stereo = useMemo(() => new StereoEffect(gl), [gl]);
  const orientation = useRef({ alpha: 0, beta: 0, gamma: 0, orient: 0 });

  // StereoEffect mantiqiy (CSS) piksellarda ishlaydi; telefon dpr=2 bo'lsa,
  // ekranni faqat pastki-chap chorakka chizadi. Cardboard davomida dpr=1 ga
  // qotirib, chiqishda hammasini (pixelRatio, o'lcham, viewport, scissor) tiklaymiz.
  useEffect(() => {
    if (!enabled) return;
    const prevRatio = gl.getPixelRatio();
    gl.setPixelRatio(1);
    stereo.setSize(size.width, size.height);
    return () => {
      gl.setPixelRatio(prevRatio);
      gl.setSize(size.width, size.height, true);
      gl.setScissorTest(false);
      const c = gl.domElement;
      gl.setViewport(0, 0, c.width, c.height);
      invalidate(); // chiqishda qora kadr qolmasligi uchun bitta repaint
    };
  }, [enabled, gl, stereo, size, invalidate]);

  // Subscribe to gyroscope + screen-rotation while cardboard mode is on.
  useEffect(() => {
    if (!enabled) return;
    const o = orientation.current;
    let gotEvent = false;
    const onDevice = (e) => {
      if (e.alpha == null && e.beta == null && e.gamma == null) return;
      gotEvent = true;
      o.alpha = e.alpha ?? 0;
      o.beta = e.beta ?? 0;
      o.gamma = e.gamma ?? 0;
    };
    const onScreen = () => {
      o.orient = window.screen?.orientation?.angle ?? window.orientation ?? 0;
    };
    onScreen();
    // 'deviceorientationabsolute' iOS/Android'da barqarorroq yaw beradi.
    window.addEventListener("deviceorientationabsolute", onDevice, true);
    window.addEventListener("deviceorientation", onDevice, true);
    window.addEventListener("orientationchange", onScreen, false);
    window.screen?.orientation?.addEventListener?.("change", onScreen);
    // Watchdog: ~1.2s ichida haqiqiy gyro hodisasi kelmasa, avtomatik chiqamiz.
    const watchdog = window.setTimeout(() => {
      if (!gotEvent) {
        setVrMessage?.("Giroskop aniqlanmadi");
        exitCardboard?.();
      }
    }, 1200);
    return () => {
      window.clearTimeout(watchdog);
      window.removeEventListener("deviceorientationabsolute", onDevice, true);
      window.removeEventListener("deviceorientation", onDevice, true);
      window.removeEventListener("orientationchange", onScreen, false);
      window.screen?.orientation?.removeEventListener?.("change", onScreen);
    };
  }, [enabled, exitCardboard, setVrMessage]);

  // priority > 0 suppresses fiber's default render; we render via the stereo effect.
  useFrame(() => {
    if (!enabled) return;
    setFromOrientation(camera.quaternion, orientation.current);
    stereo.render(scene, camera);
  }, enabled ? 1 : 0);

  return null;
};

export default CardboardView;
