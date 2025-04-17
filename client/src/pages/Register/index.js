import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Divider from "../../components/Divider";
import { RegisterUser } from "../../apicalls/users";
import { SetLoader } from "../../redux/loadersSlice";
import { useDispatch } from "react-redux";

const rules = [
  {
    required: true,
    message: "required",
  },
];

const adminCodeRule = [
  {
    required: true,
    message: "Admin code is required",
  },
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      if (value === "retro_trade_admin") {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Invalid admin code"));
    },
  },
];

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState("user");
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      dispatch(SetLoader(true));
      // Add role to the values
      values.role = selectedRole;
      const response = await RegisterUser(values);
      dispatch(SetLoader(false));
      if (response.success) {
        navigate("/login");
        message.success(response.message);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    // Reset admin code when switching roles
    if (value !== "admin") {
      form.setFieldValue("adminCode", "");
    }
  };

  return (
    <div className="h-screen bg-primary flex justify-center items-center">
      <div className="bg-white p-5 rounded w-[450px]">
        <h1 className="text-primary text-2xl">
          RETRO TRADE - <span className="text-gray-400 text-2xl">REGISTER</span>
        </h1>
        <Divider />
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item label="Name" name="name" rules={rules}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={rules}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={rules}>
            <Input type="password" placeholder="Password" />
          </Form.Item>
          <Form.Item label="Role" name="roleSelect" rules={rules}>
            <Select
              placeholder="Select role"
              onChange={handleRoleChange}
              value={selectedRole}
            >
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          {selectedRole === "admin" && (
            <Form.Item label="Admin Code" name="adminCode" rules={adminCodeRule}>
              <Input.Password placeholder="Enter admin code" />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" block className="mt-2">
            Register
          </Button>

          <div className="mt-5 text-center">
            <span className="text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary">
                Login
              </Link>
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Register;
