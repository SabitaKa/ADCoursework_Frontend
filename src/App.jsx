import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";

import Home from "./pages/Home";
import BookCatalog from "./pages/BookCatalog";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import UserAnnouncements from "./pages/Announcements";

import Navbar from "./components/Navbar";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Books from "./pages/Admin/Books";
import Orders from "./pages/Admin/Orders";
import Announcements from "./pages/Admin/Announcements";
import Discounts from "./pages/Admin/Discounts";

// Staff Pages
import StaffLayout from "./pages/Staff/StaffLayout";
import StaffOrders from "./pages/Staff/StaffOrders";

import Wishlist from "./pages/Wishlist";
import BookDetails from "./pages/BookDetails";

import "./App.css";
import CheckoutPage from "./pages/Checkout";

function AppRoutes() {
  const location = useLocation();

  const hideNavbarRoutes = ['/login', '/signup'];
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || isAdminRoute || isStaffRoute;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/BookCatalog" element={<BookCatalog />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/bookdetails/:id" element={<BookDetails />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/announcements" element={<UserAnnouncements />} />

        {/* Profile Routes */}
        <Route path="/profile" element={<Profile />}>
          <Route index element={<Profile />} />
          <Route path="orders" element={<Profile />} />
          <Route path="change-password" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['Staff']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route path="orders" element={<StaffOrders />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppRoutes />
      </Router>
    </CartProvider>
  );
}

export default App;
