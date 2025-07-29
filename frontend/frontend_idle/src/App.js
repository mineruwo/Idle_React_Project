import {RouterProvider} from "react-router-dom";
import root from "./mainpage/router/root";

export default function App() {
  return (
    <RouterProvider router={root}/>
  );
}


