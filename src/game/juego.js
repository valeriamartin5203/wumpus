// =============================================
// juego.js
// LÓGICA DE GENERACIÓN Y MECÁNICAS DEL JUEGO
// =============================================

import {
    habitacionAleatoria,
    obtenerVecinos
} from "./mapa";

// =============================================
// OBTENER POSICIÓN LIBRE
// =============================================

function obtenerPosicionLibre(ocupadas) {
    let posicion;
    do {
        posicion = habitacionAleatoria();
    } while (ocupadas.includes(posicion));
    return posicion;
}

// =============================================
// CREAR PARTIDA
// =============================================

export function crearPartida(dificultad = "normal") {
    const ocupadas = [];

    // JUGADOR
    const jugador = obtenerPosicionLibre(ocupadas);
    ocupadas.push(jugador);

    // WUMPUS
    const wumpus = obtenerPosicionLibre(ocupadas);
    ocupadas.push(wumpus);

    // POZOS
    const pozo1 = obtenerPosicionLibre(ocupadas);
    ocupadas.push(pozo1);

    const pozo2 = obtenerPosicionLibre(ocupadas);
    ocupadas.push(pozo2);

    // MURCIÉLAGOS
    const murcielago1 = obtenerPosicionLibre(ocupadas);
    ocupadas.push(murcielago1);

    const murcielago2 = obtenerPosicionLibre(ocupadas);
    ocupadas.push(murcielago2);

    let flechasIniciales = 2;
    if (dificultad === "facil") flechasIniciales = 3;
    if (dificultad === "pesadilla") flechasIniciales = 1;

    return {
        jugador,
        wumpus,
        pozos: [pozo1, pozo2],
        murcielagos: [murcielago1, murcielago2],
        flechas: flechasIniciales,
        flechasMax: flechasIniciales,
        dificultad,
        vivo: true,
        gano: false,
        causaMuerte: null, // "wumpus" | "pozo" | "sin_flechas"
        pasos: 0,
        visitadas: [jugador],
        mensaje: `Has descendido a la caverna #${jugador}. Tu antorcha ilumina tímidamente la piedra fría.`
    };
}

// =============================================
// OBTENER PISTAS SENSORIALES DE HORROR
// =============================================

export function obtenerPistas(partida) {
    const vecinos = obtenerVecinos(partida.jugador);
    const pistas = [];

    // -----------------------------------------
    // WUMPUS
    // -----------------------------------------
    const wumpusCerca = vecinos.includes(partida.wumpus);
    if (wumpusCerca) {
        pistas.push({
            tipo: "wumpus",
            icono: "👃",
            titulo: "Hedor a sangre y podredumbre",
            texto: "Hueles algo nauseabundo... ¡El temible Wumpus respira en una caverna vecina!"
        });
    }

    // -----------------------------------------
    // POZOS
    // -----------------------------------------
    const pozoCerca = vecinos.some(habitacion =>
        partida.pozos.includes(habitacion)
    );
    if (pozoCerca) {
        pistas.push({
            tipo: "pozo",
            icono: "💨",
            titulo: "Corriente gélida del abismo",
            texto: "Sientes una brisa fría ascender desde la oscuridad... Hay un pozo sin fondo cerca."
        });
    }

    // -----------------------------------------
    // MURCIÉLAGOS
    // -----------------------------------------
    const murcielagoCerca = vecinos.some(habitacion =>
        partida.murcielagos.includes(habitacion)
    );
    if (murcielagoCerca) {
        pistas.push({
            tipo: "murcielago",
            icono: "🦇",
            titulo: "Ecos en las sombras",
            texto: "Escuchas aleteos frenéticos y chillidos agudos... Murciélagos espectrales acechan."
        });
    }

    return pistas;
}
