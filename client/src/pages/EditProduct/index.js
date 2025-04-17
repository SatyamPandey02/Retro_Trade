import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { Form, Input, Button, Upload, message, Select } from "antd";
import { GetProductById, EditProduct } from "../../apicalls/products";
import { useNavigate, useParams } from "react-router-dom";

function EditProductPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [existingImages, setExistingImages] = useState([]);

  const onFinish = async (values) => {
    try {
      dispatch(SetLoader(true));
      const response = await EditProduct(id, values);
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

  const getProduct = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetProductById(id);
      dispatch(SetLoader(false));
      if (response.success) {
        const product = response.data;
        form.setFieldsValue({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          age: product.age,
          billAvailable: product.billAvailable,
          warrantyAvailable: product.warrantyAvailable,
          accessoriesAvailable: product.accessoriesAvailable,
          boxAvailable: product.boxAvailable,
        });
        setExistingImages(product.images);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  return (
    <div className="max-w-screen-sm mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>
      <Form
        form={form}
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
            {/* Add more categories as needed */}
          </Select>
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          rules={[{ required: true, message: "Please input product age!" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item name="billAvailable" valuePropName="checked">
          <Button type="default" onClick={() => form.setFieldsValue({ 
            billAvailable: !form.getFieldValue('billAvailable') 
          })}>
            Bill Available: {form.getFieldValue('billAvailable') ? 'Yes' : 'No'}
          </Button>
        </Form.Item>

        <Form.Item name="warrantyAvailable" valuePropName="checked">
          <Button type="default" onClick={() => form.setFieldsValue({ 
            warrantyAvailable: !form.getFieldValue('warrantyAvailable') 
          })}>
            Warranty Available: {form.getFieldValue('warrantyAvailable') ? 'Yes' : 'No'}
          </Button>
        </Form.Item>

        <Form.Item name="accessoriesAvailable" valuePropName="checked">
          <Button type="default" onClick={() => form.setFieldsValue({ 
            accessoriesAvailable: !form.getFieldValue('accessoriesAvailable') 
          })}>
            Accessories Available: {form.getFieldValue('accessoriesAvailable') ? 'Yes' : 'No'}
          </Button>
        </Form.Item>

        <Form.Item name="boxAvailable" valuePropName="checked">
          <Button type="default" onClick={() => form.setFieldsValue({ 
            boxAvailable: !form.getFieldValue('boxAvailable') 
          })}>
            Box Available: {form.getFieldValue('boxAvailable') ? 'Yes' : 'No'}
          </Button>
        </Form.Item>

        {existingImages.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Existing Images</h2>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => navigate("/profile")}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default EditProductPage; 