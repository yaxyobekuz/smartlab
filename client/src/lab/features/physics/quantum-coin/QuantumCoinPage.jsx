import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

const SIM_URL = "https://phet.colorado.edu/sims/html/quantum-coin-toss/latest/quantum-coin-toss_en.html";

// PhET "Quantum Coin Toss" simulation embedded in the physics section.
const QuantumCoinPage = () => (
  <div className="flex h-dvh flex-col overflow-hidden bg-background">
    {/* top bar */}
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
      <Link to="/physics" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Fizika
      </Link>
      <h1 className="text-sm font-semibold">Kvant tanga tashlash</h1>
      <span className="hidden text-xs text-muted-foreground sm:inline">
        Kvant holat va o'lchashni interaktiv o'rganing — PhET simulyatsiyasi
      </span>
      <a
        href={SIM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <ExternalLink size={14} /> Alohida ochish
      </a>
    </div>

    {/* simulation */}
    <div className="flex-1 overflow-hidden p-3 sm:p-4">
      <div className="h-full w-full overflow-hidden rounded-xl border border-border bg-card">
        <iframe
          src={SIM_URL}
          title="Kvant tanga tashlash (PhET)"
          className="h-full w-full"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  </div>
);

export default QuantumCoinPage;
