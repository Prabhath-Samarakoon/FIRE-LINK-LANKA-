import React, { createContext, useState, useMemo } from 'react';

export const AppContext = createContext({ emergencyMode: false, setEmergencyMode: () => {} });

export const AppProvider = ({ children }) => {
  const [emergencyMode, setEmergencyMode] = useState(false);

  const value = useMemo(() => ({ emergencyMode, setEmergencyMode }), [emergencyMode]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

