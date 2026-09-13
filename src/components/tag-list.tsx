export function TagList({ tags, label }: { tags?: string[]; label: string }) {
  if (!tags || tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-1.5" aria-label={label}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-rule px-2.5 py-0.5 text-[0.72rem] text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
