import { RouterProvider } from "react-router-dom";
import root from "./router/root";
import { Provider } from "react-redux";
import store from "./store";

// bootstrap 
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootswatch/dist/journal/bootstrap.min.css";

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={root} />
    </Provider>
  );
}


