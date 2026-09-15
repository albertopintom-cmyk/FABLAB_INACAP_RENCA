import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import heroImage from '../assets/hero.png'

const demoProjects = [
  {
    id: 'demo-1',
    title: 'Estación meteorológica escolar',
    category: 'Electrónica',
    year: 2025,
    excerpt: 'Un dispositivo abierto para observar el clima local y aprender haciendo.',
    image_url: 'https://images.unsplash.com/photo-1563770660941-10a3e7c7f0e4?auto=format&fit=crop&w=1200&q=85',
    featured: true,
  },
  {
    id: 'demo-2',
    title: 'Mobiliario circular',
    category: 'Fabricación digital',
    year: 2024,
    excerpt: 'Diseño y fabricación de módulos para activar espacios de encuentro.',
    image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85',
    featured: false,
  },
  {
    id: 'demo-3',
    title: 'Manos que conectan',
    category: 'Innovación social',
    year: 2024,
    excerpt: 'Prototipos inclusivos desarrollados junto a la comunidad de Renca.',
    image_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85',
    featured: false,
  },
  {
    id: 'demo-4',
    title: 'Laboratorio en movimiento',
    category: 'Diseño',
    year: 2023,
    excerpt: 'Una experiencia móvil para acercar la fabricación digital a los barrios.',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
    featured: false,
  },
]

function getCategories(projects) {
  return ['Todos', ...new Set(projects.map((project) => project.category).filter(Boolean))]
}

function ProjectCard({ project, index, featured }) {
  return <article className={featured ? 'project-card project-card-featured' : 'project-card'} onClick={() => {
    window.location.href = `/proyectos/${project.id}`
  }}><div className="project-image"><img src={project.image_url || heroImage} alt="" /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="project-meta"><span>{project.category}</span><span>{project.year}</span></div><h3>{project.title}</h3><p>{project.excerpt}</p><button type="button" className="read-more" aria-label={`Ver ${project.title}`}><ArrowUpRight size={18} /></button></article>
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState(demoProjects)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [query, setQuery] = useState('')

  const categories = useMemo(() => getCategories(projects), [projects])

  const loadProjects = useCallback(async () => {
    if (!supabase) {
      setProjects(demoProjects)
      return demoProjects
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error loading projects:', error)
        setProjects(demoProjects)
        return demoProjects
      }

      const nextProjects = data?.length ? data : demoProjects
      setProjects(nextProjects)
      return nextProjects
    } catch (error) {
      console.error('Unexpected error loading projects:', error)
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

  return (
    <main className="site-shell">
      <section className="projects-section" id="proyectos">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Proyectos destacados</p>
            <h2>Hecho aquí.</h2>
          </div>
          <p>Una selección de procesos, aprendizajes y resultados del ecosistema FabLab.</p>
        </div>

        <div className="project-toolbar">
          <div className="category-tabs">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'is-active' : ''}
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="search-field">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyectos" />
          </label>
        </div>

        <div className="project-grid">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} featured={index === 0 && activeCategory === 'Todos'} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="empty-state">No encontramos proyectos con esos criterios.</div>
        )}
      </section>
    </main>
  )
}
