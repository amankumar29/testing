import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./DrawerComponent.style.scss";
import { useOutsideClick } from "Hooks/useOutSideClick";

export const DrawerComponent = ({ children, show, onClose, className  , isstopPropagationReq=false }) => {
  const drawerRef = useRef();
  const [isOpen, setIsOpen] = useState(show);

  useEffect(() => {
    setIsOpen(show);
  }, [show]);

  useOutsideClick(drawerRef, () => {
    if (isOpen) {
      setIsOpen(!isOpen);
      onClose();
    }
  });

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
    <div
      className={`${
        show && "fixed top-0 left-0 z-[999] w-full h-full bg-opacity-80 bg-igy9"
      }`}
    >
      <div
        className={`drawer ${className} ${
          isOpen ? "open" : ""
        } shadow-[0_8px_20px_0_rgba(0,0,0,0.1)]`}
        ref={drawerRef}
      >
        <div  onClick={(e) => {
            if (!isstopPropagationReq) {
              e.stopPropagation();
            }
          }}>{children}</div>
      </div>
    </div>
  );
};

DrawerComponent.propTypes = {
  show: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func,
  className: PropTypes.string,
  width: PropTypes.number,
};
