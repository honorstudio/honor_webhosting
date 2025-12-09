import React, { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "client" | "master" | "admin";

interface DevViewContextType {
  viewMode: ViewMode;
  isClientView: boolean;
  isMasterView: boolean;
  setClientView: (enabled: boolean) => void;
  setMasterView: (enabled: boolean) => void;
  getEffectiveRole: (actualRole: string | null | undefined) => string | null;
}

const DevViewContext = createContext<DevViewContextType | undefined>(undefined);

export function DevViewProvider({ children }: { children: ReactNode }) {
  const [isClientView, setIsClientView] = useState(false);
  const [isMasterView, setIsMasterView] = useState(false);

  // 현재 뷰 모드 결정
  const viewMode: ViewMode = isClientView
    ? "client"
    : isMasterView
    ? "master"
    : "admin";

  // 실제 역할 대신 개발용 뷰 역할 반환
  const getEffectiveRole = (actualRole: string | null | undefined): string | null => {
    if (isClientView) return "client";
    if (isMasterView) return "master";
    return actualRole || null;
  };

  const handleSetClientView = (enabled: boolean) => {
    setIsClientView(enabled);
    if (enabled) {
      setIsMasterView(false); // 고객뷰 켜면 마스터뷰 끔
    }
  };

  const handleSetMasterView = (enabled: boolean) => {
    setIsMasterView(enabled);
    if (enabled) {
      setIsClientView(false); // 마스터뷰 켜면 고객뷰 끔
    }
  };

  return (
    <DevViewContext.Provider
      value={{
        viewMode,
        isClientView,
        isMasterView,
        setClientView: handleSetClientView,
        setMasterView: handleSetMasterView,
        getEffectiveRole,
      }}
    >
      {children}
    </DevViewContext.Provider>
  );
}

export function useDevView() {
  const context = useContext(DevViewContext);
  if (context === undefined) {
    throw new Error("useDevView must be used within a DevViewProvider");
  }
  return context;
}
