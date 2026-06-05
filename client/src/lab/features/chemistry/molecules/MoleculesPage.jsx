import { useMemo, useState } from "react";
import Scene from "@/lab/components/Scene";
import LabWorkspace from "@/lab/components/LabWorkspace";
import FormulaText from "@/lab/components/FormulaText";
import MoleculeModel from "./MoleculeModel";
import { MOLECULES, getMolecule, getElementMeta } from "@/lab/data/molecules";

const STATE_LABEL = { gaz: "Gaz", suyuq: "Suyuq", qattiq: "Qattiq" };

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2">
    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
      {label}
    </div>
    <div className="mt-0.5 text-sm font-medium">{value}</div>
  </div>
);

const MoleculesPage = () => {
  const [activeId, setActiveId] = useState(MOLECULES[0].id);
  const molecule = getMolecule(activeId);

  // Unique elements present, for a small colour legend.
  const legend = useMemo(() => {
    const seen = [];
    for (const a of molecule.atoms) if (!seen.includes(a.el)) seen.push(a.el);
    return seen.map((sym) => ({ sym, ...getElementMeta(sym) }));
  }, [molecule]);

  return (
    <LabWorkspace
      title="Molekulalar"
      description="Molekulani sichqoncha bilan aylantiring, atom ustiga olib boring."
      backTo="/chemistry"
      backLabel="Kimyo"
      items={MOLECULES}
      activeId={activeId}
      onSelect={setActiveId}
      scene={
        <Scene camera={[0, 0, 6]} bg="#0b1020">
          <MoleculeModel molecule={molecule} />
        </Scene>
      }
      info={
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {molecule.category}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {STATE_LABEL[molecule.state]}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-semibold">{molecule.name}</h2>
            <FormulaText
              formula={molecule.formula}
              className="text-2xl font-light text-primary"
            />
          </div>

          <p className="text-sm text-muted-foreground">{molecule.about}</p>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Molekulyar massa" value={`${molecule.weight} g/mol`} />
            <Stat label="Atomlar" value={molecule.atoms.length} />
            <Stat label="Bog'lar" value={molecule.bonds.length} />
            <Stat label="Elementlar" value={legend.length} />
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Elementlar
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {legend.map((el) => (
                <li
                  key={el.sym}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2 py-1 text-xs"
                >
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: el.color }}
                  />
                  <span className="font-medium">{el.sym}</span>
                  <span className="text-muted-foreground">{el.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    />
  );
};

export default MoleculesPage;
