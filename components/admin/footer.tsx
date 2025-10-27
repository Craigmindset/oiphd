export function AdminFooter() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
  });

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-1 text-center text-xs text-gray-600 fixed bottom-0 left-0 w-full z-50">
      <p>{formattedDate} • Courtesy of OIPHD Department</p>
    </footer>
  );
}
