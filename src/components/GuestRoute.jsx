// import { useContext } from "react";
// import { Navigate } from "react-router-dom";

export const GuestRoute = ({ children }) => {
//   const { user, loading } = useContext("AuthContext");

//   if (loading) return null;

//   if (user) {
//     return <Navigate to="/" replace />; 
//   }

  return children;
};
export const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useContext("AuthContext");

//   if (loading) return null; 

//   if (!user) {
//     return <Navigate to="/login" replace />; 
//   }

  return children;
};
