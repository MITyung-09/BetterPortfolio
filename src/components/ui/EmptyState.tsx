// Shown when a collection has no entries yet. Dashed frames, no fake content.
export default function EmptyState({ text, labels = [] }: { text: string; labels?: string[] }) {
  const frames = labels.length ? labels : ["", "", ""];
  return (
    <div className="empty">
      {frames.map((label, i) => (
        <div key={i} className="frame">{label && <span>+ {label}</span>}</div>
      ))}
      <p>{text}</p>
    </div>
  );
}
