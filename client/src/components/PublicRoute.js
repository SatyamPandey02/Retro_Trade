import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.users);

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default PublicRoute; 