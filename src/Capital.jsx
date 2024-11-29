import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetUserDataQuery } from "Services/API/apiHooks";
import {
  setError,
  setLoading,
  setUserDetails,
} from "Store/ducks/userDetailsSlice";

const Capital = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
  } = useGetUserDataQuery({
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setLoading(isUserLoading));
      if (userError) {
        dispatch(setError(userError.message));
        toast.error(userError.message);
      }
      if (userData) {
        dispatch(setUserDetails(userData.results));
      }
    }
  }, [isAuthenticated, userData, userError, isUserLoading]);
};

export default Capital;
