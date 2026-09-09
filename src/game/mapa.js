// =============================================
// mapa.js
// GRAFO NO DIRIGIDO - CAZA AL WUMPUS
// =============================================

// Cada número representa una habitación.
//
// Ejemplo:
// 1: [2, 5, 6]
//
// Significa que desde la habitación 1
// podemos ir a 2, 5 y 6.
//
// Para que sea un grafo no dirigido,
// las conexiones también aparecen en sentido contrario.

export const grafo = {

    1: [4, 2 ],
    2: [1, 3, 7],
    3: [2, 9],

    4: [1, 5, 6],
    5: [4, 14 ],
    6: [4, 7, 10],

    7: [2, 6, 8 ],
    8: [7, 9, 11 ],
    9: [3, 8, 12],

    10: [6, 14, 11],
    11: [8, 10, 13],
    12: [9, 13],

    13: [11, 12, 15],
    14: [5, 10, 15],
    15: [13, 14]

};


// =============================================
// POSICIONES DE LAS 15 HABITACIONES
// =============================================
//
// x = posición horizontal (%)
// y = posición vertical (%)
//
// ESTAS SON POSICIONES INICIALES.
// Las podrás modificar usando el
// modo desarrollador.
//
// =============================================

export const posiciones = {

    1: { x: 12.07, y: 16.96 },
    2: { x: 43.93, y: 18.16 },
    3: { x: 93.67, y: 20.56 },

    4: { x: 5.27, y: 39.23 },
    5: { x: 5, y: 62.7 },
    6: { x: 26.47, y: 48.7 },

    7: { x: 43, y: 34.3 },
    8: { x: 64.87, y: 49.5 },

    9: { x: 91.8, y: 49.76 },
    10: { x: 32.6, y: 62.03 },
    11: { x: 54.47, y: 61.9 },

    12: { x: 91.67, y: 78.96 },
    13: { x: 65.27, y: 80.43 },
    14: { x: 28.73, y: 78.83 },

    15: { x: 47.93, y: 91.76 }

};


// =============================================
// OBTENER VECINOS
// =============================================

export function obtenerVecinos(habitacion) {

    return grafo[habitacion] || [];

}


// =============================================
// COMPROBAR CONEXIÓN
// =============================================

export function estanConectadas(origen, destino) {

    return grafo[origen]?.includes(destino) || false;

}


// =============================================
// HABITACIÓN ALEATORIA
// =============================================

export function habitacionAleatoria() {

    return Math.floor(Math.random() * 15) + 1;

}