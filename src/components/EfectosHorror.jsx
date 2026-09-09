export function EfectosHorror({ hayWumpusCerca, hayPozoCerca, hayMurcielagoCerca, temblorPantalla }) {
    return (
        <div className={`efectos-horror-container ${temblorPantalla ? "temblor-activo" : ""}`}>
            {/* Vignette de peligro de Wumpus: pulsación carmesí */}
            {hayWumpusCerca && (
                <div className="vignette-sangre" title="¡El Wumpus está a una caverna de distancia!">
                    <div className="resplandor-sangre" />
                    <div className="texto-alerta-horror">
                        <span>⚠️ HEDOR A MUERTE INMINENTE ⚠️</span>
                    </div>
                </div>
            )}

            {/* Vignette de Pozo: escarcha y viento gélido */}
            {hayPozoCerca && !hayWumpusCerca && (
                <div className="vignette-frio" title="Corriente de abismo cercana">
                    <div className="resplandor-frio" />
                    <div className="texto-alerta-frio">
                        <span>💨 CORRIENTE GÉLIDA DEL ABISMO</span>
                    </div>
                </div>
            )}

            {/* Murciélagos: siluetas en sombra */}
            {hayMurcielagoCerca && (
                <div className="sombras-murcielagos">
                    <span className="murcielago-sombra s1">🦇</span>
                    <span className="murcielago-sombra s2">🦇</span>
                </div>
            )}
        </div>
    );
}
