import { useEffect, useState } from 'react'
import { renderTextWithLinks } from '../lib/formatTextWithLinks'
import { getPublishedNews } from '../services/newsService'

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

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadNews() {
      try {
        const data = await getPublishedNews()

        if (mounted) {
          setNews(data ?? [])
        }
      } catch (loadError) {
        console.error('NewsPage Error:', loadError)

        if (mounted) {
          setError(loadError.message || 'Error desconocido al cargar noticias.')
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
  }, [])

  return (
    <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <p style={{ margin: '0 0 8px', color: '#d73038', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Actualidad
        </p>
        <h1 style={{ margin: 0, color: '#101828', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
          Noticias FABLAB
        </h1>
      </header>

      <button
        type="button"
        onClick={() => {
          window.location.href = '/'
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
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
        ← Volver al Inicio
      </button>

      {loading && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#475467', fontSize: '1rem' }}>
          Cargando noticias...
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: '24px', border: '1px solid #fecdca', background: '#fff5f5', borderRadius: '16px', color: '#7a1f1b' }}>
          {error}
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div style={{ padding: '32px 20px', textAlign: 'center', border: '1px solid #e4e7ec', borderRadius: '16px', background: '#f9fafb', color: '#475467' }}>
          No hay noticias publicadas por el momento.
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {news.map((item) => (
            <article
              key={item.id}
              onClick={() => {
                window.location.href = `/noticias/${item.id}`
              }}
              style={{
                background: '#fff',
                border: '1px solid #e4e7ec',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 10px 28px rgba(16, 24, 40, 0.06)',
                cursor: 'pointer',
              }}
            >
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'}
                alt={item.title}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  background: '#f2f4f7',
                }}
              />

              <div style={{ padding: '20px' }}>
                <time
                  style={{
                    display: 'inline-block',
                    marginBottom: '12px',
                    color: '#667085',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {formatDate(item.created_at)}
                </time>

                <h2 style={{ margin: '0 0 12px', color: '#101828', fontSize: '1.35rem', lineHeight: 1.3 }}>
                  {item.title}
                </h2>

                <p style={{ margin: 0, color: '#475467', lineHeight: 1.7, fontSize: '0.98rem' }}>
                  {renderTextWithLinks(item.summary || '')}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
