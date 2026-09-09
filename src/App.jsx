// =============================================
// App.jsx - CAZA AL WUMPUS (VERSIÓN MEJORADA)
// =============================================

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    grafo,
    posiciones,
    obtenerVecinos,
    estanConectadas
} from "./game/mapa";

import {
    crearPartida,
    obtenerPistas
} from "./game/juego";

import { gestorAudio } from "./game/audio";
import { PantallaInicio } from "./components/PantallaInicio";
import { MapaCaverna } from "./components/MapaCaverna";
import { PanelControl } from "./components/PanelControl";
import { ModalGameOver } from "./components/ModalGameOver";
import { EfectosHorror } from "./components/EfectosHorror";
import { Home } from "lucide-react";

import "./App.css";

export function App() {
    // =========================================
    // ESTADOS PRINCIPALES
    // =========================================
    const [enInicio, setEnInicio] = useState(true);
    const [dificultadSeleccionada, setDificultadSeleccionada] = useState("normal");
    const [partida, setPartida] = useState(() => crearPartida("normal"));
    const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

    // MODO DESARROLLADOR Y CALIBRACIÓN
    const [modoDesarrollador, setModoDesarrollador] = useState(false);
    const [coordenadas, setCoordenadas] = useState({ x: 0, y: 0 });
    const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);

    // ATMÓSFERA Y EFECTOS
    const [nieblaActiva, setNieblaActiva] = useState(true);
    const [temblorPantalla, setTemblorPantalla] = useState(false);
    const [flechaAnimada, setFlechaAnimada] = useState(null);

    // SONIDO
    const [silenciado, setSilenciado] = useState(false);
    const [volumenMusica, setVolumenMusica] = useState(0.35);
    const [volumenEfectos, setVolumenEfectos] = useState(0.7);

    // =========================================
    // VECINOS Y PISTAS
    // =========================================
    const vecinos = useMemo(() => {
        return obtenerVecinos(partida.jugador);
    }, [partida.jugador]);

    const pistas = useMemo(() => {
        return obtenerPistas(partida);
    }, [partida]);

    const hayWumpusCerca = useMemo(() => {
        return pistas.some(p => p.tipo === "wumpus");
    }, [pistas]);

    const hayPozoCerca = useMemo(() => {
        return pistas.some(p => p.tipo === "pozo");
    }, [pistas]);

    const hayMurcielagoCerca = useMemo(() => {
        return pistas.some(p => p.tipo === "murcielago");
    }, [pistas]);

    // =========================================
    // GESTIÓN DE AUDIOS SEGÚN EL ENTORNO
    // =========================================
    useEffect(() => {
        if (!enInicio && partida.vivo && !partida.gano) {
            // Si el Wumpus está a una caverna, latidos de pánico
            if (hayWumpusCerca) {
                gestorAudio.iniciarLatidos(2);
                gestorAudio.reproducirGrunidoDistante();
            } else {
                gestorAudio.detenerLatidos();
            }

            // Si hay corrientes de abismo
            if (hayPozoCerca) {
                gestorAudio.reproducirArchivo("brisa");
            } else {
                gestorAudio.detenerArchivo("brisa");
            }

            // Si hay murciélagos en caverna contigua
            if (hayMurcielagoCerca) {
                gestorAudio.reproducirArchivo("murcielagos");
            } else {
                gestorAudio.detenerArchivo("murcielagos");
            }
        } else {
            gestorAudio.detenerLatidos();
            gestorAudio.detenerArchivo("brisa");
            gestorAudio.detenerArchivo("murcielagos");
        }
    }, [enInicio, partida.jugador, partida.vivo, partida.gano, hayWumpusCerca, hayPozoCerca, hayMurcielagoCerca]);

    // =========================================
    // INICIAR Y REINICIAR PARTIDA
    // =========================================
    const iniciarJuego = (dificultad = "normal") => {
        setDificultadSeleccionada(dificultad);
        setEnInicio(false);
        const nueva = crearPartida(dificultad);
        setPartida(nueva);
        setHabitacionSeleccionada(null);
        gestorAudio.iniciarAmbiente();
    };

    const reiniciar = useCallback(() => {
        gestorAudio.detenerTodosLosEfectos();
        gestorAudio.iniciarAmbiente();
        const nueva = crearPartida(dificultadSeleccionada);
        setPartida(nueva);
        setHabitacionSeleccionada(null);
        setTemblorPantalla(false);
        setFlechaAnimada(null);
    }, [dificultadSeleccionada]);

    const volverAlMenu = useCallback(() => {
        gestorAudio.detenerTodosLosEfectos();
        gestorAudio.iniciarAmbiente();
        setEnInicio(true);
        setHabitacionSeleccionada(null);
        setTemblorPantalla(false);
        setFlechaAnimada(null);
    }, []);

    // =========================================
    // MOVER JUGADOR
    // =========================================
    const moverJugador = useCallback((destino) => {
        if (!partida.vivo || partida.gano) return;

        if (!estanConectadas(partida.jugador, destino)) {
            setPartida(prev => ({
                ...prev,
                mensaje: `❌ La caverna #${destino} no conecta directamente con tu posición (#${prev.jugador}).`
            }));
            return;
        }

        gestorAudio.reproducirPaso();

        const nuevasVisitadas = Array.from(new Set([...(partida.visitadas || []), destino]));

        // 1. Peligro: Wumpus
        if (destino === partida.wumpus) {
            setTemblorPantalla(true);
            gestorAudio.detenerAmbiente();
            gestorAudio.detenerLatidos();
            gestorAudio.reproducirArchivo("wumpus");

            setPartida(prev => ({
                ...prev,
                jugador: destino,
                vivo: false,
                causaMuerte: "wumpus",
                pasos: prev.pasos + 1,
                visitadas: nuevasVisitadas,
                mensaje: "💀 ¡Entraste directamente a las fauces del Wumpus! La bestia te ha devorado."
            }));
            return;
        }

        // 2. Peligro: Pozo sin fondo
        if (partida.pozos.includes(destino)) {
            setTemblorPantalla(true);
            gestorAudio.detenerAmbiente();
            gestorAudio.detenerLatidos();
            gestorAudio.reproducirArchivo("caida");

            setPartida(prev => ({
                ...prev,
                jugador: destino,
                vivo: false,
                causaMuerte: "pozo",
                pasos: prev.pasos + 1,
                visitadas: nuevasVisitadas,
                mensaje: "🕳️ ¡El suelo se quebró bajo tus pies! Caíste en un pozo sin fondo."
            }));
            return;
        }

        // 3. Peligro: Murciélagos gigantes
        if (partida.murcielagos.includes(destino)) {
            gestorAudio.reproducirArchivo("murcielagos");

            // Los murciélagos trasladan al jugador a otra habitación aleatoria
            let habitacionDestino;
            do {
                habitacionDestino = Math.floor(Math.random() * 15) + 1;
            } while (habitacionDestino === destino);

            // Reubicar murciélagos a otra caverna libre
            const nuevosMurcielagos = partida.murcielagos.map(m => {
                if (m === destino) {
                    let nuevaPosBat;
                    do {
                        nuevaPosBat = Math.floor(Math.random() * 15) + 1;
                    } while (nuevaPosBat === habitacionDestino || nuevaPosBat === partida.wumpus);
                    return nuevaPosBat;
                }
                return m;
            });

            // Verificar si el destino forzado cae en Wumpus o Pozo (peligro real de los murciélagos)
            if (habitacionDestino === partida.wumpus) {
                setTemblorPantalla(true);
                gestorAudio.detenerAmbiente();
                gestorAudio.reproducirArchivo("wumpus");
                setPartida(prev => ({
                    ...prev,
                    jugador: habitacionDestino,
                    murcielagos: nuevosMurcielagos,
                    vivo: false,
                    causaMuerte: "wumpus",
                    pasos: prev.pasos + 1,
                    visitadas: Array.from(new Set([...nuevasVisitadas, habitacionDestino])),
                    mensaje: `🦇 ¡Murciélagos gigantes te levantaron en vilo y te arrojaron a la guarida del Wumpus (#${habitacionDestino})!`
                }));
                return;
            }

            if (partida.pozos.includes(habitacionDestino)) {
                setTemblorPantalla(true);
                gestorAudio.detenerAmbiente();
                gestorAudio.reproducirArchivo("caida");
                setPartida(prev => ({
                    ...prev,
                    jugador: habitacionDestino,
                    murcielagos: nuevosMurcielagos,
                    vivo: false,
                    causaMuerte: "pozo",
                    pasos: prev.pasos + 1,
                    visitadas: Array.from(new Set([...nuevasVisitadas, habitacionDestino])),
                    mensaje: `🦇 ¡Los murciélagos te soltaron en el vacío de un pozo sin fondo (#${habitacionDestino})!`
                }));
                return;
            }

            // Si el destino es seguro
            setPartida(prev => ({
                ...prev,
                jugador: habitacionDestino,
                murcielagos: nuevosMurcielagos,
                pasos: prev.pasos + 1,
                visitadas: Array.from(new Set([...nuevasVisitadas, habitacionDestino])),
                mensaje: `🦇 ¡Una bandada de murciélagos te alzó en el aire y te soltó en la caverna #${habitacionDestino}!`
            }));
            setHabitacionSeleccionada(null);
            return;
        }

        // Movimiento exitoso seguro
        setPartida(prev => ({
            ...prev,
            jugador: destino,
            pasos: prev.pasos + 1,
            visitadas: nuevasVisitadas,
            mensaje: `Te adentraste en la caverna #${destino}. La penumbra te rodea.`
        }));
        setHabitacionSeleccionada(null);
    }, [partida]);

    // =========================================
    // DISPARAR FLECHA
    // =========================================
    const disparar = useCallback((destino) => {
        if (!partida.vivo || partida.gano) return;

        if (partida.flechas <= 0) {
            setPartida(prev => ({
                ...prev,
                mensaje: "🏹 Tu carcaj está completamente vacío. ¡No te quedan flechas!"
            }));
            return;
        }

        if (!estanConectadas(partida.jugador, destino)) {
            setPartida(prev => ({
                ...prev,
                mensaje: "❌ No puedes disparar hacia una caverna que no tenga túnel directo."
            }));
            return;
        }

        // Efectos de disparo
        gestorAudio.reproducirDisparoFlecha();
        setFlechaAnimada({ origen: partida.jugador, destino });

        setTimeout(() => {
            setFlechaAnimada(null);
        }, 400);

        const flechasRestantes = partida.flechas - 1;

        // 1. ¿Le diste al Wumpus?
        if (destino === partida.wumpus) {
            gestorAudio.detenerAmbiente();
            gestorAudio.detenerLatidos();
            gestorAudio.reproducirArchivo("victoria");

            setPartida(prev => ({
                ...prev,
                flechas: flechasRestantes,
                gano: true,
                mensaje: `🏆 ¡TIRO CERTERO! Atravesaste al Wumpus en la caverna #${destino}. ¡Eres el héroe de las cavernas!`
            }));
            return;
        }

        // 2. Fallaste: El sonido de la flecha despierta / alerta al Wumpus
        gestorAudio.reproducirImpactoRoca();
        let nuevoWumpus = partida.wumpus;
        let wumpusSeMovio = false;

        // 75% de probabilidad de que el Wumpus se mueva a una caverna vecina al oír el disparo
        if (Math.random() < 0.75) {
            const vecinosWumpus = obtenerVecinos(partida.wumpus);
            if (vecinosWumpus.length > 0) {
                nuevoWumpus = vecinosWumpus[Math.floor(Math.random() * vecinosWumpus.length)];
                wumpusSeMovio = true;
            }
        }

        // CORRECCIÓN CRÍTICA DE BUG: Si el Wumpus entra a la caverna del jugador
        if (nuevoWumpus === partida.jugador) {
            setTemblorPantalla(true);
            gestorAudio.detenerAmbiente();
            gestorAudio.detenerLatidos();
            gestorAudio.reproducirArchivo("wumpus");

            setPartida(prev => ({
                ...prev,
                flechas: flechasRestantes,
                wumpus: nuevoWumpus,
                vivo: false,
                causaMuerte: "wumpus",
                mensaje: "💀 ¡El estruendo de tu flecha enfureció al Wumpus! La bestia cargó contra tu caverna y te devoró."
            }));
            return;
        }

        // Si se quedó sin flechas y no lo mató: Game Over
        if (flechasRestantes === 0) {
            setTemblorPantalla(true);
            gestorAudio.detenerAmbiente();
            gestorAudio.detenerLatidos();
            gestorAudio.reproducirArchivo("wumpus");

            setPartida(prev => ({
                ...prev,
                flechas: 0,
                wumpus: nuevoWumpus,
                vivo: false,
                causaMuerte: "sin_flechas",
                mensaje: "💀 ¡Disparaste tu última flecha y erraste! En la oscuridad y desarmado, el Wumpus te cazó."
            }));
            return;
        }

        // Flecha fallida normal, aún con flechas
        setPartida(prev => ({
            ...prev,
            flechas: flechasRestantes,
            wumpus: nuevoWumpus,
            mensaje: wumpusSeMovio
                ? "🏹 ¡La flecha rebotó contra la roca! El eco alertó al Wumpus y escuchas pasos pesados moviéndose..."
                : "🏹 ¡Fallaste el tiro! Tu flecha se partió contra las estalagmitas."
        }));
    }, [partida]);

    // =========================================
    // CONTROLES DE TECLADO
    // =========================================
    useEffect(() => {
        if (enInicio) return;

        const manejarTeclado = (e) => {
            const key = e.key.toLowerCase();

            // Moverse con 'm' si hay habitación seleccionada
            if (key === "m" && habitacionSeleccionada) {
                moverJugador(habitacionSeleccionada);
            }
            // Disparar con 'd' o 'f'
            if ((key === "d" || key === "f") && habitacionSeleccionada) {
                disparar(habitacionSeleccionada);
            }
            // Escape para deseleccionar
            if (key === "escape") {
                setHabitacionSeleccionada(null);
            }
            // Reiniciar con 'r' o 'n'
            if (key === "r" || key === "n") {
                if (e.ctrlKey) return;
                reiniciar();
            }
        };

        window.addEventListener("keydown", manejarTeclado);
        return () => window.removeEventListener("keydown", manejarTeclado);
    }, [enInicio, habitacionSeleccionada, moverJugador, disparar, reiniciar]);

    // =========================================
    // CONEXIONES VISUALES
    // =========================================
    const conexiones = useMemo(() => {
        const list = [];
        Object.entries(grafo).forEach(([origen, destinos]) => {
            destinos.forEach(destino => {
                if (Number(origen) < destino) {
                    list.push({ origen: Number(origen), destino });
                }
            });
        });
        return list;
    }, []);

    // =========================================
    // COORDENADAS MODO DEV
    // =========================================
    const obtenerCoordenadasMapa = (event) => {
        const mapa = event.currentTarget;
        const rect = mapa.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        const xRedondeado = Number(x.toFixed(2));
        const yRedondeado = Number(y.toFixed(2));

        setCoordenadas({ x: xRedondeado, y: yRedondeado });
        setPuntoSeleccionado({ x: xRedondeado, y: yRedondeado });
    };

    // =========================================
    // CONTROLES DE SONIDO
    // =========================================
    const toggleSilencio = () => {
        const nuevoEstado = !silenciado;
        setSilenciado(nuevoEstado);
        gestorAudio.establecerSilenciado(nuevoEstado);
    };

    const cambiarVolumenMusica = (vol) => {
        setVolumenMusica(vol);
        gestorAudio.establecerVolumenMusica(vol);
    };

    const cambiarVolumenEfectos = (vol) => {
        setVolumenEfectos(vol);
        gestorAudio.establecerVolumenEfectos(vol);
    };

    // =========================================
    // RENDER: PANTALLA DE INICIO
    // =========================================
    if (enInicio) {
        return (
            <PantallaInicio
                onIniciarJuego={iniciarJuego}
                silenciado={silenciado}
                onToggleSilencio={toggleSilencio}
            />
        );
    }

    // =========================================
    // RENDER: JUEGO ACTIVO
    // =========================================
    return (
        <div className="app">
            {/* Efectos de horror de pantalla completa */}
            <EfectosHorror
                hayWumpusCerca={hayWumpusCerca}
                hayPozoCerca={hayPozoCerca}
                hayMurcielagoCerca={hayMurcielagoCerca}
                temblorPantalla={temblorPantalla}
            />

            {/* Encabezado del juego */}
            <header className="cabecera-juego">
                <div className="cabecera-info">
                    <h1 className="titulo-app">
                        🏹 CAZA AL WUMPUS
                    </h1>
                    <p className="subtitulo-app">
                        Adéntrate en el laberinto subterráneo, siente las corrientes y da caza a la bestia.
                    </p>
                </div>

                <div className="cabecera-acciones">
                    <button
                        id="btn-volver-menu-cabecera"
                        className="boton-menu-cabecera"
                        onClick={volverAlMenu}
                        title="Volver a la portada principal y cambiar dificultad"
                    >
                        <Home size={16} />
                        <span>Menú Principal</span>
                    </button>
                    <button
                        className={`boton-dev ${modoDesarrollador ? "activo" : ""}`}
                        onClick={() => setModoDesarrollador(!modoDesarrollador)}
                        title="Activar vista de desarrollo y calibración de coordenadas"
                    >
                        {modoDesarrollador ? "🔧 Ocultar Modo Dev" : "🔧 Modo Desarrollador"}
                    </button>
                </div>
            </header>

            {/* Área de juego principal */}
            <main className="area-juego">
                <section className="mapa-seccion">
                    <MapaCaverna
                        posiciones={posiciones}
                        conexiones={conexiones}
                        partida={partida}
                        vecinos={vecinos}
                        habitacionSeleccionada={habitacionSeleccionada}
                        onSeleccionarHabitacion={setHabitacionSeleccionada}
                        modoDesarrollador={modoDesarrollador}
                        puntoSeleccionado={puntoSeleccionado}
                        onObtenerCoordenadasMapa={obtenerCoordenadasMapa}
                        flechaAnimada={flechaAnimada}
                        nieblaActiva={nieblaActiva}
                        onToggleNiebla={() => setNieblaActiva(!nieblaActiva)}
                    />
                </section>

                <PanelControl
                    partida={partida}
                    vecinos={vecinos}
                    pistas={pistas}
                    habitacionSeleccionada={habitacionSeleccionada}
                    onMover={moverJugador}
                    onDisparar={disparar}
                    onReiniciar={reiniciar}
                    onVolverMenu={volverAlMenu}
                    modoDesarrollador={modoDesarrollador}
                    coordenadas={coordenadas}
                    puntoSeleccionado={puntoSeleccionado}
                    onSeleccionarHabitacion={setHabitacionSeleccionada}
                    posiciones={posiciones}
                    silenciado={silenciado}
                    onToggleSilencio={toggleSilencio}
                    volumenMusica={volumenMusica}
                    onCambiarVolumenMusica={cambiarVolumenMusica}
                    volumenEfectos={volumenEfectos}
                    onCambiarVolumenEfectos={cambiarVolumenEfectos}
                />
            </main>

            {/* Modal de Victoria o Muerte */}
            <ModalGameOver partida={partida} onReiniciar={reiniciar} onVolverMenu={volverAlMenu} />

            {/* Pie de página con créditos */}
            <footer className="pie-pagina">
                <p>
                    Adaptación del clásico Caza al Wumpus • 15 Cavernas conectadas en Grafo • Desarrollado por Angel Gael Garcia Ramos, Valeria Martin Llamas y Maricarmen Hernandez Gomez
                </p>
            </footer>
        </div>
    );
}

export default App;
