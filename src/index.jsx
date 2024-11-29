import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import "./tailwind.scss";
import "react-toastify/dist/ReactToastify.css";
import "react-alice-carousel/lib/scss/alice-carousel.scss";
import { Provider } from "react-redux";
import store from "./Store/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>
);
