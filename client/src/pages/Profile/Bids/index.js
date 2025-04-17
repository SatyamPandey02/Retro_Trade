import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, message, Button, Tabs } from 'antd';
import { GetAllBids } from '../../../apicalls/products';
import moment from 'moment';
import { SetLoader } from '../../../redux/loadersSlice';
import { useDispatch } from 'react-redux';
import { AddNotification } from '../../../apicalls/notifications';

function Bids() {
  const [bidsPlaced, setBidsPlaced] = useState([]);
  const [bidsReceived, setBidsReceived] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const bidsPlacedResponse = await GetAllBids({ buyer: user._id });
      const bidsReceivedResponse = await GetAllBids({ seller: user._id });
      
      if (bidsPlacedResponse.success) {
        setBidsPlaced(bidsPlacedResponse.data);
      }
      if (bidsReceivedResponse.success) {
        setBidsReceived(bidsReceivedResponse.data);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(SetLoader(false));
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const updateBidStatus = async (bid, status) => {
    try {
      dispatch(SetLoader(true));
      const response = await fetch(`/api/products/update-bid-status/${bid._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      
      if (data.success) {
        message.success(`Bid ${status} successfully`);
        
        // Send notification to buyer
        await AddNotification({
          title: `Bid ${status}`,
          message: `Your bid for ${bid.product.name} has been ${status}`,
          user: bid.buyer._id,
          onClick: `/profile`,
          read: false,
        });
        
        getData();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(SetLoader(false));
    }
  };

  const columns = {
    bidsPlaced: [
      {
        title: "Product",
        dataIndex: ["product", "name"],
      },
      {
        title: "Bid Amount",
        dataIndex: "bidAmount",
        render: (text) => `$ ${text}`,
      },
      {
        title: "Seller",
        dataIndex: ["seller", "name"],
      },
      {
        title: "Bid Date",
        dataIndex: "createdAt",
        render: (text) => moment(text).format("DD-MM-YYYY HH:mm"),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (text) => text.toUpperCase(),
      }
    ],
    bidsReceived: [
      {
        title: "Product",
        dataIndex: ["product", "name"],
      },
      {
        title: "Bid Amount",
        dataIndex: "bidAmount",
        render: (text) => `$ ${text}`,
      },
      {
        title: "Buyer",
        dataIndex: ["buyer", "name"],
      },
      {
        title: "Bid Date",
        dataIndex: "createdAt",
        render: (text) => moment(text).format("DD-MM-YYYY HH:mm"),
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (text) => text.toUpperCase(),
      },
      {
        title: "Action",
        render: (text, record) => {
          if (record.status === "pending") {
            return (
              <div className="flex gap-3">
                <Button
                  type="primary"
                  onClick={() => updateBidStatus(record, "approved")}
                >
                  Approve
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => updateBidStatus(record, "rejected")}
                >
                  Reject
                </Button>
              </div>
            );
          }
        },
      },
    ],
  };

  return (
    <div className="p-5">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Bids Placed" key="1">
          <Table 
            columns={columns.bidsPlaced} 
            dataSource={bidsPlaced}
            rowKey="_id"
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Bids Received" key="2">
          <Table 
            columns={columns.bidsReceived} 
            dataSource={bidsReceived}
            rowKey="_id"
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Bids; 