import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/not-found";
import UserRegister from "./pages/user-register";
import MerchantRegister from "./pages/merchant-register";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Header from "./components/header";
import Product from "./pages/product";
import VerificationPage from "./pages/verification-page";
import ProductListing from "./pages/product-listing";
import ProductDetails from "./pages/product-details";
import Address from "./pages/address";
import FetchCart from "./pages/fetch-cart";
import OrderPlace from "./pages/order-place";
import { PrivateRoute, PublicRoute } from "./utils/routes-protection";
import "./assets/css/verification.css";
import "./App.css";

const Routers = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<UserRegister />} />
          <Route path="/merchant/register" element={<MerchantRegister />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerificationPage />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/address" element={<Address />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product-listing" element={<ProductListing />} />
          <Route path="/product-details/:productId" element={<ProductDetails />} />
          <Route path="/fetch-cart" element={<FetchCart />} />
          <Route path="/order/:merchantId" element={<OrderPlace />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Routers;
