// ==================== config.js ====================

export const params = {
    // -- 1.1 Model parameters --
    k1: 0.5,           // Reflection coefficient for NaCl
    Na0: 300,          // Osmolarity of the isotonic fluid into the descending limb
    maxGrad: 250,      // Maximum gradient for NaCl in ascending limb
    dt: 0.01,          // Time step

    // -- 1.2 Model variables (mutable) --
    k: 0.0005,         // Water permeability of descending limb
    maxRNa: 100,       // Maximum rate of NaCl reabsorption
    F0: 2,             // Flow of isotonic fluid into the descending limb

    // -- 1.3 Vasa recta parameters --
    kdvr: 0.01,        // Water permeability, descending vasa recta
    kavr: 0.01,        // Water permeability, ascending vasa recta
    knadvr: 0.001,     // Na permeability, descending
    knaavr: 0.001,     // Na permeability, ascending
    F0vr: 1.3,         // Flow into descending vasa recta

    // -- 1.4 Henle graph --
    nSegments: 20,
    totalHeight: 400,
    totalWidth: 240,
    interstitiumWidth: 109,  // width for interstitium

    // Derived widths & heights
    get limbWidth() { return (this.totalWidth - this.interstitiumWidth) / 2; },
    get segmentHeight() { return this.totalHeight / this.nSegments; },
    get descWidth() { return this.limbWidth; },
    get intWidth() { return this.interstitiumWidth; },
    get ascWidth() { return this.limbWidth; },

    // -- 1.5 Arrows --
    waterArrowScale: 350,
    saltArrowScale: 0.8,
    vasaArrowScale: 0,
    vasaSaltArrowScale: 0,

    // -- 1.6 Vasa recta graph --
    nVasa: 20,
    totalHeightVasa: 300,
    totalWidthVasa: 225,
    interstitiumWidthVasa: 130, // width for interstitium in vasa

    get limbWidthVasa() { return (this.totalWidthVasa - this.interstitiumWidthVasa) / 2; },
    get segmentHeightVasa() { return this.totalHeightVasa / this.nVasa; },
    get descWidthVasa() { return this.limbWidthVasa; },
    get intWidthVasa() { return this.interstitiumWidthVasa; },
    get ascWidthVasa() { return this.limbWidthVasa; },

    // -- 1.7 Color bar --
    maxConcentration: 1600,
    colorbarTickStep: 200,

    // -- 1.8 Animation parameters --
    eulerStepsPerFrame: 80,
    framesPerSecond: 30,
    get miliSecondWait() { return 1000 / this.framesPerSecond; }
};
