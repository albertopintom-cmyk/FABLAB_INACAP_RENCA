import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProjectDetailPage() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const projectId = useMemo(() => {
    const pathname = window.location.pathname
    const match = pathname.match(/\/proyectos\/(.+)$/)
    return match ? decodeURIComponent(match[1]) : ''
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadProject() {
      if (!projectId) {
        if (mounted) {
          setError('No se indicó un proyecto válido.')
          setLoading(false)
        }
        return
      }

      if (!supabase) {
        if (mounted) {
          setError('Supabase no está configurado.')
          setLoading(false)
        }
        return
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('published', true)
          .maybeSingle()

        if (supabaseError) {
          throw supabaseError
        }

        if (mounted) {
          setProject(data)
        }
      } catch (loadError) {
        console.error('ProjectDetailPage Error:', loadError)

        if (mounted) {
          setError(loadError?.message || 'Error desconocido al cargar el proyecto.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProject()

    return () => {
      mounted = false
    }
  }, [projectId])

  if (loading) {
    return (
      <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#475467', fontSize: '1rem' }}>
          Cargando proyecto...
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

  if (!project) {
    return (
      <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ padding: '32px 20px', textAlign: 'center', border: '1px solid #e4e7ec', borderRadius: '16px', background: '#f9fafb', color: '#475467' }}>
          No se encontró el proyecto solicitado.
        </div>
      </main>
    )
  }

  const youtubeMatch = project.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  const youtubeId = youtubeMatch?.[1]

  return (
    <main className="news-page" style={{ padding: '48px 20px 72px', maxWidth: '1200px', margin: '0 auto' }}>
      <article style={{ maxWidth: '860px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <button
          type="button"
          onClick={() => {
            window.history.back()
          }}
          style={{
            justifySelf: 'start',
            border: '1px solid #d0d5dd',
            background: '#fff',
            color: '#101828',
            borderRadius: '999px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Volver a proyectos
        </button>

        <img
          src={
            project.image_url ||
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
          }
          alt={project.title}
          style={{ display: 'block', width: '100%', height: '420px', objectFit: 'cover', background: '#f2f4f7' }}
        />

        <div style={{ display: 'grid', gap: '18px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: '#d73038', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span>{project.category}</span>
            <span>•</span>
            <span>{project.year}</span>
          </div>

          <h1 style={{ margin: 0, color: '#101828', fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            {project.title}
          </h1>

          <div className="detail-copy" style={{ color: '#475467', fontSize: '1.05rem', fontWeight: 500 }}>
            <p style={{ margin: 0, lineHeight: 1.7 }}>{project.summary}</p>
          </div>

          <div className="detail-copy" style={{ color: '#475467', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
            {project.description}
          </div>

          {youtubeId && (
            <div style={{ marginTop: '12px', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
              <iframe
                width="100%"
                height="420"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block', border: 0 }}
              />
            </div>
          )}

          {project.open_sam_url && (
            <a
              href={project.open_sam_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'fit-content',
                background: '#101828',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '999px',
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Ver proyecto completo
            </a>
          )}
        </div>
      </article>
    </main>
  )
}
