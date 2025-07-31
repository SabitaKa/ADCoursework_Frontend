import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdMail,
  MdLock,
  MdPerson,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdHome
} from "react-icons/md";
import Button from "../components/Button";
import authService from "../services/authService";
import bookImage from "../assets/book.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [passwordValid, setPasswordValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
  };

  const validateUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear previous error for this field
    setValidationErrors((prev) => ({ ...prev, [id]: "" }));

    // Validate email
    if (id === "email") {
      if (!validateEmail(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          email: value.length > 100 ? "Email cannot exceed 100 characters" : "Please enter a valid email address",
        }));
      }
    }

    // Validate username
    if (id === "username") {
      if (!validateUsername(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          username: "Username must be between 3 and 20 characters",
        }));
      }
    }

    // Validate password
    if (id === "password") {
      if (!validatePassword(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          password: "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters",
        }));
      }
    }

    // Validate password match
    if (id === "password" || id === "confirmPassword") {
      const password = id === "password" ? value : formData.password;
      const confirmPassword = id === "confirmPassword" ? value : formData.confirmPassword;
      
      if (confirmPassword && password !== confirmPassword) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
        setPasswordValid(false);
      } else {
        setPasswordValid(true);
      }
    }
  };
  const payload = {
    email: formData.email,
    username: formData.username,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Reset all validation errors
    const newValidationErrors = {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    };

    // Check for empty fields
    if (!formData.email.trim()) {
      newValidationErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newValidationErrors.email = "Please enter a valid email address";
    }

    if (!formData.username.trim()) {
      newValidationErrors.username = "Username is required";
    } else if (!validateUsername(formData.username)) {
      newValidationErrors.username = "Username must be between 3 and 20 characters";
    }

    if (!formData.password) {
      newValidationErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newValidationErrors.password = "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters";
    }

    if (!formData.confirmPassword) {
      newValidationErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newValidationErrors.confirmPassword = "Passwords do not match";
    }

    // Update validation errors state
    setValidationErrors(newValidationErrors);

    // Check if there are any validation errors
    const hasErrors = Object.values(newValidationErrors).some(error => error !== "");
    if (hasErrors) {
      setIsLoading(false);
      return; // Don't proceed with form submission if there are errors
    }

    // If no errors, proceed with the API call
    try {
      // Create the payload with only the required fields
      const payload = {
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        password: formData.password
      };

      // Log the payload for debugging (remove in production)
      console.log("Sending registration payload:", { ...payload, password: "[HIDDEN]" });

      // Use authService for registration
      const response = await authService.register(payload);
      console.log("Registration response:", response);
      
      navigate("/login", { 
        state: { 
          message: "Registration successful! Please login with your credentials.",
          type: "success"
        }
      });
    } catch (error) {
      console.error("Full error:", error);
      
      // Handle errors from authService
      if (error.message) {
        setError(error.message);
      } else if (error.response) {
        // Log the full error response for debugging
        console.error("Error response:", error.response);
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        // Handle different types of errors
        if (error.response.status === 400) {
          setError(error.response.data.message || "Invalid registration data. Please check your information.");
        } else if (error.response.status === 409) {
          setError("User already exists with this email or username.");
        } else if (error.response.status === 500) {
          setError("Server error occurred. Please try again later or contact support.");
        } else {
          setError(error.response.data.message || "Registration failed. Please try again.");
        }
      } else if (error.request) {
        // Network error
        console.error("Network error:", error.request);
        setError("Cannot connect to server. Please check your internet connection and try again.");
      } else {
        // Other error
        console.error("Other error:", error.message);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
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

      {/* Right section - Registration form */}
      <div className="flex-1 md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Nest</h1>
            <h2 className="text-xl font-semibold text-gray-700">Registration Form</h2>
          </div>

          {/* Registration form */}
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Username Input */}
            <div>
              <input
                type="text"
                id="username"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.username ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
              />
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;