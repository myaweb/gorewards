import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

interface WPPost {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>
    "wp:term"?: Array<Array<{ name: string }>>
  }
}

async function getBlogPosts(): Promise<WPPost[]> {
  try {
    const res = await fetch(
      "https://blog.creditrich.net/wp-json/wp/v2/posts?per_page=3&_fields=id,title,excerpt,slug,date,_embedded&_embed=wp:featuredmedia,wp:term",
      { next: { revalidate: 3600 } } // cache 1 hour
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
  })
}

export async function BlogPostsSection() {
  const posts = await getBlogPosts()
  if (!posts.length) return null

  return (
    <section className="border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">From the Blog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Articles</h2>
          </div>
          <a
            href="https://blog.creditrich.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {posts.map((post) => {
            const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
            const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name
            const excerpt = stripHtml(post.excerpt.rendered).slice(0, 120) + "…"
            const title = stripHtml(post.title.rendered)
            const url = `https://blog.creditrich.net/${post.slug}`

            return (
              <a
                key={post.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)] transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] overflow-hidden bg-white/[0.03]">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white/10" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 gap-2">
                  {category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                      {category}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                    {excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
                    <span className="text-[10px] text-gray-600">{formatDate(post.date)}</span>
                    <span className="text-[10px] font-semibold text-cyan-500 flex items-center gap-1">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden mt-4 text-center">
          <a
            href="https://blog.creditrich.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
          >
            View all articles <ArrowRight className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  )
}
