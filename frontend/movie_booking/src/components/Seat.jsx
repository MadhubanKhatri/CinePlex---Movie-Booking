export default function Seat({ seat, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-10 h-10 m-1 flex items-center justify-center cursor-pointer rounded
      ${selected ? "bg-green-500" : "bg-gray-300 hover:bg-gray-400"}`}
    >
      {seat}
    </div>
  );
}
