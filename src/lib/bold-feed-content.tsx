import type { ReactNode } from "react";

const TIME_PATTERN =
  /\b(today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm|\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))\b/gi;

export function splitContentWithBoldTimes(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(TIME_PATTERN.source, TIME_PATTERN.flags);

  for (const match of text.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    parts.push(
      <strong key={`${index}-${match[0]}`} className="font-bold">
        {match[0]}
      </strong>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
}
