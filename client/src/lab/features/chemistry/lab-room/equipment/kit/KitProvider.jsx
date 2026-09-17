import { useEffect, useMemo } from "react";
import { KitContext } from "./kitContext";
import { createKitMaterials } from "./materials";

const KitProvider = ({ printScale = 1, quality = "high", children }) => {
  const kit = useMemo(() => createKitMaterials({ printScale, quality }), [printScale, quality]);
  useEffect(() => () => kit.dispose(), [kit]);
  return <KitContext.Provider value={kit}>{children}</KitContext.Provider>;
};

export default KitProvider;
