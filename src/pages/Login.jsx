import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MdMail,
  MdLock,
  MdPerson,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdHome
} from "react-icons/md";
import Button from "../components/Button";
import axios from "axios";
import bookImage from "../assets/book.png";

const Login = () => {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(""); // Clear error when user types
    
    // Clear validation error for the field being changed
    setValidationErrors(prev => ({
      ...prev,
      [id]: ""
    }));
  };

  // Set success message only when coming from registration
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Clear the location state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Reset validation errors
    const newValidationErrors = {
      email: "",
      password: "",
    };

    // Validate email
    if (!formData.email.trim()) {
      newValidationErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newValidationErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newValidationErrors.password = "Password is required";
    }

    // Update validation errors
    setValidationErrors(newValidationErrors);

    // Check if there are any validation errors
    const hasErrors = Object.values(newValidationErrors).some(error => error !== "");
    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://localhost:7098/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Extract data from the response structure
      const { token, refreshToken, userId, role } = response.data.data;
      
      // Store user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);

      // Store complete user data
      localStorage.setItem("user", JSON.stringify(response.data.data));

      // Redirect based on role
      if (role === 'Admin') {
        navigate("/admin/dashboard", { 
          state: { 
            message: "Welcome to the Admin Dashboard!", 
            type: 'success' 
          } 
        });
        return; // Add return to prevent further execution
      } else if (role === 'Staff') {
        navigate("/staff/orders", { 
          state: { 
            message: "Welcome to the Staff Portal!", 
            type: 'success' 
          } 
        });
        return; // Add return to prevent further execution
      }
      
      // Default redirect for other users
      navigate("/home", { 
        state: { 
          message: "You've successfully logged in!", 
          type: 'success' 
        } 
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const goToHome = () => {
    navigate("/Home");
  };

  return (
    <div className="flex min-h-screen">
      {/* Home button - positioned absolutely in the top left */}
      <button 
        onClick={goToHome}
        className="absolute top-4 left-4 z-50 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        aria-label="Go to home page"
      >
        <MdHome className="h-6 w-6 text-gray-600 group-hover:text-gray-800" />
      </button>

      {/* Left section - Decorative background */}
      <div className="hidden md:flex md:w-1/2 bg-cover bg-center relative" style={{
        backgroundImage: `url(${bookImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Overlay for better text readability if needed */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Right section - Login form */}
      <div className="flex-1 md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Nest</h1>
            <h2 className="text-xl font-semibold text-gray-700">Login Form</h2>
          </div>

          {/* Success message display */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error message display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Login form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username/Email field */}
            <div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter username"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Password"
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;