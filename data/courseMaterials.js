/**
 * Course Materials Data
 * Centralized data for all course materials, including links, descriptions, and syllabi.
 */

const courseMaterials = {
    maquetado1: {
        name: 'Maquetado Web Nivel I',
        description: 'Materiales y recursos para el curso de Maquetado Web Nivel I.',
        color: 0xE44D26,
        materials: {
            general: [
                { name: 'Programa del Curso', url: 'https://example.com/maquetado1-syllabus', description: 'Resumen completo del curso, temario y objetivos.' },
                { name: 'Guía de Herramientas', url: 'https://example.com/maquetado1-tools', description: 'Software recomendado: VS Code, Navegador, GitHub Pages, etc.' }
            ],
            classes: {
                '1': [{ name: 'Bienvenida y para qué sirve maquetar', url: 'https://example.com/m1-class1', description: 'Presentación del curso, qué es una página web y por qué aprender HTML y CSS.' }],
                '2': [{ name: 'Primeros pasos con HTML', url: 'https://example.com/m1-class2', description: 'Estructura básica de HTML: <html>, <head>, <body> y tu primer archivo .html.' }],
                '3': [{ name: 'Editores, carpetas y flujo de trabajo', url: 'https://example.com/m1-class3', description: 'Uso de editores de código como VS Code y cómo organizar los archivos del proyecto.' }],
                '4': [{ name: 'Estructura y etiquetas básicas', url: 'https://example.com/m1-class4', description: 'Etiquetas semánticas como <header>, <main>, <footer> y buenas prácticas de indentación.' }],
                '5': [{ name: 'Texto en HTML', url: 'https://example.com/m1-class5', description: 'Uso de etiquetas de texto como <h1>-<h6>, <p>, <strong>, <em> y <span>.' }],
                '6': [{ name: 'Listas y enlaces', url: 'https://example.com/m1-class6', description: 'Creación de listas ordenadas y desordenadas, y enlaces internos y externos.' }],
                '7': [{ name: 'Imágenes y multimedia', url: 'https://example.com/m1-class7', description: 'Inserción de imágenes, videos y iframes, con foco en la accesibilidad.' }],
                '8': [{ name: 'Introducción a CSS', url: 'https://example.com/m1-class8', description: 'Conexión de CSS con HTML y propiedades básicas de estilo como color y fondo.' }],
                '9': [{ name: 'Selectores y clases', url: 'https://example.com/m1-class9', description: 'Uso de selectores de etiqueta, clase e ID para aplicar estilos de forma reutilizable.' }],
                '10': [{ name: 'Tipografía y colores accesibles', url: 'https://example.com/m1-class10', description: 'Uso de Google Fonts, unidades de texto y cómo asegurar el contraste y la legibilidad.' }],
                '11': [{ name: 'Box Model y espaciado', url: 'https://example.com/m1-class11', description: 'Entendiendo el modelo de caja: margin, padding, border, width y height.' }],
                '12': [{ name: 'Layouts con Flexbox', url: 'https://example.com/m1-class12', description: 'Introducción a Flexbox para crear layouts flexibles y alineados.' }],
                '13': [{ name: 'CSS Grid y diseño en cuadrícula', url: 'https://example.com/m1-class13', description: 'Creación de layouts complejos basados en cuadrículas con CSS Grid.' }],
                '14': [{ name: 'Diseño responsive y mobile first', url: 'https://example.com/m1-class14', description: 'Uso de media queries para adaptar el diseño a diferentes tamaños de pantalla.' }],
                '15': [{ name: 'Proyecto final + compartir online', url: 'https://example.com/m1-class15', description: 'Planificación del proyecto final y cómo subirlo a servicios como GitHub Pages o Netlify.' }]
            }
        }
    },
    maquetado2: {
        name: 'Maquetado Web Nivel II',
        description: 'Materiales y recursos para el curso de Maquetado Web Nivel II.',
        color: 0x1572B6,
        materials: {
            general: [
                { name: 'Programa del Curso', url: 'https://example.com/maquetado2-syllabus', description: 'Resumen completo del curso, temario y objetivos.' },
                { name: 'Guía de Herramientas', url: 'https://example.com/maquetado2-tools', description: 'Software recomendado: VS Code, DevTools, Netlify, etc.' }
            ],
            classes: {
                '1': [{ name: 'Bienvenida y repaso intensivo', url: 'https://example.com/m2-class1', description: 'Presentación del curso, repaso de Nivel 1 y ejercicio práctico.' }],
                '2': [{ name: 'HTML semántico nivel 2', url: 'https://example.com/m2-class2', description: 'Etiquetas útiles, accesibilidad básica y buenas prácticas de estructura.' }],
                '3': [{ name: 'Formularios I: estructura y campos', url: 'https://example.com/m2-class3', description: 'Estructura de <form>, tipos de inputs y agrupación con <fieldset>.' }],
                '4': [{ name: 'Formularios II: estilo y usabilidad', url: 'https://example.com/m2-class4', description: 'Estilado de inputs, estados (:focus, :hover) y buenas prácticas de UX.' }],
                '5': [{ name: 'Responsive I: media queries', url: 'https://example.com/m2-class5', description: 'Concepto de responsive, mobile first y uso de breakpoints.' }],
                '6': [{ name: 'Responsive II: tipografía fluida', url: 'https://example.com/m2-class6', description: 'Unidades relativas (%, em, rem, vw) y buenas prácticas de legibilidad.' }],
                '7': [{ name: 'Responsive III: imágenes y videos', url: 'https://example.com/m2-class7', description: 'Imágenes escalables, iframes y lazy loading.' }],
                '8': [{ name: 'Flexbox I: fundamentos', url: 'https://example.com/m2-class8', description: 'Ejes, direcciones, alineaciones (justify-content, align-items).' }],
                '9': [{ name: 'Flexbox II: ejemplos reales', url: 'https://example.com/m2-class9', description: 'Aplicación de Flexbox en menús, footers y tarjetas.' }],
                '10': [{ name: 'Grid I: lo básico', url: 'https://example.com/m2-class10', description: 'display: grid, columnas, filas y la unidad "fr".' }],
                '11': [{ name: 'Grid II: estructura completa', url: 'https://example.com/m2-class11', description: 'Grid implícito vs explícito y uso de áreas de grid.' }],
                '12': [{ name: 'Diseño modular', url: 'https://example.com/m2-class12', description: 'Creación de componentes reutilizables como botones y tarjetas.' }],
                '13': [{ name: 'Transiciones y animaciones básicas', url: 'https://example.com/m2-class13', description: 'Uso de transition, transform y @keyframes para microinteracciones.' }],
                '14': [{ name: 'Proyecto final I: diseño y armado', url: 'https://example.com/m2-class14', description: 'Instrucciones del proyecto, wireframing y estructura.' }],
                '15': [{ name: 'Proyecto final II + cierre', url: 'https://example.com/m2-class15', description: 'Presentación de proyectos, feedback y cómo subirlo online.' }]
            }
        }
    },
    tailwind: {
        name: 'Tailwind CSS',
        description: 'Materiales y recursos para el curso de Tailwind CSS.',
        color: 0x38B2AC,
        materials: {
            general: [
                { name: 'Documentación Oficial', url: 'https://tailwindcss.com/docs', description: 'La mejor fuente de información' },
                { name: 'Guía de Instalación', url: 'https://example.com/tailwind-setup', description: 'Integrando Tailwind en tu proyecto' }
            ],
            classes: {
                '1': [
                    { name: 'Utility-First Fundamentals', url: 'https://example.com/tailwind-class1', description: 'Entendiendo la filosofía de Tailwind' }
                ]
            }
        }
    }
};

module.exports = courseMaterials;