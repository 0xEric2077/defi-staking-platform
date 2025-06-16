import React from "react";

const ErrorBoundary = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
      <h1 className="text-2xl text-red-500">Something went wrong!</h1>
      <p className="mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorBoundary;
