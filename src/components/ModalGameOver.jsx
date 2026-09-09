import { useEffect } from "react";
import confetti from "canvas-confetti";
import wumpusSprite from "../assets/wumpus.png";
import pozoSprite from "../assets/pozo.png";
import { Trophy, Skull, RotateCcw, Footprints, ShieldAlert, Award, Home } from "lucide-react";

export function ModalGameOver({ partida, onReiniciar, onVolverMenu }) {
    const esVictoria = partida.gano;
    const esDerrota = !partida.vivo && !partida.gano;

    useEffect(() => {
        if (esVictoria) {
            try {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            } catch {
                // Ignore confetti error if canvas is not supported
            }
        }
    }, [esVictoria]);

    if (!esVictoria && !esDerrota) return null;

    let iconoMuerte = <Skull size={48} className="text-red-500" />;
    let tituloMuerte = "EXPEDICIÓN FALLIDA";
    let descripcionMuerte = "Las cavernas han reclamado tu vida.";
    let spriteMuerte = wumpusSprite;

    if (partida.causaMuerte === "wumpus") {
        tituloMuerte = "¡DEVORADO POR EL WUMPUS!";
        descripcionMuerte = "La bestia carnívora se abalanzó sobre ti en la oscuridad absoluta desgarrándote en segundos.";
        spriteMuerte = wumpusSprite;
    } else if (partida.causaMuerte === "pozo") {
        tituloMuerte = "¡CAÍSTE EN UN POZO SIN FONDO!";
        descripcionMuerte = "El suelo rocoso desapareció bajo tus pies y caíste al vacío del abismo infinito.";
        spriteMuerte = pozoSprite;
    } else if (partida.causaMuerte === "sin_flechas") {
        tituloMuerte = "¡INDEFENSO EN LA PENUMBRA!";
        descripcionMuerte = "Agotaste todas tus flechas doradas sin abatir a la bestia. El cazador fue cazado.";
        spriteMuerte = wumpusSprite;
    }

    return (
        <div className="modal-overlay">
            <div className={`modal-contenido ${esVictoria ? "modal-victoria" : "modal-derrota"}`}>
                {esVictoria ? (
                    <>
                        <div className="modal-icono-cabecera">
                            <Trophy size={60} className="trofeo-brillo" />
                        </div>
                        <h2 className="modal-titulo victoria-color">¡VICTORIA GLORIOSA!</h2>
                        <p className="modal-subtitulo">
                            Tu flecha atravesó el corazón de la temible bestia. Las cavernas han sido liberadas de su terror.
                        </p>

                        <div className="modal-stats">
                            <div className="stat-item">
                                <Award size={18} className="text-yellow-400" />
                                <span>Dificultad: <b>{partida.dificultad.toUpperCase()}</b></span>
                            </div>
                            <div className="stat-item">
                                <Footprints size={18} className="text-cyan-400" />
                                <span>Pasos dados: <b>{partida.pasos}</b></span>
                            </div>
                            <div className="stat-item">
                                <ShieldAlert size={18} className="text-orange-400" />
                                <span>Cavernas exploradas: <b>{partida.visitadas?.length || 1} / 15</b></span>
                            </div>
                        </div>

                        <div className="fila-botones-modal">
                            <button className="btn-modal btn-modal-victoria" onClick={onReiniciar}>
                                <RotateCcw size={20} />
                                <span>JUGAR DE NUEVO</span>
                            </button>
                            <button className="btn-modal btn-modal-secundario" onClick={onVolverMenu}>
                                <Home size={20} />
                                <span>MENÚ PRINCIPAL</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-icono-cabecera">
                            {spriteMuerte ? (
                                <img src={spriteMuerte} alt="Peligro mortal" className="sprite-muerte-modal" />
                            ) : (
                                iconoMuerte
                            )}
                        </div>
                        <h2 className="modal-titulo derrota-color">{tituloMuerte}</h2>
                        <p className="modal-subtitulo">{descripcionMuerte}</p>

                        <div className="modal-stats">
                            <div className="stat-item">
                                <span>Caverna mortal: <b>#{partida.jugador}</b></span>
                            </div>
                            <div className="stat-item">
                                <span>Pasos sobrevividos: <b>{partida.pasos}</b></span>
                            </div>
                            <div className="stat-item">
                                <span>Caverna del Wumpus: <b>#{partida.wumpus}</b></span>
                            </div>
                        </div>

                        <div className="fila-botones-modal">
                            <button className="btn-modal btn-modal-derrota" onClick={onReiniciar}>
                                <RotateCcw size={20} />
                                <span>INTENTAR DE NUEVO</span>
                            </button>
                            <button className="btn-modal btn-modal-secundario" onClick={onVolverMenu}>
                                <Home size={20} />
                                <span>MENÚ PRINCIPAL</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
