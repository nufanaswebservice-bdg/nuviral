'use client';

import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-muted text-[13px] font-mono">{match[3]}</code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
}

export function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const Tag = listType === 'ul' ? 'ul' : 'ol';
      elements.push(
        <Tag
          key={key++}
          className={`my-2 space-y-1 ${listType === 'ul' ? 'list-disc' : 'list-decimal'} pl-5`}
        >
          {listItems}
        </Tag>,
      );
      listItems = [];
      listType = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-sm font-semibold mt-4 mb-1.5 text-foreground">
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-base font-bold mt-4 mb-2 text-foreground">
          {renderInline(trimmed.slice(3))}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-lg font-bold mt-4 mb-2 text-foreground">
          {renderInline(trimmed.slice(2))}
        </h1>,
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={key++} className="my-2 pl-3 border-l-2 border-primary/40 text-muted-foreground italic text-[13px]">
          {renderInline(trimmed.slice(2))}
        </blockquote>,
      );
      continue;
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(<li key={listItems.length} className="text-sm leading-relaxed">{renderInline(ulMatch[1])}</li>);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(<li key={listItems.length} className="text-sm leading-relaxed">{renderInline(olMatch[1])}</li>);
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={key++} className="my-3 border-border" />);
      continue;
    }

    flushList();
    elements.push(
      <p key={key++} className="text-sm leading-relaxed my-1.5">
        {renderInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return <div className="chat-markdown space-y-0.5">{elements}</div>;
}
