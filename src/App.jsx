import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, AtSign, ChevronDown, Mail, Menu, Plus, Search, X } from 'lucide-react'
import { supabase } from './lib/supabase'
import NewsPage from './pages/NewsPage'
import heroImage from './assets/hero.png'
import './App.css'

const demoProjects = [
  { id: 'demo-1', title: 'Estación meteorológica escolar', category: 'Electrónica', year: 2025, excerpt: 'Un dispositivo abierto para observar el clima local y aprender haciendo.', image_url: 'https://images.unsplash.com/photo-1563770660941-10a3e7c7f0e4?auto=format&fit=crop&w=1200&q=85', featured: true },
  { id: 'demo-2', title: 'Mobiliario circular', category: 'Fabricación digital', year: 2024, excerpt: 'Diseño y fabricación de módulos para activar espacios de encuentro.', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85', featured: false },
  { id: 'demo-3', title: 'Manos que conectan', category: 'Innovación social', year: 2024, excerpt: 'Prototipos inclusivos desarrollados junto a la comunidad de Renca.', image_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85', featured: false },
  { id: 'demo-4', title: 'Laboratorio en movimiento', category: 'Diseño', year: 2023, excerpt: 'Una experiencia móvil para acercar la fabricación digital a los barrios.', image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85', featured: false },
]
function LoginPage({ onAuthenticated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!supabase) {
      setError('Supabase no está configurado.')
      setLoading(false)
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    console.log("Login result:", data)
    console.log("Login error:", signInError)
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    onAuthenticated(data.session)
  }

  return <main className="auth-page"><section className="auth-card"><a className="brand" href="#inicio" aria-label="FABLAB INACAP Renca, inicio"><span className="brand-mark">F</span><span><strong>FABLAB</strong><small>INACAP RENCA</small></span></a><p className="section-kicker">Acceso administrativo</p><h1>Ingresar al panel</h1><p className="auth-intro">Administra los proyectos publicados del FabLab INACAP Renca.</p><form onSubmit={signIn}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button className="button button-red" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</button></form>{error && <p className="auth-error" role="alert">{error}</p>}</section></main>
}

function AdminRoute({ projects, onAdd, onReload }) {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let mounted = true

    async function validateSession() {
      if (!supabase) {
        if (mounted) setChecking(false)
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const currentSession = sessionData.session
      if (!currentSession) {
        if (mounted) setChecking(false)
        return
      }

      console.log("Checking admin_users")
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', currentSession.user.id)
        .maybeSingle()
      console.log("Admin user found:", adminUser)
      if (error) console.error("admin_users error:", error)

      if (mounted) {
        setSession(currentSession)
        setAuthorized(Boolean(adminUser) && !error)
        setChecking(false)
      }
    }

    validateSession()
    return () => { mounted = false }
  }, [])

  async function handleAuthenticated(nextSession) {
    console.log("Checking admin_users")
    const { data: adminUser, error } = await supabase.from('admin_users').select('id').eq('id', nextSession.user.id).maybeSingle()
    console.log("Admin user found:", adminUser)
    if (error) console.error("admin_users error:", error)
    if (error || !adminUser) {
      await supabase.auth.signOut()
      setAuthorized(false)
      setSession(null)
      return
    }
    setSession(nextSession)
    setAuthorized(true)
  }

  async function logout() {
    await supabase?.auth.signOut()
    setSession(null)
    setAuthorized(false)
  }

  if (checking) return <main className="auth-page"><p className="auth-status">Verificando sesión...</p></main>
  if (!session || !authorized) return <LoginPage onAuthenticated={handleAuthenticated} />
  return <AdminPanel projects={projects} categories={getCategories(projects)} onClose={logout} onAdd={onAdd} onReload={onReload} onLogout={logout} dashboard />
}

function getCategories(projects) {
  return ['Todos', ...new Set(projects.map((project) => project.category).filter(Boolean))]
}

function slugifyProjectTitle(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ProjectCard({ project, index, featured, onSelect }) {
  return <article className={featured ? 'project-card project-card-featured' : 'project-card'} onClick={() => onSelect(project)}><div className="project-image"><img src={project.image_url || heroImage} alt="" /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div><h3>{project.title}</h3><p>{project.excerpt}</p><button type="button" className="read-more" aria-label={`Ver ${project.title}`}><ArrowUpRight size={18} /></button></article>
}

function CommunitySection() {
  return <section className="community-section" id="comunidad"><div className="community-copy"><p className="section-kicker">Comunidad FabLab</p><h2>Las mejores ideas<br /><span>se hacen juntas.</span></h2><p>Estudiantes, docentes, emprendedores y organizaciones encuentran aquí un espacio para colaborar, aprender y construir soluciones para Renca.</p><a className="button button-light" href="mailto:fablab.renca@inacap.cl?subject=Quiero participar">Quiero participar <ArrowUpRight size={17} /></a></div><div className="community-people"><div className="community-photo photo-one"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85" alt="Equipo colaborando en una mesa de trabajo" /></div><div className="community-photo photo-two"><img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85" alt="Personas compartiendo una idea" /></div><span className="community-label">Comunidad<br />en acción</span></div></section>
}

function SiteFooter() {
  return <footer id="contacto"><div className="footer-brand"><span className="brand-mark">F</span><div><strong>FABLAB INACAP</strong><p>Renca · Santiago de Chile</p></div></div><div className="footer-contact"><p>¿Tienes un proyecto para compartir?</p><a href="mailto:fablab.renca@inacap.cl">fablab.renca@inacap.cl <Mail size={16} /></a></div><div className="footer-social"><a href="https://www.instagram.com/inacap/" target="_blank" rel="noreferrer" aria-label="Instagram"><AtSign size={19} /></a><span>© 2025 INACAP</span></div></footer>
}

function App() {
  const [projects, setProjects] = useState(demoProjects)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedProject, setSelectedProject] = useState(null)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const categories = useMemo(() => getCategories(projects), [projects])

  const loadProjects = useCallback(async () => {
      if (!supabase) {
        console.error('Supabase client is not configured. Using demo projects.')
        setProjects(demoProjects)
        return demoProjects
      }

      try {
        console.log("Loading projects from Supabase")
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })

        console.log("Projects returned:", data)
        console.log("Supabase error object:", error)
        console.log("Projects count:", data?.length || 0)

        if (error) {
          console.error("Supabase error:", error)
          console.error("Supabase error message:", error.message)
          console.error("Supabase error code:", error.code)
          console.error("Supabase error details:", error.details)
          console.error('Could not load projects from Supabase:', error)
          setProjects(demoProjects)
          return demoProjects
        }

        const nextProjects = data?.length ? data : demoProjects
        setProjects(nextProjects)
        return nextProjects
      } catch (error) {
        console.error('Unexpected error loading projects from Supabase:', error)
        setProjects(demoProjects)
        return demoProjects
      }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesCategory = activeCategory === 'Todos' || project.category === activeCategory
    const normalizedQuery = query.toLowerCase().trim()
    const matchesQuery = !normalizedQuery || `${project.title} ${project.excerpt}`.toLowerCase().includes(normalizedQuery)
    return matchesCategory && matchesQuery
  }), [activeCategory, projects, query])

  if (window.location.pathname === '/admin') {
    return <AdminRoute projects={projects} onAdd={(project) => setProjects((current) => [project, ...current])} onReload={loadProjects} />
  }

  if (window.location.pathname === '/noticias') {
    return <NewsPage />
  }

  return (
    <div className="site-shell">
      <header className="site-header"><a className="brand" href="#inicio" aria-label="FABLAB INACAP Renca, inicio"><span className="brand-mark">F</span><span><strong>FABLAB</strong><small>INACAP RENCA</small></span></a><button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú"><Menu size={20} /></button><nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}><a href="#proyectos" onClick={() => setMenuOpen(false)}>Proyectos</a><a href="#comunidad" onClick={() => setMenuOpen(false)}>Comunidad</a><a href="#fablab" onClick={() => setMenuOpen(false)}>El FabLab</a><a href="/noticias" onClick={() => setMenuOpen(false)}>Noticias</a><a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a><button className="admin-link" type="button" onClick={() => setIsAdminOpen(true)}>Panel admin <ArrowUpRight size={15} /></button></nav></header>
      <main>
        <section className="hero" id="inicio"><div className="hero-copy"><p className="eyebrow"><span /> Fabricar para transformar</p><h1>Ideas que toman<br /><em>forma.</em></h1><p className="hero-text">Conocemos, prototipamos y compartimos proyectos que nacen en el FabLab INACAP Renca.</p><a className="button button-dark" href="#proyectos">Explorar proyectos <ArrowUpRight size={17} /></a></div><div className="hero-visual" aria-label="Estudiantes trabajando en el FabLab"><img src={heroImage} alt="Estudiantes trabajando en un proyecto de fabricación digital" /><span className="hero-stamp">FAB<br />LAB</span><div className="hero-caption"><span>01</span><span>Aprender haciendo</span></div></div></section>
        <section className="intro-band" id="fablab"><p className="section-kicker">Nuestro espacio</p><div className="intro-content"><h2>Un lugar para<br /><span>hacer posible.</span></h2><p>Somos un laboratorio de fabricación digital abierto a la comunidad educativa. Aquí las ideas se convierten en prototipos, y los prototipos en nuevas oportunidades.</p></div><div className="stats"><div><strong>01</strong><span>Sede Renca</span></div><div><strong>∞</strong><span>Ideas en movimiento</span></div><div><strong>24/7</strong><span>Curiosidad activa</span></div></div></section>
        <section className="projects-section" id="proyectos"><div className="section-heading"><div><p className="section-kicker">Proyectos destacados</p><h2>Hecho aquí.</h2></div><p>Una selección de procesos, aprendizajes y resultados del ecosistema FabLab.</p></div><div className="project-toolbar"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? 'is-active' : ''} key={category} type="button" onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyectos" /></label></div><div className="project-grid">{filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} featured={index === 0 && activeCategory === 'Todos'} onSelect={setSelectedProject} />)}</div>{filteredProjects.length === 0 && <div className="empty-state">No encontramos proyectos con esos criterios.</div>}</section>
        <CommunitySection />
      </main>
      <SiteFooter />
      {selectedProject && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProject(null)}><article className="project-modal" role="dialog" aria-modal="true" aria-label={selectedProject.title} onClick={(event) => event.stopPropagation()}><button className="close-button" type="button" onClick={() => setSelectedProject(null)} aria-label="Cerrar"><X size={20} /></button><img src={selectedProject.image_url || heroImage} alt="" /><div className="modal-copy"><div className="project-meta"><span>{selectedProject.category}</span><span>{selectedProject.year}</span></div><h2>{selectedProject.title}</h2><p>{selectedProject.excerpt}</p><a href="mailto:fablab.renca@inacap.cl?subject=Consulta sobre proyecto">Conocer más <ArrowUpRight size={17} /></a></div></article></div>}
      {isAdminOpen && <AdminPanel projects={projects} categories={categories} onClose={() => setIsAdminOpen(false)} onAdd={(project) => setProjects((current) => [project, ...current])} />}
    </div>
  )
}

function AdminPanel({ projects, categories, onClose, onAdd, onReload, onLogout, dashboard = false }) {
  const emptyForm = { title: '', summary: '', description: '', category: categories[1] ?? '', year: new Date().getFullYear(), featured: false, published: true }
  const [form, setForm] = useState(emptyForm)
  const [editingProject, setEditingProject] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [message, setMessage] = useState('')
  const orderedProjects = [...projects].sort((firstProject, secondProject) => {
    const firstDate = firstProject.created_at ? Date.parse(firstProject.created_at) : 0
    const secondDate = secondProject.created_at ? Date.parse(secondProject.created_at) : 0
    return secondDate - firstDate
  })

  function updateField(event) {
    const { name, type, value, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function startEditing(project) {
    setEditingProject(project)
    setImageFile(null)
    setForm({
      title: project.title ?? '',
      summary: project.summary ?? project.excerpt ?? '',
      description: project.description ?? '',
      category: project.category ?? categories[1] ?? '',
      year: project.year ?? new Date().getFullYear(),
      featured: Boolean(project.featured),
      published: project.published !== false,
    })
    setMessage('')
  }

  function resetForm() {
    setEditingProject(null)
    setForm(emptyForm)
    setImageFile(null)
  }

  async function uploadProjectImage() {
    if (!imageFile) return editingProject?.image_url ?? null

    const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const now = new Date()
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('') + `-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    const filePath = `projects/${slugifyProjectTitle(form.title)}-${timestamp}.${fileExtension}`
    console.log("Uploading image:", imageFile.name)
    const { data: uploadData, error: uploadError } = await supabase.storage.from('projects').upload(filePath, imageFile, { upsert: false })
    console.log("Upload data:", uploadData)
    if (uploadError) {
      console.error("Upload error:", uploadError)
      console.error("Upload error message:", uploadError?.message)
      console.error("Upload error code:", uploadError?.statusCode || uploadError?.code)
      console.error("Upload error details:", uploadError)
      throw uploadError
    }

    const { data } = supabase.storage.from('projects').getPublicUrl(filePath)
    console.log("Public image URL:", data.publicUrl)
    return data.publicUrl
  }

  async function submitProject(event) {
    event.preventDefault()
    if (!form.title.trim()) return

    if (!dashboard) {
      onAdd({ id: `local-${Date.now()}`, title: form.title.trim(), category: form.category, year: form.year, excerpt: form.summary, image_url: null, featured: form.featured })
      resetForm()
      setMessage('Proyecto agregado en esta sesión. Conecta Supabase para persistirlo.')
      return
    }

    if (!supabase) {
      setMessage('Supabase no está configurado.')
      return
    }

    let imageUrl
    try {
      imageUrl = await uploadProjectImage()
    } catch (error) {
      console.error('Could not upload project image:', error)
      setMessage(`No se pudo subir la imagen: ${error.message}`)
      return
    }

    const payload = { title: form.title.trim(), summary: form.summary, description: form.description, category: form.category, year: Number(form.year), featured: form.featured, published: form.published, ...(imageUrl ? { image_url: imageUrl } : {}) }
    let data
    let error

    if (editingProject) {
      console.log("Updating project:", editingProject?.id)
      console.log("Update payload:", payload)
      const updateResult = await supabase.from('projects').update(payload).eq('id', editingProject.id)
      data = updateResult.data
      error = updateResult.error
      console.log("Update result:", data)
      if (error) console.error("Update error:", error)
    } else {
      const insertResult = await supabase.from('projects').insert(payload)
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      console.error(`Could not ${editingProject ? 'update' : 'create'} project in Supabase:`, error)
      setMessage(`No se pudo ${editingProject ? 'actualizar' : 'crear'} el proyecto: ${error.message}`)
      return
    }

    await onReload()
    resetForm()
    setMessage(editingProject ? 'Proyecto actualizado correctamente.' : 'Proyecto agregado correctamente.')
  }

  async function deleteProject(project) {
    if (!window.confirm('¿Desea eliminar este proyecto?')) return

    if (!supabase) {
      setMessage('Supabase no está configurado.')
      return
    }

    const projectId = project.id
    console.log("Deleting project id:", projectId)
    const { data, error } = await supabase.from('projects').delete().eq('id', projectId)
    console.log("Delete data:", data)
    console.log("Delete error:", error)
    if (error) {
      console.error('Could not delete project from Supabase:', error)
      setMessage(`No se pudo eliminar el proyecto: ${error.message}`)
      return
    }

    await onReload()
    setMessage('Proyecto eliminado correctamente.')
  }

  const formFields = <form onSubmit={submitProject}><label>Título<input name="title" value={form.title} onChange={updateField} placeholder="Ej. Huerto inteligente" /></label><label>Resumen<input name="summary" value={form.summary} onChange={updateField} placeholder="Resumen breve del proyecto" /></label><label>Descripción<textarea name="description" value={form.description} onChange={updateField} placeholder="Descripción del proyecto" /></label><label>Categoría<select name="category" value={form.category} onChange={updateField}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></label><label>Año<input name="year" type="number" value={form.year} onChange={updateField} /></label><label>Imagen<input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} /></label><label className="admin-check"><input name="featured" type="checkbox" checked={form.featured} onChange={updateField} /> Destacado</label><label className="admin-check"><input name="published" type="checkbox" checked={form.published} onChange={updateField} /> Publicado</label><button className="button button-red" type="submit"><Plus size={17} /> {editingProject ? 'Guardar cambios' : 'Agregar proyecto'}</button>{editingProject && <button className="button button-dark" type="button" onClick={resetForm}>Cancelar edición</button>}</form>

  const projectList = <div className="admin-list"><strong>{projects.length} proyectos visibles</strong>{orderedProjects.map((project) => <div key={project.id}><span>{project.title}</span><small>{project.category} · {project.year} <button type="button" className="admin-edit" onClick={() => startEditing(project)}>Editar</button>{dashboard && <button type="button" className="admin-edit" onClick={() => deleteProject(project)}>Eliminar</button>}</small></div>)}</div>

  if (dashboard) return <main className="admin-page"><header className="admin-page-header"><a className="brand" href="/" aria-label="FABLAB INACAP Renca, inicio"><span className="brand-mark">F</span><span><strong>FABLAB</strong><small>INACAP RENCA</small></span></a><button className="button button-dark" type="button" onClick={onLogout}>Cerrar sesión</button></header><section className="admin-dashboard"><div className="admin-header"><div><p className="section-kicker">Gestión editorial</p><h1>Panel admin</h1></div></div><p className="admin-note">Sesión autenticada. Este panel es el punto de partida para la gestión de proyectos.</p><div className="admin-panel">{formFields}{message && <p className="success-message">{message}</p>}{projectList}</div></section></main>
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><aside className="admin-panel" role="dialog" aria-modal="true" aria-label="Panel administrador" onClick={(event) => event.stopPropagation()}><div className="admin-header"><div><p className="section-kicker">Gestión editorial</p><h2>Panel admin</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div><p className="admin-note">Vista MVP para revisar y agregar proyectos.</p>{formFields}{message && <p className="success-message">{message}</p>}{projectList}</aside></div>
}

export default App
