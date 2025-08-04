# Guía de Configuración Inicial del Bot

Esta guía te ayudará a configurar completamente tu bot educativo de Discord paso a paso.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener:
- El bot invitado a tu servidor con los permisos necesarios
- Permisos de administrador en el servidor
- Canales y roles básicos creados (opcional, se pueden crear durante la configuración)

## 🔧 Configuración Básica del Bot

### 1. Configurar Canales y Roles Básicos

Usa el comando `/configuracion bot` para configurar los elementos fundamentales:

```bash
# Configurar canales principales
/configuracion bot canales moderacion:#canal-moderacion soporte:#canal-soporte bienvenida:#bienvenida

# Configurar roles de staff
/configuracion bot roles staff:@Staff moderador:@Moderador profesor:@Profesor

# Configurar enlaces útiles
/configuracion bot enlaces sitio-web:https://tu-sitio.com reglamento:https://tu-sitio.com/reglas
```

**Parámetros disponibles:**
- `canales`: moderacion, soporte, bienvenida, verificacion
- `roles`: staff, moderador, profesor, estudiante
- `enlaces`: sitio-web, reglamento, documentacion

### 2. Verificar la Configuración

```bash
/estado bot
```

Este comando mostrará toda la configuración actual del bot.

## 🎵 Configuración de Canales de Voz Dinámicos

### Configurar el Sistema

```bash
/configuracion voz canal:#crear-canal nombre-plantilla:"Canal de {usuario}" limite-usuarios:10
```

**Parámetros:**
- `canal`: El canal donde los usuarios se unirán para crear canales temporales
- `nombre-plantilla`: Plantilla del nombre (usa `{usuario}` como variable)
- `limite-usuarios`: Límite opcional de usuarios por canal (1-99)

### Verificar Configuración de Voz

```bash
/estado voz
```

## 👥 Configuración de Roles de Identidad

### Configurar Roles de Pronombres

```bash
/configuracion roles pronombres el:@Él ella:@Ella elle:@Elle
```

### Configurar Roles de Identidad

```bash
/configuracion roles identidades transmasc:@Transmasc transfem:@Transfem no-binario:@NoBinario
```

### Verificar Configuración de Roles

```bash
/estado roles
```

## 📝 Personalización de Textos

### Configurar Mensajes Personalizados

```bash
/configuracion textos bienvenida:"¡Bienvenido a nuestra comunidad educativa!"
/configuracion textos normas:"Lee nuestras reglas para mantener un ambiente respetuoso"
/configuracion textos presentacion:"Cuéntanos sobre ti y tus intereses"
```

**Tipos de texto disponibles:**
- `bienvenida`: Mensaje de bienvenida para nuevos miembros
- `normas`: Descripción de las reglas
- `presentacion`: Guía para presentarse
- `verificacion`: Mensaje de verificación personalizado

### Verificar Textos Configurados

```bash
/estado textos
```

## 📚 Gestión de Cursos

### Agregar Cursos

Los cursos se identifican con códigos de 2 letras. Ejemplos:

```bash
# Cursos básicos
/agregar-curso codigo:MB nombre:"Maquetado Básico"
/agregar-curso codigo:MI nombre:"Maquetado Intermedio"
/agregar-curso codigo:JS nombre:"JavaScript Fundamentals"
/agregar-curso codigo:PY nombre:"Python Básico"

# Cursos avanzados
/agregar-curso codigo:TW nombre:"TypeScript Web"
/agregar-curso codigo:PH nombre:"PHP Backend"
/agregar-curso codigo:IL nombre:"Illustrator"
/agregar-curso codigo:AN nombre:"After Effects"
/agregar-curso codigo:AF nombre:"After Effects Avanzado"
/agregar-curso codigo:PR nombre:"Premiere Pro"
```

### Ver Cursos Registrados

```bash
/listar cursos
```

## 🏫 Creación de Comisiones

### Estructura de Códigos de Comisión

Los códigos siguen el formato: `[CURSO][TURNO][NÚMERO]`

**Cursos disponibles:** MB, MI, TW, JS, PY, PH, IL, AN, AF, PR
**Turnos:** M (Mañana), T (Tarde), N (Noche)
**Números:** 01-99

### Crear Comisiones

```bash
# Ejemplos de comisiones
/crear-comision codigo:MBTM01
/crear-comision codigo:JSTN02
/crear-comision codigo:PYMN03
```

### Canales Creados Automáticamente

Cada comisión crea automáticamente **4 canales** organizados en una categoría:

1. **Canal de Voz** (`🔊 mbtm01-voz`)
   - Para clases y reuniones de voz
   - Permisos básicos para todos los miembros

2. **Canal de Texto Principal** (`💬 mbtm01`)
   - Para discusiones del curso
   - Permisos de lectura y escritura

3. **Canal de Notificaciones** (`📢 mbtm01-anuncios`)
   - Solo lectura para estudiantes
   - Solo profesores y staff pueden escribir

4. **Canal de Charla** (`💭 mbtm01-charla`)
   - Para conversaciones off-topic
   - Permisos de lectura y escritura

### Permisos Automáticos

- **Rol de la comisión**: Acceso a todos los canales
- **Profesores**: Permisos de moderación en todos los canales
- **Staff**: Acceso completo a todas las comisiones

### Ver Comisiones Existentes

```bash
/listar comisiones
```

## ✅ Sistema de Verificación

### Configurar Verificación

```bash
/configuracion verificacion canal:#verificacion rol-verificado:@Verificado activar:true
```

**Parámetros:**
- `canal`: Canal donde aparecerá el mensaje de verificación
- `rol-verificado`: Rol que se asigna al verificar
- `activar`: true/false para habilitar/deshabilitar

### Enviar Mensaje de Verificación

```bash
/enviar-verificacion
```

### Verificar Estado del Sistema

```bash
/estado verificacion
```

## ⏰ Sistema de Recordatorios

### Crear Recordatorios

```bash
/recordatorio crear curso:MB fecha-hora:"2024-03-15 14:30" canal:#mbtm01 descripcion:"Clase de Flexbox y CSS Grid"
```

**Parámetros:**
- `curso`: Código del curso (MB, JS, PY, etc.)
- `fecha-hora`: Formato YYYY-MM-DD HH:MM
- `canal`: Canal donde se enviará el recordatorio
- `descripcion`: Descripción de la clase o actividad

### Gestionar Recordatorios

```bash
# Ver todos los recordatorios
/recordatorio listar

# Ver recordatorios de un curso específico
/recordatorio listar curso:MB

# Eliminar un recordatorio
/recordatorio borrar id:123
```

### Características de los Recordatorios

- **Menciones automáticas**: Menciona al rol del curso si existe
- **Emojis por curso**: Cada curso tiene su emoji distintivo
- **Envío automático**: Se envía exactamente en la hora programada
- **Formato claro**: Incluye fecha, hora, curso y descripción

## 🔍 Verificación Completa

### Comandos de Estado

```bash
# Verificar toda la configuración
/estado bot
/estado voz
/estado roles
/estado textos
/estado verificacion

# Verificar datos
/listar cursos
/listar comisiones
/recordatorio listar
```

### Checklist de Configuración

- ✅ Canales básicos configurados
- ✅ Roles de staff definidos
- ✅ Sistema de voz dinámico activo
- ✅ Roles de identidad configurados
- ✅ Textos personalizados definidos
- ✅ Cursos agregados
- ✅ Comisiones creadas
- ✅ Sistema de verificación activo
- ✅ Recordatorios configurados

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Bot no responde a comandos**
   - Verificar permisos del bot
   - Comprobar que el bot esté online

2. **Canales de voz no se crean**
   - Verificar configuración con `/estado voz`
   - Comprobar permisos de gestión de canales

3. **Recordatorios no se envían**
   - Verificar formato de fecha (YYYY-MM-DD HH:MM)
   - Comprobar que el canal existe y es accesible

4. **Comisiones no se crean**
   - Verificar formato del código (ej: MBTM01)
   - Comprobar que el curso existe

### Comandos de Diagnóstico

```bash
# Ver logs del bot
/estado bot

# Verificar permisos
/estado voz
/estado verificacion

# Verificar datos
/listar cursos
/listar comisiones
```

## 📞 Soporte

Si encuentras problemas durante la configuración:

1. Usa el comando `/soporte` para crear un ticket
2. Revisa los logs del bot para errores específicos
3. Verifica que todos los canales y roles mencionados existan
4. Asegúrate de tener permisos de administrador

---

**Nota:** Esta configuración inicial es la base del bot. Puedes personalizar y expandir las funcionalidades según las necesidades específicas de tu comunidad educativa. 