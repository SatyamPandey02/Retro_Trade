import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { Form, Input, Button, Upload, message, Select } from "antd";
import { AddProduct, UploadProductImage } from "../../apicalls/products";
import { useNavigate } from "react-router-dom";

function AddProductPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);

  const onFinish = async (values) => {
    try {
      dispatch(SetLoader(true));
      const response = await AddProduct({
        ...values,
        seller: localStorage.getItem("userId"),
        status: "pending",
        images,
      });
      dispatch(SetLoader(false));
      if (response.success) {
        message.success(response.message);
        navigate("/profile");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const uploadImages = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      dispatch(SetLoader(true));
      const response = await UploadProductImage(formData);
      dispatch(SetLoader(false));
      if (response.success) {
        setImages([...images, response.data]);
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const removeImage = (index) => {
    const tempImages = [...images];
    tempImages.splice(index, 1);
    setImages(tempImages);
  };

  return (
    <div className="max-w-screen-sm mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Add Product</h1>
      <Form
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input product name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input product description!" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Please input product price!" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select product category!" }]}
        >
          <Select>
            <Select.Option value="electronics">Electronics</Select.Option>
            <Select.Option value="fashion">Fashion</Select.Option>
            <Select.Option value="home">Home</Select.Option>
            <Select.Option value="sports">Sports</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          rules={[{ required: true, message: "Please input product age!" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Bill Available"
          name="billAvailable"
          valuePropName="checked"
        >
          <Input type="checkbox" />
        </Form.Item>

        <Form.Item
          label="Warranty Available"
          name="warrantyAvailable"
          valuePropName="checked"
        >
          <Input type="checkbox" />
        </Form.Item>

        <Form.Item
          label="Accessories Available"
          name="accessoriesAvailable"
          valuePropName="checked"
        >
          <Input type="checkbox" />
        </Form.Item>

        <Form.Item
          label="Box Available"
          name="boxAvailable"
          valuePropName="checked"
        >
          <Input type="checkbox" />
        </Form.Item>

        <Form.Item label="Images">
          <Upload
            listType="picture-card"
            beforeUpload={(file) => {
              uploadImages(file);
              return false;
            }}
          >
            {images.length < 5 && "+ Upload"}
          </Upload>
        </Form.Item>

        {images.length > 0 && (
          <div className="flex gap-2 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt=""
                  className="w-24 h-24 object-cover rounded"
                />
                <i
                  className="ri-close-circle-line absolute top-1 right-1 text-white cursor-pointer"
                  onClick={() => removeImage(index)}
                ></i>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={() => navigate("/profile")}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Add Product
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AddProductPage; 