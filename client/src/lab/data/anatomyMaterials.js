// Z-Anatomy GLB models name their parts only by material (Bone, Muscles, Eye...),
// and many ship without baseColor. This map gives each material an anatomical
// color + an Uzbek label, used for tinting and for the hover tooltip.
// Key = material base name (trailing ".001" etc. stripped, case-insensitive).
export const ANATOMY_MATERIALS = {
  artery: { color: "#c0392b", label: "Arteriya" },
  articular_capsule: { color: "#8e7cc3", label: "Bo'g'im kapsulasi" },
  bone: { color: "#e8dcc0", label: "Suyak" },
  brain: { color: "#f2b6c6", label: "Bosh miya" },
  bronchi: { color: "#d98880", label: "Bronxlar" },
  cartilage: { color: "#aed6f1", label: "Tog'ay" },
  cerebellum: { color: "#e8a0b8", label: "Miyacha" },
  cornea: { color: "#aab7c4", label: "Shox parda" },
  ductus: { color: "#7dcea0", label: "Yo'l (kanal)" },
  eye: { color: "#fdfefe", label: "Ko'z" },
  fat: { color: "#f7dc6f", label: "Yog' to'qimasi" },
  gland: { color: "#bb8fce", label: "Bez" },
  intestine: { color: "#e59866", label: "Ichak" },
  iris: { color: "#5499c7", label: "Rangdor parda" },
  lcr: { color: "#a9cce3", label: "Miya suyuqligi" },
  ligament: { color: "#d5dbdb", label: "Boylam" },
  lung: { color: "#ec7063", label: "O'pka" },
  mucosa: { color: "#f5b7b1", label: "Shilliq parda" },
  muscles: { color: "#c0392b", label: "Mushak" },
  muscular_ending: { color: "#2980b9", label: "Mushak tugashi" },
  muscular_origin: { color: "#c0392b", label: "Mushak boshlanishi" },
  nerve: { color: "#f4d03f", label: "Nerv" },
  nucleus: { color: "#9b59b6", label: "Yadro" },
  organ: { color: "#cd6155", label: "A'zo" },
  peritoneum: { color: "#fadbd8", label: "Qorin pardasi" },
  suture: { color: "#d7ccc8", label: "Choklar" },
  teeth: { color: "#fdf6e3", label: "Tishlar" },
  tendon: { color: "#d5d8dc", label: "Pay" },
  vein: { color: "#2c3e94", label: "Vena" },
  white_matter: { color: "#fae5d3", label: "Oq modda" },
};

// Resolve a material name (e.g. "Cartilage.002") to its color + Uzbek label.
export const resolveMaterial = (name) => {
  if (!name) return null;
  const key = name.replace(/\.\d+$/, "").toLowerCase();
  return ANATOMY_MATERIALS[key] || null;
};
