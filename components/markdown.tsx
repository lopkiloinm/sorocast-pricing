"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-5xl font-bold text-white mb-8 text-center" {...props} />,
        h2: ({ node, ...props }) => (
          <h2 className="text-3xl font-bold text-white mb-6 mt-16 flex items-center gap-3" {...props} />
        ),
        h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-white mb-4 mt-6" {...props} />,
        p: ({ node, ...props }) => <p className="text-zinc-300 leading-relaxed mb-4" {...props} />,
        ul: ({ node, ...props }) => <ul className="space-y-3 mb-6" {...props} />,
        li: ({ node, ...props }) => <li className="text-zinc-300" {...props} />,
        table: ({ node, ...props }) => (
          <div className="bg-zinc-900 rounded-lg overflow-hidden mb-6">
            <table className="w-full" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-zinc-800" {...props} />,
        th: ({ node, ...props }) => <th className="px-6 py-3 text-left text-white" {...props} />,
        tbody: ({ node, ...props }) => <tbody className="divide-y divide-zinc-800" {...props} />,
        tr: ({ node, ...props }) => <tr {...props} />,
        td: ({ node, ...props }) => <td className="px-6 py-4 text-zinc-300" {...props} />,
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "")

          // Special handling for math blocks
          if (match && match[1] === "math") {
            return (
              <div className="bg-zinc-900 rounded-lg p-6 my-4">
                <div className="font-mono text-yellow-500 text-center my-4 overflow-x-auto">
                  {String(children).replace(/\n$/, "")}
                </div>
              </div>
            )
          }

          // Inline code
          if (!match) {
            return (
              <code className="bg-zinc-800 text-yellow-500 px-1 py-0.5 rounded font-mono" {...props}>
                {children}
              </code>
            )
          }

          // Regular code blocks
          return (
            <div className="bg-zinc-900 rounded-lg p-4 my-4 overflow-x-auto">
              <code className={`language-${match[1]} text-zinc-300 font-mono`} {...props}>
                {children}
              </code>
            </div>
          )
        },
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-zinc-700 pl-4 italic text-zinc-400" {...props} />
        ),
        a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
        strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
        em: ({ node, ...props }) => <em className="text-zinc-300 italic" {...props} />,
        hr: ({ node, ...props }) => <hr className="border-zinc-800 my-8" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
