import React from "react";
import { Spinner } from "react-loading-spinner"; // Ensure you have a spinner component or use a library

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
      <Spinner className="mb-4" />
      <h1 className="text-2xl">Loading...</h1>
    </div>
  );
};

export default Loading;
