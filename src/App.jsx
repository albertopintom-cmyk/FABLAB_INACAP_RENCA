import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, AtSign, ChevronDown, Mail, Menu, Plus, Search, X } from 'lucide-react'
import { supabase } from './lib/supabase'
import heroImage from './assets/hero.png'
import './App.css'

const demoProjects = [
  { id: 'demo-1', title: 'Estación meteorológica escolar', category: 'Electrónica', year: 2025, excerpt: 'Un dispositivo abierto para observar el clima local y aprender haciendo.', image_url: 'https://images.unsplash.com/photo-1563770660941-10a3e7c7f0e4?auto=format&fit=crop&w=1200&q=85', featured: true },
  { id: 'demo-2', title: 'Mobiliario circular', category: 'Fabricación digital', year: 2024, excerpt: 'Diseño y fabricación de módulos para activar espacios de encuentro.', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85', featured: false },
  { id: 'demo-3', title: 'Manos que conectan', category: 'Innovación social', year: 2024, excerpt: 'Prototipos inclusivos desarrollados junto a la comunidad de Renca.', image_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85', featured: false },
  { id: 'demo-4', title: 'Laboratorio en movimiento', category: 'Diseño', year: 2023, excerpt: 'Una experiencia móvil para acercar la fabricación digital a los barrios.', image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85', featured: false },
]
const categories = ['Todos', 'Electrónica', 'Fabricación digital', 'Innovación social', 'Diseño']

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

  useEffect(() => {
    async function loadProjects() {
      if (!supabase) {
        console.error('Supabase client is not configured. Using demo projects.')
        setProjects(demoProjects)
        return
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
          return
        }

        setProjects(data?.length ? data : demoProjects)
      } catch (error) {
        console.error('Unexpected error loading projects from Supabase:', error)
        setProjects(demoProjects)
      }
    }
    loadProjects()
  }, [])

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesCategory = activeCategory === 'Todos' || project.category === activeCategory
    const normalizedQuery = query.toLowerCase().trim()
    const matchesQuery = !normalizedQuery || `${project.title} ${project.excerpt}`.toLowerCase().includes(normalizedQuery)
    return matchesCategory && matchesQuery
  }), [activeCategory, projects, query])
  return (
    <div className="site-shell">
      <header className="site-header"><a className="brand" href="#inicio" aria-label="FABLAB INACAP Renca, inicio"><span className="brand-mark">F</span><span><strong>FABLAB</strong><small>INACAP RENCA</small></span></a><button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú"><Menu size={20} /></button><nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}><a href="#proyectos" onClick={() => setMenuOpen(false)}>Proyectos</a><a href="#comunidad" onClick={() => setMenuOpen(false)}>Comunidad</a><a href="#fablab" onClick={() => setMenuOpen(false)}>El FabLab</a><a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a><button className="admin-link" type="button" onClick={() => setIsAdminOpen(true)}>Panel admin <ArrowUpRight size={15} /></button></nav></header>
      <main>
        <section className="hero" id="inicio"><div className="hero-copy"><p className="eyebrow"><span /> Fabricar para transformar</p><h1>Ideas que toman<br /><em>forma.</em></h1><p className="hero-text">Conocemos, prototipamos y compartimos proyectos que nacen en el FabLab INACAP Renca.</p><a className="button button-dark" href="#proyectos">Explorar proyectos <ArrowUpRight size={17} /></a></div><div className="hero-visual" aria-label="Estudiantes trabajando en el FabLab"><img src={heroImage} alt="Estudiantes trabajando en un proyecto de fabricación digital" /><span className="hero-stamp">FAB<br />LAB</span><div className="hero-caption"><span>01</span><span>Aprender haciendo</span></div></div></section>
        <section className="intro-band" id="fablab"><p className="section-kicker">Nuestro espacio</p><div className="intro-content"><h2>Un lugar para<br /><span>hacer posible.</span></h2><p>Somos un laboratorio de fabricación digital abierto a la comunidad educativa. Aquí las ideas se convierten en prototipos, y los prototipos en nuevas oportunidades.</p></div><div className="stats"><div><strong>01</strong><span>Sede Renca</span></div><div><strong>∞</strong><span>Ideas en movimiento</span></div><div><strong>24/7</strong><span>Curiosidad activa</span></div></div></section>
        <section className="projects-section" id="proyectos"><div className="section-heading"><div><p className="section-kicker">Proyectos destacados</p><h2>Hecho aquí.</h2></div><p>Una selección de procesos, aprendizajes y resultados del ecosistema FabLab.</p></div><div className="project-toolbar"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? 'is-active' : ''} key={category} type="button" onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyectos" /></label></div><div className="project-grid">{filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} featured={index === 0 && activeCategory === 'Todos'} onSelect={setSelectedProject} />)}</div>{filteredProjects.length === 0 && <div className="empty-state">No encontramos proyectos con esos criterios.</div>}</section>
        <CommunitySection />
      </main>
      <SiteFooter />
      {selectedProject && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedProject(null)}><article className="project-modal" role="dialog" aria-modal="true" aria-label={selectedProject.title} onClick={(event) => event.stopPropagation()}><button className="close-button" type="button" onClick={() => setSelectedProject(null)} aria-label="Cerrar"><X size={20} /></button><img src={selectedProject.image_url || heroImage} alt="" /><div className="modal-copy"><div className="project-meta"><span>{selectedProject.category}</span><span>{selectedProject.year}</span></div><h2>{selectedProject.title}</h2><p>{selectedProject.excerpt}</p><a href="mailto:fablab.renca@inacap.cl?subject=Consulta sobre proyecto">Conocer más <ArrowUpRight size={17} /></a></div></article></div>}
      {isAdminOpen && <AdminPanel projects={projects} onClose={() => setIsAdminOpen(false)} onAdd={(project) => setProjects((current) => [project, ...current])} />}
    </div>
  )
}

function AdminPanel({ projects, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Diseño')
  const [message, setMessage] = useState('')
  function addProject(event) {
    event.preventDefault()
    if (!title.trim()) return
    onAdd({ id: `local-${Date.now()}`, title, category, year: new Date().getFullYear(), excerpt: 'Nuevo proyecto pendiente de publicación.', image: demoProjects[1].image, featured: false })
    setTitle('')
    setMessage('Proyecto agregado en esta sesión. Conecta Supabase para persistirlo.')
  }
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><aside className="admin-panel" role="dialog" aria-modal="true" aria-label="Panel administrador" onClick={(event) => event.stopPropagation()}><div className="admin-header"><div><p className="section-kicker">Gestión editorial</p><h2>Panel admin</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div><p className="admin-note">Vista MVP para revisar y agregar proyectos. La autenticación y persistencia usan Supabase cuando configures las variables de entorno.</p><form onSubmit={addProject}><label>Nombre del proyecto<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Huerto inteligente" /></label><label>Categoría<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></label><button className="button button-red" type="submit"><Plus size={17} /> Agregar proyecto</button></form>{message && <p className="success-message">{message}</p>}<div className="admin-list"><strong>{projects.length} proyectos visibles</strong>{projects.slice(0, 4).map((project) => <div key={project.id}><span>{project.title}</span><small>{project.category} · {project.year}</small></div>)}</div></aside></div>
}

export default App
