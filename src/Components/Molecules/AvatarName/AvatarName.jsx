import { useState, useEffect } from "react";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const UserIcon = ({ users, isUser = false, projectData }) => {
  const navigate = useNavigate();
  const [backgroundColors, setBackgroundColors] = useState([]);

  const shuffleArray = (array) => {
    for (let i = array?.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    navigate("/users");
  };

  useEffect(() => {
    const shuffledColors = shuffleArray([...colors]);
    setBackgroundColors(shuffledColors);
  }, []);

  const colors = ["#0988B8", "#FA4F27", "#09715E"];

  return (
    <div className="relative">
      {users?.slice(0, isUser ? 1 : 2)?.map((user, index) => (
        <div
          key={index}
          className={`${
            index === 1
              ? "absolute -right-[13px] top-0 z-1 cursor-pointer"
              : "absolute z-10 text-center cursor-pointer"
          } flex items-center justify-center h-[36px] w-[36px] rounded-full cursor-default -ml-[16px] mt-[2px] rotate-180 `}
          style={{
            backgroundColor: backgroundColors[index % backgroundColors?.length],
          }}
          onClick={handleClick}
        >
          <span
            className="text-iwhite font-medium text-base"
            data-testid={`${user?.firstName[0]?.toUpperCase()}${user?.lastName[0]?.toUpperCase()}`}
          >
            {`${user?.firstName[0]?.toUpperCase()}${user?.lastName[0]?.toUpperCase()}`}
          </span>
        </div>
      ))}
    </div>
  );
};

const Stack = ({ children }) => {
  return (
    <div className="flex items-center justify-center flex-wrap rotate-180 w-fit">
      {children}
    </div>
  );
};

const AvatarName = ({ profileData, userCount, isUser, projectListData }) => {
  const userCounts = userCount?.length;
  const extraUserCounts = userCounts > 2 ? userCounts - 2 : 0;

  return (
    <div className="relative top-[20px]">
      <Stack>
        <div className="relative">
          <UserIcon
            users={profileData}
            isUser={isUser}
            projectData={projectListData}
          />
          {extraUserCounts > 0 && (
            <div className="absolute top-1.5 right-[22px] text-black bg-opacity-75 px-1 text-xs rotate-180">
              +{extraUserCounts}
            </div>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default AvatarName;

UserIcon.propTypes = {
  users: PropTypes.any,
  isUser: PropTypes.bool,
  projectData: PropTypes.array,
};

Stack.propTypes = {
  children: PropTypes.any,
};

AvatarName.propTypes = {
  profileData: PropTypes.any,
  userCount: PropTypes.number,
  isUser: PropTypes.bool,
  projectListData: PropTypes.array,
};
