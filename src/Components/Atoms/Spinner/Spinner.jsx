export default function Spinner() {
  return (
    <div>
      <div className="flex items-center justify-center">
        <div
          className="w-12 h-12 border-t-4 border-b-4 rounded-full animate-spin border-ibl1"
          data-testid="spinner"
        ></div>
      </div>
    </div>
  );
}
