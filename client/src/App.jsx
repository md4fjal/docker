import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./redux/slices/authSlice";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Protect from "./components/protect";
import ChangePassword from "./pages/changePass";
import Home from "./pages/home";

const App = () => {
  const dispatch = useDispatch();
  const { authChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    !authChecked && dispatch(checkAuth());
  }, [dispatch, authChecked]);

  if (!authChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/profile"
          element={
            <Protect>
              <Profile />
            </Protect>
          }
        />

        <Route
          path="/change-password"
          element={
            <Protect>
              <ChangePassword />
            </Protect>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
