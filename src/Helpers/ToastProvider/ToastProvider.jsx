import { ToastContainer } from "react-toastify";

const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={800}
      hideProgressBar
      theme="colored"
      closeOnClick={false}
      rtl={false}
      pauseOnHover={false}
      newestOnTop
      closeButton={false} // Disable the close button
    />
  );
};

export default ToastProvider;
