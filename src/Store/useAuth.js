import { create } from "zustand";

export const useAuth = create((set) => ({
  accessToken: localStorage.getItem("ilAuth") || null,
  isAuth: localStorage.getItem("isAuth") === "true",
  setAccessToken: (accessToken) => {
    localStorage.setItem("ilAuth", accessToken);
    set({ accessToken });
  },
  setIsAuth: (isAuth) => {
    localStorage.setItem("isAuth", isAuth);
    set({ isAuth });
  },
  resetAccessToken: () => {
    localStorage.removeItem("ilAuth");
    set({ accessToken: null });
  },
  resetIsAuth: () => {
    localStorage.removeItem("isAuth");
    set({ isAuth: false });
  },
  logout: () => {
    localStorage.removeItem("ilAuth");
    localStorage.removeItem("isAuth");
    set({ accessToken: null, isAuth: false });
  },
}));
