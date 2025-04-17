import { createContext, useContext } from "react";

import { getConfig } from "../config/config";

const ConfigContext = createContext(getConfig());

export const ConfigProvider = ({ children }) => {
  const config = getConfig();
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
