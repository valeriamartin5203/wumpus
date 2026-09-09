// =============================================
// audio.js - GESTOR DE AUDIO Y ATMÓSFERA SONORA
// =============================================

import audioAmbiente from "../assets/ambiente.wav";
import audioVictoria from "../assets/Sonido de Victoria de un Juego para tus vídeos - Efecto de Sonido.mp3";
import audioWumpusScream from "../assets/Demon Monster (Scream).mp3";
import audioMurcielagos from "../assets/Efecto de sonido_ Murciélago vuelo y chillido.mp3";
import audioCaida from "../assets/Sonido de caida al suelo.mp3";
import audioBrisa from "../assets/Brisa_ efecto de sonido.mp3";

class GestorAudio {
    constructor() {
        this.ctx = null;
        this.silenciado = false;
        this.volumenMusica = 0.4;
        this.volumenEfectos = 0.7;

        // Archivos de audio cargados
        this.archivos = {
            ambiente: new Audio(audioAmbiente),
            victoria: new Audio(audioVictoria),
            wumpus: new Audio(audioWumpusScream),
            murcielagos: new Audio(audioMurcielagos),
            caida: new Audio(audioCaida),
            brisa: new Audio(audioBrisa)
        };

        this.archivos.ambiente.loop = true;
        this.archivos.ambiente.volume = this.volumenMusica * 0.6;

        this.heartbeatInterval = null;
        this.droneNodes = null;
        this.droneTimer = null;
    }

    obtenerContexto() {
        if (!this.ctx && typeof window !== "undefined") {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    // =========================================
    // AMBIENTACIÓN EN BUCLE TÉTRICA Y PROCEDURAL
    // =========================================
    iniciarAmbiente() {
        if (this.silenciado) return;

        // 1. Audio base en bucle
        try {
            this.archivos.ambiente.volume = this.volumenMusica * 0.45;
            this.archivos.ambiente.play().catch(() => {
                // Se iniciará con el primer clic del usuario
            });
        } catch {
            // Audio no listo
        }

        // 2. Drone tétrico procedural continuo (sin corte de loop, genera atmósfera viva)
        this.iniciarDroneTetrico();
    }

    detenerAmbiente() {
        try {
            this.archivos.ambiente.pause();
            this.archivos.ambiente.currentTime = 0;
        } catch {
            // Audio no cargado aún
        }
        this.detenerDroneTetrico();
    }

    iniciarDroneTetrico() {
        if (this.droneNodes) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        try {
            const droneMasterGain = ctx.createGain();
            const droneVol = this.silenciado ? 0 : this.volumenMusica * 0.35;
            droneMasterGain.gain.setValueAtTime(0.001, ctx.currentTime);
            droneMasterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, droneVol), ctx.currentTime + 2.5);
            droneMasterGain.connect(ctx.destination);

            // Sub-drone 1 (Frecuencia sub-grave 43Hz)
            const subOsc1 = ctx.createOscillator();
            subOsc1.type = "sine";
            subOsc1.frequency.setValueAtTime(43, ctx.currentTime);

            // Sub-drone 2 (47Hz para batimiento binaural psicoacústico de 4Hz - sensación de inquietud)
            const subOsc2 = ctx.createOscillator();
            subOsc2.type = "sine";
            subOsc2.frequency.setValueAtTime(47, ctx.currentTime);

            // Resonancia oscura de catacumba (86Hz con filtro pasa-bajos)
            const lowOsc = ctx.createOscillator();
            lowOsc.type = "triangle";
            lowOsc.frequency.setValueAtTime(86, ctx.currentTime);

            const lowFilter = ctx.createBiquadFilter();
            lowFilter.type = "lowpass";
            lowFilter.frequency.setValueAtTime(140, ctx.currentTime);

            // LFO lento para respiración/pulsación de la caverna (0.07Hz = 1 ciclo cada ~14 seg)
            const lfo = ctx.createOscillator();
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(0.07, ctx.currentTime);

            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(15, ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(lowFilter.frequency);

            // Viento espectral filtrado de ruido rosa
            const noiseBufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < noiseBufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                noiseData[i] = (b0 + b1 + b2) * 0.12;
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.loop = true;

            const windFilter = ctx.createBiquadFilter();
            windFilter.type = "bandpass";
            windFilter.frequency.setValueAtTime(220, ctx.currentTime);
            windFilter.Q.setValueAtTime(4.0, ctx.currentTime);

            const windGain = ctx.createGain();
            windGain.gain.setValueAtTime(0.18, ctx.currentTime);

            noiseSource.connect(windFilter);
            windFilter.connect(windGain);
            windGain.connect(droneMasterGain);

            subOsc1.connect(droneMasterGain);
            subOsc2.connect(droneMasterGain);
            lowOsc.connect(lowFilter);
            lowFilter.connect(droneMasterGain);

            subOsc1.start();
            subOsc2.start();
            lowOsc.start();
            lfo.start();
            noiseSource.start();

            this.droneNodes = {
                droneMasterGain,
                subOsc1,
                subOsc2,
                lowOsc,
                lfo,
                noiseSource
            };

            // Gotas de agua y crujidos esporádicos en la caverna para romper cualquier monotonía
            this.programarSonidosAleatoriosCaverna();
        } catch {
            // Audio context aún no disponible
        }
    }

    programarSonidosAleatoriosCaverna() {
        if (this.droneTimer) clearTimeout(this.droneTimer);

        const tiempoHastaSiguiente = Math.random() * 4500 + 3500; // entre 3.5s y 8s

        this.droneTimer = setTimeout(() => {
            if (!this.droneNodes || this.silenciado) return;

            // 60% gota de agua, 40% eco o crujido distante
            if (Math.random() < 0.65) {
                this.reproducirGotaAgua();
            } else {
                this.reproducirCrujidoRoca();
            }

            this.programarSonidosAleatoriosCaverna();
        }, tiempoHastaSiguiente);
    }

    detenerDroneTetrico() {
        if (this.droneTimer) {
            clearTimeout(this.droneTimer);
            this.droneTimer = null;
        }

        if (this.droneNodes) {
            try {
                const { droneMasterGain, subOsc1, subOsc2, lowOsc, lfo, noiseSource } = this.droneNodes;
                const ctx = this.obtenerContexto();
                if (ctx) {
                    droneMasterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
                    setTimeout(() => {
                        try {
                            subOsc1.stop();
                            subOsc2.stop();
                            lowOsc.stop();
                            lfo.stop();
                            noiseSource.stop();
                        } catch {
                            // Ya detenido
                        }
                    }, 850);
                }
            } catch {
                // Fallo al detener
            }
            this.droneNodes = null;
        }
    }

    // Gota de agua procedural con eco en caverna
    reproducirGotaAgua() {
        if (this.silenciado) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Tono tipo "plop" agudo
        const freqBase = 1100 + Math.random() * 600;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freqBase, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqBase * 0.7, ctx.currentTime + 0.08);

        const vol = (0.08 + Math.random() * 0.06) * this.volumenMusica;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.24);
    }

    // Crujido o eco de roca subterránea
    reproducirCrujidoRoca() {
        if (this.silenciado) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sawtooth";
        const baseFreq = 50 + Math.random() * 30;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, ctx.currentTime + 0.4);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(120, ctx.currentTime);

        const vol = 0.07 * this.volumenMusica;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.52);
    }

    // =========================================
    // REPRODUCCIÓN DE ARCHIVOS
    // =========================================
    reproducirArchivo(nombre) {
        if (this.silenciado) return;
        const audio = this.archivos[nombre];
        if (!audio) return;

        try {
            audio.currentTime = 0;
            audio.volume = this.volumenEfectos;
            audio.play().catch(() => {
                // Interacción bloqueada por el navegador
            });
        } catch {
            // Error en reproducción de audio
        }
    }

    detenerArchivo(nombre) {
        const audio = this.archivos[nombre];
        if (!audio) return;
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch {
            // Audio no activo
        }
    }

    detenerTodosLosEfectos() {
        ["victoria", "wumpus", "murcielagos", "caida", "brisa"].forEach(k => {
            this.detenerArchivo(k);
        });
        this.detenerLatidos();
    }

    establecerSilenciado(silenciado) {
        this.silenciado = silenciado;
        if (silenciado) {
            this.archivos.ambiente.pause();
            this.detenerDroneTetrico();
            this.detenerTodosLosEfectos();
        } else {
            this.iniciarAmbiente();
        }
    }

    establecerVolumenMusica(vol) {
        this.volumenMusica = Math.max(0, Math.min(1, vol));
        this.archivos.ambiente.volume = this.silenciado ? 0 : this.volumenMusica * 0.45;
        if (this.droneNodes && !this.silenciado) {
            try {
                const ctx = this.obtenerContexto();
                if (ctx) {
                    this.droneNodes.droneMasterGain.gain.setValueAtTime(
                        Math.max(0.001, this.volumenMusica * 0.35),
                        ctx.currentTime
                    );
                }
            } catch {
                // Contexto ocupado
            }
        }
    }

    establecerVolumenEfectos(vol) {
        this.volumenEfectos = Math.max(0, Math.min(1, vol));
    }

    // =========================================
    // SÍNTESIS WEB AUDIO: EFECTOS PROCEDURALES
    // =========================================

    // Paso sobre piedra húmeda
    reproducirPaso() {
        if (this.silenciado) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(300, ctx.currentTime);

        const vol = 0.25 * this.volumenEfectos;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.13);
    }

    // Disparo de flecha con silbido de viento
    reproducirDisparoFlecha() {
        if (this.silenciado) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        // Tensión y soltado de cuerda
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(340, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.4 * this.volumenEfectos, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);

        // Ruido blanco para el vuelo/silbido de la flecha
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(1400, ctx.currentTime);
        noiseFilter.Q.setValueAtTime(3.0, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35 * this.volumenEfectos, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(ctx.currentTime + 0.05);
    }

    // Impacto de flecha en piedra
    reproducirImpactoRoca() {
        if (this.silenciado) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3 * this.volumenEfectos, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    }

    // Rugido lejano de bestia (tensión de proximidad)
    reproducirGrunidoDistante() {
        if (this.silenciado) return;
        const ctx = this.obtenerContexto();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(48, ctx.currentTime + 1.2);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        const vol = 0.4 * this.volumenEfectos;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.35);
    }

    // Latido de corazón tenso (cuando el Wumpus está a 1 paso)
    iniciarLatidos(intensidad = 1) {
        if (this.heartbeatInterval) return;
        const intervaloMs = Math.max(500, 1100 - intensidad * 300);

        const darLatido = () => {
            if (this.silenciado) return;
            const ctx = this.obtenerContexto();
            if (!ctx) return;

            // Primer golpe (Lub)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(65, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.09);

            gain1.gain.setValueAtTime(0.45 * this.volumenEfectos, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.11);

            // Segundo golpe (Dub) tras 120ms
            setTimeout(() => {
                if (this.silenciado || !this.ctx) return;
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = "sine";
                osc2.frequency.setValueAtTime(58, ctx.currentTime);
                osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.08);

                gain2.gain.setValueAtTime(0.35 * this.volumenEfectos, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.1);
            }, 120);
        };

        darLatido();
        this.heartbeatInterval = setInterval(darLatido, intervaloMs);
    }

    detenerLatidos() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

export const gestorAudio = new GestorAudio();
