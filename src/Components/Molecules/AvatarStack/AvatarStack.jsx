import { useEffect, useState } from "react";
import webicon from "Assets/Images/webicon.svg";
import iosicon from "Assets/Images/iosicon.svg";
import androidicon from "Assets/Images/androidicon.svg";
import apiicon from "Assets/Images/apiicon.svg";
import Style from "./AvatarStack.module.scss";
import PropTypes from "prop-types";
import webicon1 from "../../../Assets/Images/application_webicon.svg";
import iosicon1 from "../../../Assets/Images/application_iosicon.svg";
import apiicon1 from "../../../Assets/Images/application_apiicon.svg";
import androidicon1 from "../../../Assets/Images/application_android.svg";
import { CustomTooltip } from "Components/Atoms/Tooltip/CustomTooltip";
import tvIcon1 from "../../../Assets/Images/application_tv.svg";
import tvIcon from "../../../Assets/Images/tv.svg";
import { ApplicationTypeEnum } from "Enums/ApplicationTypeEnum";
import { Tooltip } from "react-tooltip";

const AvatarStack = ({ avatarData }) => {
  const avatarsDesc = [...avatarData].reverse();
  const [hovered, setHovered] = useState(null);
  const [uniqueAvatars, setUniqueAvatars] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (index) => {
    setHovered(index);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(null);
    setIsHovered(null);
  };

  const handleClick = (e) => {
    e?.stopPropagation();
  };

  useEffect(() => {
    const uniqueObjectsWithTypeCount = avatarsDesc?.reduce((acc, obj) => {
      const { type, ...rest } = obj;
      const existing = acc?.find((item) => item?.type === type);

      if (existing) {
        existing.count++;
      } else {
        acc.push({ type, count: 1, ...rest });
      }
      return acc;
    }, []);

    setUniqueAvatars(uniqueObjectsWithTypeCount);
  }, [avatarData]);
  return (
    <div className={`flex items-center justify-center flex-wrap avatar-tooltip`}>
      {uniqueAvatars?.map((avatar, index) => {
        return (
          <div
            className="relative z-10 hover:z-20"
            // style={{ zIndex: uniqueAvatars?.length - index }}
            key={index}
            onClick={handleClick}
          >
            <div
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave()}
            >
              {/* <CustomTooltip
                title={avatar?.count}
                placement="top"
                offset={[0, -18]}
                height={"18px"}
                width={"24px"}
                fontSize="11px"
                position="absolute"
                top="-42px"
                left="-20px"
              > */}
              <div
                className={`min-w-9 cursor-default test ${index > 0 && !isHovered && `-ml-[30px]`
                  } min-h-9 flex items-center justify-center rounded-[50%] bg-iwhite border border-ibl2 ${isHovered && "transition-all ease-in-out"
                  } ${Style?.shadow}`}
                style={isHovered ? { margin: "0 3px" } : {}}
                data-tooltip-id="avatar"
              >
                <img
                  data-testid={`images_${index}`}
                  key={index}
                  className={`${hovered === index} ? ${Style.avatarHovered
                    } : ${Style?.avatar}`}
                  src={
                    hovered === index
                      ? avatar?.type == ApplicationTypeEnum?.API
                        ? apiicon1
                        : avatar?.type == ApplicationTypeEnum?.IOS
                          ? iosicon1
                          : avatar?.type == ApplicationTypeEnum?.ANDROID
                            ? androidicon1
                            : avatar?.type == ApplicationTypeEnum?.TV
                              ? tvIcon1
                              : webicon1
                      : avatar?.type == ApplicationTypeEnum?.API
                        ? apiicon
                        : avatar?.type == ApplicationTypeEnum?.IOS
                          ? iosicon
                          : avatar?.type == ApplicationTypeEnum?.ANDROID
                            ? androidicon
                            : avatar?.type == ApplicationTypeEnum?.TV
                              ? tvIcon
                              : webicon
                  }
                  alt={avatar?.alt}
                />
                <div
                  title={avatar?.count}
                  noArrow
                  className="tooltip-div !text-[11px] !rounded-lg w-[30px] h-[23px] bg-[#1246BC] text-iwhite items-center justify-center absolute -top-5 hidden"
                  id="avatar"
                >
                  {avatar?.count}
                </div>
              </div>
              {/* </CustomTooltip> */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvatarStack;

AvatarStack.propTypes = {
  avatarData: PropTypes.any,
};
