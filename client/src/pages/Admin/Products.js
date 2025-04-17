import React, { useEffect, useState } from "react";
import { Button, message, Table, Modal } from "antd";
import { useDispatch } from "react-redux";
import moment from "moment";
import { GetProducts, UpdateProductStatus } from "../../apicalls/products";
import { SetLoader } from "../../redux/loadersSlice";

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetProducts({});
      dispatch(SetLoader(false));
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const onStatusUpdate = async (id, status) => {
    try {
      dispatch(SetLoader(true));
      const response = await UpdateProductStatus(id, status);
      dispatch(SetLoader(false));
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
    },
    {
      title: "Seller",
      dataIndex: "seller",
      render: (seller) => seller?.name || "Unknown",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => status.toUpperCase(),
    },
    {
      title: "Added On",
      dataIndex: "createdAt",
      render: (date) => moment(date).format("DD-MM-YYYY"),
    },
    {
      title: "Action",
      render: (text, record) => {
        const { status, _id } = record;
        return status === "pending" ? (
        <div className="flex gap-3">
          <Button
            type="primary"
              onClick={() => onStatusUpdate(_id, "approved")}
          >
            Approve
          </Button>
          <Button
            type="primary"
            danger
              onClick={() => onStatusUpdate(_id, "rejected")}
          >
            Reject
          </Button>
        </div>
        ) : (
          <span>{status === "approved" ? "Approved" : "Rejected"}</span>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
      </div>
      <Table 
        columns={columns} 
        dataSource={products}
        rowKey="_id"
      />

      {showProductDetails && (
        <Modal
          title="Product Details"
          visible={showProductDetails}
          onCancel={() => {
            setSelectedProduct(null);
            setShowProductDetails(false);
          }}
          footer={null}
          width={1000}
        >
          {selectedProduct && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-5">
                {selectedProduct.images.map((image) => (
                  <img
                    className="w-32 h-32 object-cover rounded-md"
                    src={image}
                    alt=""
                  />
                ))}
              </div>

              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-primary">
                  Product Details
                </h1>
                <div className="flex justify-between mt-2">
                  <span>Name:</span>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Description:</span>
                  <span>{selectedProduct.description}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Price:</span>
                  <span>₹ {selectedProduct.price}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Category:</span>
                  <span>{selectedProduct.category}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Age:</span>
                  <span>{selectedProduct.age} years</span>
                </div>
              </div>

              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-primary">
                  Seller Details
                </h1>
                <div className="flex justify-between mt-2">
                  <span>Name:</span>
                  <span>{selectedProduct.seller.name}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Email:</span>
                  <span>{selectedProduct.seller.email}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-primary">
                  Additional Details
                </h1>
                <div className="flex justify-between mt-2">
                  <span>Bill Available:</span>
                  <span>{selectedProduct.billAvailable ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Box Available:</span>
                  <span>{selectedProduct.boxAvailable ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Accessories Available:</span>
                  <span>{selectedProduct.accessoriesAvailable ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Warranty Available:</span>
                  <span>{selectedProduct.warrantyAvailable ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Status:</span>
                  <span>{selectedProduct.status.toUpperCase()}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Added On:</span>
                  <span>
                    {moment(selectedProduct.createdAt).format("DD-MM-YYYY hh:mm A")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default Products;
