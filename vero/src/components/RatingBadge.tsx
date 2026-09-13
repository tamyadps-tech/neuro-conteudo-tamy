export function RatingBadge({
  average,
  count,
}: {
  average: number;
  count: number;
}) {
  if (count === 0) {
    return <span className="text-xs text-ink-soft">Novo na Vero</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
      <span className="text-accent">★</span>
      <span className="font-medium text-ink">{average.toFixed(1)}</span>
      <span>
        ({count} avaliaç{count === 1 ? "ão" : "ões"})
      </span>
    </span>
  );
}
