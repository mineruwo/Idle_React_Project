import { RouterProvider } from "react-router-dom";
import root from "./router/root";

// bootstrap 
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootswatch/dist/journal/bootstrap.min.css";
import Layout from "./layouts/Layout";

export default function App() {
  return (
    <Layout>
      <RouterProvider router={root} />
    </Layout>
  );
}


