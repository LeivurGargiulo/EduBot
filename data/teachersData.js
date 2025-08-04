/**
 * Teachers Data
 * Information about teachers/professors for the /profesor command
 */

const teachersData = {
    'maria-garcia': {
        name: 'María García',
        description: 'Profesora especializada en desarrollo web frontend con más de 8 años de experiencia en la industria.',
        specialties: [
            '• HTML5 y CSS3 avanzado',
            '• JavaScript moderno (ES6+)',
            '• React y Vue.js',
            '• Diseño responsive',
            '• Accesibilidad web'
        ],
        experience: '8 años en desarrollo web',
        courses: [
            '• Maquetado Web Nivel I',
            '• Maquetado Web Nivel II',
            '• JavaScript Fundamentals'
        ],
        contact: [
            '📧 maria.garcia@ejemplo.com',
            '💼 LinkedIn: /in/maria-garcia-dev'
        ],
        funFact: '☕ Adicta al café y amante de los gatos. Siempre dispuesta a ayudar con dudas de CSS!',
        color: 0xE44D26,
        avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    'carlos-rodriguez': {
        name: 'Carlos Rodríguez',
        description: 'Desarrollador fullstack y mentor con pasión por enseñar tecnologías web modernas.',
        specialties: [
            '• Node.js y Express',
            '• Bases de datos (MongoDB, PostgreSQL)',
            '• APIs REST y GraphQL',
            '• Deployment y DevOps',
            '• Testing y TDD'
        ],
        experience: '10 años en desarrollo fullstack',
        courses: [
            '• Backend con Node.js',
            '• Bases de Datos',
            '• APIs y Microservicios'
        ],
        contact: [
            '📧 carlos.rodriguez@ejemplo.com',
            '🐙 GitHub: /carlos-dev',
            '🐦 Twitter: @carlosdev'
        ],
        funFact: '🎸 Toca la guitarra en sus tiempos libres y cree que el código limpio es como una buena canción.',
        color: 0x68A063,
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    'ana-martinez': {
        name: 'Ana Martínez',
        description: 'Diseñadora UX/UI convertida en desarrolladora frontend, especialista en crear experiencias web increíbles.',
        specialties: [
            '• Diseño UX/UI',
            '• Tailwind CSS',
            '• Sass y metodologías CSS',
            '• Figma y herramientas de diseño',
            '• Prototipado y wireframing'
        ],
        experience: '6 años en diseño y desarrollo',
        courses: [
            '• Tailwind CSS',
            '• Diseño Web Responsive',
            '• UX/UI para Desarrolladores'
        ],
        contact: [
            '📧 ana.martinez@ejemplo.com',
            '🎨 Behance: /ana-martinez-design',
            '📱 Instagram: @ana_designs'
        ],
        funFact: '🌱 Le encanta la jardinería y dice que cuidar plantas es como cuidar código: requiere paciencia y amor.',
        color: 0x38B2AC,
        avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    'luis-fernandez': {
        name: 'Luis Fernández',
        description: 'Veterano de la industria tech con experiencia en múltiples lenguajes y frameworks.',
        specialties: [
            '• JavaScript avanzado',
            '• TypeScript',
            '• React y Next.js',
            '• Testing automatizado',
            '• Arquitectura de software'
        ],
        experience: '15 años en desarrollo de software',
        courses: [
            '• JavaScript Avanzado',
            '• TypeScript Fundamentals',
            '• React Profesional'
        ],
        contact: [
            '📧 luis.fernandez@ejemplo.com',
            '💼 LinkedIn: /in/luis-fernandez-dev'
        ],
        funFact: '📚 Colecciona libros de programación vintage y tiene más de 200 libros técnicos en su biblioteca.',
        color: 0xF7DF1E,
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
};

module.exports = teachersData;