'use client'

import { Check, Copy, Lightbulb } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { slugify } from '@/lib/utils'

type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'ul'; items: string[] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'callout'; title: string; text: string }

const isSpecial = (line: string) => /^(```|#{2,3} |> |[-*] |!! )/.test(line)

export function parseContent(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++])
      i++
      blocks.push({ type: 'code', lang, code: buf.join('\n') })
    } else if (!line.trim()) {
      i++
    } else if (line.startsWith('## ')) {
      const text = line.slice(3).trim()
      blocks.push({ type: 'h2', text, id: slugify(text) })
      i++
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      i++
    } else if (line.startsWith('!! ')) {
      const title = line.slice(3).trim()
      const buf: string[] = []
      i++
      while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) buf.push(lines[i++])
      blocks.push({ type: 'callout', title, text: buf.join(' ') })
    } else if (line.startsWith('> ')) {
      const buf: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) buf.push(lines[i++].slice(2))
      const last = buf[buf.length - 1]
      const cite = buf.length > 1 && /^(—|--)\s/.test(last) ? buf.pop()!.replace(/^(—|--)\s*/, '') : undefined
      blocks.push({ type: 'quote', text: buf.join(' '), cite })
    } else if (/^[-*] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*] /.test(lines[i])) items.push(lines[i++].slice(2))
      blocks.push({ type: 'ul', items })
    } else {
      const buf: string[] = []
      while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) buf.push(lines[i++])
      blocks.push({ type: 'p', text: buf.join(' ') })
    }
  }
  return blocks
}

export function getHeadings(content: string) {
  return parseContent(content).filter((b): b is Extract<Block, { type: 'h2' }> => b.type === 'h2')
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {parts.map((part, i): ReactNode => {
        if (part.startsWith('**') && part.endsWith('**'))
          return (
            <strong key={i} className="font-semibold text-on-surface">
              {part.slice(2, -2)}
            </strong>
          )
        if (part.startsWith('`') && part.endsWith('`'))
          return (
            <code key={i} className="rounded bg-surface-container px-1 py-0.5 font-mono text-[0.85em] text-primary">
              {part.slice(1, -1)}
            </code>
          )
        return part
      })}
    </>
  )
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <figure className="my-space-xl overflow-hidden rounded-xl border border-outline-variant/30 bg-[#0f172a] shadow-lg">
      <figcaption className="flex items-center justify-between border-b border-white/5 bg-[#1e293b] px-space-md py-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f56]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#27c93f]" />
          </span>
          {lang && <span className="font-mono text-code text-slate-400">{lang}</span>}
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 font-label text-label-sm text-slate-400 transition-colors hover:text-white"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-space-md font-mono text-code text-slate-200">
        <code>{code}</code>
      </pre>
    </figure>
  )
}

export function ArticleBody({ content }: { content: string }) {
  const blocks = parseContent(content)
  let firstParagraph = true
  return (
    <div className="font-serif text-body-lg text-on-surface/90">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p': {
            const dropCap = firstParagraph
            firstParagraph = false
            return (
              <p
                key={i}
                className={
                  dropCap
                    ? 'mb-space-lg first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-[64px] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-primary'
                    : 'mb-space-lg'
                }
              >
                <Inline text={block.text} />
              </p>
            )
          }
          case 'h2':
            return (
              <h2 key={i} id={block.id} className="mb-space-md mt-space-2xl font-serif text-headline-md text-on-surface">
                {block.text}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="mb-space-sm mt-space-xl font-serif text-headline-sm text-on-surface">
                {block.text}
              </h3>
            )
          case 'quote':
            return (
              <blockquote key={i} className="my-space-xl border-l-4 border-primary py-space-sm pl-space-lg">
                <p className="font-serif text-headline-sm italic text-on-surface">
                  <Inline text={block.text} />
                </p>
                {block.cite && (
                  <cite className="mt-space-sm block font-label text-label-sm font-semibold uppercase not-italic tracking-wider text-on-surface-variant">
                    {`— ${block.cite}`}
                  </cite>
                )}
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={i} className="mb-space-lg flex flex-col gap-space-sm pl-space-lg">
                {block.items.map((item, j) => (
                  <li key={j} className="list-disc marker:text-primary">
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'code':
            return <CodeBlock key={i} lang={block.lang} code={block.code} />
          case 'callout':
            return (
              <aside key={i} className="my-space-xl flex gap-space-md rounded-xl bg-surface-container-low p-space-lg">
                <Lightbulb className="mt-1 size-5 shrink-0 text-tertiary-container" aria-hidden />
                <div>
                  <p className="mb-space-xs font-label text-label-md font-bold text-on-surface">{block.title}</p>
                  <p className="font-sans text-body-sm text-on-surface-variant">
                    <Inline text={block.text} />
                  </p>
                </div>
              </aside>
            )
        }
      })}
    </div>
  )
}
