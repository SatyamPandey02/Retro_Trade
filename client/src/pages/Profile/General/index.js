import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Button, message, Table, Modal } from 'antd';
import moment from 'moment';

function General() {
  const { user } = useSelector((state) => state.users);

  return (
    <div className="p-5">
      <Card className="mb-5">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold text-primary mb-2">Profile Information</h2>
          <div className="text-gray-500">Welcome back, {user?.name}!</div>
        </div>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="text-gray-700">
              <div className="font-semibold">Name</div>
              <div>{user?.name}</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-gray-700">
              <div className="font-semibold">Email</div>
              <div>{user?.email}</div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-gray-700">
              <div className="font-semibold">Member Since</div>
              <div>{moment(user?.createdAt).format('MMMM D, YYYY')}</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold mb-4">Account Status</h3>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="text-gray-700">
              <div className="font-semibold">Account Type</div>
              <div className="capitalize">{user?.role || 'User'}</div>
            </div>
          </Col>
          <Col span={12}>
            <div className="text-gray-700">
              <div className="font-semibold">Status</div>
              <div className="capitalize">{user?.status || 'Active'}</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default General; 