"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react"

interface WPPost {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>
    "wp:term"?: Array<Array<{ name: string }>>
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
}

export function BlogPostsClient() {
  const [posts, setPosts] = useState<WPPost[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/blog-posts")
      .then(r => r.ok ? r.json() : [])
      .then(setPosts)
      .catch(() => {})
  }, [])

  if (!posts.length) return null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://GoRewards.net'

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "GoRewards Blog Posts",
    "url": "https://blog.creditrich.net",
    "itemListElement": posts.map((post, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "headline": stripHtml(post.title.rendered),
        "url": `https://blog.creditrich.net/${post.slug}`,
        "datePublished": post.date,
        "image": post._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
        "publisher": {
          "@type": "Organization",
          "name": "GoRewards",
          "url": siteUrl,
        },
      },
    })),
  }

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.offsetWidth / 3
    scrollRef.current.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" })
  }

  return (
    <section className="border-t border-white/5 pt-12 pb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-cyan-500" />
            <h2 className="text-xl font-bold text-white">From the Blog</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => scroll("left")} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all" aria-label="Previous">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll("right")} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all" aria-label="Next">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <a href="https://blog.creditrich.net" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{scrollSnapType:'x mandatory',WebkitOverflowScrolling:'touch'}}>
          {posts.map((post) => {
            const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
            const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name
            const title = stripHtml(post.title.rendered)
            const excerpt = stripHtml(post.excerpt.rendered).slice(0, 90) + "…"
            const url = `https://blog.creditrich.net/${post.slug}`

            return (
              <a
                key={post.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-shrink-0 w-[85vw] sm:w-[calc(33.333%-11px)] flex flex-col bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.08)] transition-all" style={{scrollSnapAlign:'start'}}
              >
                <div className="h-36 overflow-hidden bg-white/[0.03] flex-shrink-0">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white/10" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  {category && <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">{category}</span>}
                  <h3 className="text-xs font-semibold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">{title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 flex-1">{excerpt}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                    <span className="text-[10px] text-gray-600">{formatDate(post.date)}</span>
                    <span className="text-[10px] font-semibold text-cyan-500 flex items-center gap-0.5">Read <ArrowRight className="h-2.5 w-2.5" /></span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

      </div>
    </section>
  )
}

