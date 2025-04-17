import { axiosInstance } from "./axiosInstance";
import { message } from "antd";

// register user
export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/register", payload);
    if (response && response.data) {
      return response.data;
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Registration failed"
    };
  }
};

// login user
export const LoginUser = async (user) => {
  try {
    const response = await axiosInstance.post("/api/users/login", user);
    
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }

    if (response.data.success) {
      const token = response.data.data;
      // Set token first
      localStorage.setItem("token", token);
      
      // Get user data
      const userData = await GetCurrentUser();
      if (!userData) {
        localStorage.removeItem("token");
        throw new Error("Failed to get user data");
      }

      return {
        success: true,
        message: "Login successful",
        user: userData
      };
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    localStorage.removeItem("token"); // Clear token on error
    return {
      success: false,
      message: error.message || "Login failed"
    };
  }
};

// get current user
export const GetCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    const response = await axiosInstance.get("/api/users/get-current-user");
    if (!response || !response.data) {
      throw new Error("Invalid response from server");
    }

    if (response.data.success) {
      return response.data.data;
    } else {
      // If the token is invalid, clear it
      localStorage.removeItem("token");
      return null;
    }
  } catch (error) {
    console.error("Get current user error:", error);
    // Clear token on any error
    localStorage.removeItem("token");
    return null;
  }
};

// get all users
export const GetAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-users");
    return response.data;
  } catch (error) {
    return error.message;
  }
}

// update user status
export const UpdateUserStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(
      `/api/users/update-user-status/${id}`,
      { status }
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

// Add these functions to your existing users.js file
export const ForgotPasswordUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/forgot-password", payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response.data.message || "Something went wrong"
    };
  }
};

export const ResetPassword = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/reset-password", payload);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// Add these functions to your existing users.js
export const SendOTP = async (payload) => {
    try {
        console.log("Sending OTP API call with:", payload);
        const response = await axiosInstance.post("/api/users/send-otp", payload);
        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("API Error:", error.response || error);
        return {
            success: false,
            message: error.response?.data?.message || "Error sending OTP"
        };
    }
};

export const VerifyOTPAndResetPassword = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/users/verify-otp-and-reset-password", payload);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Error resetting password"
        };
    }
};

// Add this function to your existing users.js file
export const GetUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-user-profile");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};