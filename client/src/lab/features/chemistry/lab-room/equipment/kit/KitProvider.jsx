import { useEffect, useMemo } from "react";
import { KitContext } from "./kitContext";
import { createKitMaterials } from "./materials";

const KitProvider = ({ children }) => {
  const kit = useMemo(() => createKitMaterials(), []);
  useEffect(() => () => kit.dispose(), [kit]);
  return <KitContext.Provider value={kit}>{children}</KitContext.Provider>;
};

export default KitProvider;
