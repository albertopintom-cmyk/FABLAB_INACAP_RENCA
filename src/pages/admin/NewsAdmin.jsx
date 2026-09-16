import { useEffect, useMemo, useState } from 'react'
import { createNews, deleteNews, getAllNews, updateNews } from '../../services/newsService'
import { supabase } from '../../lib/supabase'

function slugifyNewsTitle(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function NewsAdmin({ onSectionChange, onLogout }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    published: true,
  })

  const orderedNews = useMemo(
    () =>
      [...news].sort((first, second) => {
        const firstDate = first.created_at ? Date.parse(first.created_at) : 0
        const secondDate = second.created_at ? Date.parse(second.created_at) : 0
        return secondDate - firstDate
      }),
    [news]
  )

  async function loadNews() {
    try {
      setLoading(true)
      const data = await getAllNews()
      setNews(data)
      setError('')
    } catch (loadError) {
      console.error('NewsAdmin load error:', loadError)
      setError(loadError?.message || 'No se pudieron cargar las noticias.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  function resetForm() {
    setEditingId(null)
    setForm({ title: '', summary: '', content: '', published: true })
    setImageFile(null)
    setMessage('')
  }

  function updateField(event) {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function startEditing(item) {
    setEditingId(item.id)
    setForm({
      title: item.title ?? '',
      summary: item.summary ?? item.excerpt ?? '',
      content: item.content ?? '',
      published: item.published !== false,
    })
    setImageFile(null)
    setMessage('')
  }

  async function uploadImage() {
    if (!imageFile) {
      return editingId ? news.find((item) => item.id === editingId)?.image_url ?? null : null
    }

    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)
    const filePath = `news/${slugifyNewsTitle(form.title) || 'noticia'}-${timestamp}.${extension}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from('news').upload(filePath, imageFile, { upsert: false })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from('news').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function submitForm(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      setMessage('Título y contenido son obligatorios.')
      return
    }

    try {
      const imageUrl = await uploadImage()
      const payload = {
        title: form.title.trim(),
        slug: slugifyNewsTitle(form.title) || `noticia-${Date.now()}`,
        excerpt: form.summary.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
        ...(imageUrl ? { image_url: imageUrl, image: imageUrl } : {}),
      }

      if (editingId) {
        await updateNews(editingId, payload)
        setMessage('Noticia actualizada correctamente.')
      } else {
        await createNews(payload)
        setMessage('Noticia creada correctamente.')
      }

      await loadNews()
      resetForm()
    } catch (submitError) {
      console.error('Could not save news:', submitError)
      setMessage(submitError?.message || 'No se pudo guardar la noticia.')
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Deseas eliminar la noticia "${item.title}"?`)) return

    try {
      await deleteNews(item.id)
      setMessage('Noticia eliminada correctamente.')
      await loadNews()
      if (editingId === item.id) resetForm()
    } catch (deleteError) {
      console.error('Could not delete news:', deleteError)
      setMessage(deleteError?.message || 'No se pudo eliminar la noticia.')
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <a className="brand" href="/" aria-label="FABLAB INACAP Renca, inicio">
          <span className="brand-mark">F</span>
          <span><strong>FABLAB</strong><small>INACAP RENCA</small></span>
        </a>

        <nav className="admin-nav" aria-label="Secciones del panel admin">
          <button type="button" className="admin-nav-button" onClick={() => onSectionChange?.('projects')}>Proyectos</button>
          <button type="button" className="admin-nav-button is-active" onClick={() => onSectionChange?.('news')}>Noticias</button>
        </nav>

        <button className="button button-dark" type="button" onClick={onLogout}>Cerrar sesión</button>
      </header>

      <section className="admin-dashboard">
        <div className="admin-header">
          <div>
            <p className="section-kicker">Gestión editorial</p>
            <h1>Noticias</h1>
          </div>
        </div>

        <p className="admin-note">Publica, edita y elimina noticias para mantener actualizada la sección de actualidad.</p>

        <div className="admin-panel">
          <form onSubmit={submitForm}>
            <label>
              Título
              <input name="title" value={form.title} onChange={updateField} placeholder="Ej. Nueva convocatoria del FabLab" />
            </label>

            <label>
              Resumen
              <input name="summary" value={form.summary} onChange={updateField} placeholder="Resumen breve de la noticia" />
            </label>

            <label>
              Contenido
              <textarea name="content" value={form.content} onChange={updateField} placeholder="Escribe el contenido completo de la noticia" rows={6} />
            </label>

            <label>
              Imagen
              <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
            </label>

            <label className="admin-check">
              <input name="published" type="checkbox" checked={form.published} onChange={updateField} />
              Publicado
            </label>

            <button className="button button-red" type="submit">
              {editingId ? 'Guardar cambios' : 'Agregar noticia'}
            </button>

            {editingId && (
              <button className="button button-dark" type="button" onClick={resetForm}>
                Cancelar edición
              </button>
            )}
          </form>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <div className="admin-list">
            <strong>{news.length} noticias registradas</strong>

            {loading ? (
              <p className="admin-note">Cargando noticias...</p>
            ) : orderedNews.length === 0 ? (
              <p className="admin-note">No hay noticias disponibles aún.</p>
            ) : (
              orderedNews.map((item) => (
                <div key={item.id}>
                  <span>{item.title}</span>
                  <small>
                    {item.published ? 'Publicado' : 'Borrador'} · {formatDate(item.created_at)}
                    <button type="button" className="admin-edit" onClick={() => startEditing(item)}>Editar</button>
                    <button type="button" className="admin-edit" onClick={() => handleDelete(item)}>Eliminar</button>
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
