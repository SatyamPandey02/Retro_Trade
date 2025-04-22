import { axiosInstance } from "./axiosInstance";
import { message } from "antd";

// add a notification
export const AddNotification = async (data) => {
  try {
    const response = await axiosInstance.post("/api/notifications/notify", data);
    if (response && response.data) {
      return {
        success: true,
        message: response.data.message
      };
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Add notification error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// get all notifications by user
export const GetAllNotifications = async () => {
  try {
    const response = await axiosInstance.get("/api/notifications/get-all-notifications");
    if (response && response.data) {
      return {
        success: true,
        data: response.data.data
      };
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// delete a notification
export const DeleteNotification = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/api/notifications/delete-notification/${id}`
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// read all notifications by user
export const ReadAllNotifications = async () => {
  try {
    const response = await axiosInstance.put("/api/notifications/read-all-notifications");
    if (response && response.data) {
      return {
        success: true,
        message: response.data.message
      };
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Read notifications error:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};
