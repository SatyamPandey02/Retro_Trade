import { axiosInstance } from "./axiosInstance";

// add a new product
export const AddProduct = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/products/add-product", payload);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// get all products
export const GetProducts = async (filters) => {
  try {
    const response = await axiosInstance.post("/api/products/get-products", filters);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// edit a product
export const EditProduct = async (id, payload) => {
  try {
    const response = await axiosInstance.put(
      `/api/products/edit-product/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// get a product by id
export const GetProductById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/api/products/get-product-by-id/${id}`
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// delete a product
export const DeleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/api/products/delete-product/${id}`
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// upload product image
export const UploadProductImage = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "/api/products/upload-image-to-product",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response.data.message || 'Error uploading image',
    };
  }
};

// update product status
export const UpdateProductStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(
      `/api/products/update-product-status/${id}`,
      { status }
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// place a new bid
export const PlaceNewBid = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/api/bids/place-new-bid",
      payload
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

// get all bids
export const GetAllBids = async (filters) => {
  try {
    const response = await axiosInstance.post(
      "/api/bids/get-all-bids",
      filters
    );
    return response.data;
  } catch (error) {
    return error.message;
  }
};

// update bid status
export const UpdateBidStatus = async (payload) => {
  try {
    const response = await axiosInstance.put(
      `/api/products/update-bid-status`,
      payload
    );
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

// get bids for a product
export const GetProductBids = async (productId) => {
  try {
    const response = await axiosInstance.get(`/api/products/get-product-bids/${productId}`);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
