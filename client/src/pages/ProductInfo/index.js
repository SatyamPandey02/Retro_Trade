import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { Button, message, Modal } from "antd";
import { GetProductById } from "../../apicalls/products";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { CreateOrder, VerifyPayment } from "../../apicalls/payments";

function ProductInfo() {
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { user } = useSelector(state => state.users);

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetProductById(id);
      dispatch(SetLoader(false));
      if (response.success) {
        setProduct(response.data);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const handleBuyNow = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await CreateOrder(product._id);
      dispatch(SetLoader(false));

      if (response.success) {
        const {
          data: { orderId, amount, currency, productName }
        } = response;

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: amount * 100,
          currency: currency,
          name: "Retro Trade",
          description: `Purchase of ${productName}`,
          order_id: orderId,
          prefill: {
            name: user?.name || "",
            email: user?.email || ""
          },
          handler: async function (response) {
            try {
              dispatch(SetLoader(true));
              const verificationResponse = await VerifyPayment({
                ...response,
                productId: product._id,
                userId: user._id
              });
              dispatch(SetLoader(false));

              if (verificationResponse.success) {
                setShowSuccessModal(true);
                getData();
              } else {
                message.error(verificationResponse.message);
              }
            } catch (error) {
              dispatch(SetLoader(false));
              message.error(error.message);
            }
          },
          modal: {
            ondismiss: function () {
              message.error("Payment cancelled");
            }
          },
          theme: {
            color: "#3399cc"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          message.error(response.error.description);
        });
        rzp.open();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {product && (
        <div className="grid grid-cols-2 gap-5 mt-5">
          {/* Images */}
          <div className="flex flex-col gap-5">
            <img
              src={product.images[selectedImageIndex]}
              alt=""
              className="w-full h-96 object-cover rounded-md"
            />
            <div className="flex gap-5">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt=""
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer ${
                    selectedImageIndex === index
                      ? "border-2 border-green-700 p-1"
                      : ""
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <span>{product.description}</span>
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">Product Details</h1>
              <div className="flex justify-between mt-2">
                <span>Price</span>
                <span>₹ {product.price}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Category</span>
                <span className="uppercase">{product.category}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Age</span>
                <span>{product.age} years</span>
              </div>
              
              {/* New Additional Details */}
              <div className="mt-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Additional Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${product.billAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Bill Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${product.warrantyAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Warranty Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${product.accessoriesAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Accessories Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${product.boxAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Box Available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">Seller Details</h1>
              <div className="flex justify-between mt-2">
                <span>Name</span>
                <span>{product.seller.name}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Email</span>
                <span>{product.seller.email}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between mt-2">
                <span>Added On</span>
                <span>{moment(product.createdAt).format("MMM D , YYYY hh:mm A")}</span>
              </div>
            </div>

            {product.status === "approved" && product.seller !== user._id && (
              <Button 
                type="primary" 
                size="large" 
                block 
                onClick={handleBuyNow}
                className="mt-4"
              >
                Buy Now for ₹{product.price}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Modal
        title="Congratulations!"
        open={showSuccessModal}
        onOk={() => {
          setShowSuccessModal(false);
          navigate('/profile');
        }}
        onCancel={() => {
          setShowSuccessModal(false);
          navigate('/profile');
        }}
        centered
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-semibold text-green-600">Payment Successful!</h2>
          <p className="text-center text-gray-600">
            Congratulations on your purchase! You will receive your product within 48 working hours.
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default ProductInfo;
