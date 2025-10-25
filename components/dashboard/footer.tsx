export function Footer() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
  });

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-600">
      <p>{formattedDate} • Courtesy of OIPHD Department</p>
    </footer>
  );
}
