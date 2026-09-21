import { useEffect, useMemo, useState } from 'react'
import { renderTextWithLinks } from '../lib/formatTextWithLinks'
import { getNewsById } from '../services/newsService'

function BackToNewsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = '/noticias'
      }}
      style={{
        justifySelf: 'start',
        marginBottom: '16px',
        border: '1px solid #d0d5dd',
        background: '#fff',
        color: '#101828',
        borderRadius: '999px',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '0.95rem',
      }}
    >
      ← Volver a Noticias
    </button>
  )
}

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
    <main className="news-page" style={{ padding: '48px 20px 72px' }}>
      <BackToNewsButton />

      <article style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <div style={{ width: '100%', height: 'auto', overflow: 'visible', background: '#f5f5f5' }}>
          <img
            src={
              news.image_url ||
              'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
            }
            alt={news.title}
            style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'contain', objectPosition: 'center', background: '#f5f5f5' }}
          />
        </div>

        <div style={{ display: 'grid', gap: '18px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <time style={{ color: '#667085', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {formatDate(news.created_at)}
          </time>

          <h1 className="detail-title" style={{ margin: 0, color: '#101828', fontSize: 'clamp(2.3rem, 5vw, 4.2rem)', lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            {news.title}
          </h1>

          <div className="detail-copy" style={{ color: '#475467', fontSize: '1.05rem', maxWidth: '680px', whiteSpace: 'pre-wrap' }}>
            {renderTextWithLinks(news.content || '')}
          </div>
        </div>
      </article>
    </main>
  )
}
