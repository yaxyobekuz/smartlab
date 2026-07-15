# AI Laboratory

## Snapshot
**Current state:** Nothing built yet — no `ai` subject exists in `client/src/lab/data/subjects.js`; this is a greenfield fifth subject alongside Kimyo/Biologiya/Fizika/Elektronika. The stack already ships everything needed (R3F + drei, canvas/SVG demos, Gemini integration proven in the `AIReactionModal` flow), plus **TensorFlow.js + ml5.js run real training in the browser** — no backend GPU required. **Vision (one line):** the only lab where students don't *watch* science — they **train, break, and debug a real model with their own hands**, from a single neuron to a webcam classifier they build in 60 seconds.

## Feature Tree

| Branch | Concrete instantiation for AI Laboratory | Status | Priority |
|---|---|---|---|
| **Theory** | "Neyron qanday o'rganadi" — scrollytelling darslar (React + IntersectionObserver), matn oqilishi bilan yonma-yon jonli mini-demolar (perceptron, gradient) | 🆕 | P0 |
| **Experiment** | **Model Lab** — foydalanuvchi datasetni tanlaydi, giperparametrlarni buradi, TF.js real-vaqtda o'qitadi, metrikalarni kuzatadi | 🆕 | P0 |
| **Simulation** | RL labirint agenti + 3D gradient descent landshafti (R3F) — optimizatsiya va mukofot sikllari | 🆕 | P1 |
| **Calculator** | **Neuron kalkulyatori** (∑wᵢxᵢ+b → activation), **Confusion-matrix / accuracy–precision–recall kalkulyatori**, **Model params & xotira kalkulyatori** | 🆕 | P1 |
| **Interactive Graph** | Jonli loss/accuracy egri chiziqlari, qaror chegarasi (decision boundary) plot, ROC egri chizig'i — hammasi SVG/canvas, epoch bo'yicha animatsiyalanadi | 🆕 | P0 |
| **Challenge** | "Beat the baseline" — modelni target aniqlikka sozlash; **"Prompt golf"** — kerakli natijani eng kam tokenda olish | 🆕 | P1 |
| **Quiz** | ML tushunchalari testi + **"Inson vs AI"** taxmin o'yini — *parallel quiz-engine*'ga ulanadi (hozircha stub) | 🟡 | P2 |
| **AI Tutor** | **Ustoz AI** — Gemini asosidagi kontekstga bog'liq murabbiy; mavjud `AIReaction` Gemini infratuzilmasini qayta ishlatadi | 🟡 | P1 |
| **Real-life Examples** | Galereya: spam filtri, yuz bilan qulf ochish, tavsiya tizimi, self-driving idrok, ChatGPT — har biri "qaysi demo buni tushuntiradi" havolasi bilan | 🆕 | P2 |
| **Mini Game** | **"Neyron ovi"**, **"Soxtasini top" (real vs AI-generated)**, **"Klaster savdosi"** | 🆕 | P2 |
| **Achievements** | "Birinchi modelni o'qitding", "Spiralni yechding", "Prompt ustasi" nishonlari — *parallel gamification*'ga ulanadi (stub) | 🟡 | P2 |
| **3D Models** | R3F: loss landshafti, 3D embedding galaktikasi, 3D neyron tarmoq grafi, transformer attention oqimi | 🆕 | P1 |

## Demo Playground

| Demo | Status | Purpose | Learning Objective | UI | Animations | Controls | Input | Output | Result | Difficulty | Dev (days) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Perceptron / Neuron** 🆕 | 🆕 | Bitta neyron = tortilgan yig'indi + aktivatsiya | Weights, bias, aktivatsiya, chiziqli ajratish | SVG neyron + input nuqtalar + weight sliderlar + output lampochka; 2D scatter + suriladigan chegara chizig'i | Chekkalar bo'ylab signal pulsi; weight o'zgarganda chiziq buriladi; xato nuqtalar chaqnaydi | Weight/bias sliderlar, aktivatsiya dropdown (step/sigmoid/ReLU), nuqta qo'yish | Foydalanuvchi joylagan 2D nuqta + label | Jonli output qiymati, chegara, aniqlik | *Aha:* chiziq = neyron; XOR yechilmaydi → qatlamlar kerak | Beginner | 3 |
| **Neural Net Trainer** 🆕 | 🆕 | Kichik MLP'ni brauzerda qurish va o'qitish | Qatlamlar, epochlar, loss pasayishi, overfitting | SVG tarmoq grafi (neyron qo'sh/o'chir) + TF.js o'qitish + jonli loss chart + boundary canvas (TF Playground uslubi) | Chekka qalinligi/rangi = weight; boundary har epochda morflanadi | Layer/neuron qo'shish, learning-rate slider, dataset (spiral/doira/xor), play/pause/step | Toy 2D dataset + giperparametrlar | Animatsiyalangan qaror chegarasi + loss/acc egri | Spiralni ~200 epochda "o'rganganini" ko'rish | Intermediate | 6 |
| **Image Classifier (draw & recognize)** 🆕 | 🆕 | Qo'lda chizilgan raqam/shaklni tanish | Piksel→belgi→bashorat, ishonch (confidence) | 28×28 chizish paneli + class ehtimolliklari bar chart + TF.js MNIST/doodle modeli | Barlar o'sadi; top-taxmin yoritiladi; qaysi piksel "yongani" heatmap | Chiz/o'chir, tozalash, cho'tka o'lchami, model toggle (raqam/doodle) | Canvas chizmasi | Bashorat qilingan sinf + ishonch barlari | 7 chizasan → 92% "7"; iflos inputda xato qilishini ko'rasan | Beginner | 4 |
| **Linear Regression fit** 🆕 | 🆕 | Ma'lumotga chiziq moslash, xatoni kamaytirish | Slope/intercept, MSE, least-squares vs gradient descent | SVG scatter + suriladigan chiziq + residual tayoqchalar + MSE ko'rsatkichi | Residual tayoqchalar cho'ziladi; chiziq eng yaxshi moslamaga siljiydi | Chiziq uchlarini surish, "auto-fit", nuqta qo'sh/o'chir, GD-step slider | Foydalanuvchi nuqtalari | Best-fit tenglama, R², MSE | Qo'lda chizgan chiziging vs optimum — farq raqamda | Beginner | 2.5 |
| **Decision Tree** 🆕 | 🆕 | Rekursiv bo'lish (splitting) qanday ishlaydi | Belgilar, chegaralar, entropy/gini, poklik | R3F/SVG daraxt diagrammasi + yonida 2D feature-space bo'linishi | Daraxt tugun-tugun o'sadi; hududlar bo'linadi; gini bar qisqaradi | Max-depth slider, "keyingi split", belgi toggle, dataset tanlash | Belgili 2D dataset | Daraxt + bo'lingan qaror hududlari + aniqlik | Chuqurroq daraxt = overfit; hududlar tishli bo'lib ketadi | Intermediate | 4 |
| **K-Means clustering** 🆕 | 🆕 | Nazoratsiz guruhlash | Sentroidlar, assign/update sikli, konvergensiya, k tanlash | SVG scatter, rangli klasterlar, sentroid yulduzlar, iteratsiya hisoblagich | Nuqtalar qayta ranglanadi; sentroidlar o'rtachaga siljiydi; Voronoi kataklar | k slider, step/run, qayta-urug'lantirish, nuqta qo'yish | Nuqta buluti + k | Klaster taqsimoti + sentroidlar + inertia | Sentroidlar konvergensiyasi; yomon k/urug' = yomon klaster (elbow) | Beginner | 3 |
| **RL Maze Agent** 🆕 | 🆕 | Agent mukofot orqali o'rganadi | State/action/reward, Q-jadval, exploration vs exploitation | Grid labirint (SVG/canvas) + Q-qiymat heatmap qatlami + agent sprite + reward jurnali | Agent katakdan katakka sakraydi; Q-qiymatlar issiqlik bo'lib chiqadi; strelkalar = policy | Reward/penalty sliderlar, epsilon slider, tezlik, reset, devor/goal qo'yish | Labirint tuzilishi + giperparametrlar | O'rganilgan policy strelkalari + episode bo'yicha muvaffaqiyat | N episoddan keyin agent eng qisqa yo'lni topadi — "aqlli bo'lishini" ko'rasan | Advanced | 6 |
| **Prompt / Tokenizer Playground** 🆕 | 🆕 | LLM matnni qanday o'qishini + prompt san'atini ochish | Token ≠ so'z, temperature, kontekst oynasi, prompt tuzilishi | Token bo'yicha ranglangan matn maydoni + token soni + xarajat o'lchagichi + Gemini paneli | Yozayotganda tokenlar ranglanadi; keyingi-token ehtimolliklari oqib chiqadi | Temperature/top-k sliderlar, model tanlash, tokenizer toggle, namuna promptlar | Foydalanuvchi prompt matni | Token bo'linishi + son + Gemini javobi + ehtimolliklar | "hamburger" = 2 token; temperature ijodkorlikni jonli o'zgartiradi | Beginner | 4 |
| **Teachable-Machine Webcam Trainer** 🆕 | 🆕 | 60 soniyada o'z rasm klassifikatoringni o'qit | Transfer learning, sinflar, namuna→aniqlik, ma'lumot sifati | Webcam oqimi + sinf tugmalari + jonli bashorat bar + ml5/TF.js MobileNet feature-extractor | Namuna thumbnaillar sinf chelaklariga uchadi; ishonch bar jonli | "Sinf qo'sh", "capture" (ushlab tur), train, reset | Har sinf uchun webcam kadrlari | Imo-ishorang/predmetni real-vaqt klassifikatsiyasi | Bir daqiqada "thumbs up vs down" o'rgatasan — AI'ni SEN yasading | Intermediate | 5 |
| **Gradient Descent 3D Landscape** 🆕 | 🆕 | Loss yuzasida optimizatsiyani ko'rish | Gradientlar, learning rate, lokal minimum, momentum | R3F 3D loss yuzasi + dumalayotgan shar + kontur soya-xarita | Shar pastga step-step dumalaydi; iz qoldiradi; yuqori LR'da o'tib ketadi | Learning-rate slider, momentum, start-nuqta surish, yuza tanlash (convex/saddle/multi) | Giperparametrlar + start nuqta | Descent yo'li + yakuniy loss | Juda yuqori LR uzoqlashadi, past LR sudraladi — tradeoff'ni his qilasan | Intermediate | 5 |
| **Word Embedding / Vector Space Explorer** 🆕 | 🆕 | So'zlar = vektorlar; o'xshashlik, analogiya | Embeddinglar, cosine similarity, king−man+woman≈queen | R3F 3D nuqta buluti (PCA-proyeksiyalangan oldindan hisoblangan embeddinglar) + qidiruv + o'xshashlik ro'yxati | Kamera so'zga uchadi; qo'shnilar yonadi; analogiya strelkasi chiziladi | So'z qidiruv, "analogiya top" a:b::c:?, klaster rang toggle | So'z(lar) | Eng yaqin qo'shnilar + analogiya natijasi + cosine ballar | Ma'no ustida matematika: Paris−France+Italy≈Rome | Intermediate | 4 |
| **Convolution & CNN Filter Playground** 🆕 | 🆕 | CNN qanday "ko'radi" | Kernellar, feature map, chekka/blur, filtrlarni ustma-ust qo'yish | Canvas rasm + 3×3 kernel muharriri + filtrlangan chiqish + feature-map galereyasi | Sirg'aluvchi oyna rasm ustida yuguradi; chiqish piksel to'ladi | Kernel qiymatlari, preset (edge/sharpen/blur/sobel), rasm yuklash, stride | Rasm + kernel | Konvolyutsiyalangan rasm + aktivatsiya xaritasi | 3×3 raqamlar to'ri chekkalarni topadi — bu CNN'ning 1-qatlami | Intermediate | 3.5 |
| **AI Bias & Fairness Detective** 🆕 | 🆕 | Dataset xolisligi va oqibatlarini fosh qilish | Xolis ma'lumot → xolis model, adolat metrikalari, vakillik | Dataset jadvali + tarkib skew slideri + jonli o'qitilgan model + guruh bo'yicha natija chart | Bias oshgani sari guruh barlari ajraladi; "rad etildi/tasdiqlandi" muhrlar | Guruh nisbat sliderlar, belgi qo'sh/olib tashla toggle, retrain | Dataset tarkibi tanlovi | Guruh bo'yicha aniqlik + adolat farqi metrikasi | Skew qilingan ma'lumot → model kam vakil guruhga adolatsiz — o'lchanadi | Advanced | 5 |

## 3D / Interactive Experiences

| Experience | Interactions | What it teaches | Complexity |
|---|---|---|---|
| **3D Neyron Tarmoq Grafi** | rotate / zoom / animate (forward-pass signal) / labels / hotspots (neyronni bosib → aktivatsiya) | Qatlamlar va forward pass | Med |
| **Loss Landshafti (R3F)** | rotate / zoom / animate (shar dumalashi) / measure (loss) / cross-section (kontur) | Optimizatsiya va gradient descent | Med |
| **3D Embedding Galaktikasi** | rotate / zoom / hotspots (so'zlar) / animate (so'zga uchish) | Semantik makon va o'xshashlik | Med |
| **Transformer Attention Oqimi** | animate (token→token nur dastalari) / labels / hotspots (tokenni tanlash) / head toggle | Self-attention mexanizmi | High |
| **CNN Feature-Map Stack** | explode (qatlamlarni ajratish) / cross-section / hotspots / labels | Ierarxik belgilar (chekka→shakl→obyekt) | High |
| **RL Labirint Q-Heatmap** | animate (agent) / hotspots (katak Q-qiymati) / measure (reward) | Value-funksiya va policy | Med |
| **Data Pipeline Konveyeri** | animate (ma'lumot xom→toza→train→predict oqadi) / hotspots / labels | ML hayotiy sikli | Low-Med |
| **Decision Boundary Relyefi** | rotate / zoom / animate (o'qitilganda morflanadi) / cross-section | Model makonni qanday "kesadi" | Med |
| **Tokenizatsiya Lentasi** | animate (matn→token bo'laklar→id→embedding) / hotspots / labels | LLM matnni qanday yutadi | Low-Med |

## Roadmap (skill ladder)

| Level | Focus | Topics & Demos | Outcome |
|---|---|---|---|
| **Beginner** | "AI nima?" — intuitsiya, birinchi model | Perceptron/Neuron, Linear Regression, K-Means, Image Classifier (draw), Tokenizer Playground; "Neyron qanday o'rganadi" darsi | Model nimaligini tushuntira oladi, chizib birinchi klassifikatorini "o'qitadi", token ≠ so'zni biladi |
| **Intermediate** | O'qitish va sozlash | Neural Net Trainer, Decision Tree, Convolution Playground, Word Embeddings, Teachable-Machine, Gradient Descent 3D | MLP quradi va sozlaydi, overfitting/loss egrisini o'qiydi, transfer learning bilan o'z modelini yasaydi |
| **Advanced** | Chuqur o'rganish va ketma-ketliklar | RL Maze Agent, Transformer Attention Visualizer, CNN Feature-Map Stack, temperature/top-k bilan Prompt Playground | Attention va RL siklini tushunadi, prompt injeneriyani qo'llaydi, giperparametr tuning yuritadi |
| **Expert** | Frontiers + axloq + capstone | AI Bias Detective, generativ (GAN/diffusion) tushunchasi, agentic-LLM mini-loyiha; **Capstone:** o'z mini-modelini qur + adolatini baholab yozib chiqar | End-to-end mini-ilova quradi, adolat/bias'ni baholaydi, portfolio loyihasini "ship" qiladi |

## Feature Economics

| Feature | Purpose | Educational Value | Complexity | Priority | Dev Cost | Est User Engagement |
|---|---|---|---|---|---|---|
| **Neural Net Trainer (TF.js Playground)** | MLP'ni jonli qurish/o'qitish — subyektning flagmani | Very High | High | P0 | 6 dev-days | Very High |
| **Teachable-Machine Webcam Trainer** | Foydalanuvchi 60s'da o'z AI'sini yasaydi | Very High | Med-High | P0 | 5 dev-days | Very High |
| **Prompt / Tokenizer Playground** | LLM savodxonligi + Gemini bilan jonli tajriba | High | Med | P0 | 4 dev-days | Very High |
| **Image Classifier (draw & recognize)** | Eng intuitiv "birinchi tajriba" demosi | High | Low-Med | P0 | 4 dev-days | High |
| **ML Basics Bundle (Perceptron + Linear Reg + K-Means)** | Fundament: weight, xato, klaster | High | Low | P0 | 5 dev-days (jami) | Med-High |
| **RL Maze Agent** | Mukofot orqali o'rganish — eng "sehrli" demo | High | High | P1 | 6 dev-days | High |
| **Ustoz AI Tutor (Gemini)** | Har demoda kontekstga bog'liq murabbiy (mavjud infra qayta ishlatiladi) | High | Med | P1 | 4 dev-days | Med-High |
| **Gradient Descent 3D Landscape** | Optimizatsiya intuitsiyasi (R3F flagman 3D) | High | Med | P1 | 5 dev-days | Med |
| **AI Bias & Fairness Detective** | Axloq va mas'uliyatli AI — differensiatsiya nuqtasi | Very High | Med-High | P2 | 5 dev-days | Med |

---
**Build notes (load-bearing):** all in-browser training runs on **`@tensorflow/tfjs` (WebGL backend)** + **`ml5.js`** for MobileNet transfer learning (webcam/image demos) — zero server GPU. Tokenizer is **local** (`gpt-tokenizer`/`js-tiktoken`), Gemini is only called for live completions and Ustoz AI, reusing the existing `AIReactionModal`/Gemini hook pattern. 3D experiences reuse the current **R3F + drei** setup. Registry hook: add a `{ slug: "ai", title: "Sun'iy intellekt", icon: "BrainCircuit", color: "#db2777", topics: [...] }` entry to `client/src/lab/data/subjects.js`, features under `client/src/lab/features/ai/*`, no new route logic needed (`/:subject/:topic` already covers it). Quiz/Achievements branches are intentionally 🟡 — they consume the parallel quiz-engine and gamification systems via a thin adapter once those land.
