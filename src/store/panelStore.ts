import { create } from "zustand";

interface PanelState {
  activePanel: "library" | "content" | "chat";
  activeTab: "gallery" | "ai" | "community" | "creation";
  selectedAgentId: string | null;
  setActivePanel: (panel: PanelState["activePanel"]) => void;
  setActiveTab: (tab: PanelState["activeTab"]) => void;
  setSelectedAgent: (agentId: string | null) => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  activePanel: "content",
  activeTab: "gallery",
  selectedAgentId: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedAgent: (agentId) =>
    set({ selectedAgentId: agentId, activeTab: "ai" }),
}));
