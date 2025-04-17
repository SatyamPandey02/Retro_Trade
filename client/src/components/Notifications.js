import React from 'react';
import { Modal, Badge, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { GetAllNotifications, ReadAllNotifications } from '../apicalls/notifications';

function Notifications({
  showNotifications,
  setShowNotifications,
  notifications,
  setNotifications,
  reloadNotifications
}) {
  const navigate = useNavigate();

  const readNotifications = async () => {
    try {
      const response = await ReadAllNotifications();
      if (response.success) {
        reloadNotifications();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Modal
      title="Notifications"
      open={showNotifications}
      onCancel={() => setShowNotifications(false)}
      footer={null}
      width={500}
    >
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`flex flex-col gap-1 p-2 cursor-pointer border rounded
              ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
            onClick={() => {
              navigate(notification.onClick);
              setShowNotifications(false);
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">{notification.title}</h3>
              <span className="text-gray-500 text-sm">
                {moment(notification.createdAt).fromNow()}
              </span>
            </div>
            <span className="text-gray-600">{notification.message}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default Notifications;
