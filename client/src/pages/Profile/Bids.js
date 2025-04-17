import React from "react";
import { Table, Tag, Button } from "antd";
import moment from "moment";

function Bids({ bids, reloadData }) {
  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      render: (product) => product.name,
    },
    {
      title: "Seller",
      dataIndex: "seller",
      render: (seller) => seller.name,
    },
    {
      title: "Bid Amount",
      dataIndex: "bidAmount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Placed On",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("MMM D, YYYY HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={
          status === "pending" ? "gold" :
          status === "approved" ? "green" :
          "red"
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (text, record) => (
        record.status === "approved" && (
          <Button
            type="primary"
            onClick={() => window.location.href = `/product/${record.product._id}`}
          >
            Buy Now
          </Button>
        )
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={bids}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default Bids; 