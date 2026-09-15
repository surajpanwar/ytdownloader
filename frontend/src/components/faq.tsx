export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-xl border border-edge bg-surface overflow-hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white select-none [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="ml-4 shrink-0 text-muted transition-transform group-open:rotate-180">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </summary>
          <div className="px-5 pb-4 text-sm leading-relaxed text-muted">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
