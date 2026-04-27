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
    // DIFFERENT VALUES TO MATLAB
    kdvr: 0.0005,        // Water permeability, descending vasa recta
    kavr: 0.0005,        // Water permeability, ascending vasa recta
    knadvr: 0.0005,     // Na permeability, descending
    knaavr: 0.0005,     // Na permeability, ascending
    F0vr: 1.7,         // Flow into descending vasa recta

    // -- 1.4 Distal tubule parameters --
    kdt: 1.0E-3,    // Water permeability in distal tubule and cortical collecting duct   %NEW
    knadt: 5.E-3,   // Transport coefficient for Na in distal tubule and cortical collecting duct %NEW
    nDist: 10,      // Number of segments in distal tubule + cortical collecting duct
    
    // -- 1.5 Collecting duct parameters --
    kcd: 1.0E-3,    // Water permeability in collecting duct (ADH sensitive) %NEW
    knacd: 1.E-2,   // Transport coefficient for Na in medullary collecting duct %NEW
    nCD: 10,        // Number of segments in medullary collecting duct

    // -- 1.6 Henle graph --    
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

    vasaArrowScale: 1,
    vasaSaltArrowScale: 700,

    // -- 1.6 Vasa recta graph --
    nVasa: 20,
    totalHeightVasa: 300,
    totalWidthVasa: 225,
    interstitiumWidthVasa: 133, // width for interstitium in vasa

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
