import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { GetCurrentUser } from "../../apicalls/users";
import { SetUser } from "../../redux/usersSlice";
import { Tabs, message } from "antd";
import Products from "./Products";
import General from "./General";
import Orders from "./Orders";

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetCurrentUser();
      dispatch(SetLoader(false));
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="General" key="1">
          <General />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Products" key="2">
          <Products />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Orders" key="3">
          <Orders />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Profile;