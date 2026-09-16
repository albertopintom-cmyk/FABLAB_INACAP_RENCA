import { useEffect, useState } from 'react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        border: 'none',
        background: '#E30613',
        color: '#fff',
        fontSize: '28px',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 10px 24px rgba(16, 24, 40, 0.18)',
        zIndex: 9999,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-2px)'
        event.currentTarget.style.boxShadow = '0 14px 28px rgba(16, 24, 40, 0.22)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)'
        event.currentTarget.style.boxShadow = '0 10px 24px rgba(16, 24, 40, 0.18)'
      }}
    >
      ↑
    </button>
  )
}
