import React from "react";
import { Spinner } from "react-loading-spinner"; // Ensure you have a spinner component or use a library

const TransactionButton = ({
  onClick,
  isLoading,
  disabled,
  children,
  variant = "primary",
  fullWidth = false,
}) => {
  const baseStyles = "p-2 rounded transition duration-200 focus:outline-none";
  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        isLoading ? disabledStyles : ""
      } ${fullWidth ? "w-full" : ""}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner className="mr-2" />{" "}
          {/* Adjust the spinner component as necessary */}
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default TransactionButton;
