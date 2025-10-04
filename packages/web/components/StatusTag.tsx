export default function StatusTag({ status }: { status: string }) {
  const s = status.toUpperCase();
  const cls =
    s === 'PAID'    ? 'bg-green-100 text-green-700' :
    s === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
    s === 'FAILED'  ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {s}
    </span>
  );
}
