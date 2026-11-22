"use client";

import React from "react";


interface LegalContentRendererProps {
  content?: string;
  theme?: "prosecution" | "defense" | "judge";
}

type BlockType =
  | { type: "heading"; level: number; text: string; raw: string }
  | { type: "metadata"; items: { key: string; value: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "divider" }
  | { type: "quote"; text: string }
  | { type: "paragraph"; text: string };

/**
 * Parses markdown inline text with bold, italics, IPC badges, and line breaks
 */
function renderInlineFormatting(rawText: string) {
  if (!rawText) return null;

  // Split on <br>, <br/>, <br />
  const brSegments = rawText.split(/<br\s*\/?>/gi);

  return brSegments.map((segment, brIdx) => {
    // Process markdown bold (**...**) and italics (*...*) and statutory codes
    const parts: React.ReactNode[] = [];
    const tokenRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\b(IPC\s+\d+[A-Z]?|Section\s+\d+[A-Z]?)\b)/g;

    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(segment)) !== null) {
      if (match.index > lastIndex) {
        parts.push(segment.substring(lastIndex, match.index));
      }

      if (match[2]) {
        // Bold
        parts.push(
          <strong key={`${brIdx}-${match.index}`} className="font-semibold text-slate-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic
        parts.push(
          <em key={`${brIdx}-${match.index}`} className="italic text-slate-800">
            {match[3]}
          </em>
        );
      } else if (match[4]) {
        // Statutory Section (e.g. IPC 356)
        parts.push(
          <span
            key={`${brIdx}-${match.index}`}
            className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded text-xs font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
          >
            {match[4]}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < segment.length) {
      parts.push(segment.substring(lastIndex));
    }

    return (
      <React.Fragment key={brIdx}>
        {parts}
        {brIdx < brSegments.length - 1 && <br className="my-1" />}
      </React.Fragment>
    );
  });
}

/**
 * Transforms raw text from LangGraph agents into structured semantic blocks
 */
function parseLegalDocument(text: string): BlockType[] {
  if (!text) return [];

  const rawLines = text.split("\n");
  const blocks: BlockType[] = [];

  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // 1. Horizontal Rule (--- or *** or ___)
    if (/^[-*_]{3,}$/.test(line)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // 2. Headings (### I. INTRODUCTION, ## CASE FACTS, etc.)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const cleanText = headingMatch[2].replace(/^\*+|\*+$/g, "").trim();
      blocks.push({ type: "heading", level, text: cleanText, raw: line });
      i++;
      continue;
    }

    // 3. Metadata Lines (e.g., **Court:** ..., **Case Title:** ..., *Case: ...*)
    const metadataMatch = line.match(/^(\*\*|\*)?([A-Za-z\s]+):(\*\*|\*)?\s*(.+)$/);
    if (
      metadataMatch &&
      ["Court", "Case Title", "Case No", "Case Number", "Judge", "Date", "Accused", "Victim"].some(
        (key) => metadataMatch[2].trim().toLowerCase().includes(key.toLowerCase())
      )
    ) {
      const items: { key: string; value: string }[] = [];
      let currentLine = line;

      while (i < rawLines.length) {
        const itemMatch = currentLine.match(/^(\*\*|\*)?([A-Za-z\s]+):(\*\*|\*)?\s*(.+)$/);
        if (itemMatch) {
          const key = itemMatch[2].replace(/\*+/g, "").trim();
          const value = itemMatch[4].replace(/\*+/g, "").trim();
          items.push({ key, value });
          i++;
          currentLine = (rawLines[i] || "").trim();
        } else {
          break;
        }
      }

      blocks.push({ type: "metadata", items });
      continue;
    }

    // 4. Markdown Tables (Starts with | and has | separator line)
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("|") && rawLines[i].trim().endsWith("|")) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        // line 1 is separator |---|---|
        const rows = tableLines.slice(2).map(parseRow);

        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // 5. Ordered List (1. ..., 2. ...)
    if (/^\d+[\.\)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < rawLines.length && /^\d+[\.\)]\s+/.test(rawLines[i].trim())) {
        const itemText = rawLines[i].trim().replace(/^\d+[\.\)]\s+/, "");
        items.push(itemText);
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // 6. Unordered List (- ..., * ..., • ...)
    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < rawLines.length && /^[-*•]\s+/.test(rawLines[i].trim())) {
        const itemText = rawLines[i].trim().replace(/^[-*•]\s+/, "");
        items.push(itemText);
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // 7. Blockquote (> ...)
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith(">")) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    // 8. General Paragraph
    blocks.push({ type: "paragraph", text: line });
    i++;
  }

  return blocks;
}

export default function LegalContentRenderer({
  content = "",
  theme = "judge",
}: LegalContentRendererProps) {
  if (!content || !content.trim()) {
    return (
      <div className="py-8 text-center text-slate-400 italic font-medium">
        No arguments or statements recorded.
      </div>
    );
  }

  const blocks = parseLegalDocument(content);

  const themeConfig = {
    prosecution: {
      accent: "border-red-600",
      headingBg: "bg-red-50 text-red-950 border-red-200",
      numBadge: "bg-red-700 text-white",
      tableHeader: "bg-red-800 text-white",
      badgeColor: "bg-red-100 text-red-800 border-red-300",
      bulletColor: "text-red-700",
      cardBorder: "border-red-200",
      headingLine: "bg-red-700",
    },
    defense: {
      accent: "border-blue-600",
      headingBg: "bg-blue-50 text-blue-950 border-blue-200",
      numBadge: "bg-blue-700 text-white",
      tableHeader: "bg-blue-800 text-white",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      bulletColor: "text-blue-700",
      cardBorder: "border-blue-200",
      headingLine: "bg-blue-700",
    },
    judge: {
      accent: "border-amber-500",
      headingBg: "bg-amber-50/90 text-amber-950 border-amber-200",
      numBadge: "bg-amber-800 text-white",
      tableHeader: "bg-amber-900 text-amber-100",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      bulletColor: "text-amber-800",
      cardBorder: "border-amber-200",
      headingLine: "bg-amber-700",
    },
  }[theme];

  return (
    <div className="legal-document space-y-4 text-slate-800 text-[15px] leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "metadata":
            return (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200/80 shadow-xs mb-4"
              >
                {block.items.map((item, mIdx) => (
                  <div key={mIdx} className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                      {item.key}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            );

          case "heading": {
            const isTopLevel = block.level <= 2;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 pt-3 pb-1 border-b ${
                  isTopLevel
                    ? "border-slate-300 text-slate-900 font-bold text-lg"
                    : "border-slate-200 text-slate-800 font-semibold text-base"
                }`}
              >
                <div
                  className={`w-2 h-5 rounded-full ${themeConfig.headingLine}`}
                />
                <h3 className="tracking-tight uppercase">{block.text}</h3>
              </div>
            );
          }

          case "table":
            return (
              <div
                key={idx}
                className="my-4 overflow-hidden rounded-lg border border-slate-200 shadow-xs bg-white"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className={themeConfig.tableHeader}>
                        {block.headers.map((h, hIdx) => (
                          <th
                            key={hIdx}
                            className="px-4 py-3 font-semibold tracking-wider text-xs uppercase whitespace-nowrap border-r border-white/10 last:border-0"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {block.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-4 py-3 align-top text-slate-700 border-r border-slate-100 last:border-0 leading-relaxed font-normal"
                            >
                              {/* Parse bullets inside table cells */}
                              {cell.includes("•") || cell.includes("<br>") ? (
                                <div className="space-y-1.5">
                                  {cell.split(/<br\s*\/?>/gi).map((part, pIdx) => {
                                    const trimmed = part.trim();
                                    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                                      return (
                                        <div key={pIdx} className="flex items-start gap-1.5 pl-1">
                                          <span className="text-amber-700 font-bold shrink-0">•</span>
                                          <span>{renderInlineFormatting(trimmed.replace(/^[-•]\s*/, ""))}</span>
                                        </div>
                                      );
                                    }
                                    return <div key={pIdx}>{renderInlineFormatting(trimmed)}</div>;
                                  })}
                                </div>
                              ) : (
                                renderInlineFormatting(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case "list":
            return (
              <div key={idx} className="my-3 space-y-2.5 pl-1">
                {block.items.map((item, lIdx) => (
                  <div key={lIdx} className="flex items-start gap-3 group">
                    {block.ordered ? (
                      <span
                        className={`inline-flex shrink-0 items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-0.5 shadow-xs ${themeConfig.numBadge}`}
                      >
                        {lIdx + 1}
                      </span>
                    ) : (
                      <span className={`text-lg leading-none mt-1 shrink-0 ${themeConfig.bulletColor}`}>
                        •
                      </span>
                    )}
                    <div className="flex-1 text-slate-700 leading-relaxed pt-0.5">
                      {renderInlineFormatting(item)}
                    </div>
                  </div>
                ))}
              </div>
            );

          case "quote":
            return (
              <blockquote
                key={idx}
                className="my-3 pl-4 py-2.5 rounded-r-lg border-l-4 border-slate-400 bg-slate-50/80 italic text-slate-700"
              >
                {renderInlineFormatting(block.text)}
              </blockquote>
            );

          case "divider":
            return <hr key={idx} className="my-5 border-slate-200/80" />;

          case "paragraph":
          default:
            return (
              <p key={idx} className="text-slate-700 leading-relaxed my-2">
                {renderInlineFormatting(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
