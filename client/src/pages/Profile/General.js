import React from "react";
import { useSelector } from "react-redux";
import { Card, Row, Col, Statistic } from "antd";
import moment from "moment";

function General() {
  const { user } = useSelector((state) => state.users);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <Card className="shadow-md">
        <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-gray-600">Name</span>
                <span className="text-lg font-medium">{user.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600">Email</span>
                <span className="text-lg font-medium">{user.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600">Member Since</span>
                <span className="text-lg font-medium">
                  {moment(user.createdAt).format("MMMM D, YYYY")}
                </span>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card className="text-center">
                  <Statistic 
                    title="Account Status" 
                    value={user.status?.toUpperCase() || 'ACTIVE'} 
                    className="text-green-500"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="text-center">
                  <Statistic 
                    title="Products Listed" 
                    value={user.products?.length || 0}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default General; 