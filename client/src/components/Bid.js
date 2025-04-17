import { Button, message } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { SetLoader } from "../redux/loadersSlice";
import { UpdateBidStatus, InitiatePayment } from "../apicalls/bids";
import moment from "moment";

function Bid({ bid, reloadData }) {
  const dispatch = useDispatch();

  const onStatusUpdate = async (status) => {
    try {
      dispatch(SetLoader(true));
      const response = await UpdateBidStatus({
        bidId: bid._id,
        status,
      });
      dispatch(SetLoader(false));
      if (response.success) {
        message.success(response.message);
        reloadData();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const onPayment = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await InitiatePayment({ bidId: bid._id });
      dispatch(SetLoader(false));
      if (response.success) {
        const { orderId, amount, bidId } = response.data;
        
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: amount,
          currency: "INR",
          name: "Retro Trade",
          description: "Payment for bid",
          order_id: orderId,
          handler: async function (response) {
            try {
              dispatch(SetLoader(true));
              const verifyResponse = await VerifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bidId,
              });
              dispatch(SetLoader(false));
              if (verifyResponse.success) {
                message.success(verifyResponse.message);
                reloadData();
              } else {
                throw new Error(verifyResponse.message);
              }
            } catch (error) {
              dispatch(SetLoader(false));
              message.error(error.message);
            }
          },
          prefill: {
            name: bid.buyer.name,
            email: bid.buyer.email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  return (
    <div className="card p-3 mb-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-sm">Bid Amount: ₹{bid.bidAmount}</h1>
          <h1 className="text-sm">Buyer: {bid.buyer.name}</h1>
          <h1 className="text-sm">Bid Placed On: {moment(bid.createdAt).format("DD-MM-YYYY HH:mm")}</h1>
          <h1 className="text-sm">Message: {bid.message}</h1>
          <h1 className="text-sm">Mobile: {bid.mobile}</h1>
        </div>

        <div className="flex flex-col gap-2">
          {bid.status === "pending" && bid.seller._id === localStorage.getItem("userId") && (
            <>
              <Button
                type="primary"
                onClick={() => onStatusUpdate("approved")}
                className="btn-small"
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => onStatusUpdate("rejected")}
                className="btn-small"
              >
                Reject
              </Button>
            </>
          )}

          {bid.status === "approved" && bid.buyer._id === localStorage.getItem("userId") && (
            <Button
              type="primary"
              onClick={onPayment}
              className="btn-small"
            >
              Pay Now
            </Button>
          )}

          {bid.status === "completed" && (
            <span className="text-green-500 text-sm">Completed</span>
          )}

          {bid.status === "rejected" && (
            <span className="text-red-500 text-sm">Rejected</span>
          )}

          {bid.status === "approved" && (
            <span className="badge badge-success">Approved</span>
          )}
          {bid.status === "rejected" && (
            <span className="badge badge-danger">Rejected</span>
          )}
          {bid.status === "pending" && (
            <span className="badge badge-warning">Pending</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bid; 