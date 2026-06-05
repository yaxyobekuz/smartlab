// Shared world-space constants so the stand, clamp, tube, burner and flame all
// line up: the tube is clamped to the stand and the burner sits directly under
// it. All Y values are world coordinates with the bench floor at y = 0.

export const TUBE_X = 0;
export const TUBE_BASE_Y = 0.8; // world Y of the tube's lowest (rounded) point
export const TUBE_HEIGHT = 2.4;
export const TUBE_OUTER_R = 0.42;
export const TUBE_INNER_R = 0.34;
export const TUBE_LIQUID_MAX = 2.05; // liquid column height at fill = 1
export const TUBE_MOUTH_Y = TUBE_BASE_Y + TUBE_HEIGHT; // ≈ 3.2

export const CLAMP_Y = 1.95; // where the clamp ring grips the tube
export const ROD_X = -1.15;

export const BURNER_Y = 0.12; // burner sits on the stand base top
export const FLAME_Y = 0.66; // world Y of the flame base (the wick)

export const CAMERA_POSITION = [3.0, 2.1, 4.3];
export const CAMERA_TARGET = [0, 1.5, 0];
