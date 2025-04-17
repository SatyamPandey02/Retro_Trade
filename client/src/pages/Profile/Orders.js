import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { GetOrders } from "../../apicalls/payments";
import { Table, message } from "antd";
import moment from "moment";

function Orders() {
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetOrders();
      dispatch(SetLoader(false));
      if (response.success) {
        setOrders(response.data);
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
      dataIndex: "product",
      render: (product) => (
        <div className="flex items-center gap-2">
          <img 
            src={product?.images?.[0]} 
            alt={product?.name}
            className="w-16 h-16 object-cover rounded-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/64";
            }}
          />
          <span className="font-medium">{product?.name}</span>
        </div>
      )
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => `₹${amount.toLocaleString('en-IN')}`
    },
    {
      title: "Seller",
      dataIndex: ["seller", "name"],
    },
    {
      title: "Ordered On",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY hh:mm A")
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <span className={`
          px-2 py-1 rounded text-white
          ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}
        `}>
          {status.toUpperCase()}
        </span>
      )
    }
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Orders</h1>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={orders}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            total: orders.length,
            showTotal: (total) => `Total ${total} orders`
          }}
        />
      </div>
    </div>
  );
}

export default Orders; 