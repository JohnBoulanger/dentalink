import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AuthProvider from "./contexts/AuthContext/AuthProvider";
import Layout from "./components/Layout";

// public pages
import Landing from "./pages/Public/Landing";
import BusinessList from "./pages/Public/BusinessList";
import PublicBusinessProfile from "./pages/Public/BusinessProfile";

// auth pages
import Login from "./pages/Auth/Login";
import RegisterUser from "./pages/Auth/RegisterUser";
import RegisterBusiness from "./pages/Auth/RegisterBusiness";
import AccountActivation from "./pages/Auth/AccountActivation";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// catch-all
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* public routes */}
            <Route index element={<Landing />} />
            <Route path="businesses" element={<BusinessList />} />
            <Route path="businesses/:businessId" element={<PublicBusinessProfile />} />

            {/* auth routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterUser />} />
            <Route path="register/business" element={<RegisterBusiness />} />
            <Route path="activate/:resetToken" element={<AccountActivation />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:resetToken" element={<ResetPassword />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
