import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { checkAuth } from "../redux/slices/authSlice";

const Protect = ({ children }) => {
  const dispatch = useDispatch();
  const { user, authChecked, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authChecked && !loading) {
      dispatch(checkAuth());
    }
  }, [dispatch, authChecked, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protect;
