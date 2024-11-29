import { create } from "zustand";
import { userData } from "../Services/API/UserDetails/UserDetails";
import { toast } from "react-toastify";

export const useUserDetails = create((set) => ({
  data: {}, // Initialize as an object
  fetchUserData: () => {
    userData()
      .then((res) => {
        const data = res.data.results;
        set({ data });
      })
      .catch(() => {
        toast.error("Error fetching user data");
      });
  },
  resetUserData: () => set({ data: null }), // Define a reset action
}));
