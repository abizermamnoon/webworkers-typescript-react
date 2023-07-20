import React from "react";

const Modal = ({ show, children }) => {
  const modalStyle = {
    display: show ? "block" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "90%",
    height: "90%",
    margin: "5%",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    zIndex: 9999,
    overflowY: "auto",
  };

  return (
    <div style={modalStyle}>
      {children}
    </div>
  );
};

export default Modal;