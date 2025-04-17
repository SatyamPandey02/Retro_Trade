import { Modal, Form, Input, Row, Col, message, Upload, Image } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useDispatch, useSelector } from "react-redux";
import { AddProduct, EditProduct, UploadProductImage } from "../../../apicalls/products";
import { SetLoader } from "../../../redux/loadersSlice";
import React, { useEffect, useState } from "react";
import { PlusOutlined, LoadingOutlined, EyeOutlined } from "@ant-design/icons";

const additionalThings = [
  {
    label: "Bill Available",
    name: "billAvailable",
  },
  {
    label: "Warranty Available",
    name: "warrantyAvailable",
  },
  {
    label: "Accessories Available",
    name: "accessoriesAvailable",
  },
  {
    label: "Box Available",
    name: "boxAvailable",
  },
];

const rules = [
  {
    required: true,
    message: "Required",
  },
];

const categories = [
  "Electronics",
  "Home",
  "Fashion",
  "Sports",
  "Books",
  "Collectibles",
  "Others"
];

function ProductsForm({
  showProductForm,
  setShowProductForm,
  selectedProduct,
  getData,
}) {
  const [fileList, setFileList] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const formRef = React.useRef(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      formRef.current?.setFieldsValue(selectedProduct);
      const existingFiles = (selectedProduct.images || []).map((image, index) => ({
        uid: `-${index}`,
        name: `image-${index}`,
        status: 'done',
        url: image
      }));
      setFileList(existingFiles);
    } else {
      formRef.current?.resetFields();
      setFileList([]);
    }
  }, [selectedProduct]);

  const onFinish = async (values) => {
    try {
      dispatch(SetLoader(true));
      const productData = {
        ...values,
        seller: user._id,
        status: selectedProduct ? selectedProduct.status : "pending",
        images: fileList.map(file => file.url) // Get all image URLs
      };

      let response;
      if (selectedProduct) {
        response = await EditProduct(selectedProduct._id, productData);
      } else {
        response = await AddProduct(productData);
      }

      if (response.success) {
        message.success(response.message);
        getData();
        setShowProductForm(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(SetLoader(false));
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadImage = async (file) => {
    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await UploadProductImage(formData);

      if (response.success) {
        message.success('Image uploaded successfully');
        // Update the fileList with the new image
        const newFile = {
          uid: `-${fileList.length + 1}`,
          name: file.name,
          status: 'done',
          url: response.data
        };
        setFileList([...fileList, newFile]);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error('Error uploading image');
    } finally {
      setImageLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title={selectedProduct ? "Edit Product" : "Add Product"}
      open={showProductForm}
      onCancel={() => setShowProductForm(false)}
      centered
      width={1000}
      okText="Save"
      onOk={() => formRef.current?.submit()}
    >
      <Form
        layout="vertical"
        ref={formRef}
        onFinish={onFinish}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Name" name="name" rules={rules}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Description" name="description" rules={rules}>
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Price" name="price" rules={rules}>
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Category" name="category" rules={rules}>
              <select className="w-full border border-gray-300 rounded p-2">
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Age" name="age" rules={rules}>
              <Input type="number" />
            </Form.Item>
          </Col>
          {additionalThings.map((item) => (
            <Col span={8} key={item.name}>
              <Form.Item label={item.label} name={item.name} valuePropName="checked">
                <Input type="checkbox" />
              </Form.Item>
            </Col>
          ))}
          <Col span={24}>
            <Form.Item label="Images">
              <div className="flex flex-wrap gap-4">
                {fileList.map((file) => (
                  <div key={file.uid} className="relative">
                    <Image
                      src={file.url}
                      alt={file.name}
                      width={96}
                      height={96}
                      className="object-cover rounded"
                      preview={{
                        mask: <div className="flex items-center justify-center">
                          <EyeOutlined className="text-white text-xl" />
                        </div>,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFileList = fileList.filter(f => f.uid !== file.uid);
                        setFileList(updatedFileList);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    if (!file.type.startsWith('image/')) {
                      message.error('You can only upload image files!');
                      return false;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      message.error('Image must be smaller than 5MB!');
                      return false;
                    }
                    uploadImage(file);
                    return false;
                  }}
                >
                  {fileList.length >= 8 ? null : uploadButton}
                </Upload>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default ProductsForm;
