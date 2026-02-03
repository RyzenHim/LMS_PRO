import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <App>
    <RouterProvider router={router} />
  </App>,
);
