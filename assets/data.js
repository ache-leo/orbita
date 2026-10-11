/* ==========================================================================
   Órbita — Contenido del recorrido
   Orientación basada en instrumentos validados.

   Tres formatos, todos con respaldo en la literatura:
     · escena    -> situación cotidiana + frecuencia/grado (evoca el recuerdo
                    concreto; el ASRS usa horizonte temporal y frecuencia).
     · historia  -> lectura de una situación social con opciones graduadas
                    (lógica de las "Strange Stories" y de las tareas de
                    cognición social).
     · tarea     -> micro-tarea de desempeño: go/no-go sostenido, memoria de
                    trabajo visoespacial, decisión ortográfica, deleción de
                    fonema y decisión léxica.

   Las viñetas son redacción propia en español; no son reproducciones
   literales de los instrumentos citados al final.
   ========================================================================== */

/* Escalas (5 puntos, misma métrica para todas las variantes) */
const ESCALAS = {
  freq:  ["Nunca", "Casi nunca", "A veces", "Seguido", "Siempre"],
  grado: ["Nada", "Poco", "Más o menos", "Bastante", "Mucho"]
};

const BLOQUES = [
  /* ======================================================================
     TRAMO 1 — Foco y arranque  (ASRS / SNAP-IV)
     ====================================================================== */
  {
    id: "atencion",
    nombre: "Atención e impulso",
    corto: "Atención",
    clin: "TDAH",
    inst: "ASRS / SNAP-IV",
    emoji: "⚡",
    color: "#FF9E5E",
    parada: {
      titulo: "Foco y arranque",
      texto: "Nueve escenas del día a día y dos juegos cortos. Para las escenas, pensá en el último mes.",
      nota: "Uno de los juegos dura menos de un minuto y necesita que estés atento/a."
    },
    items: [
      { id:"a1", tipo:"escena", escala:"freq", escapa:true,
        esc:"Tuviste toda la semana para algo que hay que entregar. Ya hiciste lo más pesado: buscaste la información y armaste el esquema. Es domingo a la noche y sigue ahí, sin cerrar.",
        t:"¿Cuántas veces te pasó en el último mes?" },

      { id:"a2", tipo:"escena", escala:"freq", escapa:true,
        esc:"Algo que tenés que hacer tiene tres partes y una fecha de entrega. Abrís lo que estabas haciendo, leés lo que pide y no sabés por dónde arrancar.",
        t:"¿Cuántas veces te pasó en el último mes?" },

      { id:"a3", tipo:"escena", escala:"freq", par:"olvido",
        esc:"Habías quedado en pasar por lo de un amigo a las 6 y llevarle una cosa. Son las 7 y te acordás de golpe.",
        t:"¿Cuántas veces te pasó en el último mes?" },

      { id:"a4", tipo:"tarea", juego:"gonogo",
        titulo: "La señal",
        para:"Va a aparecer el panda en el medio de la pantalla. Tocá lo más rápido que puedas cada vez que aparezca. Pero si aparece el panda azul, no toques nada.",
        detalle:"Cuarenta apariciones, menos de un minuto. Al principio van algunas de prueba.",
        cta:"Estoy listo/a" },

      { id:"a5", tipo:"escena", escala:"freq", escapa:true,
        esc:"Tenés que leer veinte páginas para mañana. Agarrás el celular «un ratito» y cuando mirás la hora se fueron dos horas.",
        t:"¿Cuántas veces te pasó en el último mes?" },

      { id:"a6", tipo:"escena", escala:"freq", par:"inquietud", escapa:true,
        esc:"Estás en algo que dura ochenta minutos y hay que quedarse en el lugar: una clase, una reunión, un viaje. A los quince ya te acomodaste mil veces: movés la pierna, girás el lápiz, cambiás de postura.",
        t:"¿Cuántas veces te pasa?" },

      { id:"a7", tipo:"escena", escala:"freq", par:"inquietud",
        esc:"Es un día libre y no tenés nada que hacer. Igual sentís que necesitás levantarte, caminar, moverte.",
        t:"¿Cuántas veces te pasa?" },

      { id:"a8", tipo:"escena", escala:"freq",
        esc:"Estás haciendo algo que necesita que le prestes atención, con el celular al lado. Llega un mensaje, levantás la vista, y volver a lo que estabas cuesta.",
        t:"¿Cuántas veces te pasa?" },

      { id:"a9", tipo:"escena", escala:"freq", par:"olvido",
        esc:"Salís de casa y a mitad de camino te das cuenta de que te olvidaste algo: la llave, la billetera, el celu.",
        t:"¿Cuántas veces te pasa?" },

      { id:"a10", tipo:"escena", escala:"freq",
        esc:"Un amigo te está contando algo largo. En el medio te das cuenta de que ya lo cortaste para contar lo tuyo.",
        t:"¿Cuántas veces te pasa?" },

      { id:"a11", tipo:"tarea", juego:"luces",
        titulo: "Las luces de la nave",
        para:"Se van a encender las luces del panel, una por una. Cuando terminen, repetí la misma secuencia tocándolas en el mismo orden. Cada ronda tiene una luz más.",
        detalle:"Prestá atención al orden, no a la posición: las luces se apagan todas juntas.",
        cta:"Empezar" }
    ]
  },

  /* ======================================================================
     TRAMO 2 — Lectura social  (AQ-10 + tareas de cognición social)
     ====================================================================== */
  {
    id: "social",
    nombre: "Mundo social",
    corto: "Social",
    clin: "Espectro autista",
    inst: "AQ-10",
    emoji: "🧩",
    color: "#7FD3FF",
    parada: {
      titulo: "Lectura social",
      texto: "Ocho escenas con gente y cuatro situaciones para interpretar. No hay respuestas obvias: elegí la que más se parezca a lo que te pasa de verdad.",
      nota: "En las cuatro situaciones no importa acertar. Importa qué entendiste en el momento."
    },
    items: [
      { id:"s1", tipo:"escena", escala:"freq",
        esc:"En la cocina de tu casa, en silencio, escuchás el zumbido del tubo de luz. Los demás están ahí y no parecen notarlo.",
        t:"¿Cuántas veces te pasa?" },

      { id:"s2", tipo:"escena", escala:"freq", inv:true,
        esc:"Entrás a un lugar nuevo. Lo primero que registrás es el conjunto, cómo se ve todo junto; los detalles los ves después.",
        t:"¿Cuántas veces te pasa?" },

      { id:"s3", tipo:"escena", escala:"freq", inv:true,
        esc:"Podés escuchar música y hacer otra cosa al mismo tiempo, y las dos te salen bien.",
        t:"¿Cuántas veces te sale?" },

      { id:"s4", tipo:"escena", escala:"freq", inv:true,
        esc:"Estás escribiendo algo y te interrumpen con una pregunta. Volvés a lo que hacías casi enseguida, sin perder el hilo.",
        t:"¿Cuántas veces te pasa?" },

      { id:"s5", tipo:"historia",
        esc:"Llegás al grupo y Sofi te dice, con una sonrisa: «¡Buenísimo, llegaste a horario!». Son las 12:40 y habían quedado a las 12.",
        t:"¿Qué entendiste en ese momento?",
        ops:[
          { t:"Que me estaba cargando con cariño, no hablando en serio.", sig:0 },
          { t:"Que me estaba felicitando de verdad.", sig:1 },
          { t:"Que estaba enojada conmigo.", sig:0.5 },
          { t:"No estaba seguro/a de qué quiso decir.", sig:0.7 }
        ] },

      { id:"s6", tipo:"escena", escala:"grado",
        esc:"Hay un tema que te encanta: modelos, años, nombres, datos. Podés pasar horas ordenando esa información.",
        t:"¿Cuánto te pasa?" },

      { id:"s7", tipo:"historia",
        esc:"Estás hablando con alguien y esa persona aprieta los labios, mira para otro lado y se queda callada.",
        t:"¿Qué te dice esa cara?",
        ops:[
          { t:"Que algo le molestó o no le gustó lo que dije.", sig:0 },
          { t:"Que está pensando en otra cosa.", sig:1 },
          { t:"Que está cansada.", sig:0.5 },
          { t:"Nada en particular: no suelo fijarme en eso.", sig:1 }
        ] },

      { id:"s8", tipo:"escena", escala:"freq", inv:true,
        esc:"Estás contando algo que te encanta. La otra persona mira el celular, contesta «ajá» y no pregunta nada.",
        t:"¿Te diste cuenta en ese momento?" },

      { id:"s9", tipo:"historia",
        esc:"Alguien que casi nunca te habla se acerca y se ofrece a ayudarte con algo.",
        t:"¿Qué pensás que quiere?",
        ops:[
          { t:"Puede ser amabilidad o puede querer algo; me doy cuenta si sigo hablando.", sig:0 },
          { t:"Seguro quiere algo de mí.", sig:0.6 },
          { t:"Seguro es solo amabilidad.", sig:0.4 },
          { t:"No sé qué interpretar de eso.", sig:1 }
        ] },

      { id:"s10", tipo:"escena", escala:"grado",
        esc:"Se suspende algo que ya estaba arreglado y hay que improvisar otra cosa a último momento.",
        t:"¿Cuánto te desacomoda?" },

      { id:"s11", tipo:"historia",
        esc:"En una serie, un personaje le regala a otro algo que antes había dicho que odiaba. El otro sonríe y lo agradece.",
        t:"¿Qué está pasando entre los dos?",
        ops:[
          { t:"El que regala quiere marcar algo o incomodar; el otro disimula.", sig:0 },
          { t:"Se equivocó de regalo sin querer.", sig:0.8 },
          { t:"No se acordaba de que lo odiaba.", sig:0.6 },
          { t:"Me pierdo con esas cosas en las historias.", sig:1 }
        ] },

      { id:"s12", tipo:"escena", escala:"freq",
        esc:"Tarde libre. Podés escribirle a alguien para hacer algo, o quedarte con lo tuyo.",
        t:"¿Cuántas veces elegís quedarte con lo tuyo?" }
    ]
  },

  /* ======================================================================
     TRAMO 3 — Palabras  (ARHQ + tareas de lectura)
     ====================================================================== */
  {
    id: "aprendizaje",
    nombre: "Lectura y escritura",
    corto: "Aprendizaje",
    clin: "Dificultades de lectura",
    inst: "ARHQ",
    emoji: "📖",
    color: "#8FE388",
    parada: {
      titulo: "Palabras",
      texto: "Siete escenas sobre leer y escribir, y tres juegos cortos con palabras. Una de las escenas mira para atrás, a cuando aprendiste a leer.",
      nota: "En los juegos no importa la velocidad: importa lo que te sale natural."
    },
    items: [
      { id:"l1", tipo:"escena", escala:"freq",
        esc:"Terminás de leer una página y te das cuenta de que no sabés qué decía. Volvés atrás.",
        t:"¿Cuántas veces te pasa?" },

      { id:"l2", tipo:"tarea", juego:"ortografia",
        titulo: "¿Cuál está bien escrita?",
        para:"En cada par, solo una está bien escrita. Elegí sin pensarlo demasiado, la primera que te suene.",
        detalle:"Diez pares. Si dudás, elegí igual.",
        cta:"Empezar",
        pares:[
          { ok:"llave",     mal:"yave" },
          { ok:"zapato",    mal:"sapato" },
          { ok:"guitarra",  mal:"gitarra" },
          { ok:"hielo",     mal:"yelo" },
          { ok:"lluvia",    mal:"yuvia" },
          { ok:"examen",    mal:"esamen" },
          { ok:"agujero",   mal:"agugero" },
          { ok:"cebolla",   mal:"sevolla" },
          { ok:"burbuja",   mal:"burbuya" },
          { ok:"viernes",   mal:"biernes" }
        ] },

      { id:"l3", tipo:"escena", escala:"grado",
        esc:"Aparece una palabra que no viste nunca —un apellido, un término raro— y la tenés que decir en voz alta.",
        t:"¿Cuánto te traba?" },

      { id:"l4", tipo:"tarea", juego:"fonos",
        titulo:"Sacale un sonido",
        para:"Si a una palabra le sacás el primer sonido, queda otra. Por ejemplo: a «plato» sin el «p» le queda «lato».",
        detalle:"Seis palabras. Decilo en voz baja antes de elegir.",
        cta:"Empezar",
        items:[
          { p:"flor",   q:"f", ok:"lor" },
          { p:"tren",   q:"t", ok:"ren" },
          { p:"blusa",  q:"b", ok:"lusa" },
          { p:"grillo", q:"g", ok:"rillo" },
          { p:"casa",   q:"c", ok:"asa" },
          { p:"premio", q:"p", ok:"remio" }
        ] },

      { id:"l5", tipo:"escena", escala:"freq",
        esc:"Escribís rápido y te salen letras cambiadas o pegadas. Después tenés que corregir.",
        t:"¿Cuántas veces te pasa?" },

      { id:"l6", tipo:"tarea", juego:"lexico",
        titulo:"¿Existe esta palabra?",
        para:"Van a aparecer palabras sueltas, de a una. Tocá «Sí» si es una palabra que existe en castellano y «No» si no existe.",
        detalle:"Dieciséis palabras. Rápido, sin darle muchas vueltas.",
        cta:"Empezar",
        reales:[ "casa", "mesa", "tren", "libro", "ventana", "cocina", "camino", "espejo" ],
        falsas:[ "lopo", "cobina", "esmejo", "ventano", "plibre", "bardijo", "tumelo", "grenda" ] },

      { id:"l7", tipo:"escena", escala:"grado", escapa:true,
        esc:"Pensá en cuando estabas aprendiendo a leer. Los demás ya iban leyendo y a vos te costaba más.",
        t:"Mirando atrás, ¿cuánto te costaba?" },

      { id:"l8", tipo:"escena", escala:"grado", escapa:true,
        esc:"Te piden leer algo en voz alta delante de otros. Te dan ganas de que le toque a otra persona.",
        t:"¿Cuánto te incomoda?" },

      { id:"l9", tipo:"escena", escala:"freq",
        esc:"Tenés un rato libre y hay algo para leer: una novela, una nota, un cómic. Elegís otra cosa.",
        t:"¿Cuántas veces elegís otra cosa?" },

      { id:"l10", tipo:"escena", escala:"freq", escapa:true,
        esc:"Copiar algo de una pantalla o de un texto largo te lleva más tiempo que a los demás: vas y volvés para no perderte.",
        t:"¿Cuántas veces te pasa?" }
    ]
  }
];

/* Niveles orientativos: proporción de la señal (0..1) -> banda
   "corto" se usa en el badge del informe, donde el espacio es escaso. */
const NIVELES = [
  {
    id: "baja",
    hasta: 0.34,
    titulo: "Señal baja",
    corto: "Baja",
    tono: "por-ahora",
    color: "#8FE388",
    texto: "Por ahora no aparecen muchas señales acá."
  },
  {
    id: "media",
    hasta: 0.59,
    titulo: "Algunas señales",
    corto: "Algunas",
    tono: "a-mirar",
    color: "#FFC24B",
    texto: "Aparecen algunas señales. Puede ser algo puntual o algo para mirar con calma."
  },
  {
    id: "alta",
    hasta: 1,
    titulo: "Bastantes señales",
    corto: "Bastantes",
    tono: "a-consultar",
    color: "#FF7A7A",
    texto: "Aparecen varias señales. Conviene charlarlo con un adulto de confianza."
  }
];

/* Pares de consistencia: se responden en momentos distintos del recorrido */
const PARES = [
  { id:"olvido",    nombre:"olvidos",     max:2.5 },
  { id:"inquietud", nombre:"inquietud",   max:2.5 }
];

const UMBRAL_PLANO = 0.85;   // proporción de respuestas idénticas que sugiere línea recta

const FUENTES = [
  {
    nombre: "ASRS-v1.1 (TDAH)",
    cita: "Kessler RC, Adler L, Ames M, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population. Psychological Medicine, 2005;35(2):245-256. Organización Mundial de la Salud.",
    url: "https://pubmed.ncbi.nlm.nih.gov/15841682/"
  },
  {
    nombre: "SNAP-IV (TDAH)",
    cita: "Swanson JM, Schuck S, Porter MM, et al. Categorical and Dimensional Definitions and Evaluations of Symptoms of ADHD: History of the SNAP and the SWAN Rating Scales. The International Journal of Educational and Psychological Assessment, 2012;10(1):51-70.",
    url: "https://pubmed.ncbi.nlm.nih.gov/26504617/"
  },
  {
    nombre: "AQ-10 (espectro autista)",
    cita: "Allison C, Auyeung B, Baron-Cohen S. Toward Brief 'Red Flags' for Autism Screening: The Short Autism Spectrum Quotient and the Short Quantitative Checklist for Autism in Toddlers. Journal of the American Academy of Child & Adolescent Psychiatry, 2012;51(2):202-212. (Corte orientativo: 6 o más puntos sobre 10).",
    url: "https://pubmed.ncbi.nlm.nih.gov/22265366/"
  },
  {
    nombre: "ARHQ (dificultades de lectura)",
    cita: "Lefly DL, Pennington BF. Reliability and Validity of the Adult Reading History Questionnaire. Journal of Learning Disabilities, 2000;33(3):286-296.",
    url: "https://pubmed.ncbi.nlm.nih.gov/15505966/"
  },
  {
    nombre: "SART — tarea de atención sostenida",
    cita: "Robertson IH, Manly T, Andrade J, Baddeley BT, Yiend J. 'Oops!': performance correlates of everyday attentional failures in traumatic brain injured and normal subjects. Neuropsychologia, 1997;35(6):747-758. Base de la tarea de la señal (go/no-go sostenido).",
    url: "https://pubmed.ncbi.nlm.nih.gov/9204482/"
  },
  {
    nombre: "Variabilidad de tiempo de reacción en TDAH",
    cita: "Kofler MJ, Rapport MD, Sarver DE, et al. Reaction time variability in ADHD: a meta-analytic review of 319 studies. Clinical Psychology Review, 2013;33(6):795-811. Sustenta el peso dado a la irregularidad del tiempo de reacción en la tarea de la señal.",
    url: "https://pubmed.ncbi.nlm.nih.gov/23872284/"
  },
  {
    nombre: "Strange Stories (cognición social)",
    cita: "Happé FGE. An advanced test of theory of mind: understanding of story characters' thoughts and feelings by able autistic, mentally handicapped, and normal children and adults. Journal of Autism and Developmental Disorders, 1994;24(2):129-154. Base de las cuatro situaciones para interpretar.",
    url: "https://pubmed.ncbi.nlm.nih.gov/8040158/"
  },
  {
    nombre: "PROLEC-SE-R (procesos lectores)",
    cita: "Cuetos F, Arribas D, Ramos JL. PROLEC-SE-R. Batería de evaluación de los procesos lectores en secundaria y bachillerato. TEA Ediciones. Referencia de las tareas de decisión ortográfica, deleción de fonema y decisión léxica.",
    url: ""
  }
];
