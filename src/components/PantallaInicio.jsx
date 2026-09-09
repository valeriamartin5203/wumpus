import { useState, useEffect } from "react";
import wumpusSprite from "../assets/wumpus.png";
import jugadorSprite from "../assets/jugador.png";
import { 
    Volume2, 
    VolumeX, 
    Flame, 
    Skull, 
    Compass, 
    ShieldAlert, 
    Gamepad2, 
    Play, 
    X, 
    Footprints, 
    Crosshair, 
    RotateCcw,
    Keyboard,
    Info
} from "lucide-react";
import { gestorAudio } from "../game/audio";

const capitulosHistoria = [
    {
        paso: 1,
        etiqueta: "EL DESCENSO",
        icono: "🌋",
        titulo: "EL MONSTRUO DE LAS CATACUMBAS",
        texto: "En las profundidades de este laberinto volcánico duerme el temible WUMPUS. Tu pueblo te confió un arco sagrado con escasas flechas doradas para cazar a la bestia."
    },
    {
        paso: 2,
        etiqueta: "EL RASTREO",
        icono: "👃",
        titulo: "EL HEDOR A PODREDUMBRE",
        texto: "Si sientes un hedor nauseabundo a carroña, el Wumpus acecha en una caverna contigua. ¡No entres a ciegas a su guarida o serás devorado en la oscuridad!"
    },
    {
        paso: 3,
        etiqueta: "TRAMPAS",
        icono: "💨",
        titulo: "POZOS Y MURCIÉLAGOS",
        texto: "La brisa helada delata abismos sin fondo donde una caída es fatal. El aleteo frenético advierte de murciélagos gigantes que te transportarán a cualquier caverna al azar."
    },
    {
        paso: 4,
        etiqueta: "LA CAZA",
        icono: "🏹",
        titulo: "EL DISPARO CERTERO",
        texto: "Deduce la posición del monstruo y lanza tu flecha mágica a través de los túneles. Si fallas, el Wumpus despertará hambriento. ¡Buena suerte, cazador!"
    }
];

export function PantallaInicio({ onIniciarJuego, silenciado, onToggleSilencio }) {
    const [capituloActual, setCapituloActual] = useState(0);
    const [textoVisible, setTextoVisible] = useState("");
    const [escribiendoCompleto, setEscribiendoCompleto] = useState(false);
    const [dificultad, setDificultad] = useState("normal");
    const [mostrarControles, setMostrarControles] = useState(false);

    const capitulo = capitulosHistoria[capituloActual];

    useEffect(() => {
        let i = 0;
        const speed = 15;
        const textoCompleto = capitulo.texto;
        const intervalo = setInterval(() => {
            i++;
            setTextoVisible(textoCompleto.slice(0, i));
            if (i >= textoCompleto.length) {
                setEscribiendoCompleto(true);
                clearInterval(intervalo);
            }
        }, speed);
        return () => clearInterval(intervalo);
    }, [capitulo.texto]);

    const cambiarCapitulo = (nuevoIndice) => {
        setTextoVisible("");
        setEscribiendoCompleto(false);
        setCapituloActual(nuevoIndice);
    };

    const avanzarHistoria = () => {
        gestorAudio.iniciarAmbiente();
        if (!escribiendoCompleto) {
            setTextoVisible(capitulo.texto);
            setEscribiendoCompleto(true);
        } else {
            const siguiente = (capituloActual + 1) % capitulosHistoria.length;
            cambiarCapitulo(siguiente);
            gestorAudio.reproducirPaso();
        }
    };

    const handleStart = () => {
        gestorAudio.obtenerContexto();
        onIniciarJuego(dificultad);
    };

    return (
        <div className="pantalla-inicio" id="pantalla-inicio-wumpus">
            {/* Control rápido de sonido en la portada */}
            <button 
                id="btn-toggle-audio-portada"
                className="boton-audio-portada" 
                onClick={onToggleSilencio}
                title={silenciado ? "Activar audio" : "Silenciar audio"}
            >
                {silenciado ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{silenciado ? "MUTED" : "SOUND ON"}</span>
            </button>

            <div className="contenedor-centro">
                {/* Encabezado Principal */}
                <div className="encabezado-retro">
                    <span className="subtitulo-retro">★ EXPEDICIÓN SUBTERRÁNEA ★</span>
                    <h1 className="titulo-retro">CAZA AL WUMPUS</h1>
                </div>

                {/* ESCENA CENTRAL: EL PERSONAJE Y EL WUMPUS (SIEMPRE VISIBLE) */}
                <div className="diorama-enfrentamiento" id="diorama-personajes">
                    <div className="luchador-card cazador-card">
                        <div className="aura-luchador cazador-aura" />
                        <img 
                            src={jugadorSprite} 
                            alt="Cazador con arco y antorcha" 
                            className="sprite-diorama float"
                        />
                        <div className="badge-luchador cazador-tag">
                            <span>🏹 EL CAZADOR</span>
                        </div>
                        <span className="sub-luchador">Tú en la oscuridad</span>
                    </div>

                    <div className="versus-emblema">
                        <div className="rayo-vs">VS</div>
                        <Flame size={22} className="fuego-vs text-orange-500" />
                    </div>

                    <div className="luchador-card wumpus-card">
                        <div className="aura-luchador wumpus-aura" />
                        <img 
                            src={wumpusSprite} 
                            alt="Wumpus bestia de las cavernas" 
                            className="sprite-diorama wiggle"
                        />
                        <div className="badge-luchador wumpus-tag">
                            <span>👹 EL WUMPUS</span>
                        </div>
                        <span className="sub-luchador">Bestia devoradora</span>
                    </div>
                </div>

                {/* CAJA DE NARRATIVA FIJA (NO CAMBIA DE TAMAÑO Y AVANZA CON CLIC) */}
                <div 
                    className="caja-historia" 
                    id="caja-historia-narrativa"
                    onClick={avanzarHistoria}
                    title="Haz clic para avanzar la historia o saltar la animación"
                >
                    <div className="caja-historia-header">
                        <div className="caja-historia-titulo-izq">
                            <Flame size={14} className="text-orange-400" />
                            <span>DIARIO DE EXPEDICIÓN</span>
                            <span className="badge-paso-historia">PARTE {capituloActual + 1}/{capitulosHistoria.length}</span>
                        </div>

                        <div className="caja-historia-dots">
                            {capitulosHistoria.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`historia-dot ${idx === capituloActual ? "activo" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cambiarCapitulo(idx);
                                        gestorAudio.reproducirPaso();
                                    }}
                                    title={`Ir a parte ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <div className="btn-avanzar-indicador">
                            <span className="prompt-clic">
                                {!escribiendoCompleto ? "Completar ↵" : "Siguiente ➔"}
                            </span>
                        </div>
                    </div>

                    <div className="caja-historia-contenido">
                        <div className="capitulo-subcabecera">
                            <span className="capitulo-icono">{capitulo.icono}</span>
                            <span className="capitulo-titulo">{capitulo.titulo}</span>
                        </div>
                        <p className="capitulo-parrafo">
                            {textoVisible}
                            {!escribiendoCompleto && <span className="cursor-escribiendo">█</span>}
                        </p>
                    </div>
                </div>

                {/* Selector de Dificultad */}
                <div className="selector-dificultad">
                    <span className="label-dificultad">SELECCIONA DIFICULTAD:</span>
                    <div className="opciones-dificultad">
                        <button 
                            id="btn-dif-facil"
                            className={`btn-dif ${dificultad === "facil" ? "activa" : ""}`}
                            onClick={() => setDificultad("facil")}
                        >
                            <Compass size={14} /> FÁCIL (3 Flechas)
                        </button>
                        <button 
                            id="btn-dif-normal"
                            className={`btn-dif ${dificultad === "normal" ? "activa" : ""}`}
                            onClick={() => setDificultad("normal")}
                        >
                            <ShieldAlert size={14} /> NORMAL (2 Flechas)
                        </button>
                        <button 
                            id="btn-dif-pesadilla"
                            className={`btn-dif ${dificultad === "pesadilla" ? "activa" : ""}`}
                            onClick={() => setDificultad("pesadilla")}
                        >
                            <Skull size={14} /> PESADILLA (1 Flecha)
                        </button>
                    </div>
                </div>

                {/* BOTONES PRINCIPALES: INICIO Y VER CONTROLES */}
                <div className="fila-botones-portada">
                    <button 
                        id="btn-iniciar-juego"
                        className="boton-start" 
                        onClick={handleStart}
                    >
                        <Play size={20} className="mr-2" />
                        <span>INICIAR EXPEDICIÓN</span>
                    </button>

                    <button 
                        id="btn-ver-controles"
                        className="boton-controles" 
                        onClick={() => {
                            gestorAudio.obtenerContexto();
                            gestorAudio.iniciarAmbiente();
                            setMostrarControles(true);
                        }}
                    >
                        <Gamepad2 size={20} className="mr-2" />
                        <span>VER CONTROLES</span>
                    </button>
                </div>
            </div>

            {/* MODAL DE CONTROLES Y GUÍA TÁCTICA */}
            {mostrarControles && (
                <div className="modal-overlay" onClick={() => setMostrarControles(false)}>
                    <div 
                        className="modal-contenido modal-controles-box" 
                        onClick={(e) => e.stopPropagation()}
                        id="modal-guia-controles"
                    >
                        <div className="modal-controles-header">
                            <div className="flex items-center gap-2">
                                <Keyboard size={24} className="text-amber-400" />
                                <h2 className="modal-controles-titulo">CONTROLES & GUÍA DE CAZA</h2>
                            </div>
                            <button 
                                className="btn-cerrar-modal"
                                onClick={() => setMostrarControles(false)}
                                title="Cerrar ventana"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-controles-cuerpo">
                            {/* Sección 1: Mandos y Teclado */}
                            <div className="guia-bloque">
                                <h3>🕹️ CÓMO JUGAR (RATÓN & TECLADO)</h3>
                                <div className="guia-grilla">
                                    <div className="guia-item">
                                        <div className="guia-item-icon">
                                            <Footprints size={20} className="text-blue-400" />
                                        </div>
                                        <div className="guia-item-info">
                                            <strong>MOVERSE A OTRA CAVERNA</strong>
                                            <p>Haz clic en una caverna conectada adyacente y pulsa <b>AVANZAR A PIE</b> o la tecla <kbd>M</kbd>.</p>
                                        </div>
                                    </div>

                                    <div className="guia-item">
                                        <div className="guia-item-icon">
                                            <Crosshair size={20} className="text-pink-400" />
                                        </div>
                                        <div className="guia-item-info">
                                            <strong>DISPARAR FLECHA DORADA</strong>
                                            <p>Selecciona una caverna vecina y pulsa <b>DISPARAR</b> o las teclas <kbd>D</kbd> o <kbd>F</kbd>.</p>
                                        </div>
                                    </div>

                                    <div className="guia-item">
                                        <div className="guia-item-icon">
                                            <RotateCcw size={20} className="text-green-400" />
                                        </div>
                                        <div className="guia-item-info">
                                            <strong>REINICIAR PARTIDA</strong>
                                            <p>Pulsa el botón <b>NUEVA EXPEDICIÓN</b> o las teclas <kbd>R</kbd> o <kbd>N</kbd> en cualquier momento.</p>
                                        </div>
                                    </div>

                                    <div className="guia-item">
                                        <div className="guia-item-icon">
                                            <Info size={20} className="text-purple-400" />
                                        </div>
                                        <div className="guia-item-info">
                                            <strong>DESELECCIONAR</strong>
                                            <p>Presiona la tecla <kbd>Esc</kbd> para quitar la mira de una habitación.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección 2: Pistas Sensoriales */}
                            <div className="guia-bloque">
                                <h3>🩸 SEÑALES Y PELIGROS EN LA PENUMBRA</h3>
                                <div className="guia-pistas-lista">
                                    <div className="guia-pista-card pista-wumpus-guia">
                                        <span className="pista-emoji">👃</span>
                                        <div>
                                            <h4 className="text-red-400 font-bold">HEDOR A PODREDUMBRE</h4>
                                            <p>El temible Wumpus duerme en una caverna vecina inmediata. ¡No entres o te devorará!</p>
                                        </div>
                                    </div>

                                    <div className="guia-pista-card pista-pozo-guia">
                                        <span className="pista-emoji">💨</span>
                                        <div>
                                            <h4 className="text-cyan-400 font-bold">BRISA GÉLIDA</h4>
                                            <p>Hay un pozo sin fondo contiguo. Caer en él supone la muerte instantánea.</p>
                                        </div>
                                    </div>

                                    <div className="guia-pista-card pista-bat-guia">
                                        <span className="pista-emoji">🦇</span>
                                        <div>
                                            <h4 className="text-purple-400 font-bold">ALETEO DE MURCIÉLAGOS</h4>
                                            <p>Murciélagos gigantes habitan a un paso. Te levantarán y te dejarán en cualquier caverna al azar.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección 3: Reglas de Victoria */}
                            <div className="guia-bloque aviso-caza">
                                <h4>🏹 REGLA DE ORO DE LA CAZA:</h4>
                                <p>
                                    Tus flechas son mágicas y vuelan en línea recta por los túneles directos. Si disparas y no aciertas, el eco puede enfurecer al Wumpus y hacer que se mueva a otra caverna. Si te quedas sin flechas, quedarás indefenso.
                                </p>
                            </div>
                        </div>

                        <div className="modal-controles-footer">
                            <button 
                                className="btn-comenzar-modal"
                                onClick={() => {
                                    setMostrarControles(false);
                                    handleStart();
                                }}
                            >
                                <Play size={18} />
                                <span>¡ENTENDIDO, DESCENDER A LA CAVERNA!</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Créditos y autores originales */}
            <div className="autores">
                <p>ADAPTACIÓN POR:</p>
                <p>ANGEL GAEL GARCIA RAMOS • VALERIA MARTIN LLAMAS • MARICARMEN HERNANDEZ GOMEZ</p>
            </div>
        </div>
    );
}
