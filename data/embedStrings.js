/**
 * Centralized Embed Strings
 * All embed content for better maintainability and localization
 */

const embedStrings = {
    // Welcome/Community Embeds
    welcome: {
        title: '📌 ¡Bienvenide a la comunidad de cursos de desarrollo web!',
        description: "🌐 ✨ Aprender desde el cariño, compartir desde la experiencia.\n\n" +
                    "¡Hola! Qué lindo que estés acá. Este espacio está pensado para que podamos aprender juntes sobre desarrollo web en un entorno seguro, amigable y horizontal.\n" +
                    "Ya seas tu primer `<div>` o ya estés combatiendo bugs en producción, este servidor es para vos 💜",
        fields: {
            howToStart: {
                name: '🛠 ¿Cómo empezar?',
                value: '• Inscribite en el formulario si todavía no lo hiciste → `/inscripciones`\n' +
                       '• Inscribite usando el comando `/anotarse` para que el bot te asigne tu rol automáticamente.\n' +
                       '• Una vez tengas tu rol, vas a ver el canal de tu comisión y todo el material del curso 📚\n' +
                       '• Leé las reglas, saludá si querés, y sentite libre de participar a tu ritmo 🧃'
            },
            rules: {
                name: '📜 Reglas de convivencia',
                value: '• Respetá los tiempos, emociones y procesos de les demás.\n' +
                       '• No se permite discriminación, violencia o comentarios fuera de lugar.\n' +
                       '• Evitá el spam o desviar el foco de los canales temáticos.\n' +
                       '• Si algo te incomoda, hablalo con el equipo o escribí por privado a un administrador.'
            },
            importantLinks: {
                name: '📎 Links importantes',
                value: () => 
                    `• **Formulario de inscripción:** Usa \`/inscripciones\`\n` +
                    `• **Material de clases:** Usa \`/material\`\n` +
                    `• **Soporte:** Usa \`/soporte\` para ayuda`
            }
        },
        footer: '🌟 ¡Gracias por sumarte! Acá valoramos el aprendizaje lento, la empatía y el acompañamiento. Nadie nació sabiendo y estamos para crecer juntes 🌱'
    },



    // Rules and Guidelines Embeds
    rules: {
        title: '📋 Normas y Directrices de la Comunidad',
        description: '¡Te damos la bienvenida a nuestra comunidad educativa! Por favor, lee y sigue estas directrices para asegurar un ambiente de aprendizaje positivo para todos.',
        fields: {
            respect: {
                name: '🤝 1. Respeto y Amabilidad',
                value: '• Trata a todos los miembros con respeto y amabilidad\n' +
                       '• No se permite el acoso, la discriminación ni el discurso de odio\n' +
                       '• Sé paciente con los principiantes, todos empezamos en algún punto\n' +
                       '• Usa críticas constructivas, no comentarios destructivos'
            },
            communication: {
                name: '💬 2. Directrices de Comunicación',
                value: '• Mantén las discusiones relevantes al tema del canal\n' +
                       '• Usa los canales apropiados para diferentes tipos de contenido\n' +
                       '• No se permite el spam, la autopromoción excesiva ni la publicidad\n' +
                       '• Usa hilos para discusiones extensas'
            },
            learning: {
                name: '📚 3. Ambiente de Aprendizaje',
                value: '• Haz preguntas libremente, ninguna pregunta es demasiado básica\n' +
                       '• Comparte recursos y ayuda a otros cuando puedas\n' +
                       '• Da crédito al compartir código o recursos de otros\n' +
                       '• Enfócate en aprender y crecer juntos'
            },
            privacy: {
                name: '🔒 4. Privacidad y Seguridad',
                value: '• No compartas información personal públicamente\n' +
                       '• No se permite el doxxing ni compartir información privada de otros\n' +
                       '• Reporta comportamientos inapropiados a los administradores\n' +
                       '• Ten cuidado con lo que compartes en capturas de pantalla'
            },
            content: {
                name: '⚡ 5. Directrices de Contenido',
                value: '• Mantén el contenido apropiado para todas las edades (13+)\n' +
                       '• Usa advertencias de contenido (CW) para temas sensibles\n' +
                       '• No se permite contenido NSFW ni discusiones sobre actividades ilegales\n' +
                       '• Comparte contenido educativo que beneficie a la comunidad'
            },
            technical: {
                name: '🛠️ 6. Etiqueta Técnica',
                value: '• Formatea el código correctamente usando bloques de código\n' +
                       '• Proporciona contexto al pedir ayuda\n' +
                       '• No preguntes si puedes preguntar, simplemente haz tu pregunta\n' +
                       '• Busca en mensajes anteriores antes de hacer preguntas duplicadas'
            }
        },
        footer: 'Bot Educativo • Normas de la Comunidad'
    },

    consequences: {
        title: '⚖️ Consecuencias y Moderación',
        description: 'Creemos en una moderación justa y transparente. Esto es lo que sucede cuando se rompen las normas:',
        fields: {
            warnings: {
                name: '📝 Sistema de Advertencias',
                value: '**Primera Infracción:** Recordatorio amistoso o advertencia\n' +
                       '**Segunda Infracción:** Advertencia formal con explicación\n' +
                       '**Tercera Infracción:** Silencio temporal o restricciones'
            },
            serious: {
                name: '⏰ Infracciones Graves',
                value: '**Acoso:** Silencio inmediato (1-7 días)\n' +
                       '**Spam/Publicidad:** Advertencia → Silencio → Expulsión\n' +
                       '**Discurso de Odio:** Expulsión o baneo inmediato'
            },
            appeal: {
                name: '🔄 Proceso de Apelación',
                value: '• Contacta a los administradores por MD\n' +
                       '• Explica tu perspectiva respetuosamente\n' +
                       '• Lo revisaremos y responderemos en 48 horas\n' +
                       '• Todos merecen una audiencia justa'
            }
        },
        footer: '¿Preguntas sobre las normas? ¡Consulta a un administrador!'
    },

    helpfulCommands: {
        title: '🤖 Comandos Útiles',
        description: 'Usa estos comandos para aprovechar al máximo nuestra comunidad:',
        fields: {
            gettingStarted: {
                name: '🎭 Para Empezar',
                value: '`/presentarme` - Guía de presentación\n' +
                       '`/mi-curso` - Ve tus cursos inscritos'
            },
            learning: {
                name: '📚 Recursos de Aprendizaje',
                value: '`/material [curso]` - Obtén materiales del curso'
            },
            community: {
                name: '🔧 Herramientas de la Comunidad',
                value: '`/feedback` - Comparte tu opinión'
            }
        }
    },

    // Introduction Guide Embeds
    introduction: {
        title: '👋 ¡Bienvenido/a! Te ayudamos a presentarte',
        description: '¡Las grandes comunidades comienzan con grandes presentaciones! Aquí tienes una guía para ayudarte a conectar con otros estudiantes.',
        fields: {
            template: {
                name: '🎯 Plantilla de Presentación',
                value: '```' +
                       '👋 ¡Hola a todos! Soy [Tu Nombre]\n\n' +
                       '📍 Ubicación: [Ciudad, País/Zona Horaria]\n' +
                       '💼 Trasfondo: [Rol actual/estudios]\n' +
                       '📚 Aprendiendo: [Qué cursos estás tomando]\n' +
                       '🎯 Metas: [Qué quieres lograr]\n' +
                       '🎮 Hobbies: [Datos curiosos sobre ti]\n' +
                       '❓ Preguntas: [Con qué te gustaría recibir ayuda]' +
                       '```'
            },
            tips: {
                name: '✨ Consejos Pro',
                value: '• Sé auténtico/a y genuino/a\n' +
                       '• Comparte tus metas de aprendizaje\n' +
                       '• Haz preguntas, ¡a todos les encanta ayudar!\n' +
                       '• Menciona tus lenguajes de programación favoritos\n' +
                       '• No tengas vergüenza de ser principiante'
            },
            greatIntro: {
                name: '🌟 Qué Hace una Gran Presentación',
                value: '• Tu nivel de habilidad actual\n' +
                       '• Proyectos en los que estás trabajando\n' +
                       '• Qué te emociona de la programación\n' +
                       '• Cómo te gusta aprender mejor\n' +
                       '• Tu disponibilidad para grupos de estudio'
            }
        },
        footer: 'Bot Educativo • Guía de la Comunidad'
    },

    introExample: {
        title: '📝 Ejemplo de Presentación',
        description: '👋 ¡Hola, gente! Soy Valentina\n\n' +
                    '📍 **Ubicación:** Buenos Aires, Argentina (GMT-3)\n' +
                    '💼 **Trasfondo:** Soy estudiante de Diseño Gráfico y quiero meterme en el mundo del desarrollo web.\n' +
                    '📚 **Aprendiendo:** Actualmente estoy en **Maquetado Web Nivel I** y mi objetivo es seguir con **Maquetado Web Nivel II** y **Tailwind CSS**.\n' +
                    '🎯 **Metas:** Mi meta es poder maquetar mis propios diseños y armar un portfolio sólido para buscar mi primer trabajo como desarrolladora front-end.\n' +
                    '🎮 **Hobbies:** Me gusta mucho tomar mate, mirar series y juntarme a jugar al fútbol los findes.\n' +
                    '❓ **Preguntas:** ¡Busco gente para practicar Flexbox y me vendrían bien consejos sobre cómo organizar mi CSS!\n\n' +
                    '**¡Muy contenta de aprender con todos ustedes! ✨**',
        footer: 'Esto es solo un ejemplo, ¡hazlo tuyo!'
    },

    // Course Registration Embeds
    registration: {
        title: "📝 Cómo inscribirse a los cursos",
        description: "Para sumarte a los cursos, primero tenés que completar el formulario de inscripción. ¡Es rápido y sencillo!",
        fields: {
            steps: {
                name: "📍 Paso a paso",
                value: "1. Entrá a la web: **[leivur-cursos.netlify.app](https://leivur-cursos.netlify.app)**\n2. Llená el formulario con tus datos y elegí el curso y la comisión que querés.\n3. Aceptá las condiciones y enviá el formulario.\n4. ¡Listo! Ya podés verificarte en el servidor."
            },
            afterRegistration: {
                name: "🤖 ¿Y después?",
                value: "Cuando termines el formulario, usá el comando `/anotarse` acá en el servidor.\nEl bot va a buscar tu Discord en la base de datos y te va a asignar el rol correcto según el curso y comisión."
            }
        },
        footer: "Este paso es obligatorio para acceder a las clases y canales del curso ✨"
    },

    // User Course Information Embeds
    userCourses: {
        title: (displayName) => `📚 Inscripción de Cursos de ${displayName}`,
        noCourses: {
            description: '❌ ¡Aún no estás inscrito/a en ningún curso!',
            fields: {
                getStarted: {
                    name: '🎯 Para Empezar',
                    value: '¡Usa `/anotarse` para seleccionar tus cursos y unirte a la comunidad de aprendizaje!'
                }
            }
        },
        withCourses: {
            description: (count) => `✅ Estás inscrito/a en **${count}** curso${count > 1 ? 's' : ''}`,
            fields: {
                quickAccess: {
                    name: '📖 Acceso Rápido',
                    value: 'Usa `/material curso:[curso]` para obtener los materiales del curso'
                },
                community: {
                    name: '👥 Comunidad',
                    value: 'Revisa los canales específicos del curso para discusiones'
                },
                progress: {
                    name: '🎓 Progreso',
                    value: 'Sigue tu aprendizaje en los canales dedicados del curso'
                }
            }
        },
        otherRoles: {
            name: '🏷️ Otros Roles'
        },
        memberStats: {
            name: '📊 Estadísticas del Miembro',
            value: (joinedAt, roleCount) => `**Se unió al servidor:** ${joinedAt}\n**Roles Totales:** ${roleCount}`
        },
        footer: 'Bot Educativo • Gestión de Cursos'
    },

    // Feedback Embeds
    feedback: {
        title: '📝 ¡Tu Opinión es Importante!',
        description: 'Valoramos mucho tus comentarios para seguir mejorando nuestra comunidad educativa. Por favor, tómate un momento para compartir tus ideas, sugerencias o reportar cualquier problema.',
        fields: {
            howItHelps: {
                name: '¿Cómo Ayuda tu Feedback?',
                value: '• Mejorar los cursos y materiales.\n• Añadir nuevas funcionalidades al bot.\n• Hacer de la comunidad un lugar más acogedor.\n• Resolver problemas que quizás no hemos visto.'
            }
        },
        footer: 'Gracias por ayudarnos a crecer'
    },

    // Support Ticket Embeds
    supportTicket: {
        title: '🎟️ Nuevo Ticket de Soporte',
        fields: {
            user: 'Usuario',
            category: 'Categoría',
            created: 'Creado',
            description: 'Descripción',
            status: 'Estado'
        },
        statusOpen: 'Abierto',
        footerPrefix: 'Ticket ID: '
    },

    // Moderation Embeds
    moderation: {
        userReport: {
            title: '🚨 Nuevo Reporte de Usuario',
            fields: {
                reportedUser: 'Usuario Reportado',
                reportedBy: 'Reportado por',
                reason: 'Motivo'
            }
        },
        userKicked: {
            title: '👢 Usuario Expulsado',
            dmTitle: (guildName) => `Has sido expulsado de ${guildName}`,
            fields: {
                user: 'Usuario',
                reason: 'Motivo',
                moderator: 'Moderador'
            }
        },
        userMuted: {
            title: '🔇 Usuario Silenciado',
            fields: {
                user: 'Usuario',
                duration: 'Duración',
                reason: 'Motivo',
                moderator: 'Moderador'
            }
        },
        commandError: {
            title: '🚨 Error de Comando',
            fields: {
                command: 'Comando',
                user: 'Usuario',
                guild: 'Servidor',
                channel: 'Canal',
                error: 'Error'
            }
        },
        criticalError: {
            title: '🚨 Error Crítico Detectado',
            fields: {
                type: 'Tipo',
                code: 'Código',
                user: 'Usuario',
                command: 'Comando',
                channel: 'Canal',
                timestamp: 'Timestamp',
                error: 'Error'
            }
        }
    },

    // Voice/Music Embeds
    dynamicVoice: {
        configSuccess: {
            title: '✅ Configuración de Canales Dinámicos',
            fields: {
                triggerChannel: 'Canal Activador',
                nameTemplate: 'Plantilla de Nombre',
                userLimit: 'Límite de Usuarios'
            },
            footer: 'Los canales se crearán automáticamente cuando alguien se una al canal activador'
        },
        status: {
            title: '📊 Estado de Canales Dinámicos',
            fields: {
                triggerChannel: 'Canal Activador',
                nameTemplate: 'Plantilla de Nombre',
                userLimit: 'Límite de Usuarios',
                activeChannels: 'Canales Activos'
            },
            footer: 'Configuración actual del sistema de canales dinámicos'
        }
    },

    // Verification System Embeds
    verification: {
        defaultTitle: '🔐 Verificación de Miembro',
        defaultDescription: '¡Bienvenido/a a nuestra comunidad educativa! Para acceder a todos los canales y participar en las actividades, necesitas verificarte como miembro.',
        fields: {
            instructions: {
                name: '📋 Instrucciones',
                value: '1. Lee las normas de la comunidad\n2. Haz clic en el botón "Verificarme" de abajo\n3. ¡Listo! Tendrás acceso completo al servidor'
            }
        },
        buttonText: 'Verificarme',
        footer: 'Bot Educativo • Sistema de Verificación',
        welcomeDM: {
            title: (guildName) => `¡Bienvenido/a a ${guildName}! 🎉`,
            description: (channel) => `Hola! Te damos la bienvenida a nuestra comunidad educativa.\n\nPara comenzar a participar, necesitas verificarte en ${channel}.`,
            fields: {
                nextSteps: {
                    name: '🚀 Próximos Pasos',
                    value: '• Ve al canal de verificación\n• Lee las instrucciones\n• Haz clic en "Verificarme"\n• ¡Disfruta de la comunidad!'
                }
            },
            footer: 'Gracias por unirte a nosotros'
        },
        success: {
            title: '✅ ¡Verificación Completada!',
            description: (roleName) => `¡Felicidades! Has sido verificado/a exitosamente y ahora tienes el rol **${roleName}**.`,
            fields: {
                access: {
                    name: '🎯 Acceso Completo',
                    value: 'Ahora puedes:\n• Ver todos los canales\n• Participar en discusiones\n• Acceder a materiales de curso\n• Unirte a canales de voz'
                },
                nextSteps: {
                    name: '📚 Siguientes Pasos',
                    value: '• Usa `/mi-curso` para ver tus cursos\n• Usa `/material` para acceder a recursos\n• Preséntate en el canal correspondiente\n• ¡Comienza a aprender!'
                }
            },
            footer: '¡Bienvenido/a a la comunidad!'
        }
    },

    // Teacher Information Embeds
    teacher: {
        fields: {
            specialties: {
                name: '🎯 Especialidades'
            },
            experience: {
                name: '⏰ Experiencia'
            },
            courses: {
                name: '📚 Cursos que Imparte'
            },
            contact: {
                name: '📞 Contacto'
            },
            funFact: {
                name: '🎉 Dato Curioso'
            }
        },
        footer: 'Bot Educativo • Información de Profesores'
    },



    // Commission System Embeds
    commission: {
        joined: {
            title: '✅ Te has unido a la comisión exitosamente',
            description: (code, courseName) => `¡Bienvenido/a a la comisión **${code}**!\n\nYa tienes acceso a todos los recursos del curso **${courseName}**.`,
            fields: {
                details: {
                    name: '📋 Detalles de la Comisión',
                    value: (courseName, number) => 
                        `**Curso:** ${courseName}\n` +
                        `**Número:** ${number}`
                },
                access: {
                    name: '🎯 Acceso Otorgado',
                    value: (code) => 
                        `• Canal de texto: #${code}\n` +
                        `• Canal de voz: 🔊 ${code.toUpperCase()}\n` +
                        `• Materiales del curso\n` +
                        `• Comunicación con compañeros`
                }
            },
            footer: 'Bot Educativo • Sistema de Comisiones'
        },
        dmConfirmation: {
            title: '🎉 ¡Confirmación de Inscripción!',
            description: (code, guildName) => `Te has unido exitosamente a la comisión **${code}** en **${guildName}**.`,
            fields: {
                nextSteps: {
                    name: '📚 Próximos Pasos',
                    value: '• Revisa el canal de tu comisión para materiales\n' +
                           '• Preséntate con tus compañeros\n' +
                           '• Participa en las actividades del curso\n' +
                           '• No dudes en hacer preguntas'
                }
            },
            footer: '¡Que tengas un excelente aprendizaje!'
        },
        welcome: {
            title: (code) => `🎓 Bienvenidos a la Comisión ${code}`,
            description: (courseName) => `¡Hola a todos! Este es el canal oficial de la comisión para el curso **${courseName}**.`,
            fields: {
                details: {
                    name: '📋 Información de la Comisión',
                    value: (courseName, number) => 
                        `**📚 Curso:** ${courseName}\n` +
                        `**🔢 Número:** ${number}`
                },
                instructions: {
                    name: '📖 Instrucciones',
                    value: '• Usa este canal para comunicarte con tus compañeros\n' +
                           '• Comparte dudas, recursos y avances\n' +
                           '• Mantén un ambiente respetuoso y colaborativo\n' +
                           '• Usa el canal de voz para sesiones de estudio grupales'
                }
            },
            footer: '¡Que tengan un excelente curso!'
        },
        created: {
            title: '✅ Comisión Creada Exitosamente',
            description: (code) => `La comisión **${code}** ha sido creada con todos sus recursos.`,
            fields: {
                details: {
                    name: '📋 Detalles de la Comisión',
                    value: (courseName, number) => 
                        `**Curso:** ${courseName}\n` +
                        `**Número:** ${number}`
                },
                resources: {
                    name: '🛠️ Recursos Creados',
                    value: (role, textChannel, voiceChannel) => 
                        `**Rol:** ${role}\n` +
                        `**Canal de texto:** ${textChannel}\n` +
                        `**Canal de voz:** ${voiceChannel}`
                }
            },
            footer: 'Los estudiantes pueden unirse usando /anotarse'
        },
        list: {
            title: '📚 Lista de Comisiones',
            titleFiltered: (course) => `📚 Comisiones del Curso ${course}`,
            description: (count) => `Se encontraron **${count}** comisión${count !== 1 ? 'es' : ''} registrada${count !== 1 ? 's' : ''}.`,
            fields: {
                summary: {
                    name: '📊 Resumen',
                    value: (commissions, courses, members) => 
                        `**Total de comisiones:** ${commissions}\n` +
                        `**Cursos activos:** ${courses}\n` +
                        `**Estudiantes inscritos:** ${members}`
                }
            },
            noCommissions: {
                title: '📚 No hay comisiones registradas',
                description: 'Aún no se han creado comisiones en este servidor.',
                descriptionFiltered: (course) => `No se encontraron comisiones para el curso **${course}**.`,
                fields: {
                    howToCreate: {
                        name: '🛠️ Cómo crear una comisión',
                        value: '1. Primero agrega un curso: `/agregar-curso`\n' +
                               '2. Luego crea la comisión: `/crear-comision` (formato: CURSO-NÚMERO)\n' +
                               '3. Los estudiantes se unen con: `/anotarse`'
                    }
                },
                footer: 'Sistema de Comisiones'
            },
            footer: 'Bot Educativo • Sistema de Comisiones'
        }
    },

    // Course Management Embeds
    course: {
        added: {
            title: '✅ Curso Agregado Exitosamente',
            description: (code, name) => `El curso **${name}** ha sido registrado con el código **${code}**.`,
            fields: {
                details: {
                    name: '📋 Detalles del Curso',
                    value: (code, name) => `**Código:** ${code}\n**Nombre:** ${name}`
                },
                usage: {
                    name: '🛠️ Uso',
                    value: (code) => `Ahora puedes crear comisiones usando el formato **${code}-NÚMERO**\n\nEjemplo: \`/crear-comision ${code}-01\``
                }
            },
            footer: 'Bot Educativo • Gestión de Cursos'
        },
        list: {
            title: '📚 Lista de Cursos Registrados',
            description: (count) => `Se encontraron **${count}** curso${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}.`,
            fields: {
                courses: {
                    name: '📖 Cursos Disponibles'
                },
                summary: {
                    name: '📊 Resumen',
                    value: (courses, commissions) => 
                        `**Total de cursos:** ${courses}\n` +
                        `**Total de comisiones:** ${commissions}`
                }
            },
            noCourses: {
                title: '📚 No hay cursos registrados',
                description: 'Aún no se han registrado cursos en este servidor.',
                fields: {
                    howToAdd: {
                        name: '➕ Cómo agregar un curso',
                        value: 'Usa el comando `/agregar-curso` para registrar un nuevo curso.\n\nEjemplo: `/agregar-curso codigo:UX nombre:"Diseño UX Básico"`'
                    }
                },
                footer: 'Sistema de Cursos'
            },
            footer: 'Bot Educativo • Gestión de Cursos'
        }
    },

    // Reminder System Embeds
    reminders: {
        reminderCreated: {
            title: '✅ Recordatorio Creado Exitosamente',
            description: (reminderId) => `El recordatorio ha sido programado correctamente.\n\n**ID del recordatorio:** \`${reminderId}\``,
            fields: {
                details: {
                    name: '📋 Detalles del Recordatorio'
                },
                notification: {
                    name: '🔔 Notificaciones'
                },
                description: {
                    name: '📝 Descripción'
                }
            },
            footer: 'El recordatorio se enviará automáticamente'
        },
        reminderDeleted: {
            title: '🗑️ Recordatorio Eliminado',
            description: (reminderId) => `El recordatorio ha sido eliminado.\n\n**ID del recordatorio:** \`${reminderId}\``,
            fields: {
                deletedReminder: {
                    name: '📋 Recordatorio Eliminado'
                }
            },
            footer: 'El recordatorio automático ha sido cancelado'
        },
        remindersList: {
            title: '⏰ Lista de Recordatorios Programados',
            titleFiltered: (course) => `⏰ Recordatorios del Curso ${course}`,
            description: (count) => `Se encontraron **${count}** recordatorio${count !== 1 ? 's' : ''} programado${count !== 1 ? 's' : ''}.`,
            noReminders: {
                title: '⏰ No hay recordatorios programados',
                description: 'No se encontraron recordatorios programados.',
                descriptionFiltered: (course) => `No se encontraron recordatorios para el curso **${course}**.`
            },
            footer: 'Bot Educativo • Sistema de Recordatorios'
        }
    },

    messages: {
        success: {
            welcomeSent: '✅ El mensaje de bienvenida ha sido enviado.',

            rulesSent: '✅ El panel de normas ha sido enviado.',
            introGuideSent: '✅ La guía de presentación ha sido enviada al canal.',
            ticketCreated: (thread) => `✅ ¡Tu ticket de soporte ha sido creado! Por favor, dirígete a ${thread} para continuar.`,
            reportSent: (userTag) => `✅ El reporte para **${userTag}** ha sido enviado correctamente.`,
            userKicked: (userTag) => `✅ **${userTag}** ha sido expulsado del servidor.`,
            userMuted: (userTag, duration) => `✅ **${userTag}** ha sido silenciado por **${duration}**.`,
            roleAdded: (roleName) => `✅ ¡Rol **${roleName}** agregado exitosamente!`,
            roleRemoved: (roleName) => `✅ ¡Rol **${roleName}** removido exitosamente!`,
            ticketClosing: '🔒 El ticket será cerrado y archivado en 5 segundos...',
            connectedToVoice: (channelName) => `✅ Conectado al canal de voz **${channelName}**`,
            disconnectedFromVoice: '✅ Desconectado del canal de voz',
            dynamicChannelCreated: (channelName, userName) => `✅ Canal dinámico **${channelName}** creado para **${userName}**`,
            dynamicChannelDeleted: (channelName) => `🗑️ Canal dinámico **${channelName}** eliminado por inactividad`,

            commissionJoined: (userTag, code) => `✅ **${userTag}** se ha unido a la comisión **${code}**.`,
            commissionCreated: (code) => `✅ Comisión **${code}** creada exitosamente.`,
            courseAdded: (code, name) => `✅ Curso **${name}** (${code}) agregado exitosamente.`,
        },
        errors: {
            supportNotConfigured: '❌ El sistema de soporte no está configurado. Por favor, contacta a un administrador.',
            supportChannelInvalid: '❌ El canal de soporte configurado no es válido. Por favor, contacta a un administrador.',
            feedbackNotConfigured: '❌ La función de feedback no está configurada. Por favor, contacta a un administrador.',
            noStaffPermission: '❌ Solo los administradores pueden usar este comando.',
            userNotFound: '❌ No se pudo encontrar al usuario en este servidor.',
            cannotKickUser: '❌ No puedo expulsar a este usuario. Asegúrate de que mi rol esté por encima del rol del usuario y que no sea el dueño del servidor.',
            cannotMuteAdmin: '❌ No puedes silenciar a un administrador.',
            invalidTimeFormat: '❌ Formato de tiempo inválido o excede los 28 días. Usa `s`, `m`, `h`, o `d` (e.g., `10m`, `1h`, `7d`).',
            cannotMuteUser: '❌ Hubo un error al intentar silenciar a este usuario. Asegúrate de que mi rol esté por encima del rol del usuario.',
            noPermission: '❌ No tienes permiso para realizar esta acción.',
            invalidAction: '❌ Esta acción no se puede realizar aquí.',
            ticketArchiveError: '❌ Hubo un error al archivar el ticket.',
            roleNotConfigured: (roleName) => `❌ El rol "${roleName}" no está configurado. Por favor contacta a un administrador.`,
            roleNotFound: (roleName) => `❌ Rol "${roleName}" no encontrado. Por favor contacta a un administrador.`,
            noManageRolesPermission: '❌ El bot no tiene permisos para gestionar roles.',
            roleHierarchyError: '❌ No puedo gestionar este rol debido a la jerarquía de roles.',
            roleManagementError: 'Error al modificar el rol. Por favor contacta a un administrador.',
            courseNotFound: '❌ Curso no encontrado. Por favor, selecciona un curso válido.',
            moderationChannelNotConfigured: '❌ El canal de moderación no está configurado. Contacta a un administrador.',
            moderationChannelNotFound: '❌ No se pudo encontrar el canal de moderación. Contacta a un administrador.',
            reportSendError: '❌ Hubo un error al enviar el reporte al canal de moderación.',
            kickError: '❌ Hubo un error al intentar expulsar a este usuario.',
            ticketCreateError: '❌ Hubo un error al crear tu ticket. Por favor, inténtalo de nuevo más tarde.',
            unknownButtonInteraction: '❌ Interacción de botón desconocida.',
            selectMenuInDevelopment: '🚧 Funcionalidad de menú de selección en desarrollo.',
            modalInDevelopment: '🚧 Funcionalidad de modal en desarrollo.',
            invalidRoleSelection: '❌ Selección de rol inválida.',
            notInVoiceChannel: '❌ Debes estar en un canal de voz para usar este comando.',
            noVoicePermissions: '❌ No tengo permisos para conectarme o hablar en tu canal de voz.',
            notConnectedToVoice: '❌ No estoy conectado a ningún canal de voz.',
            voiceConnectionError: '❌ Error al conectar al canal de voz. Inténtalo de nuevo.',
            voiceDisconnectionError: '❌ Error al desconectar del canal de voz.',
            noDynamicVoicePermissions: '❌ El bot necesita permisos de "Gestionar Canales" y "Mover Miembros" para crear canales dinámicos.',
            noTriggerChannelPermissions: '❌ El bot no tiene permisos para ver o conectarse al canal seleccionado.',
            dynamicVoiceConfigError: '❌ Error al configurar los canales dinámicos. Inténtalo de nuevo.',
            dynamicChannelCreateError: '❌ Error al crear el canal dinámico.',
            dynamicChannelDeleteError: '❌ Error al eliminar el canal dinámico.',
            noStaffPermission: '❌ Solo los administradores pueden usar este comando.',
            configurationError: '❌ Error al actualizar la configuración. Inténtalo de nuevo.',
            teacherNotFound: '❌ Profesor no encontrado. Usa el autocompletado para ver los profesores disponibles.',
            verificationNotEnabled: '❌ El sistema de verificación no está activado.',
            verificationNotConfigured: '❌ El sistema de verificación no está configurado completamente. Configura el canal y rol primero.',
            verificationChannelNotFound: '❌ El canal de verificación configurado no existe.',
            verificationRoleNotFound: '❌ El rol de verificación configurado no existe.',
            verificationSendError: '❌ Error al enviar el mensaje de verificación.',
            alreadyVerified: '❌ Ya estás verificado/a.',
            verificationError: '❌ Error durante el proceso de verificación. Contacta a un administrador.',

            commissionNotFound: (code) => `❌ La comisión **${code}** no existe. Verifica el código e inténtalo de nuevo.`,
            commissionRoleNotFound: (code) => `❌ El rol de la comisión **${code}** no fue encontrado. Contacta a un administrador.`,
            alreadyInCommission: (code) => `❌ Ya estás inscrito/a en la comisión **${code}**.`,
            commissionJoinError: '❌ Error al unirse a la comisión. Inténtalo de nuevo más tarde.',
            commissionAlreadyExists: (code) => `❌ La comisión **${code}** ya existe.`,
            courseNotRegistered: (code) => `❌ El curso **${code}** no está registrado. Usa \`/agregar-curso\` primero.`,
            commissionCreateError: '❌ Error al crear la comisión. Inténtalo de nuevo más tarde.',
            invalidCourseCode: '❌ El código del curso debe contener solo letras mayúsculas.',
            courseAlreadyExists: (code, name) => `❌ El curso **${code}** ya existe con el nombre "${name}".`,
            courseAddError: '❌ Error al agregar el curso. Inténtalo de nuevo más tarde.',
            commissionListError: '❌ Error al obtener la lista de comisiones.',
            courseListError: '❌ Error al obtener la lista de cursos.',
            invalidDateTimeFormat: '❌ Formato de fecha y hora inválido. Usa el formato: YYYY-MM-DD HH:MM (ej: 2024-03-15 14:30)',
            pastDateTime: '❌ La fecha y hora debe ser en el futuro.',



            reminderError: '❌ Error al procesar el recordatorio. Inténtalo de nuevo más tarde.',
            reminderNotFound: (reminderId) => `❌ No se encontró el recordatorio con ID: \`${reminderId}\``
        },
        info: {

            ticketWelcome: (supportRoleId, user) => `¡Hola <@&${supportRoleId}> y ${user}! Se ha creado un nuevo ticket.`,
            alreadyConnectedToChannel: '✅ Ya estoy conectado a este canal de voz.',
            noDynamicVoiceConfig: '❌ No hay configuración de canales dinámicos. Usa `/configuracion voz configurar` para configurar el sistema.',
            dynamicVoiceHelp: '💡 Únete al canal activador para crear automáticamente tu propio canal de voz temporal.',
            verificationSuccess: (roleName) => `✅ ¡Verificación completada! Ahora tienes el rol **${roleName}**.`
        },
        verification: {
            verificationSent: (channel) => `✅ Mensaje de verificación enviado a ${channel}.`,
            userVerified: (userTag, roleName) => `✅ **${userTag}** ha sido verificado y recibió el rol **${roleName}**.`
        }
    },

    // Colors (hex values)
    colors: {
        primary: 0x5865F2,
        success: 0x00FF00,
        warning: 0xFFD700,
        error: 0xFF0000,
        info: 0x7289DA,
        maquetado1: 0xE44D26,
        maquetado2: 0x1572B6,
        tailwind: 0x38B2AC,
        green: 0x77dd77,
        red: 0xFF6B6B,
        orange: 0xFF6B6B
    }
};

module.exports = embedStrings;