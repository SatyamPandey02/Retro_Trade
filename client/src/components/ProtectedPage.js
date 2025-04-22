import React, { useEffect, useState } from "react";
import { Avatar, Badge, message } from "antd";
import { GetCurrentUser } from "../apicalls/users";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SetLoader } from "../redux/loadersSlice";
import { SetUser } from "../redux/usersSlice";
import Notifications from "./Notifications";
import {
  GetAllNotifications,
  ReadAllNotifications,
} from "../apicalls/notifications";

function ProtectedPage({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateToken = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetCurrentUser();
      
      if (response) {
        dispatch(SetUser(response));
        return true;
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      localStorage.removeItem("token");
      dispatch(SetUser(null));
      return false;
    } finally {
      dispatch(SetLoader(false));
    }
  };

  const getNotifications = async () => {
    try {
      const response = await GetAllNotifications();
      if (response.success) {
        const newNotifications = response.data;
        const newUnreadCount = newNotifications.filter(item => !item.read).length;
        
        if (newUnreadCount !== unreadCount) {
          setUnreadCount(newUnreadCount);
        }
        
        if (JSON.stringify(notifications) !== JSON.stringify(newNotifications)) {
          setNotifications(newNotifications);
        }
      } else {
        console.error("Failed to get notifications:", response.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const readNotifications = async () => {
    try {
      const response = await ReadAllNotifications();
      if (response.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
      } else {
        console.error("Failed to mark notifications as read:", response.message);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    validateToken().then(isValid => {
      if (!isValid) {
        navigate("/login", { replace: true });
      }
    });
  }, []);

  useEffect(() => {
    getNotifications();
    
    const interval = setInterval(() => {
      getNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    user && (
      <div>
        {/* header */}
        <div className="flex justify-between items-center bg-primary p-5">
          <h1
            className="text-2xl text-white cursor-pointer"
            onClick={() => navigate("/")}
          >
            RETRO TRADE
          </h1>

          <div className="bg-white py-2 px-5 rounded flex gap-1 items-center">
            <span
              className="underline cursor-pointer uppercase"
              onClick={() => {
                if (user.role === "user") {
                  navigate("/profile");
                } else {
                  navigate("/admin");
                }
              }}
            >
              {user.name}
            </span>
            <Badge
              count={unreadCount}
              onClick={() => {
                setShowNotifications(true);
                if (unreadCount > 0) {
                  readNotifications();
                }
              }}
              className="cursor-pointer"
            >
              <Avatar
                shape="circle"
                icon={<i className="ri-notification-3-line"></i>}
                className="cursor-pointer"
              />
            </Badge>
            <i
              className="ri-logout-box-r-line ml-10 cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
            ></i>
          </div>
        </div>

        {/* body */}
        <div className="p-5">{children}</div>

        <Notifications
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          setNotifications={setNotifications}
          reloadNotifications={getNotifications}
        />
      </div>
    )
  );
}

export default ProtectedPage;
