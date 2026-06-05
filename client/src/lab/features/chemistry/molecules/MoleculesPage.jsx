// Molecule library: searchable category list (left) + 3D viewer with toolbar
// (center) + PubChem info panel (right). 240 molecules from PubChem data.
import { useRef } from "react";
import Scene from "@/lab/components/Scene";
import Toolbar from "@/lab/components/Toolbar";
import { SceneControlProvider } from "@/lab/components/SceneControlProvider";
import { useSceneControl } from "@/lab/components/sceneControl";
import useObjectState from "@/shared/hooks/useObjectState";
import { cn } from "@/shared/utils/cn";
import MoleculeModel from "./MoleculeModel";
import MoleculeStates from "./MoleculeStates";
import MoleculeLibrarySidebar from "./MoleculeLibrarySidebar";
import MoleculeInfoPanel from "./MoleculeInfoPanel";
import { MOLECULE_LIBRARY, getLibraryMolecule } from "@/lab/data/moleculeLibrary";

// Ko'rinish: molekula modeli yoki uchta agregat holat (zarrachalar animatsiyasi).
const VIEWS = [
  { id: "molekula", label: "Molekula" },
  { id: "qattiq", label: "Qattiq" },
  { id: "suyuq", label: "Suyuq" },
  { id: "gaz", label: "Gaz" },
];

const STATE_HINT = {
  qattiq: "Zarrachalar panjara bo'lib qotgan va joyida tebranadi.",
  suyuq: "Zarrachalar zich, lekin bir-birining ustidan oqib turadi.",
  gaz: "Zarrachalar tez uchadi va idish devorlaridan sakraydi.",
};

// Open on a recognizable molecule if present, else the first in the dataset.
const DEFAULT_CID = (
  MOLECULE_LIBRARY.find((m) => m.nameEn.toLowerCase() === "caffeine") ??
  MOLECULE_LIBRARY[0]
).cid;

const MoleculesBody = () => {
  const rootRef = useRef(null);
  const { selectedCid, search, panelsHidden, view, setField } = useObjectState({
    selectedCid: DEFAULT_CID,
    search: "",
    panelsHidden: false,
    view: "molekula",
  });
  const { inVR, cardboard, exitCardboard } = useSceneControl();

  const molecule = getLibraryMolecule(selectedCid) ?? MOLECULE_LIBRARY[0];
  const isState = view !== "molekula";

  // Panels are hidden when manually collapsed OR while in either VR mode.
  const panelsVisible = !panelsHidden && !cardboard && !inVR;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else rootRef.current?.requestFullscreen?.();
  };

  return (
    <div ref={rootRef} className="flex h-full w-full bg-background">
      {panelsVisible && (
        <MoleculeLibrarySidebar
          molecules={MOLECULE_LIBRARY}
          selectedCid={molecule.cid}
          onSelect={(cid) => setField("selectedCid", cid)}
          search={search}
          onSearch={(v) => setField("search", v)}
        />
      )}

      <div className="relative min-w-0 flex-1">
        <Scene camera={[0, 0, 6.5]} bg="#0b1020">
          {isState ? (
            <MoleculeStates molecule={molecule} state={view} />
          ) : (
            <MoleculeModel molecule={molecule} />
          )}
        </Scene>

        {/* Ko'rinish almashtirgich: molekula yoki agregat holat */}
        {!inVR && !cardboard && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-1.5">
            <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-background/90 p-1 shadow-lg backdrop-blur">
              {VIEWS.map((v) => {
                const natural = v.id !== "molekula" && v.id === molecule.state;
                return (
                  <button
                    key={v.id}
                    onClick={() => setField("view", v.id)}
                    className={cn(
                      "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      view === v.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {v.label}
                    {natural && (
                      <span
                        className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400"
                        title="Xona haroratidagi holat"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {isState && (
              <span className="pointer-events-auto rounded-md bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
                {STATE_HINT[view]}
              </span>
            )}
          </div>
        )}

        {cardboard ? (
          <>
            {/* Center seam to help align the phone in the headset. */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-white/40" />
            <button
              onClick={exitCardboard}
              className="absolute right-3 top-3 z-30 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium shadow-md backdrop-blur"
            >
              Chiqish
            </button>
          </>
        ) : (
          // Toolbar is hidden during a WebXR session; the headset drives the view.
          !inVR && (
            <Toolbar
              panelsHidden={panelsHidden}
              onTogglePanels={() => setField("panelsHidden", !panelsHidden)}
              onToggleFullscreen={toggleFullscreen}
            />
          )
        )}
      </div>

      {panelsVisible && <MoleculeInfoPanel molecule={molecule} />}
    </div>
  );
};

const MoleculesPage = () => (
  <SceneControlProvider>
    <MoleculesBody />
  </SceneControlProvider>
);

export default MoleculesPage;
