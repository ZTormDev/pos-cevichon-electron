import React from "react";
import { ToastContainer } from "react-toastify";
import { useNotification } from "./useNotification";

function Notification() {
  const { notifyTimeAlive } = useNotification();

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={notifyTimeAlive}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme={document.documentElement.getAttribute("data-theme")}
        style={{ width: "auto" }}
      />
    </>
  );
}

export default Notification;
