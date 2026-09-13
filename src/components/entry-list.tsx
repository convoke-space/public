import Link from "next/link";
import { formatDate, isoDateTime } from "@/lib/format";

export type EntryListItem = {
  href: string;
  title: string;
  description: string;
  date: string;
  /** Rendered on the right of the title row, e.g. a project status. */
  badge?: string;
  meta?: string;
};

/**
 * The single list primitive used by Writing, Projects, Gatherings and Home.
 * One rhythm across the whole archive, so a reader learns it once.
 */
export function EntryList({
  items,
  emptyMessage = "Nothing here yet.",
}: {
  items: EntryListItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return <p className="text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-rule border-t border-rule">
      {items.map((item) => (
        <li key={item.href} className="group py-6 sm:py-7">
          <article>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-serif text-[1.15rem] leading-snug">
                <Link
                  href={item.href}
                  className="underline decoration-transparent decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] group-hover:decoration-accent"
                >
                  {item.title}
                </Link>
              </h3>
              {item.badge ? (
                <span className="eyebrow shrink-0">{item.badge}</span>
              ) : null}
            </div>

            <p className="mt-1.5 max-w-[54ch] text-[0.95rem] text-muted">
              {item.description}
            </p>

            <p className="mt-2.5 text-[0.78rem] text-faint">
              <time dateTime={isoDateTime(item.date)}>
                {formatDate(item.date)}
              </time>
              {item.meta ? <span> · {item.meta}</span> : null}
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
