// Arduino demo projects for the electronics topic.
// `type` drives the 3D animation; `code` is the matching sketch shown in the panel.

export const ARDUINO = [
  {
    id: "blink",
    name: "LED miltillashi",
    about:
      "Eng birinchi loyiha - 13-pinga ulangan LEDni bir soniyada yoqib-o'chirish. delay() dastur bajarilishini kutkazadi.",
    type: "blink",
    ledColor: "#22c55e",
    interval: 1,
    code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
  },
  {
    id: "fade",
    name: "Yorug'likni sozlash",
    about:
      "PWM (analogWrite) yordamida LED ravshanligini 0 dan 255 gacha silliq o'zgartiramiz. Faqat ~ belgili (PWM) pinlarda ishlaydi.",
    type: "fade",
    ledColor: "#3b82f6",
    interval: 2,
    code: `void loop() {
  for (int v = 0; v <= 255; v++) {
    analogWrite(9, v);
    delay(5);
  }
}`,
  },
  {
    id: "rgb",
    name: "RGB LED",
    about:
      "Uch kanal (qizil, yashil, ko'k) ravshanligini aralashtirib istalgan rangni hosil qilamiz. Har kanal alohida PWM pinga ulanadi.",
    type: "rgb",
    ledColor: "#a855f7",
    interval: 3,
    code: `void loop() {
  analogWrite(R, red);
  analogWrite(G, green);
  analogWrite(B, blue);
}`,
  },
  {
    id: "servo",
    name: "Servo motor",
    about:
      "Servo motor burchagini 0° dan 180° gacha aniq boshqaramiz. Servo kutubxonasi PWM signalini avtomatik hosil qiladi.",
    type: "servo",
    ledColor: "#f97316",
    interval: 2,
    code: `#include <Servo.h>
Servo s;

void setup() { s.attach(9); }

void loop() {
  for (int a = 0; a <= 180; a++) {
    s.write(a);
    delay(15);
  }
}`,
  },
  {
    id: "button",
    name: "Tugma va LED",
    about:
      "Tugma bosilganda LED yonadi. INPUT_PULLUP ichki rezistorni yoqib, pin holatini barqaror ushlaydi.",
    type: "button",
    ledColor: "#eab308",
    interval: 1.4,
    code: `void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  bool pressed = !digitalRead(2);
  digitalWrite(13, pressed);
}`,
  },
];

export const getArduino = (id) => ARDUINO.find((a) => a.id === id) || null;
