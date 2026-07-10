import { Fragment, type ReactNode } from "react";

/**
 * Minimal, dependency-free Markdown renderer for GitHub release notes.
 * Supports: headings (#/##/###), bold, inline code, links, bullet lists,
 * numbered lists, blockquotes (>), horizontal rules (---), tables (| a | b |).
 * Anything else renders as a plain paragraph. Not a full CommonMark parser —
 * just enough to make release bodies look like release notes instead of
 * plain text with stray `#`/`*`/`>` characters.
 */

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {linkMatch[1]}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function renderMarkdownLite(md: string): ReactNode {
  if (!md?.trim()) return null;

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push(<hr key={key++} className="my-3 border-border" />);
      i++; continue;
    }

    // Headings
    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      const cls = level === 1 ? "text-lg font-bold mt-4 mb-2" : level === 2 ? "text-base font-semibold mt-3 mb-1.5" : "text-sm font-semibold mt-2 mb-1";
      blocks.push(<Tag key={key++} className={cls}>{renderInline(text)}</Tag>);
      i++; continue;
    }

    // Table
    if (trimmed.startsWith("|") && lines[i + 1]?.trim().match(/^\|[\s:|-]+\|$/)) {
      const headerCells = trimmed.split("|").map((c) => c.trim()).filter(Boolean);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim().split("|").map((c) => c.trim()).filter(Boolean));
        i++;
      }
      blocks.push(
        <div key={key++} className="my-2 overflow-x-auto">
          <table className="w-full min-w-[300px] text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-card/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>{headerCells.map((h, j) => <th key={j} className="p-2 text-left">{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-border">
                  {r.map((c, ci) => <td key={ci} className="p-2">{renderInline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground italic">
          {quoteLines.map((l, li) => <p key={li}>{renderInline(l)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1.5 space-y-1">
          {items.map((it, ii) => (
            <li key={ii} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1.5 ml-4 list-decimal space-y-1 text-sm">
          {items.map((it, ii) => <li key={ii}>{renderInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // Plain paragraph
    blocks.push(<p key={key++} className="my-1 text-sm">{renderInline(trimmed)}</p>);
    i++;
  }

  return <>{blocks}</>;
}
