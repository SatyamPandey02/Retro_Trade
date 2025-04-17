import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SetLoader } from "../../redux/loadersSlice";
import { GetProducts } from "../../apicalls/products";
import { message } from "antd";
import Divider from "../../components/Divider";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showFilters, setShowFilters] = useState(true);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    status: "approved",
    category: [],
    age: [],
    search: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(SetLoader(true));
      const response = await GetProducts(filters);
      dispatch(SetLoader(false));
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      dispatch(SetLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, [filters]);

  return (
    <div className="flex gap-5">
      {showFilters && (
        <div className="w-72 flex flex-col gap-3">
          <div className="bg-white p-5 rounded-lg shadow-md">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                Categories
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: "electronics", label: "Electronics" },
                  { id: "fashion", label: "Fashion" },
                  { id: "home", label: "Home" },
                  { id: "sports", label: "Sports" },
                ].map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={category.id}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={filters.category.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            category: [...filters.category, category.id],
                          });
                        } else {
                          setFilters({
                            ...filters,
                            category: filters.category.filter(
                              (item) => item !== category.id
                            ),
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor={category.id}
                      className="ml-3 text-gray-700 cursor-pointer select-none"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                Age Range
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: "0-2", label: "0-2 years old" },
                  { id: "3-5", label: "3-5 years old" },
                  { id: "6-8", label: "6-8 years old" },
                  { id: "9-12", label: "9-12 years old" },
                  { id: "13-20", label: "13-20 years old" },
                ].map((ageRange) => (
                  <div 
                    key={ageRange.id}
                    className="flex items-center hover:bg-gray-50 p-2 rounded-md transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id={`age-${ageRange.id}`}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={filters.age.includes(ageRange.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            age: [...filters.age, ageRange.id],
                          });
                        } else {
                          setFilters({
                            ...filters,
                            age: filters.age.filter(
                              (item) => item !== ageRange.id
                            ),
                          });
                        }
                      }}
                    />
                    <label 
                      htmlFor={`age-${ageRange.id}`}
                      className="ml-3 text-gray-700 cursor-pointer select-none"
                    >
                      {ageRange.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {(filters.category.length > 0 || filters.age.length > 0) && (
              <button
                className="mt-6 w-full bg-red-50 text-red-600 py-2 px-4 rounded-md hover:bg-red-100 transition-all text-sm font-medium"
                onClick={() => setFilters({
                  ...filters,
                  category: [],
                  age: [],
                })}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 w-full">
        <div className="flex gap-5 items-center bg-white p-4 rounded-lg shadow-sm">
          <button
            className="text-gray-600 hover:text-gray-800 transition-all"
              onClick={() => setShowFilters(!showFilters)}
          >
            <i className="ri-filter-3-line text-xl"></i>
          </button>
          <div className="relative flex-1">
          <input
            type="text"
              placeholder="Search Products here..."
              className="w-full h-12 pl-4 pr-10 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />
            <i className="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <div className={`grid gap-5 ${showFilters ? "grid-cols-4" : "grid-cols-5"}`}>
          {products?.map((product) => (
            <div
                key={product._id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <img
                  src={product.images[0]}
                className="w-full h-52 object-cover"
                  alt=""
                />
              <div className="p-4">
                <h1 className="text-lg font-semibold text-gray-800">{product.name}</h1>
                <p className="text-sm text-gray-600 mt-1">{product.age} years old</p>
                  <Divider />
                <span className="text-xl font-semibold text-green-600">
                  ₹ {product.price}
                  </span>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
