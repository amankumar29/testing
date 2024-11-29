import { useSelector } from "react-redux";
import NavButton from "../../../Components/Atoms/NavButton/NavButton";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";

const SettingMenu = () => {
  // const { data } = useUserDetails();
  const { userDetails } = useSelector((state) => state?.userDetails);
  const assetsURL = process.env.REACT_APP_ASSETS_URL;

  const menuList = [
    {
      id: 1,
      path: "/setting/project-list",
      label: "Projects",
    },
    {
      id: 2,
      path: "/setting/integration",
      label: "Integrations",
    },
    {
      id: 3,
      path: "/setting/add-user",
      label: "Add User",
      adminOnly: true
    },
    {
      id: 4,
      path: "/setting/change-password",
      label: "Change Password",
    },
  ];
  return (
    <div className="w-full md:w-[300px] px-6 py-8 mdMax:py-4 rounded-2xl bg-iwhite lg:drop-shadow-lg mb-5 md:mb-0">
      <div className="flex items-center gap-6 mdMax:gap-3">
        <div className="flex items-center justify-center w-12 h-12 mdMax:w-8 mdMax:h-8 text-lg font-semibold uppercase rounded-full bg-ibl1 text-iwhite">
          {
            userDetails?.profilePicUrl ? (
              <img src={userDetails?.profilePicUrl && `${assetsURL}${userDetails?.profilePicUrl}`} className="w-full h-full object-cover rounded-full object-top"/>
            ) : (
             <>
              {userDetails?.firstName && userDetails?.firstName[0]}
              {userDetails?.lastName && userDetails?.lastName[0]}
             </>
            )
          }
          
        </div>
        <div>
          <div className="text-xl font-bold capitalize  w-[180px] break-all line-clamp-2">
          <CustomTooltip 
          title={userDetails?.firstName + " " + userDetails?.lastName}
          placement="top"
          height={"40px"}
          fontSize="40px"
          offset={[0, -10]}
          >
            {userDetails?.firstName + " " + userDetails?.lastName}
          </CustomTooltip>
          </div>
        </div>
      </div>

      <hr className="my-3 text-ibl7 rounded-[50%]" />
      <div className="mt-6 mdMax:mt-3">
        {menuList?.filter((list)=> (!list?.adminOnly || userDetails?.role === 'Admin'))?.map((list) => (
          <div key={list?.id} className="mb-2 mdMax:mb-0">
            <NavButton path={list?.path} label={list?.label} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingMenu;
