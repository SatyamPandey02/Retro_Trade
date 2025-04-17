import { axiosInstance } from "./axiosInstance";

export const CreateOrder = async (productId) => {
  try {
    const response = await axiosInstance.post("/api/payments/create-order", {
      productId
    });
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const VerifyPayment = async (data) => {
  try {
    const response = await axiosInstance.post("/api/payments/verify-payment", data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const GetOrders = async () => {
  try {
    const response = await axiosInstance.get("/api/payments/get-orders");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}; 