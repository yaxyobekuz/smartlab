// Agent vositalari (function calling). Bularni server bajarmaydi - har bir
// chaqiruv frontendga "action" sifatida yuboriladi va u yerda 3D sahna ustida
// bajariladi. Shu sabab argumentlar oddiy va xavfsiz bo'lishi shart.
export const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "control_scene",
      description:
        "3D sahnani boshqarish: kamerani yaqinlashtirish/uzoqlashtirish, tiklash yoki aylanishni to'xtatish/davom ettirish. Foydalanuvchi 'yaqinlashtir', 'kattalashtir', 'to'xtat' kabi so'raganda chaqir.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["zoom_in", "zoom_out", "reset", "pause", "resume"],
            description: "Sahna ustida bajariladigan amal.",
          },
        },
        required: ["action"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_topic",
      description:
        "Foydalanuvchini boshqa fan yoki mavzuga olib o'tish. Masalan foydalanuvchi 'DNK ni ko'rsat' yoki 'fizikaga o't' desa chaqir.",
      parameters: {
        type: "object",
        properties: {
          subject: {
            type: "string",
            enum: ["chemistry", "biology", "physics"],
            description: "Fan kodi.",
          },
          topic: {
            type: "string",
            description:
              "Mavzu slug'i, masalan: molecules, lab, atoms, cell, dna, solar-system, wave.",
          },
        },
        required: ["subject", "topic"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "select_item",
      description:
        "Joriy mavzuda muayyan modelni (molekula, sayyora, to'lqin va h.k.) tanlash. Faqat joriy mavzuda mavjud item id'laridan birini uzat. Mavjud id'lar har bir so'rovda kontekstda beriladi.",
      parameters: {
        type: "object",
        properties: {
          itemId: {
            type: "string",
            description: "Tanlanadigan model id'si.",
          },
        },
        required: ["itemId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_quiz",
      description:
        "Foydalanuvchini sinash uchun joriy mavzu bo'yicha bitta test savoli tuzish. Foydalanuvchi 'meni sina', 'test ber', 'savol ber' desa chaqir.",
      parameters: {
        type: "object",
        properties: {
          question: { type: "string", description: "Test savoli (o'zbekcha)." },
          options: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 4,
            description: "Javob variantlari (2-4 ta).",
          },
          correctIndex: {
            type: "integer",
            description: "To'g'ri javob indeksi (0 dan boshlanadi).",
          },
        },
        required: ["question", "options", "correctIndex"],
        additionalProperties: false,
      },
    },
  },
];
