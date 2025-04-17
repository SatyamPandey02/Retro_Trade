import { Button, message, Table, Modal, Row, Col, Card } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { GetProducts, UpdateProductStatus } from "../../apicalls/products";
import { SetLoader } from "../../redux/loadersSlice";
import { GetAllUsers, UpdateUserStatus } from "../../apicalls/users";

function Users() {
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetAllUsers(null);
      dispatch(SetLoader(false));
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const onStatusUpdate = async (id, status) => {
    try {
      dispatch(SetLoader(true));
      const response = await UpdateUserStatus(id, status);
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

  const UserDetailsModal = ({ user, visible, onClose }) => {
    if (!user) return null;

    return (
      <Modal
        title="User Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <div className="p-4">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Basic Information">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Joined:</strong> {moment(user.createdAt).format('MMMM D, YYYY')}</p>
                <p><strong>Status:</strong> {user.status}</p>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Activity Statistics">
                <p><strong>Products Listed:</strong> {user.products?.length || 0}</p>
                <p><strong>Active Bids:</strong> {user.bids?.length || 0}</p>
                <p><strong>Products Sold:</strong> {user.soldProducts?.length || 0}</p>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (text, record) => {
        return record.role.toUpperCase();
      }
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text, record) =>
        moment(record.createdAt).format("DD-MM-YYYY hh:mm A"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record) => {
        return record.status.toUpperCase();
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        const { status, _id } = record;
        return (
          <div className="flex gap-3">
            <Button
              type="primary"
              onClick={() => {
                setSelectedUser(record);
                setShowUserDetails(true);
              }}
            >
              View Details
            </Button>
            {status === "active" && (
              <span
                className="underline cursor-pointer"
                onClick={() => onStatusUpdate(_id, "blocked")}
              >
                Block
              </span>
            )}
            {status === "blocked" && (
              <span
                className="underline cursor-pointer"
                onClick={() => onStatusUpdate(_id, "active")}
              >
                Unblock
              </span>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);
  return (
    <>
      <Table columns={columns} dataSource={users} />
      <UserDetailsModal
        user={selectedUser}
        visible={showUserDetails}
        onClose={() => {
          setSelectedUser(null);
          setShowUserDetails(false);
        }}
      />
    </>
  );
}

export default Users;
