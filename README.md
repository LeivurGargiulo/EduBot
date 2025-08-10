# Bot Educativo Discord con Funciones de Voz

Un bot de Discord modular y completo diseñado para comunidades educativas, con funcionalidades básicas de voz.

## 🎵 Sistema de Canales de Voz Dinámicos

### Configuración
El sistema de canales de voz dinámicos ahora se configura mediante variables de entorno:
- `DYNAMIC_VOICE_TRIGGER_CHANNEL_ID` - ID del canal que activa la creación de canales dinámicos
- `DYNAMIC_VOICE_NAME_TEMPLATE` - Plantilla para el nombre de los canales (usa {usuario})
- `DYNAMIC_VOICE_USER_LIMIT` - Límite de usuarios por canal (0 = sin límite)

### Comandos de Estado
- `/estado voz` - Muestra la configuración actual

### Funcionalidad Principal
- **Creación Automática**: Cuando un usuario se une al canal configurado, se crea automáticamente un nuevo canal de voz temporal
- **Permisos Especiales**: El usuario que activa la creación obtiene permisos de administrador en su canal
- **Auto-eliminación**: Los canales se eliminan automáticamente cuando quedan vacíos
- **Plantillas de Nombre**: Personaliza el nombre de los canales usando `{usuario}` como variable
- **Límite de Usuarios**: Configura opcionalmente un límite de usuarios por canal

## 🏫 Características Educativas

### Sistema de Comisiones con Códigos Estructurados
- **Códigos de 5 caracteres**: `[CURSO][TURNO][NÚMERO]`
  - Curso: MB, MI, TW, JS, PY, PH, IL, AN, AF, PR
  - Turno: M (Mañana), T (Tarde), N (Noche)
  - Número: 01-99
- `/inscribirme [codigo]` - Los estudiantes se unen a su comisión
- `/crear-comision [codigo]` - Crea comisión con canales y rol automáticamente
- `/agregar-curso [codigo] [nombre]` - Registra nuevos cursos
- `/listar comisiones` - Ver todas las comisiones existentes
- `/listar cursos` - Ver todos los cursos registrados
- **Creación automática**: Rol, canal de texto, canal de voz y permisos
- **Logging completo**: Registro de inscripciones y creaciones

### Sistema de Recordatorios
- `/recordatorio crear [curso] [fecha-hora] [canal] [descripcion]` - Crea un recordatorio único para una clase (Solo Admins)
- `/recordatorio listar [curso]` - Muestra próximos recordatorios (Solo Admins)
- `/recordatorio borrar [id]` - Elimina un recordatorio (Solo Admins)
- **Recordatorios automáticos**: Sistema que envía un recordatorio único en el momento programado
- **Gestión por roles**: Menciona automáticamente al rol del curso si existe
- **Formato de fecha**: YYYY-MM-DD HH:MM (ej: 2024-03-15 14:30)
- **Emojis por curso**: Cada curso tiene su emoji distintivo en los recordatorios

### Sistema de Verificación
El sistema de verificación se configura mediante variables de entorno:
- `VERIFICATION_CHANNEL_ID` - ID del canal donde aparecerá el mensaje de verificación
- `VERIFIED_ROLE_ID` - ID del rol que se otorga a los usuarios verificados
- `VERIFICATION_ENABLED` - Activar/desactivar el sistema (true/false)

**Nota:** Los textos del sistema de verificación (título, descripción, botón) se configuran en `data/embedStrings.js` y pueden ser personalizados usando el comando `/configuracion textos`.

### Comandos de Verificación
- `/enviar-verificacion` - Envía el mensaje de verificación (Solo Admins)
- `/estado verificacion` - Muestra el estado del sistema (Solo Admins)
- **Verificación automática**: Los nuevos miembros deben verificarse para acceder
- **Mensajes personalizables**: Títulos y descripciones configurables
- **DM de bienvenida**: Mensaje automático a nuevos miembros
- **Logging**: Registro de verificaciones en canal de moderación

### Comandos de Administración
- `/estado bot` - Muestra la configuración actual del bot (Solo Admins)
- `/configuracion textos` - Personaliza los textos y mensajes del bot (Solo Admins)
- `/crear-comision [codigo]` - Crea una nueva comisión con canales y rol (Solo Admins)
- `/agregar-curso [codigo] [nombre]` - Agrega un nuevo curso a la base de datos (Solo Admins)
- `/listar comisiones` - Muestra todas las comisiones existentes (Solo Admins)
- `/listar cursos` - Muestra todos los cursos registrados (Solo Admins)

### Configuración del Bot
La configuración del bot ahora se maneja mediante variables de entorno:
- **Canales**: `MODERATION_CHANNEL_ID`, `SUPPORT_CHANNEL_ID`, `DOUBTS_CHANNEL_ID`, `ANNOUNCEMENTS_CHANNEL_ID`
- **Roles**: `STAFF_ROLE_ID`, `ADMIN_ROLE_ID`, `MODERATOR_ROLE_ID`
- **Enlaces**: `FEEDBACK_FORM_URL`, `GUIDELINES_URL`

### Comandos de Comunidad
- `/hola` - Mensaje de bienvenida (Solo Admins)
- `/normas` - Muestra las reglas de la comunidad (Solo Admins)
- `/presentarme` - Guía para presentarse (Solo Admins)
- `/roles` - Panel de selección de roles (Solo Admins)
- `/inscripciones` - Información sobre inscripciones

### Comandos de Educación
- `/material [curso]` - Obtiene materiales del curso
- `/mi-curso` - Muestra tus cursos inscritos
- `/profesor [nombre]` - Muestra información sobre un profesor
- `/inscribirme [codigo]` - Únete a tu comisión usando el código asignado

### Comandos de Utilidad
- `/feedback` - Enlace para dar feedback
- `/soporte` - Crea un ticket de soporte privado

### Comandos de Moderación
- `/expulsar [usuario] [motivo]` - Expulsa a un usuario
- `/silenciar [usuario] [tiempo] [motivo]` - Silencia temporalmente a un usuario
- `/reporte [usuario] [motivo]` - Reporta a un usuario

## 🔄 Migración de Configuración

### Cambios Recientes
El bot ha migrado de configuración dinámica a variables de entorno para mayor estabilidad y facilidad de mantenimiento.

#### Comandos Eliminados
- `/configuracion bot canales` - Ahora usa variables de entorno
- `/configuracion roles staff` - Ahora usa variables de entorno  
- `/configuracion roles verificacion` - Ahora usa variables de entorno
- `/configuracion voz configurar` - Ahora usa variables de entorno

#### Nuevas Variables de Entorno
Todas las configuraciones ahora se manejan mediante variables de entorno en el archivo `.env`:
- Configuración de canales del bot
- Roles de staff y moderación
- Sistema de verificación
- Canales de voz dinámicos
- Enlaces externos

### Ventajas de la Migración
- **Mayor estabilidad**: No más pérdida de configuración al reiniciar
- **Fácil respaldo**: Configuración en archivo de texto
- **Control de versiones**: Configuración versionada con Git
- **Despliegue simplificado**: Configuración consistente entre entornos

### Reseteo de Base de Datos
Después de la migración, es recomendable resetear la base de datos para limpiar los datos de configuración obsoletos:

#### Opción 1: PowerShell Script (Recomendado)
```powershell
.\scripts\reset-database.ps1
```

#### Opción 2: Node.js Script
```bash
node scripts/reset-database.js
```

Estos scripts:
- Crean un respaldo de la base de datos actual
- Eliminan las tablas de configuración obsoletas
- Preservan datos esenciales (cursos, recordatorios, textos personalizados)
- Validan las variables de entorno
- Inicializan la nueva estructura de base de datos

## 🛠️ Instalación

### Prerrequisitos
- Node.js 16.9.0 o superior
- npm o yarn
- Un bot de Discord configurado

### Dependencias
```bash
npm install discord.js @discordjs/voice dotenv node-cron
```

### Configuración

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno:

#### Opción 1: Configuración Automática (Recomendada)
Ejecuta el script de configuración interactiva:
```powershell
.\scripts\setup-environment.ps1
```

#### Opción 2: Configuración Manual
Copia `.env.example` a `.env` y configura las variables:

```env
# Discord Bot Configuration (REQUIRED)
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=id_de_tu_aplicacion
GUILD_ID=id_de_tu_servidor

# Optional: Logging Configuration
LOG_LEVEL=2
ENABLE_FILE_LOGGING=false
DISABLE_LOG_COLORS=false
```

**Nota:** La mayoría de la configuración ahora se hace a través de comandos del bot en lugar de variables de entorno. Solo necesitas configurar el token, client ID y guild ID.

4. Ejecuta el bot: `npm start`

## ⚙️ Configuración Inicial

Después de invitar el bot a tu servidor, usa estos comandos para configurarlo:

1. **Configurar canales básicos:**
   ```
   /configuracion bot canales moderacion:#canal-moderacion soporte:#canal-soporte
   ```

2. **Configurar roles:**
   ```
   /configuracion bot roles staff:@Staff moderador:@Moderador
   ```

3. **Configurar roles de identidad:**
   ```
   /configuracion roles pronombres el:@Él ella:@Ella elle:@Elle
   /configuracion roles identidades transmasc:@Transmasc transfem:@Transfem
   ```

4. **Configurar canales de voz dinámicos:**
   ```
   /configuracion voz canal:#crear-canal nombre-plantilla:"Canal de {usuario}"
   ```

5. **Configurar sistema de verificación:**
   ```
   /configuracion verificacion canal:#verificacion rol-verificado:@Verificado activar:true
   /enviar-verificacion
   ```

6. **Ver estado actual:**
   ```
   /estado bot
   ```

7. **Configurar sistema de comisiones:**
   ```
   # Agregar cursos
   /agregar-curso codigo:MB nombre:"Maquetado Básico"
   /agregar-curso codigo:JS nombre:"JavaScript Fundamentals"
   
   # Crear comisiones
   /crear-comision codigo:MBTG01
   /crear-comision codigo:JSNT02
   
   # Ver comisiones
   /listar comisiones
   ```

8. **Configurar sistema de recordatorios:**
   ```
   # Crear recordatorios
   /recordatorio crear curso:MB fecha-hora:"2024-03-15 14:30" canal:#mbt01 descripcion:"Clase de Flexbox"
   
   # Ver próximos recordatorios
   /recordatorio listar
   
   # Gestionar recordatorios
   /recordatorio listar curso:MB
   ```

## 🏗️ Arquitectura

### Estructura de Archivos
```
├── commands/
│   ├── admin/         # Comandos de administración
│   ├── community/     # Comandos de comunidad
│   ├── education/     # Comandos educativos
│   ├── moderation/    # Comandos de moderación
│   ├── utility/       # Comandos de utilidad
│   └── voice/         # Comandos de voz básicos
├── data/
│   ├── courseMaterials.js  # Datos de materiales de curso
│   └── embedStrings.js     # Strings centralizados
├── events/
│   ├── interactionCreate.js  # Manejo de interacciones
│   ├── ready.js             # Evento de bot listo
│   └── voiceStateUpdate.js  # Eventos de estado de voz
├── utils/
│   ├── configManager.js     # Gestión de configuración
│   ├── errorHandler.js      # Manejo de errores
│   ├── logger.js           # Sistema de logging
│   ├── permissions.js      # Gestión de permisos
│   └── reminderSystem.js   # Sistema de recordatorios automáticos
└── index.js                # Punto de entrada principal
```

### Características Técnicas
- **Modular**: Comandos organizados por categorías
- **Configuración Dinámica**: La mayoría de ajustes se configuran via comandos
- **Manejo de errores**: Sistema completo de manejo y logging de errores
- **Permisos**: Verificación automática de permisos
- **Cooldowns**: Sistema de cooldown por comando
- **Logging**: Sistema de logging configurable
- **Health Monitoring**: Monitoreo de salud del bot con recuperación automática
- **Gestión de Configuración**: Sistema centralizado con fallback a variables de entorno
- **Sistema de Recordatorios**: Recordatorios automáticos con cron jobs
- **Gestión de Eventos**: Base de datos en memoria para eventos programados

## 🎯 Permisos Requeridos

### Permisos Básicos del Bot
- Ver Canales
- Enviar Mensajes
- Usar Comandos de Barra
- Insertar Enlaces
- Adjuntar Archivos
- Leer Historial de Mensajes
- Usar Emojis Externos
- Agregar Reacciones

### Permisos de Canales Dinámicos
- Gestionar Canales
- Mover Miembros
- Conectar
- Ver Canales

### Permisos de Moderación (Opcional)
- Gestionar Mensajes
- Expulsar Miembros
- Banear Miembros
- Moderar Miembros
- Gestionar Roles
- Crear Hilos Privados

## 🔧 Desarrollo

### Agregar Nuevos Comandos
1. Crea un archivo en la carpeta de categoría apropiada
2. Sigue la estructura de comando existente
3. Agrega strings localizados a `embedStrings.js`
4. El bot cargará automáticamente el nuevo comando

### Estructura de Comando
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nombre-comando')
        .setDescription('Descripción del comando'),
    
    cooldown: 5, // Opcional: cooldown en segundos
    
    async execute(interaction) {
        // Lógica del comando
    }
};
```

## 🌐 Convenciones de Idioma

### Contenido Visible del Bot
- **Mensajes de usuario**: Todos los mensajes, embeds y respuestas del bot están en español
- **Interfaz de usuario**: Menús, botones y elementos interactivos en español
- **Logs de consola**: Los mensajes de `console.log` y `console.error` están en español

### Código y Archivos
- **Nombres de archivos**: Todos los archivos deben tener nombres en inglés
- **Comentarios de código**: Todos los comentarios en el código deben estar en inglés
- **Variables y funciones**: Nombres de variables y funciones en inglés
- **Strings de configuración**: Los strings de configuración pueden estar en español

### Ejemplos
```javascript
// ✅ Correcto - Comentarios en inglés, strings en español
const welcomeMessage = "¡Bienvenido al servidor!";
console.log("Usuario se unió al servidor");

// ❌ Incorrecto - Comentarios en español
const mensajeBienvenida = "¡Bienvenido al servidor!";
console.log("Usuario se unió al servidor");
```

## 📝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:
1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema
4. Usa el comando `/soporte` en Discord para ayuda específica del bot

## 🙏 Agradecimientos

- Basado en las funcionalidades del bot Vigdis
- Discord.js por la excelente librería
- La comunidad de Discord.js por el soporte
- Todos los contribuidores del proyecto