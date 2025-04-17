import React, { useEffect } from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Divider from "../../components/Divider";
import { LoginUser } from "../../apicalls/users";
import { useDispatch, useSelector } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { SetUser } from "../../redux/usersSlice";

const rules = [
  {
    required: true,
    message: "required",
  },
];

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { user } = useSelector((state) => state.users);

  const onFinish = async (values) => {
    try {
      dispatch(SetLoader(true));
      const response = await LoginUser(values);
      
      if (response.success) {
        message.success(response.message);
        if (response.user) {
          await dispatch(SetUser(response.user));
          navigate("/", { replace: true });
        }
      } else {
        throw new Error(response?.message || "Login failed");
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(SetLoader(false));
    }
  };

  useEffect(() => {
    if (window.location.pathname === "/login") {
      localStorage.removeItem("token");
      dispatch(SetUser(null));
    }
  }, []);

  return (
    <div className="h-screen bg-primary flex justify-center items-center">
      <div className="bg-white p-5 rounded w-[450px]">
        <h1 className="text-primary text-2xl">
          RETRO TRADE - <span className="text-gray-400 text-2xl">LOGIN</span>
        </h1>
        <Divider />
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item label="Email" name="email" rules={rules}>
            <Input placeholder="Email" autoComplete="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={rules}>
            <Input type="password" placeholder="Password" autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block className="mt-2">
            Login
          </Button>

          <div className="mt-2 text-center">
            <Link to="/forgot-password" className="text-primary">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-5 text-center">
            <span className="text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary">
                Register
              </Link>
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;
