import React from "react";
import Skeleton from "react-loading-skeleton"; // Ensure you have react-loading-skeleton installed
import "react-loading-skeleton/dist/skeleton.css";

const LoadingSkeleton = ({ variant }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case "text":
        return <Skeleton count={1} />;
      case "card":
        return <Skeleton height={200} />;
      case "button":
        return <Skeleton width={100} height={40} />;
      default:
        return null;
    }
  };

  return <div className="mb-4">{renderSkeleton()}</div>;
};

export default LoadingSkeleton;
