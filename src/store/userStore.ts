import { create } from "zustand";

interface UserState {
  isJunior: boolean;
  setIsJunior: (val: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isJunior: false,
  setIsJunior: (val) => set({ isJunior: val }),
}));
