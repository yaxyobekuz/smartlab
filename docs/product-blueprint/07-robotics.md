# Robotics

## Snapshot
**Current state:** Nothing exists yet — Robotics is a greenfield subject. The registry (`client/src/lab/data/subjects.js`) has no `robotics` entry; every topic, page, and demo below is 🆕. The stack it will reuse is already proven in-repo: R3F for 3D scenes (anatomy, solar-system), plain SVG + an offline JS simulator loop (the `electronics/arduino` circuit builder), Recharts for graphs, and Gemini for AI features.
**Vision:** *"Robotni faqat tomosha qilma — dasturla, sozla, boshqar."* A hands-on robotics playground where a learner writes/blocks logic, tunes sensors and PID gains, and watches a physics-driven robot succeed or crash — turning abstract control theory into a felt, measurable outcome.

Proposed registry entry: `slug: "robotics"`, `title: "Robototexnika"`, `icon: "Bot"`, `color: "#0891b2"`.

## Feature Tree

| Branch | Concrete instantiation for Robotics | Status | Priority |
|---|---|---|---|
| **Theory** | "Sensorlar va aktuatorlar" lesson set: sensor→controller→motor loop, degrees of freedom, PWM, PID intuition — MDX pages with inline mini-canvases | 🆕 | P0 |
| **Experiment** | "IR sensor kalibratsiyasi": drag a virtual line-sensor over black/white surface, read live reflectance values, set a threshold that actually feeds the Line Follower demo | 🆕 | P1 |
| **Simulation** | `RobotSimEngine` — shared fixed-timestep (60 Hz) 2D kinematics + collision core (three-mesh-bvh raycasts) powering Line Follower, Maze, Obstacle, Rover | 🆕 | P0 |
| **Calculator** | "Motor & gear kalkulyatori": RPM↔torque, gear ratio, wheel-diameter→linear speed, servo angle→PWM µs, battery-life estimator | 🆕 | P1 |
| **Interactive Graph** | Recharts live plot of sensor error, motor output, and robot position vs time — scrub/replay a run, overlay two PID tunings | 🆕 | P1 |
| **Challenge** | "Trassani 10 soniyada tugat" / "Labirintdan chiq" timed missions with a par time and 3-star scoring, feeding the (parallel) achievements system | 🆕 | P1 |
| **Quiz** | Per-topic MCQ + "predict the outcome" drag questions; hooks into the parallel quiz engine via a `robotics` question bank JSON | 🆕 | P2 |
| **AI Tutor** | Gemini "Robo-murabbiy": explains why the robot crashed, suggests a threshold/gain change, and can rewrite the learner's block program into working logic | 🆕 | P1 |
| **Real-life Examples** | Gallery cards: Roomba (obstacle+wall-follow), Amazon Kiva rover, Boston Dynamics balance, DJI drone, ABB welding arm — each links to the matching demo | 🆕 | P2 |
| **Mini Game** | "Sumo Bot" — tune + launch your bot to push the opponent out of the ring; leaderboard by win streak | 🆕 | P2 |
| **Achievements** | Badges: *First Loop*, *Maze Master*, *PID Whisperer*, *Zero-Crash Run*, *Swarm Commander* — emitted as events for the parallel gamification service | 🆕 | P2 |
| **3D Models** | GLB library: 6-DOF arm, humanoid, quadcopter, rover chassis, differential-drive bot, conveyor + gripper — loaded via drei `useGLTF`, exploded/labeled | 🆕 | P0 |

## Demo Playground

All demos 🆕. Share one `RobotSimEngine` (fixed-step loop, sensor raycasts, motor model) so behavior is consistent and cheap to extend.

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Line Follower** | 🆕 | Show closed-loop sensor→motor control | IR threshold + P-control keeps robot on track | 2D SVG top-down track + side telemetry panel | Wheels spin, bot hugs curve, wobble on overshoot | Sliders: threshold, Kp, speed; Start/Reset | 2 virtual IR readings (0–1023) | Left/right motor PWM, on/off-line flag | Bot completes loop; high Kp = oscillation, aha on tuning | Beginner | 4 |
| **Obstacle Avoiding** | 🆕 | Reactive avoidance from range sensing | Ultrasonic distance → turn decision | 2D SVG arena, ultrasonic cone drawn as fan | Bot brakes, pivots away, cone recolors on hit | Sliders: stop-distance, turn-angle; drop obstacles by click | Distance to nearest wall (cm) | Steering + speed | Bot navigates cluttered room crash-free | Beginner | 3 |
| **Robot Arm** | 🆕 | Forward/inverse kinematics on a 6-DOF arm | Joint angles ↔ end-effector position | R3F scene, GLB arm, target gizmo, joint readouts | Smooth joint interpolation, gripper open/close | Sliders per joint (FK) OR drag target (IK) | 6 joint angles or XYZ target | End-effector pose, reachable/unreachable flag | Learner places tip on a dot; sees IK solve live | Intermediate | 8 |
| **Maze Robot** | 🆕 | Pathfinding vs reactive wall-following | Left-hand rule vs BFS/A* | 2D canvas grid maze, editable walls | Bot traces path, visited cells shade, path highlights | Draw maze, pick algorithm, step/auto | Wall map / local sensors | Route taken, cell count, solved flag | "Wall-follow gets stuck, A* is optimal" contrast | Intermediate | 6 |
| **Balance Robot** | 🆕 | Inverted-pendulum PID stabilization | PID keeps tilt near 0° | R3F 2-wheel bot on ground plane, tilt gauge | Bot teeters, recovers or topples; body sway | Sliders: Kp/Ki/Kd; nudge (impulse) button | Tilt angle + angular velocity | Wheel torque; falls if unstable | Well-tuned bot survives a shove; bad gains = faceplant | Advanced | 7 |
| **Humanoid Robot** | 🆕 | Kinematic gait & pose control | Bipedal DOF coordination, static balance | R3F GLB humanoid, foot-support polygon overlay | Preset gait cycle, wave, squat; CoM marker moves | Play gait, speed slider, pose presets, joint sliders | Gait params / joint targets | Animated walk, balance-OK indicator | See why widening stance stops the tip-over | Advanced | 9 |
| **Drone** | 🆕 | Quadcopter thrust & attitude control | 4-rotor differential thrust → roll/pitch/yaw/alt | R3F scene, spinning rotors, altitude + attitude HUD | Prop blur, tilt-to-move, hover bob, wind gusts | Virtual joysticks (throttle/yaw + pitch/roll) | Stick inputs (+ optional altitude-hold PID) | Per-rotor thrust, 3D position | Learner hovers steady, then does a waypoint lap | Advanced | 8 |
| **Rover** | 🆕 | Waypoint navigation + terrain | Differential drive, GPS-style waypoint following | R3F low-poly terrain, path line, minimap | 6-wheel rock-crawl, dust, camera follow | Click-to-set waypoints, speed, auto/manual | Waypoint list, heading error | Motor commands, distance-to-goal | Rover autonomously reaches Mars-flag waypoints | Intermediate | 7 |
| **Conveyor Robot** | 🆕 | Sensor-triggered sorting automation | Photodiode trigger → actuator timing | 2D SVG belt + bins, sensor gate | Boxes slide, arm/pusher fires, sorted by color | Belt speed, sensor position, sort rule editor | Box color/size at gate | Pusher fire events, throughput count | Optimize timing → 0 mis-sorts at max speed | Intermediate | 5 |
| **Pick and Place** | 🆕 | Task sequencing for an industrial cell | Pick→lift→move→drop state machine | R3F arm + bins + parts, sequence timeline | Grip close, part follows gripper, place snap | Record/edit waypoint sequence, run, loop | Part positions, gripper state | Cycle time, parts placed, drops | Learner authors a repeatable pick-place cycle | Advanced | 8 |
| **Swarm Robots** 🆕(+) | 🆕 | Emergent behavior from local rules | Boids: separation/alignment/cohesion | 2D canvas, dozens of agents | Flocking, splitting, re-forming around obstacles | Sliders: 3 boid weights, agent count, goal point | Neighbor positions | Collective heading, formation | "No leader, yet they flock" emergence aha | Advanced | 5 |
| **Self-Driving Car** 🆕(+) | 🆕 | Perception→control lane keeping | Sensor array + steering PID + lane detect | 2D SVG road with curves + other cars | Steering wheel turns, lane overlay, brake lights | Sliders: look-ahead, Kp; toggle traffic | Ray "camera" lane offsets | Steering/throttle/brake | Car completes circuit without lane departure | Advanced | 7 |
| **Sumo Bot Battle** 🆕(+) | 🆕 | Gamified strategy + tuning | Combine detection + aggression tactics | R3F dohyo ring, two bots, HP/push meter | Charge, shove, ring-out, sparks | Pre-match tune (speed/aggression/sensor), Fight! | Opponent bearing/distance | Movement + push force | Beat AI/friend; leaderboard streak | Intermediate | 6 |
| **Block-Code Bot** 🆕(+) | 🆕 | No-code programming of any bot | Sequencing, loops, conditionals w/ sensors | Drag-drop block canvas (custom, no lib) + live 2D bot | Blocks highlight as they execute | Drag blocks, run/step/stop, speed | Sensor reads inside blocks | Executed program → bot motion | Learner "codes" a line follower with 5 blocks | Intermediate | 9 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **6-DOF Arm Anatomy** | rotate, zoom, explode (base→shoulder→elbow→wrist→gripper), labels, hotspots, animate joints | Joint types, DOF, workspace envelope | Med |
| **Servo vs DC vs Stepper cutaway** | rotate, cross-section, animate rotation, labels, hotspots | How each motor turns and where it's used | Med |
| **Ultrasonic sensor cone** | rotate, animate ping wave, measure distance, hotspots | Time-of-flight ranging, blind spots | Low |
| **Differential drive playground** | animate, drag wheel-speed sliders, measure turn radius, top-down + 3D toggle | Steering by speed difference | Med |
| **Quadcopter thrust vectors** | rotate, animate rotor speeds, arrows for lift/torque, cross-section motor | Why counter-rotating props + how yaw works | Med |
| **Gripper mechanisms** | animate open/close, cross-section (parallel/vacuum/soft), measure grip width, hotspots | Grasp types and payload limits | Med |
| **Humanoid DOF map** | rotate, explode limbs, hotspots per joint, animate gait, CoM overlay | Bipedal complexity & balance | High |
| **Robot brain loop** | animate sense→think→act pulse, hotspots on MCU/sensor/motor, labels | The control-loop mental model | Low |
| **Assembly-line cell (AR)** | rotate, animate cycle, place in room via `@react-three/xr`, hotspots | Industrial automation in real space | High |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | What a robot is: sense→think→act | Theory (control loop, sensors/actuators), **Line Follower**, **Obstacle Avoiding**, motor calculator | Explains the loop; tunes an IR threshold to complete a track |
| **Intermediate** | Control & navigation | **Maze Robot**, **Rover**, **Conveyor**, **Block-Code Bot**, IR calibration experiment, interactive telemetry graph | Programs a bot with blocks; picks a pathfinding strategy and reaches a goal |
| **Advanced** | Feedback control & dynamics | **Balance Robot** (PID), **Robot Arm** (IK), **Drone**, **Self-Driving Car**, PID tuning graph overlay | Tunes PID gains from a step-response graph; solves IK to a target |
| **Expert** | Autonomy, multi-agent & authoring | **Humanoid gait**, **Pick & Place** sequencing, **Swarm**, **Sumo Battle**, AI-tutor code review | Designs a repeatable autonomous task; reasons about emergence and stability |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Line Follower demo** | Teach closed-loop control simply | Very High | Low | P0 | 4 days | Very High |
| **Shared RobotSimEngine** | Reusable physics/sensor core for all 2D demos | High (indirect) | High | P0 | 6 days | High (enables the rest) |
| **Robot Arm (FK/IK)** | Flagship 3D kinematics experience | Very High | High | P0 | 8 days | High |
| **Balance Robot (PID)** | Make abstract PID tunable & visceral | Very High | Med | P1 | 7 days | High |
| **Block-Code Bot** | No-code programming onramp | Very High | High | P1 | 9 days | Very High |
| **AI Robo-tutor (Gemini)** | Explain crashes, fix learner's logic | High | Med | P1 | 5 days | High |
| **Live telemetry graph (Recharts)** | Connect numbers to visible behavior | High | Low | P1 | 3 days | Med |
| **Drone flight sim** | High "wow", intuitive attitude control | High | Med | P1 | 8 days | Very High |
| **Sumo Bot mini-game** | Retention loop via competition | Med | Med | P2 | 6 days | High |
| **Motor/gear calculator** | Practical design tool, low cost | Med | Low | P2 | 2 days | Med |

---
**Build order (opinionated):** ship `RobotSimEngine` + **Line Follower** + telemetry graph first (proves the pattern, mirrors the existing `arduino` SVG-sim architecture), then **Robot Arm** as the 3D flagship, then **Balance Robot** + **AI tutor**, then game/retention layer (**Sumo**, achievements) and the **Block-Code Bot** authoring tool. Total P0+P1 core ≈ **57 dev-days**; full subject with all 14 demos ≈ **100–110 dev-days** for a small team. Every demo emits `run-complete`/`challenge-passed` events so the parallel quiz, progress, and achievements systems can hook in without touching demo code.
