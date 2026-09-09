import jugadorSprite from "../assets/jugador.png";
import wumpusSprite from "../assets/wumpus.png";
import murcielagoSprite from "../assets/murcielago.png";
import pozoSprite from "../assets/pozo.png";
import { Eye, EyeOff, Flame, Crosshair } from "lucide-react";

export function MapaCaverna({
    posiciones,
    conexiones,
    partida,
    vecinos,
    habitacionSeleccionada,
    onSeleccionarHabitacion,
    modoDesarrollador,
    puntoSeleccionado,
    onObtenerCoordenadasMapa,
    flechaAnimada,
    nieblaActiva,
    onToggleNiebla
}) {
    const posJugador = posiciones[partida.jugador] || { x: 50, y: 50 };

    return (
        <div className="mapa-wrapper">
            {/* Barra superior de herramientas del mapa */}
            <div className="mapa-toolbar">
                <button 
                    className={`btn-toolbar ${nieblaActiva ? "activa" : ""}`}
                    onClick={onToggleNiebla}
                    title="Alternar Niebla de Guerra (Niebla de Caverna)"
                >
                    {nieblaActiva ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{nieblaActiva ? "Niebla Oscura: ON" : "Niebla Oscura: OFF"}</span>
                </button>

                <div className="indicador-antorcha">
                    <Flame size={16} className="text-amber-400 llama-parpadeo" />
                    <span>Luz de Antorcha: Caverna #{partida.jugador}</span>
                </div>
            </div>

            {/* Contenedor del Mapa */}
            <div
                className={`mapa ${modoDesarrollador ? "modo-dev" : ""} ${nieblaActiva && !modoDesarrollador ? "con-niebla" : ""}`}
                onClick={modoDesarrollador ? onObtenerCoordenadasMapa : undefined}
                id="mapa-caverna"
            >
                {/* Capa de luz de antorcha dinámica sobre la caverna */}
                <div 
                    className="antorcha-resplandor"
                    style={{
                        left: `${posJugador.x}%`,
                        top: `${posJugador.y}%`
                    }}
                />

                {/* Niebla de guerra ambiental (oscuridad) */}
                {nieblaActiva && !modoDesarrollador && (
                    <div 
                        className="capa-niebla-radial"
                        style={{
                            background: `radial-gradient(circle 180px at ${posJugador.x}% ${posJugador.y}%, rgba(0,0,0,0) 0%, rgba(11,9,20,0.7) 65%, rgba(7,5,15,0.94) 100%)`
                        }}
                    />
                )}

                {/* CONEXIONES SVG */}
                <svg className="conexiones" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradActivo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff9a3c" />
                            <stop offset="100%" stopColor="#f35588" />
                        </linearGradient>
                        <filter id="glowLine">
                            <feGaussianBlur stdDeviation="0.4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {conexiones.map(({ origen, destino }) => {
                        const inicio = posiciones[origen];
                        const fin = posiciones[destino];
                        if (!inicio || !fin) return null;

                        const conectaConJugador =
                            (origen === partida.jugador && destino === habitacionSeleccionada) ||
                            (destino === partida.jugador && origen === habitacionSeleccionada) ||
                            (origen === partida.jugador && vecinos.includes(destino)) ||
                            (destino === partida.jugador && vecinos.includes(origen));

                        const esCaminoSeleccionado =
                            (origen === partida.jugador && destino === habitacionSeleccionada) ||
                            (destino === partida.jugador && origen === habitacionSeleccionada);

                        return (
                            <line
                                key={`${origen}-${destino}`}
                                x1={inicio.x}
                                y1={inicio.y}
                                x2={fin.x}
                                y2={fin.y}
                                className={`linea-conexion ${conectaConJugador ? "conexion-activa" : ""} ${esCaminoSeleccionado ? "conexion-seleccionada" : ""}`}
                            />
                        );
                    })}

                    {/* Animación del tiro de flecha */}
                    {flechaAnimada && (
                        <line
                            x1={posiciones[flechaAnimada.origen]?.x || 0}
                            y1={posiciones[flechaAnimada.origen]?.y || 0}
                            x2={posiciones[flechaAnimada.destino]?.x || 0}
                            y2={posiciones[flechaAnimada.destino]?.y || 0}
                            className="flecha-vuelo"
                        />
                    )}
                </svg>

                {/* SPRITES EN MODO DESARROLLADOR */}
                {modoDesarrollador && (
                    <>
                        {/* Wumpus */}
                        <div 
                            className="contenedor-sprite-enemigo"
                            style={{
                                left: `${posiciones[partida.wumpus].x}%`,
                                top: `${posiciones[partida.wumpus].y}%`
                            }}
                            title={`Wumpus en caverna ${partida.wumpus}`}
                        >
                            <img src={wumpusSprite} alt="Wumpus" className="sprite-enemigo sprite-wumpus pulse-horror" />
                            <span className="badge-dev wumpus-badge">WUMPUS</span>
                        </div>

                        {/* Murciélagos */}
                        {partida.murcielagos.map((habitacion, index) => (
                            <div 
                                key={`murcielago-${index}`}
                                className="contenedor-sprite-enemigo"
                                style={{
                                    left: `${posiciones[habitacion].x}%`,
                                    top: `${posiciones[habitacion].y}%`
                                }}
                                title={`Murciélago en caverna ${habitacion}`}
                            >
                                <img src={murcielagoSprite} alt="Murciélago" className="sprite-enemigo sprite-murcielago" />
                                <span className="badge-dev murcielago-badge">MURCIÉLAGO</span>
                            </div>
                        ))}

                        {/* Pozos */}
                        {partida.pozos.map((habitacion, index) => (
                            <div 
                                key={`pozo-${index}`}
                                className="contenedor-sprite-enemigo"
                                style={{
                                    left: `${posiciones[habitacion].x}%`,
                                    top: `${posiciones[habitacion].y}%`
                                }}
                                title={`Pozo en caverna ${habitacion}`}
                            >
                                <img src={pozoSprite} alt="Pozo" className="sprite-enemigo sprite-pozo" />
                                <span className="badge-dev pozo-badge">POZO</span>
                            </div>
                        ))}
                    </>
                )}

                {/* HABITACIONES / CAVERNAS */}
                {Object.keys(posiciones).map(numero => {
                    const num = Number(numero);
                    const posicion = posiciones[num];
                    const esJugador = partida.jugador === num;
                    const esVecina = vecinos.includes(num);
                    const seleccionada = habitacionSeleccionada === num;
                    const yaVisitada = partida.visitadas?.includes(num);

                    // Comprobación de visibilidad con niebla
                    const esVisible = !nieblaActiva || modoDesarrollador || esJugador || esVecina || yaVisitada;

                    return (
                        <button
                            key={numero}
                            id={`caverna-nodo-${numero}`}
                            className={`
                                habitacion
                                ${esJugador ? "jugador" : ""}
                                ${esVecina ? "vecina" : ""}
                                ${seleccionada ? "seleccionada" : ""}
                                ${yaVisitada && !esJugador ? "visitada" : ""}
                                ${!esVisible ? "oculta-niebla" : ""}
                            `}
                            style={{
                                left: `${posicion.x}%`,
                                top: `${posicion.y}%`
                            }}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSeleccionarHabitacion(num);
                            }}
                            title={
                                esJugador
                                    ? `Tu posición actual (Caverna ${num})`
                                    : esVecina
                                    ? `Caverna adyacente conectada #${num} (Haz clic para Moverte o Disparar)`
                                    : `Caverna #${num}`
                            }
                        >
                            {esJugador ? (
                                <div className="avatar-jugador-contenedor">
                                    <div className="aura-jugador" />
                                    <img
                                        src={jugadorSprite}
                                        alt="Cazador"
                                        className="sprite-jugador"
                                    />
                                    <span className="antorcha-icon">🔥</span>
                                </div>
                            ) : (
                                <div className="contenido-nodo">
                                    <span className="numero-caverna">{num}</span>
                                    {yaVisitada && <span className="huella-visitada" title="Ya visitada">👣</span>}
                                    {seleccionada && (
                                        <div className="mira-seleccion">
                                            <Crosshair size={28} className="mira-icono" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* PUNTO DE MODO DEV */}
                {modoDesarrollador && puntoSeleccionado && (
                    <div
                        className="punto-dev"
                        style={{
                            left: `${puntoSeleccionado.x}%`,
                            top: `${puntoSeleccionado.y}%`
                        }}
                    />
                )}
            </div>
        </div>
    );
}
