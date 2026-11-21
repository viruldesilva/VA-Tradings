import { Fragment, type ReactNode } from "react";

/**
 * Tiny, dependency-free Markdown renderer for product descriptions (the format
 * ChatGPT's "Copy" button produces). Supports headings, **bold**, *italic*,
 * `code`, bullet / numbered lists, horizontal rules and paragraphs.
 * It only ever creates React elements (no raw HTML), so it's XSS-safe.
 */

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "hr" }
  | { type: "p"; lines: string[] };

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const UL_ITEM = /^\s*[-*+•]\s+(.*)$/;
const OL_ITEM = /^\s*\d+[.)]\s+(.*)$/;

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flush = () => {
    if (para.length) blocks.push({ type: "p", lines: para });
    if (list) blocks.push(list);
    para = [];
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    if (HR.test(line)) {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }

    const ul = UL_ITEM.exec(line);
    const ol = ul ? null : OL_ITEM.exec(line);
    if (ul || ol) {
      const type = ul ? "ul" : "ol";
      if (para.length || (list && list.type !== type)) flush();
      list ??= { type, items: [] };
      list.items.push((ul ?? ol)![1]);
      continue;
    }

    // Indented continuation of the previous list item.
    if (list && /^\s+/.test(raw)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }

    if (list) flush();
    para.push(line.trim());
  }
  flush();
  return blocks;
}

const INLINE = /(\*\*[^*]+?\*\*|__[^_]+?__|`[^`]+?`|\*[^*\s](?:[^*]*?[^*\s])?\*|_[^_\s](?:[^_]*?[^_\s])?_)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return (
        <strong key={i} className="font-semibold text-brand-dark">
          {renderInline(part.slice(2, -2))}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (
      part.length > 2 &&
      ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_")))
    ) {
      return <em key={i}>{renderInline(part.slice(1, -1))}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const HEADING_STYLES: Record<number, string> = {
  1: "text-lg font-bold",
  2: "text-base font-bold",
  3: "text-[15px] font-semibold",
};

export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={className}>
      {parseBlocks(source).map((block, i) => {
        switch (block.type) {
          case "heading": {
            // The page already has an h1 (product name), so start at h3.
            const Tag = (`h${Math.min(block.level + 2, 6)}`) as "h3" | "h4" | "h5" | "h6";
            return (
              <Tag
                key={i}
                className={`mt-5 mb-2 text-brand-dark first:mt-0 ${HEADING_STYLES[block.level] ?? "font-semibold"}`}
              >
                {renderInline(block.text)}
              </Tag>
            );
          }
          case "hr":
            return <hr key={i} className="my-4 border-slate-200" />;
          case "ul":
          case "ol": {
            const Tag = block.type;
            return (
              <Tag
                key={i}
                className={`my-3 grid gap-1.5 pl-5 ${block.type === "ul" ? "list-disc" : "list-decimal"} marker:text-primary`}
              >
                {block.items.map((item, j) => (
                  <li key={j} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </Tag>
            );
          }
          case "p":
            return (
              <p key={i} className="my-3 first:mt-0 last:mb-0">
                {block.lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {renderInline(line)}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}

/** Markdown → plain text, for meta descriptions and structured data. */
export function stripMarkdown(source: string): string {
  return source
    .replace(/\r\n?/g, "\n")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*([-*_])(\s*\1){2,}\s*$/gm, "")
    .replace(/^\s*(?:[-*+•]|\d+[.)])\s+/gm, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(\S(?:.*?\S)?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1");
}
