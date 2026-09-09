import { 
    Footprints, 
    Crosshair, 
    RotateCcw, 
    Volume2, 
    VolumeX, 
    Sliders, 
    Shield, 
    AlertTriangle,
    Navigation,
    Compass,
    Home
} from "lucide-react";

export function PanelControl({
    partida,
    vecinos,
    pistas,
    habitacionSeleccionada,
    onMover,
    onDisparar,
    onReiniciar,
    onVolverMenu,
    modoDesarrollador,
    coordenadas,
    puntoSeleccionado,
    onSeleccionarHabitacion,
    posiciones,
    silenciado,
    onToggleSilencio,
    volumenMusica,
    onCambiarVolumenMusica,
    volumenEfectos,
    onCambiarVolumenEfectos
}) {
    const esVecina = habitacionSeleccionada !== null && vecinos.includes(habitacionSeleccionada);
    const puedeActuar = partida.vivo && !partida.gano;

    return (
        <aside className="panel-lateral" id="panel-control-cazador">
            {/* ESTADO DEL CAZADOR */}
            <div className="tarjeta-estado">
                <div className="tarjeta-cabecera">
                    <Compass size={18} className="text-amber-400" />
                    <h2>ESTADO DE EXPEDICIÓN</h2>
                    <span className={`badge-dificultad ${partida.dificultad}`}>
                        {partida.dificultad.toUpperCase()}
                    </span>
                </div>

                <div className="grilla-stats">
                    <div className="stat-caja">
                        <span className="stat-label">📍 CAVERNA</span>
                        <span className="stat-valor destaque-caverna">#{partida.jugador}</span>
                    </div>

                    <div className="stat-caja">
                        <span className="stat-label">🏹 CARCAJ</span>
                        <div className="flechas-visuales">
                            {Array.from({ length: partida.flechasMax || 2 }).map((_, i) => (
                                <span 
                                    key={i} 
                                    className={`flecha-icono ${i < partida.flechas ? "disponible" : "agotada"}`}
                                    title={i < partida.flechas ? "Flecha dorada lista" : "Flecha gastada"}
                                >
                                    🏹
                                </span>
                            ))}
                            <span className="flechas-num">({partida.flechas})</span>
                        </div>
                    </div>

                    <div className="stat-caja">
                        <span className="stat-label">👣 PASOS</span>
                        <span className="stat-valor">{partida.pasos}</span>
                    </div>

                    <div className="stat-caja">
                        <span className="stat-label">🗺️ EXPLORADAS</span>
                        <span className="stat-valor">{partida.visitadas?.length || 1} / 15</span>
                    </div>
                </div>
            </div>

            {/* BITÁCORA Y MENSAJE RECIENTE */}
            <div className="tarjeta-mensaje">
                <div className="tarjeta-cabecera">
                    <Shield size={16} className="text-purple-400" />
                    <h3>REGISTRO DE EXPEDICIÓN</h3>
                </div>
                <div className="caja-mensaje-reciente">
                    <p className="texto-mensaje">{partida.mensaje}</p>
                </div>
            </div>

            {/* PISTAS SENSORIALES DE HORROR */}
            <div className="tarjeta-pistas">
                <div className="tarjeta-cabecera">
                    <AlertTriangle size={18} className="text-red-400" />
                    <h3>PERCEPCIÓN EN LA OSCURIDAD</h3>
                </div>

                {pistas.length === 0 ? (
                    <div className="pista-vacia">
                        <span className="icono-pista">🕯️</span>
                        <p>El aire está en calma. No percibes el hedor del Wumpus ni corrientes de abismo cercanas.</p>
                    </div>
                ) : (
                    <div className="lista-pistas">
                        {pistas.map((pista, idx) => (
                            <div key={idx} className={`pista-item ${pista.tipo}`}>
                                <span className="pista-icono">{pista.icono}</span>
                                <div className="pista-cuerpo">
                                    <h4 className="pista-titulo">{pista.titulo}</h4>
                                    <p className="pista-texto">{pista.texto}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ACCIONES TÁCTICAS */}
            <div className="tarjeta-acciones">
                <div className="tarjeta-cabecera">
                    <Crosshair size={18} className="text-cyan-400" />
                    <h3>ACCIONES DE CAZA</h3>
                </div>

                {habitacionSeleccionada === null ? (
                    <div className="aviso-seleccion">
                        <Navigation size={22} className="text-gray-400 animate-pulse" />
                        <p>Selecciona una caverna conectada en el mapa para decidir tu próximo movimiento.</p>
                        <div className="sugerencia-vecinos">
                            <span>Cavernas adyacentes: </span>
                            <b>{vecinos.join(", ")}</b>
                        </div>
                    </div>
                ) : (
                    <div className="detalle-accion">
                        <div className="caverna-objetivo-banner">
                            <span>OBJETIVO: </span>
                            <span className="num-objetivo">CAVERNA #{habitacionSeleccionada}</span>
                            {esVecina ? (
                                <span className="tag-conectada">✓ CONECTADA</span>
                            ) : (
                                <span className="tag-no-conectada">✗ SIN TÚNEL DIRECTO</span>
                            )}
                        </div>

                        {esVecina ? (
                            <div className="botones-accion-táctica">
                                <button
                                    className="btn-accion btn-mover"
                                    onClick={() => onMover(habitacionSeleccionada)}
                                    disabled={!puedeActuar}
                                >
                                    <Footprints size={20} />
                                    <div className="btn-texto-col">
                                        <span className="btn-titulo">AVANZAR A PIE</span>
                                        <span className="btn-sub">Entrar a la caverna #{habitacionSeleccionada}</span>
                                    </div>
                                </button>

                                <button
                                    className="btn-accion btn-disparar"
                                    onClick={() => onDisparar(habitacionSeleccionada)}
                                    disabled={!puedeActuar || partida.flechas <= 0}
                                >
                                    <Crosshair size={20} />
                                    <div className="btn-texto-col">
                                        <span className="btn-titulo">DISPARAR FLECHA</span>
                                        <span className="btn-sub">
                                            {partida.flechas > 0 
                                                ? `Lanzar proyectil a #${habitacionSeleccionada}` 
                                                : "¡Sin flechas restantes!"}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <p className="aviso-no-conectada">
                                No puedes alcanzar la caverna #{habitacionSeleccionada} desde tu posición actual (#{partida.jugador}). Elige una de tus cavernas vecinas: <b>{vecinos.join(", ")}</b>.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* BOTONES DE EXPEDICIÓN Y REGRESO A MENÚ */}
            <div className="fila-botones-control">
                <button 
                    id="btn-reiniciar-panel" 
                    className="btn-reiniciar" 
                    onClick={onReiniciar}
                    title="Reiniciar con la misma dificultad"
                >
                    <RotateCcw size={18} />
                    <span>REINICIAR</span>
                </button>

                <button 
                    id="btn-menu-panel" 
                    className="btn-volver-menu-panel" 
                    onClick={onVolverMenu}
                    title="Volver a la portada principal para cambiar dificultad"
                >
                    <Home size={18} />
                    <span>MENÚ PRINCIPAL</span>
                </button>
            </div>

            {/* CONTROLES DE AUDIO */}
            <div className="tarjeta-audio">
                <div className="audio-header">
                    <button 
                        className="btn-mute-toggle" 
                        onClick={onToggleSilencio}
                        title={silenciado ? "Activar audio" : "Silenciar audio"}
                    >
                        {silenciado ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-green-400" />}
                        <span>{silenciado ? "AUDIO SILENCIADO" : "AUDIO ACTIVADO"}</span>
                    </button>
                    <Sliders size={16} className="text-gray-400" />
                </div>

                {!silenciado && (
                    <div className="sliders-audio">
                        <div className="slider-fila">
                            <label>Ambiente:</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={volumenMusica}
                                onChange={(e) => onCambiarVolumenMusica(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="slider-fila">
                            <label>Efectos:</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={volumenEfectos}
                                onChange={(e) => onCambiarVolumenEfectos(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL DE MODO DESARROLLADOR */}
            {modoDesarrollador && (
                <div className="panel-coordenadas">
                    <h3>🔧 Modo Desarrollador Activo</h3>
                    <p>
                        Selecciona una habitación y haz clic en el mapa para registrar o calibrar sus coordenadas exactas.
                    </p>

                    <select
                        value={habitacionSeleccionada || ""}
                        onChange={(event) => {
                            const val = event.target.value;
                            onSeleccionarHabitacion(val ? Number(val) : null);
                        }}
                    >
                        <option value="">Seleccionar habitación para calibrar...</option>
                        {Object.keys(posiciones).map(numero => (
                            <option key={numero} value={numero}>
                                Caverna {numero}
                            </option>
                        ))}
                    </select>

                    <div className="coordenadas">
                        <strong>X: {coordenadas.x}%</strong>
                        <strong>Y: {coordenadas.y}%</strong>
                    </div>

                    {puntoSeleccionado && habitacionSeleccionada && (
                        <div className="codigo-posicion">
                            <p>📋 Coordenada para <b>mapa.js</b>:</p>
                            <code>
                                {`${habitacionSeleccionada}: { x: ${puntoSeleccionado.x}, y: ${puntoSeleccionado.y} },`}
                            </code>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
