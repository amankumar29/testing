import { create } from "zustand";

// Define the store
const useImportCsvModal = create((set) => ({
  isOpen: false, // Initial state
  setShow: () => set({ isOpen: true }), // Action to show the modal (set isOpen to true)
  setHide: () => set({ isOpen: false }), // Action to hide the modal (set isOpen to false)
}));

export default useImportCsvModal;
