import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "APP_SELECTED_RESTAURANT_ID";

type SelectedRestaurantContextType = {
  globalRestaurantId: string | null;
  setGlobalRestaurantId: (id: string | null) => void;
  clearglobalRestaurantId: () => void;
};

const SelectedRestaurantContext =
  createContext<SelectedRestaurantContextType | undefined>(undefined);

export const SelectedRestaurantProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [globalRestaurantId, setGlobalRestaurantId] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? String(stored) : null;
  });

  useEffect(() => {
    if (globalRestaurantId !== null) {
      localStorage.setItem(STORAGE_KEY, globalRestaurantId.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [globalRestaurantId]);

  return (
    <SelectedRestaurantContext.Provider
      value={{
        globalRestaurantId,
        setGlobalRestaurantId,
        clearglobalRestaurantId: () => setGlobalRestaurantId(null),
      }}
    >
      {children}
    </SelectedRestaurantContext.Provider>
  );
};

export const useSelectedRestaurant = () => {
  const context = useContext(SelectedRestaurantContext);

  if (!context) {
    throw new Error(
      "useSelectedRestaurant must be used inside SelectedRestaurantProvider"
    );
  }

  return context;
};
