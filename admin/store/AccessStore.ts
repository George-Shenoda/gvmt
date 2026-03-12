import { create } from "zustand";

interface AccessStore {
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    clearAccessToken: () => void;
}

export const useAccessStore = create<AccessStore>((set) => ({
    accessToken: "",
    setAccessToken: (accessToken: string) => set({ accessToken }),
    clearAccessToken: () => set({ accessToken: "" }),
}));