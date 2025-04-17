import React, { useState } from "react";
import { Table, Tag, Button, Space, Modal, message, Popconfirm } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { GetProductBids, DeleteProduct } from "../../apicalls/products";
import { UpdateBidStatus } from "../../apicalls/bids";

function Products({ products, reloadData }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [showBidsModal, setShowBidsModal] = useState(false);

  const getBids = async (product) => {
    try {
      dispatch(SetLoader(true));
      setSelectedProduct(product);
      const response = await GetProductBids(product._id);
      dispatch(SetLoader(false));
      if (response.success) {
        setBids(response.data);
        setShowBidsModal(true);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const handleDelete = async (productId) => {
    try {
      dispatch(SetLoader(true));
      const response = await DeleteProduct(productId);
      dispatch(SetLoader(false));
      if (response.success) {
        message.success(response.message);
        reloadData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Added On",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("MMM D, YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={
          status === "pending" ? "gold" :
          status === "approved" ? "green" :
          status === "rejected" ? "red" :
          "blue"
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/product/${record._id}`)}
          >
            View
          </Button>
          <Button
            onClick={() => navigate(`/edit-product/${record._id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const bidColumns = [
    {
      title: "Buyer",
      dataIndex: ["buyer", "name"],
    },
    {
      title: "Bid Amount",
      dataIndex: "bidAmount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Bid Date",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("MMM D, YYYY HH:mm"),
    },
    {
      title: "Message",
      dataIndex: "message",
    },
    {
      title: "Contact",
      dataIndex: "mobile",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={
          status === "pending" ? "gold" :
          status === "approved" ? "green" :
          "rejected" ? "red" : "blue"
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (text, record) => (
        record.status === "pending" && (
          <Space>
            <Button
              type="primary"
              onClick={() => onStatusUpdate(record._id, "approved")}
            >
              Approve
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => onStatusUpdate(record._id, "rejected")}
            >
              Reject
            </Button>
          </Space>
        )
      ),
    },
  ];

  const onStatusUpdate = async (bidId, status) => {
    try {
      dispatch(SetLoader(true));
      const response = await UpdateBidStatus({
        bidId,
        status,
      });
      dispatch(SetLoader(false));
      if (response.success) {
        message.success(response.message);
        getBids(selectedProduct._id);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          onClick={() => navigate("/add-product")}
          className="bg-blue-500"
        >
          Add Product
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Bids Modal */}
      <Modal
        title={`Bids for ${selectedProduct?.name}`}
        open={showBidsModal}
        onCancel={() => {
          setShowBidsModal(false);
          setSelectedProduct(null);
          setBids([]);
        }}
        width={1000}
        footer={null}
      >
        <Table
          columns={bidColumns}
          dataSource={bids}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
}

export default Products; 