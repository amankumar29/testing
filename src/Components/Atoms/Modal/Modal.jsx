import { useEffect } from "react";
import PropTypes from "prop-types";
export const Modal = ({
  isOpen = false,
  onClose = () => {},
  children,
  className,
  isstopPropagationReq = false,
  modalClassName,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // Add event listener when the modal is open
      window.addEventListener("keydown", handleKeyDown);
    }

    // Remove event listener when the modal is closed or component is unmounted
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup function to ensure the overflow is always reset
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className={`fixed z-[9999] top-0 left-0 flex items-center justify-center w-full h-full bg-opacity-80 bg-igy9 !mt-0 ${modalClassName}`}
          onClick={(e) => {
            if (!isstopPropagationReq) {
              e.stopPropagation();
            }
          }}
        >
          <div
            className={`rounded-[10px] bg-iwhite mdMax:w-full lgMax:max-w-[calc(100%-60px)] lgMax:max-h-[calc(100%-30px)] lgMax:overflow-y-auto mx-[30px] max-w-[1080px] ${className}`}
            data-testid={`${children}_value`}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.any,
  modalClassName: PropTypes.string,
};
