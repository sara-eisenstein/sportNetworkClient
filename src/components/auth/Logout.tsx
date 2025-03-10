import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { AppDispatch } from "../../store/store";

const Logout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload(); // ריענון הדף לאחר יציאה
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
