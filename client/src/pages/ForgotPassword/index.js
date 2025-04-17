import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { SendOTP, VerifyOTPAndResetPassword } from "../../apicalls/users";

function ForgotPassword() {
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [email, setEmail] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSendOTP = async (values) => {
        try {
            dispatch(SetLoader(true));
            console.log("Sending OTP request for:", values.email);
            const response = await SendOTP(values);
            console.log("OTP Response:", response);
            dispatch(SetLoader(false));

            if (response.success) {
                setEmail(values.email);
                setShowOTPForm(true);
                message.success("OTP sent to your email");
                console.log("Test OTP:", response.otp);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoader(false));
            console.error("OTP Error:", error);
            message.error(error.message || "Error sending OTP");
        }
    };

    const onResetPassword = async (values) => {
        try {
            dispatch(SetLoader(true));
            const response = await VerifyOTPAndResetPassword({
                email,
                otp: values.otp,
                newPassword: values.newPassword
            });
            dispatch(SetLoader(false));

            if (response.success) {
                message.success("Password reset successful");
                navigate("/login");
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            dispatch(SetLoader(false));
            message.error(error.message);
        }
    };

    return (
        <div className="h-screen bg-primary flex justify-center items-center">
            <div className="bg-white p-5 rounded w-[450px]">
                <h1 className="text-primary text-2xl">
                    RETRO TRADE - <span className="text-gray-400">RESET PASSWORD</span>
                </h1>

                {!showOTPForm ? (
                    <Form layout="vertical" onFinish={onSendOTP}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: "Please input your email!" }]}
                        >
                            <Input type="email" placeholder="Email" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" block className="mt-2">
                            Send OTP
                        </Button>

                        <div className="mt-5 text-center">
                            <Link to="/login" className="text-primary">
                                Back to Login
                            </Link>
                        </div>
                    </Form>
                ) : (
                    <Form layout="vertical" onFinish={onResetPassword}>
                        <Form.Item
                            label="OTP"
                            name="otp"
                            rules={[{ required: true, message: "Please input OTP!" }]}
                        >
                            <Input placeholder="Enter OTP" />
                        </Form.Item>

                        <Form.Item
                            label="New Password"
                            name="newPassword"
                            rules={[{ required: true, message: "Please input new password!" }]}
                        >
                            <Input.Password placeholder="New Password" />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" block className="mt-2">
                            Reset Password
                        </Button>
                    </Form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;