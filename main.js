// ==================== main.js ====================
import { params } from "./config.js";
import { createSegmentState, createVasaState } from "./state.js";
import { eulerStep, vasaEulerStep } from "./model.js";
import { drawHenle, drawVasa, drawArrows, drawVasaArrows, drawColorBar, drawDistal, drawCollecting } from "./draw.js";
import { initUI } from "./ui.js";
import { createFilledArray } from "./utils.js";
import { initSvg, updateSvgColors, setUrineSampleOffset } from "./svg.js";
import { concentrationToColor, drawLegend } from "./draw.js";


// ---- Canvas contexts ----
const canvas = document.getElementById("henleCanvas");
const ctx = canvas.getContext("2d");
ctx.scale(4, 4);

const vasaCanvas = document.getElementById("vasaCanvas");
const vasaCtx = vasaCanvas.getContext("2d");
vasaCtx.scale(4, 4);

const colorBarCanvas = document.getElementById("colorBar");
const ctxBar = colorBarCanvas.getContext("2d");

const colorBarVasaCanvas = document.getElementById("colorBarVasa");
const ctxBarVasa = colorBarVasaCanvas.getContext("2d");

// ---- Distal canvas context ----
const distalCanvas = document.getElementById("distalCanvas");
let distalCtx = null;
if (distalCanvas) {
    distalCtx = distalCanvas.getContext("2d");
    distalCtx.scale(4, 4);
}

// ---- Collecting duct canvas context ----
const collectingCanvas = document.getElementById("collectingCanvas");
let collectingCtx = null;
if (collectingCanvas) {
    collectingCtx = collectingCanvas.getContext("2d");
    collectingCtx.scale(4, 4);
}


// ---- Model state ----
const segmentState = createSegmentState();
const vasaState = createVasaState();
initSvg(segmentState, vasaState);

// Translate urine sample elements in the SVG
const urineHeight = document.getElementById('pixelSlider');
if (urineHeight) {
    // initialize
    setUrineSampleOffset(parseInt(urineHeight.value, 10) || 0);
    urineHeight.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) || 0;
        setUrineSampleOffset(val);
    });
}


// ---- Model variables (can be changed by UI) ----
const modelVars = {
    k: 0.0005,
    maxRNa: 100,
    F0: 2,
    F0vr: params.F0vr,
    kcd: params.kcd,
    knacd: params.knacd
};

// ---- UI callbacks ----
function resetSimulation() {
    segmentState.desc = createFilledArray(params.nSegments, params.Na0);
    segmentState.asc = createFilledArray(params.nSegments, params.Na0);
    segmentState.ints = createFilledArray(params.nSegments, params.Na0);

    segmentState.dist = createFilledArray(params.nDist, params.Na0);
    segmentState.cd = createFilledArray(params.nCD, params.Na0);

    vasaState.desc = createFilledArray(params.nVasa, params.Na0);
    vasaState.asc = createFilledArray(params.nVasa, params.Na0);
}

function replaySimulation() {
    resetSimulation();
    drawAll();
}

// ---- Initialize UI ----
initUI(modelVars, resetSimulation, replaySimulation);


// ---- Main drawing loop ----
function drawAll(
    fluxes = { R: createFilledArray(params.nSegments, 0), RNa: createFilledArray(params.nSegments, 0) },
    vasaFluxes = { R: createFilledArray(params.nVasa, 0), RNa: createFilledArray(params.nVasa, 0) }
) {
    const showHenle = document.getElementById("showHenle").checked;
    const showVasa = document.getElementById("showVasa").checked;

    drawInterstitiumGradient(segmentState);

    // Clear canvases first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    vasaCtx.clearRect(0, 0, vasaCanvas.width, vasaCanvas.height);

    // Colorbar wrappers (title + canvas)
    const henleColorbarWrapper = document.querySelector(".colorbar-wrapper.henle");
    const vasaColorbarWrapper = document.querySelector(".colorbar-wrapper.vasa");

    // Henle
    if (showHenle) {
        drawHenle(ctx, segmentState);
        // Draw distal tubule band
        if (distalCtx) drawDistal(distalCtx, segmentState.dist);
        // Draw collecting duct using model values
        if (collectingCtx) drawCollecting(collectingCtx, segmentState.cd);
        drawArrows(ctx, fluxes.R, fluxes.RNa);
        drawColorBar(ctxBar, 'henle');

        if (henleColorbarWrapper) henleColorbarWrapper.style.visibility = "visible";
    } else {
        ctxBar.clearRect(0, 0, ctxBar.canvas.width, ctxBar.canvas.height);
        if (henleColorbarWrapper) henleColorbarWrapper.style.visibility = "hidden";
    }

    // Vasa
    if (showVasa) {
        drawVasa(vasaCtx, vasaState, segmentState);
        drawVasaArrows(vasaCtx, vasaFluxes.R, vasaFluxes.RNa);
        drawColorBar(ctxBarVasa, 'vasa');

        if (vasaColorbarWrapper) vasaColorbarWrapper.style.visibility = "visible";
    } else {
        ctxBarVasa.clearRect(0, 0, ctxBarVasa.canvas.width, ctxBarVasa.canvas.height);
        if (vasaColorbarWrapper) vasaColorbarWrapper.style.visibility = "hidden";
    }

}

// ---- Draw interstitium gradient ----
const interstitiumCanvas = document.getElementById("interstitiumCanvas");
const interCtx = interstitiumCanvas.getContext("2d");

function drawInterstitiumGradient(segmentState) {
    const nSegments = segmentState.ints.length;
    const segmentHeight = interstitiumCanvas.height / nSegments;
    const width = interstitiumCanvas.width;

    for (let i = 0; i < nSegments; i++) {
        const y = i * segmentHeight;
        const color = concentrationToColor(segmentState.ints[i]);
        interCtx.fillStyle = color;
        interCtx.fillRect(0, y, width, segmentHeight);
    }

    const bottomCanvas = document.getElementById("bottomCanvas");
    const bottomCtx = bottomCanvas.getContext("2d");

    const bottomInt = segmentState.ints[segmentState.ints.length - 1];
    const color = concentrationToColor(bottomInt);
    bottomCtx.fillStyle = color;
    bottomCtx.fillRect(0, 0, bottomCanvas.width, bottomCanvas.height);
    drawLegend(bottomCtx)
}

// ---- Animation loop ----
let stepsPerFrame = params.eulerStepsPerFrame; // can be changed by speed input
const speedInput = document.getElementById("speedInput"); // your spin box

speedInput.addEventListener("input", (e) => {
    let multiplier = parseFloat(e.target.value);

    // Clamp to allowed range
    multiplier = Math.min(Math.max(multiplier, 0.25), 4);

    // update stepsPerFrame
    stepsPerFrame = Math.max(1, Math.round(params.eulerStepsPerFrame * multiplier));
});

setInterval(() => {
    let fluxes, vasaFluxes;

    for (let n = 0; n < stepsPerFrame; n++) {
        fluxes = eulerStep(segmentState, params.dt, modelVars);
        vasaFluxes = vasaEulerStep(segmentState, vasaState, params.dt, modelVars);
    }

    drawAll(fluxes, vasaFluxes);
    updateSvgColors();
}, params.miliSecondWait);



// ---- Initial draw ----
drawAll();
