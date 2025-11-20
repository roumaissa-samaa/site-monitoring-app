import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // <- c’est indispensable

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
