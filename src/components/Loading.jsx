const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
};

export default Loading;
