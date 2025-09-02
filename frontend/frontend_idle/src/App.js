import { RouterProvider } from "react-router-dom";
import root from "./router/root";
import { Provider } from "react-redux";
import store from "./store";

// bootstrap
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./theme/bootStrap.css"; // 덮어쓸 스타일 파일
import AuthProvider from "./auth/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <div className="app-root bg-third">
          <div className="app-content">
            <RouterProvider router={root} />
          </div>
        </div>
      </Provider>
    </AuthProvider>
  );
}
