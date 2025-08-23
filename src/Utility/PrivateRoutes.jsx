import { Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoutes() {
  const { isAuth } = useSelector((state) => state.UserAuth);
  // console.log("PrivateRoutes", isAuth);

  return (
    <>
      <Suspense>
        {isAuth === true ? <Outlet /> : <Navigate to="/LoginSignup" />}
      </Suspense>
    </>
  );
}
