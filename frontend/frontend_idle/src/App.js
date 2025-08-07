import { RouterProvider } from "react-router-dom";
import root from "./router/root";
import { Provider } from "react-redux";
import store from "./store";
// import FloatingChatButton from "./layouts/components/common/FloatingChatButton"; // 이제 RootLayout에서 임포트하므로 여기서는 필요 없음

// bootstrap 
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./theme/bootStrap.css"
import "./theme/custom.css"; // 덮어쓸 스타일 파일

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={root} />
      {/* <FloatingChatButton /> 이제 RootLayout에서 조건부 렌더링 */}
    </Provider>
  );
}
