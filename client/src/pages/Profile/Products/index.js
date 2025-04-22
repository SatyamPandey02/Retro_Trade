import { Button, message, Table, Modal, Image } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { DeleteProduct, GetProducts } from "../../../apicalls/products";
import { SetLoader } from "../../../redux/loadersSlice";
import ProductsForm from "./ProductsForm";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Products() {
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [showProductForm, setShowProductForm] = React.useState(false);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      setLoading(true);
      console.log("Fetching products for user:", user._id);
      const response = await GetProducts({ seller: user._id });
      console.log("Products response:", response);
      
      if (response.success) {
        setProducts(response.data || []);
      } else {
        message.error(response.message || "Failed to fetch products");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      dispatch(SetLoader(true));
      const response = await DeleteProduct(id);
      dispatch(SetLoader(false));
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "images",
      render: (images, record) => (
        <div className="flex items-center gap-2">
          <div className="relative group">
            <img
              src={images?.length > 0 ? images[0] : "https://via.placeholder.com/80"}
              alt={record.name}
              className="w-20 h-20 object-cover rounded-md cursor-pointer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/80";
              }}
              onClick={() => {
                if (images?.length > 0) {
                  setPreviewImage(images[0]);
                  setPreviewTitle(record.name);
                  setPreviewVisible(true);
                }
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <EyeOutlined className="text-white text-xl" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{record.name}</span>
            <span className="text-gray-500">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price.toLocaleString('en-IN')}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <span className={`
          px-2 py-1 rounded text-white
          ${status === 'pending' ? 'bg-yellow-500' : ''}
          ${status === 'approved' ? 'bg-green-500' : ''}
          ${status === 'rejected' ? 'bg-red-500' : ''}
          ${status === 'sold' ? 'bg-gray-500' : ''}
        `}>
          {status.toUpperCase()}
        </span>
      ),
    },
    {
      title: "Added On",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY hh:mm A"),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={() => {
              setSelectedProduct(record);
              setShowProductForm(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this product?')) {
                deleteProduct(record._id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    console.log("User state changed:", user);
    if (user?._id) {
      getData();
    }
  }, [user?._id]);

  useEffect(() => {
    console.log("Products state updated:", products);
  }, [products]);

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">My Products</h1>
            <p className="text-gray-500 mt-1">
              Total Products: {products.length}
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              setSelectedProduct(null);
              setShowProductForm(true);
            }}
          >
            Add Product
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={products}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            total: products.length,
            showTotal: (total) => `Total ${total} products`
          }}
        />

        {showProductForm && (
          <ProductsForm
            showProductForm={showProductForm}
            setShowProductForm={setShowProductForm}
            selectedProduct={selectedProduct}
            getData={getData}
          />
        )}

        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={800}
          centered
        >
          <img
            alt={previewTitle}
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            src={previewImage}
          />
        </Modal>
      </div>
    </div>
  );
}

export default Products;
