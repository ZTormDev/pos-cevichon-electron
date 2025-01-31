import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useNotification = () => {
  const [notifyTimeAlive, setNotifyTime] = useState(5000); // Valor predeterminado

  const notify = (notificationText, timeAlive = 5000, type = 'default') => {
    setNotifyTime(timeAlive);
    
    switch (type) {
      case 'success':
        toast.success(notificationText, {
          position: "bottom-right",
          autoClose: timeAlive,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: document.documentElement.getAttribute('data-theme'),
        });
        break;

      case 'error':
        toast.error(notificationText, {
          position: "bottom-right",
          autoClose: timeAlive,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: document.documentElement.getAttribute('data-theme'),
        });
        break;

      case 'warning':
        toast.warning(notificationText, {
          position: "bottom-right",
          autoClose: timeAlive,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: document.documentElement.getAttribute('data-theme'),
        });
        break;

      case 'info':
        toast.info(notificationText, {
          position: "bottom-right",
          autoClose: timeAlive,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: document.documentElement.getAttribute('data-theme'),
        });
        break;

      default:
        toast(notificationText, {
          position: "bottom-right",
          autoClose: timeAlive,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: document.documentElement.getAttribute('data-theme'),
        });
        break;
    }
  };

  return { notify, notifyTimeAlive };
};
