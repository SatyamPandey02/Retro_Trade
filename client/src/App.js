import { useSelector } from "react-redux";
import { Routes, Route, unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import ProtectedPage from "./components/ProtectedPage";
import Spinner from "./components/Spinner";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductInfo from "./pages/ProductInfo";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import EditProductPage from "./pages/EditProduct";
import AddProductPage from "./pages/AddProduct";
import { App as AntApp } from "antd";

const history = createBrowserHistory();

function App() {
  const { loading } = useSelector((state) => state.loaders);
  return (
    <AntApp>
      <div>
        {loading && <Spinner />}
        <HistoryRouter history={history}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedPage>
                  <Home />
                </ProtectedPage>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedPage>
                  <ProductInfo />
                </ProtectedPage>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedPage>
                  <Profile />
                </ProtectedPage>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedPage>
                  <Admin />
                </ProtectedPage>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/edit-product/:id" element={<ProtectedPage><EditProductPage /></ProtectedPage>} />
            <Route 
              path="/add-product" 
              element={
                <ProtectedPage>
                  <AddProductPage />
                </ProtectedPage>
              } 
            />
          </Routes>
        </HistoryRouter>
      </div>
    </AntApp>
  );
}

export default App;
