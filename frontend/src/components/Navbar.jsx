import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();

  return (
    <nav>
      <ul>
        <li>
          <strong>Chatyellow</strong>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        {user && (
          <>
            <li style={{ marginLeft: "auto" }}>{user.email}</li>
            <li>
              <button onClick={logoutUser}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
