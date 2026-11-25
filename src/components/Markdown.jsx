import React from "react";

const inline = (value) => value.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, index) => {
  if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={index}>{part.slice(2, -2)}</strong>;
  if (part.startsWith("_") && part.endsWith("_") && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
  return part;
});

const formats = [
  [/^#{1,3} (.+)$/, "heading"], [/^> (.+)$/, "blockquote"],
  [/^[-*] (.+)$/, "ul"], [/^\d+\. (.+)$/, "ol"],
];

export default function Markdown({ text = "" }) {
  const blocks = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const format = formats.find(([pattern]) => pattern.test(line));
    const content = format ? format[0].exec(line)[1] : line;
    const kind = format?.[1] || "p";
    const previous = blocks[blocks.length - 1];
    if (["ol", "ul"].includes(kind) && previous?.kind === kind) previous.items.push(content);
    else blocks.push({ kind, items: [content], depth: line.indexOf(" ") });
  }

  return blocks.map(({ kind, items, depth }, index) => {
    if (kind === "ul" || kind === "ol") {
      const List = kind;
      return <List key={index}>{items.map((item, key) => <li key={key}>{inline(item)}</li>)}</List>;
    }
    const Tag = kind === "heading" ? "h" + Math.min(depth + 1, 4) : kind;
    return <Tag key={index}>{inline(items[0])}</Tag>;
  });
}
