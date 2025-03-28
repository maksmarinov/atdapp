type LoadingProps = {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function Loading({
  fullScreen = true,
  size = "md",
}: LoadingProps = {}) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`flex justify-center items-center ${
        fullScreen ? "h-screen" : "h-full"
      }`}
    >
      <div
        className={`animate-spin rounded-full border-b-2 border-gray-900 ${sizeClasses[size]}`}
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
