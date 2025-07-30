import { RouterProvider } from "react-router-dom";
import root from "./router/root";

// bootstrap 
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootswatch/dist/journal/bootstrap.min.css";

export default function App() {
  return (
      <RouterProvider router={root} />
  );
}


