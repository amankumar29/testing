import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import logo from "Assets/Images/ideyaLabsLogo.svg";
import UserAvatar from "Components/Atoms/UserAvatar/UserAvatar";
import ProfileDropdown from "Components/Molecules/ProfileDropdown/ProfileDropdown";
import { useOutsideClick } from "Hooks/useOutSideClick";
import { useRef, useState } from "react";
import { Tooltip } from "react-tooltip";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Header = ({handleMobileOpen,mobileOpen}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
 
  
  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div className="h-[65px] md:h-[60px] w-full flex justify-between sticky top-0 drop-shadow-md bg-iwhite z-[999]">
      <div className="flex items-center justify-center mdMax:py-[18px] mdMax:pl-5 gap-5">
        <button className="md:hidden" onClick={handleMobileOpen}>
          {
            mobileOpen ? <CloseIcon/> : <MenuIcon />
          }
          
        </button>        
        <img
          data-testid="logo_Image"
          src={logo}
          alt="logo"
          width={150}
          height={34}
          className="py-0 md:py-[16px] pl-0 md:pl-5 mdMax:max-w-[120px]"
        />
      </div>
      <div className="flex items-center gap-5 mr-6">
        <p
          data-testid="notification_Icon"
          className="h-[48px] w-[48px] group flex items-center justify-center rounded-2xl hover:bg-ibl17 hover:duration-300 hover:transition-all hover:ease-in cursor-pointer mr-2"
          data-tooltip-id="notification"
          data-tooltip-content="Notifications"
        >
          <NotificationsNoneIcon className="text-ibl1 group-hover:text-ibl3" />
        </p>
        <Tooltip id="notification" noArrow className="!text-[11px]" />

        <div className="relative" ref={dropdownRef}>
          {/* <p
            data-testid={`profile_Name_Value`}
            className={`flex uppercase items-center justify-center w-10 h-10 text-lg font-semibold leading-7 rounded-full cursor-pointer text-iwhite bg-ibl1 hover:bg-ibl3 hover:duration-300 hover:transition-all hover:ease-in-out hover:shadow-[0_0_4px_0_rgba(12,86,255,0.72)] ${
              isOpen && "shadow-[0_0_4px_0_rgba(12,86,255,0.72)] bg-ibl3"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            data-tooltip-id="profile"
            data-tooltip-content="Profile"
          >
            {!loading &&
              `${userDetails?.firstName?.charAt(
                0
              )}${userDetails?.lastName?.charAt(0)}`}
          </p> */}
             <p
            data-testid={`profile_Name_Value`}
            className={`flex uppercase items-center justify-center w-10 h-10 text-lg font-semibold leading-7 rounded-full cursor-pointer text-iwhite bg-ibl1 hover:bg-ibl3 hover:duration-300 hover:transition-all hover:ease-in-out hover:shadow-[0_0_4px_0_rgba(12,86,255,0.72)] ${
              isOpen && "shadow-[0_0_4px_0_rgba(12,86,255,0.72)] bg-ibl3"
            }`}
            onClick={() => setIsOpen(!isOpen)}
            data-tooltip-id="profile"
            data-tooltip-content="Profile"
          >
            {/* Render initials from userDetails or fallback static data */}
           <UserAvatar />
          </p>
          {isOpen ? (
            ""
          ) : (
            <Tooltip id="profile" noArrow className="!text-[11px]" />
          )}

          <div className="absolute right-0 z-[200] top-12">
            {isOpen && <ProfileDropdown onSelect={() => setIsOpen(false)} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
