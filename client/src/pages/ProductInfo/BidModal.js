import { Form, Input, Modal, message } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddNotification } from "../../apicalls/notifications";
import { PlaceNewBid } from "../../apicalls/products";
import { SetLoader } from "../../redux/loadersSlice";

function BidModal({ showBidModal, setShowBidModal, product, reloadData }) {
  const { user } = useSelector((state) => state.users);
  const formRef = React.useRef(null);
  const rules = [{ required: true, message: "Required" }];
  const dispatch = useDispatch();
  const onFinish = async (values) => {
    try {
      dispatch(SetLoader(true));
      const response = await PlaceNewBid({
        ...values,
        product: product._id,
        seller: product.seller._id,
        buyer: user._id,
      });
      
      if (response.success) {
        // Enhanced notification with more details
        await AddNotification({
          title: "New Bid Received",
          message: `New bid of $${values.bidAmount} received on your product "${product.name}"
                   Buyer: ${user.name}
                   Contact: ${values.mobile}
                   Message: ${values.message}`,
          user: product.seller._id,
          onClick: `/product/${product._id}`,
          read: false,
        });

        // Add a notification for admin as well
        await AddNotification({
          title: "New Bid Placed",
          message: `A new bid has been placed on product "${product.name}"
                   Seller: ${product.seller.name}
                   Buyer: ${user.name}
                   Amount: $${values.bidAmount}`,
          user: "admin",
          onClick: `/admin`,
          read: false,
        });

        message.success("Bid added successfully");
        reloadData();
        setShowBidModal(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(SetLoader(false));
    }
  };
  return (
    <Modal
      onCancel={() => setShowBidModal(false)}
      open={showBidModal}
      centered
      width={600}
      onOk={() => formRef.current.submit()}
    >
      <div className="flex flex-col gap-5 mb-5">
        <h1 className="text-2xl font-semibold text-orange-900 text-center">
          New Bid
        </h1>

        <Form layout="vertical" ref={formRef} onFinish={onFinish}>
          <Form.Item label="Bid Amount" name="bidAmount" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Message" name="message" rules={rules}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Mobile" name="mobile" rules={rules}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default BidModal;
