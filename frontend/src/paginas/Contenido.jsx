import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import '../documento.css'
import useRevelar from '../revelar.js'

/** El HTML es nuestro, del repositorio y compilado en el bundle: no hay inyección posible. */

/** Las largas, las que se leen buscando algo y necesitan índice. */
const DOCUMENTOS = new Set(['guia', 'modulos', 'referencia', 'empezar', 'acerca'])

const ESTRECHO = '(max-width: 60rem)'
const QUIETO = '(prefers-reduced-motion: reduce)'

const esDocumento = (pathname) =>
  DOCUMENTOS.has(pathname.replace(/^\/en(?=\/|$)/, '').replace(/^\//, ''))

const FLECHA =
  '<svg class="indice-flecha" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
  ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="m6 9 6 6 6-6"/></svg>'

export default function Contenido({ html, titulo, pide }) {
  const { pathname } = useLocation()
  const caja = useRef(null)
  const documento = esDocumento(pathname)
  const [pedido, setPedido] = useState(html ?? null)
  const cuerpo = html ?? pedido

  // La página 404 llega con su HTML hecho; las demás se piden al entrar en su ruta.
  useEffect(() => {
    if (html) return
    let vigente = true
    setPedido(null)
    pide().then((m) => { if (vigente) setPedido(m.default) })
    return () => { vigente = false }
  }, [pide, html])

  useRevelar(cuerpo)

  useEffect(() => {
    document.title = `${titulo} · Cero`
    window.scrollTo(0, 0)
  }, [titulo, pathname])

  useEffect(() => {
    const raiz = caja.current
    if (!documento || !raiz) return

    const limpiezas = []

    // Se mide en vez de copiarlo: un número copiado se queda viejo el día que la barra cambie.
    const cabecera = document.querySelector('header')
    const medirBarra = () => {
      if (!cabecera) return
      const alto = Math.round(cabecera.getBoundingClientRect().height)
      if (alto > 0) raiz.style.setProperty('--doc-barra', `${alto}px`)
    }
    medirBarra()

    // El marcado del índice ya está en contenido/: aquí solo se le añade estado, no se duplica.
    const indice = raiz.querySelector('nav.indice')
    const lista = indice && indice.querySelector('ol')
    const pares = []

    if (indice && lista) {
      for (const enlace of lista.querySelectorAll('a[href^="#"]')) {
        const id = decodeURIComponent(enlace.getAttribute('href').slice(1))
        const seccion = id && raiz.querySelector(`#${CSS.escape(id)}`)
        if (seccion) pares.push({ enlace, seccion })
      }
    }

    if (pares.length > 1) {
      if (!lista.id) lista.id = 'indice-del-documento'

      // La etiqueta sale del aria-label ya traducido del documento: sin tabla de idiomas aquí.
      const rotulo = indice.getAttribute('aria-label') || 'Índice'
      const boton = document.createElement('button')
      boton.type = 'button'
      boton.className = 'indice-boton'
      boton.setAttribute('aria-expanded', 'false')
      boton.setAttribute('aria-controls', lista.id)
      boton.innerHTML = `<span class="indice-rotulo"></span><span class="indice-actual"></span>${FLECHA}`
      boton.querySelector('.indice-rotulo').textContent = rotulo
      const actual = boton.querySelector('.indice-actual')
      indice.insertBefore(boton, lista)

      const estrecho = window.matchMedia(ESTRECHO)

      const plegar = (abierto) => {
        boton.setAttribute('aria-expanded', abierto ? 'true' : 'false')
        lista.hidden = !abierto
      }
      // En ancho no hay nada que plegar y la lista debe quedar visible aunque se viniera plegada.
      const ajustar = () => plegar(!estrecho.matches)

      ajustar()
      estrecho.addEventListener('change', ajustar)
      limpiezas.push(() => estrecho.removeEventListener('change', ajustar))

      const alPulsar = () => plegar(boton.getAttribute('aria-expanded') !== 'true')
      boton.addEventListener('click', alPulsar)
      limpiezas.push(() => boton.removeEventListener('click', alPulsar))

      // Elegir destino cierra el panel: si no, tapa justo el encabezado al que se ha saltado.
      const alElegir = () => { if (estrecho.matches) plegar(false) }
      lista.addEventListener('click', alElegir)
      limpiezas.push(() => lista.removeEventListener('click', alElegir))

      const alTeclado = (e) => {
        if (e.key !== 'Escape' || !estrecho.matches) return
        if (boton.getAttribute('aria-expanded') !== 'true') return
        plegar(false)
        boton.focus()
      }
      const alTocarFuera = (e) => {
        if (!estrecho.matches || indice.contains(e.target)) return
        if (boton.getAttribute('aria-expanded') === 'true') plegar(false)
      }
      document.addEventListener('keydown', alTeclado)
      document.addEventListener('pointerdown', alTocarFuera)
      limpiezas.push(() => document.removeEventListener('keydown', alTeclado))
      limpiezas.push(() => document.removeEventListener('pointerdown', alTocarFuera))

      // El corte es el scroll-margin-top de la sección: lo mismo que usa el navegador al saltar.
      const corte = () => parseFloat(getComputedStyle(pares[0].seccion).scrollMarginTop) || 0

      // El indicador se coloca sobre el enlace activo: una sola barra que se desliza en vez de
      // encenderse y apagarse por saltos.
      const deslizar = (enlace) => {
        lista.style.setProperty('--y', `${enlace.offsetTop}px`)
        lista.style.setProperty('--alto', `${enlace.offsetHeight}px`)
        lista.style.setProperty('--visible', '1')
      }

      const marcarLeidos = (activo) => {
        let pasado = true
        for (const par of pares) {
          par.enlace.classList.toggle('leido', pasado && par !== activo)
          if (par === activo) pasado = false
        }
      }

      let ultimo = null
      const repintar = () => {
        const y = corte()
        let activo = pares[0]
        for (const par of pares) {
          if (par.seccion.getBoundingClientRect().top - y <= 1) activo = par
        }
        if (activo === ultimo) return
        if (ultimo) {
          ultimo.enlace.classList.remove('activo')
          ultimo.enlace.removeAttribute('aria-current')
        }
        activo.enlace.classList.add('activo')
        activo.enlace.setAttribute('aria-current', 'location')
        actual.textContent = activo.enlace.textContent.trim().replace(/\s+/g, ' ')
        ultimo = activo
        deslizar(activo.enlace)
        marcarLeidos(activo)
      }

      let observador = null
      // Banda de 1 px en el corte: un umbral por porcentaje no dispara en secciones muy altas.
      const montarObservador = () => {
        if (observador) observador.disconnect()
        const y = corte()
        const abajo = Math.max(0, Math.round(window.innerHeight - y - 1))
        observador = new IntersectionObserver(repintar, {
          rootMargin: `-${Math.round(y)}px 0px -${abajo}px 0px`,
          threshold: 0,
        })
        for (const par of pares) observador.observe(par.seccion)
        repintar()
      }

      if ('IntersectionObserver' in window) {
        montarObservador()
        // La banda depende del alto de la ventana, así que se rehace al redimensionar.
        let temporizador = 0
        const alRedimensionar = () => {
          clearTimeout(temporizador)
          temporizador = setTimeout(montarObservador, 150)
        }
        window.addEventListener('resize', alRedimensionar)
        limpiezas.push(() => {
          clearTimeout(temporizador)
          window.removeEventListener('resize', alRedimensionar)
          if (observador) observador.disconnect()
        })
      } else {
        // Sin observador el índice sigue siendo una lista de enlaces que funciona.
        repintar()
      }

      // Bajo el índice queda hueco: se llena con el avance y un atajo para volver arriba.
      const pie = document.createElement('div')
      pie.className = 'indice-pie'
      pie.innerHTML =
        '<div class="indice-avance"><span></span></div>' +
        '<button type="button" class="indice-arriba">' +
        (document.documentElement.lang === 'en' ? 'Back to top' : 'Volver arriba') +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>'
      indice.appendChild(pie)

      const barra = pie.querySelector('.indice-avance span')
      const arriba = pie.querySelector('.indice-arriba')
      const alSubir = () => window.scrollTo({
        top: 0,
        behavior: window.matchMedia(QUIETO).matches ? 'auto' : 'smooth',
      })
      arriba.addEventListener('click', alSubir)
      limpiezas.push(() => { arriba.removeEventListener('click', alSubir); pie.remove() })

      const avance = () => {
        const total = document.documentElement.scrollHeight - window.innerHeight
        const cuanto = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0
        barra.style.transform = `scaleX(${cuanto})`
      }
      avance()
      window.addEventListener('scroll', avance, { passive: true })
      limpiezas.push(() => window.removeEventListener('scroll', avance))

      limpiezas.push(() => {
        boton.remove()
        lista.hidden = false
        for (const par of pares) {
          par.enlace.classList.remove('activo')
          par.enlace.removeAttribute('aria-current')
        }
      })
    }

    // Cada celda lleva el rótulo de su columna. Con eso el CSS puede apilar la tabla en el
    // teléfono sin que nadie tenga que arrastrarla de lado para ver las cifras.
    for (const tabla of raiz.querySelectorAll('table')) {
      const rotulos = [...tabla.querySelectorAll('thead th')].map((th) => th.textContent.trim())
      if (!rotulos.some(Boolean)) continue
      for (const fila of tabla.querySelectorAll('tbody tr')) {
        ;[...fila.children].forEach((celda, i) => {
          if (rotulos[i]) celda.setAttribute('data-rotulo', rotulos[i])
        })
      }
      tabla.classList.add('apilable')
    }

    // El atributo lo pone el script, no el HTML: sin script no queda nada esperando a revelarse.
    if ('IntersectionObserver' in window && !window.matchMedia(QUIETO).matches) {
      const bloques = [...raiz.querySelectorAll('.codigo, .envoltura')]
      const asomo = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('dentro')
          asomo.unobserve(entrada.target)
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 })

      for (const bloque of bloques) {
        bloque.dataset.asomar = ''
        asomo.observe(bloque)
      }
      limpiezas.push(() => {
        asomo.disconnect()
        for (const bloque of bloques) {
          delete bloque.dataset.asomar
          bloque.classList.remove('dentro')
        }
      })
    }

    return () => { for (const limpieza of limpiezas) limpieza() }
  }, [cuerpo, documento])

  return (
    <div
      ref={caja}
      className={documento ? 'pagina documento' : 'pagina'}
      dangerouslySetInnerHTML={{ __html: cuerpo ?? '' }}
    />
  )
}
