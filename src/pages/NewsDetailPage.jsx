import { useEffect, useMemo, useState } from 'react'
import { getNewsById } from '../services/newsService'

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default function NewsDetailPage() {
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const newsId = useMemo(() => {
    const pathname = window.location.pathname
    const match = pathname.match(/\/noticias\/(.+)$/)
    return match ? decodeURIComponent(match[1]) : ''
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadNews() {
      if (!newsId) {
        if (mounted) {
          setError('No se indicó una noticia válida.')
          setLoading(false)
        }
        return
      }

      try {
        const item = await getNewsById(newsId)

        if (mounted) {
          setNews(item)
        }
      } catch (loadError) {
        console.error('NewsDetailPage Error:', loadError)

        if (mounted) {
          setError(loadError?.message || 'Error desconocido al cargar la noticia.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadNews()

    return () => {
      mounted = false
    }
  }, [newsId])

  if (loading) {
    return (
      <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#475467', fontSize: '1rem' }}>
          Cargando noticia...
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '24px', border: '1px solid #fecdca', background: '#fff5f5', borderRadius: '16px', color: '#7a1f1b' }}>
          {error}
        </div>
      </main>
    )
  }

  if (!news) {
    return (
      <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '32px 20px', textAlign: 'center', border: '1px solid #e4e7ec', borderRadius: '16px', background: '#f9fafb', color: '#475467' }}>
          No se encontró la noticia solicitada.
        </div>
      </main>
    )
  }

  return (
    <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => {
          window.history.back()
        }}
        style={{
          marginBottom: '24px',
          border: '1px solid #d0d5dd',
          background: '#fff',
          color: '#101828',
          borderRadius: '999px',
          padding: '10px 16px',
          cursor: 'pointer',
          fontSize: '0.95rem',
        }}
      >
        Volver a noticias
      </button>

      <article style={{ background: '#fff', border: '1px solid #e4e7ec', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(16, 24, 40, 0.06)' }}>
        <img
          src={news.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'}
          alt={news.title}
          style={{ display: 'block', width: '100%', height: '420px', objectFit: 'cover', background: '#f2f4f7' }}
        />

        <div style={{ padding: '28px 24px 32px' }}>
          <time style={{ display: 'inline-block', marginBottom: '16px', color: '#667085', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {formatDate(news.created_at)}
          </time>

          <h1 style={{ margin: '0 0 18px', color: '#101828', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
            {news.title}
          </h1>

          <div style={{ color: '#475467', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
            {news.content}
          </div>
        </div>
      </article>
    </main>
  )
}
