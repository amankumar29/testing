import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const UserAvatar = () => {
  const { loading, userDetails } = useSelector((state) => state?.userDetails);
  const [fallbackUser, setFallbackUser] = useState({
    firstName: "",
    lastName: "",
  });

  const assetsURL = process.env.REACT_APP_ASSETS_URL;

  useEffect(() => {
    if (userDetails) {
      localStorage.setItem("staticFirstName", userDetails.firstName);
      localStorage.setItem("staticLastName", userDetails.lastName);
    } else {
      const staticFirstName = localStorage.getItem("staticFirstName") || ""; // Default value for firstName
      const staticLastName = localStorage.getItem("staticLastName") || ""; // Default value for lastName
      setFallbackUser({ firstName: staticFirstName, lastName: staticLastName });
    }
  }, [userDetails]);

  // Helper function to get initials from first and last names
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0) || "";
    const lastInitial = lastName?.charAt(0) || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // console.log(userDetails)

  return (
    <>
      {userDetails?.profilePicUrl ? (
        <img
          src={
            userDetails.profilePicUrl &&
            `${assetsURL}${userDetails?.profilePicUrl}`
          }
          className="object-cover object-top w-full h-full rounded-full"
          alt=""
        />
      ) : (
        <span>
          {!loading && userDetails
            ? getInitials(userDetails.firstName, userDetails.lastName)
            : getInitials(fallbackUser?.firstName, fallbackUser?.lastName)}
        </span>
      )}
    </>
  );
};

export default UserAvatar;
