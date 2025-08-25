import { RouterProvider } from "react-router-dom";
import root from "./router/root";
import { Provider } from "react-redux";
import store from "./store";

// bootstrap 
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./theme/bootStrap.css"
import "./theme/custom.css"; // 덮어쓸 스타일 파일
import AuthProvider from "./auth/AuthProvider";
import BubbleAnimation from "./layouts/components/carownerComponent/common/BubbleAnimation";

export default function App() {
  return (
    <>
    <BubbleAnimation/>
    <AuthProvider>
      <Provider store={store}>
        <RouterProvider router={root} />
      </Provider>
    </AuthProvider>
    </>
  );
}