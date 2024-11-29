import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import UserAvatar from "Components/Atoms/UserAvatar/UserAvatar";
import { removeCookies } from "Helpers/RemoveCookies/RemoveCookies";
import { resetApiCache } from "Services/API/apiHooks";
import { logout } from "Store/ducks/authSlice";
import { setProjectList } from "Store/ducks/projectListSlice";
import { setUserDetails } from "Store/ducks/userDetailsSlice";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfileDropdown = ({ ref, onSelect }) => {
  const navigateTo = useNavigate();
  const { loading, userDetails } = useSelector((state) => state?.userDetails);
  const dispatch = useDispatch();

  const handleSignOut = () => {
    removeCookies();
    onSelect();
    dispatch(setUserDetails(null));
    dispatch(resetApiCache());
    dispatch(logout()); // Dispatch the logout action
    dispatch(setProjectList(null));
    navigateTo("/login");
    toast.success("Logged Out Successfully");
    localStorage.removeItem('defaultApp')
  };

  const handleProfileNavigate = () => {
    onSelect();
    navigateTo("/user-profile");
  };

  return (
    <div
      className="w-[244px] rounded-lg shadow-[0_0_4px_0_rgba(12,86,255,0.72)] bg-iwhite py-4 px-4"
      ref={ref}
    >
      <div className="flex items-center justify-between">
        <div className="flex" data-testid="initial_name">
          <p
            className={`flex uppercase items-center justify-center w-10 h-10 text-lg font-semibold leading-7 rounded-full text-iwhite bg-ibl1`}
          >
           <UserAvatar />
          </p>
          <div className="ml-2.5" data-testid="initial_vales">
            <p className="text-base font-medium leading-6 truncate text-igy2 max-w-[125px] capitalize">
              {userDetails &&
                userDetails?.firstName + " " + userDetails?.lastName}
            </p>
            <p className="text-[10px] font-normal leading-4 text-igy8 truncate max-w-[145px]">
              {userDetails?.email}
            </p>
          </div>
        </div>
        <div>
          <CustomTooltip
            title="Go To Profile"
            offset={[0, -8]}
            height={"28px"}
            fontSize="11px"
          >
            <ExpandCircleDownOutlinedIcon
              className="rotate-[270deg] text-ibl1 cursor-pointer"
              onClick={handleProfileNavigate}
              data-testid="circle_down"
              fontSize="medium"
            />
          </CustomTooltip>
        </div>
      </div>
      <hr className="text-ibl17 rounded-[50%] mt-[22px] mb-4" />
      <div className="flex justify-center">
        <button
          type="button"
          className="border border-solid rounded border-ibl1 text-ibl1 w-[104px] h-[26px] font-medium text-[13px] leading-5 hover:text-ird3 hover:border-ird3 hover:duration-300 hover:transition-all hover:ease-in-out"
          onClick={handleSignOut}
          data-testid="sign_out"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;

ProfileDropdown.propTypes = {
  ref: PropTypes.any,
  onSelect: PropTypes.func,
};
