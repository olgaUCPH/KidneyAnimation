// ==================== main.js ====================


import { params } from "./config.js";
import { createSegmentState, createVasaState } from "./state.js";
import { eulerStep, vasaEulerStep } from "./model.js";
import { drawHenle, drawVasa, drawArrows, drawVasaArrows, drawColorBar } from "./draw.js";
import { initUI } from "./ui.js";
import { createFilledArray } from "./utils.js";
import { initSvg, updateSvgColors } from "./svg.js";
import { concentrationToColor } from "./draw.js";


// ---- Canvas contexts ----
const canvas = document.getElementById("henleCanvas");
const ctx = canvas.getContext("2d");
ctx.scale(4, 4);

const vasaCanvas = document.getElementById("vasaCanvas");
const vasaCtx = vasaCanvas.getContext("2d");
vasaCtx.scale(4, 4);

const colorBarCanvas = document.getElementById("colorBar");
const ctxBar = colorBarCanvas.getContext("2d");

// ---- Model state ----
const segmentState = createSegmentState();
const vasaState = createVasaState();
initSvg(segmentState, vasaState);


// ---- Model variables (can be changed by UI) ----
const modelVars = {
    k: 0.0005,
    maxRNa: 100,
    F0: 2,
    F0vr: 1.3
};

// ---- UI callbacks ----
function resetSimulation() {
    segmentState.desc = createFilledArray(params.nSegments, params.Na0);
    segmentState.asc = createFilledArray(params.nSegments, params.Na0);
    segmentState.ints = createFilledArray(params.nSegments, params.Na0);

    vasaState.desc = createFilledArray(params.nVasa, params.Na0);
    vasaState.asc = createFilledArray(params.nVasa, params.Na0);
}

function replaySimulation() {
    resetSimulation();
    drawAll();
}

// ---- Initialize UI ----
initUI(modelVars, resetSimulation, replaySimulation);


// ---- Draw everything ----
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

    if (showHenle) {
        drawHenle(ctx, segmentState);
        drawArrows(ctx, fluxes.R, fluxes.RNa);
    }

    if (showVasa) {
        drawVasa(vasaCtx, vasaState, segmentState);
        drawVasaArrows(vasaCtx, vasaFluxes.R, vasaFluxes.RNa);
    }

    drawColorBar(ctxBar);
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
}



// ---- Animation loop ----
setInterval(() => {
    let fluxes, vasaFluxes;

    for (let n = 0; n < params.eulerStepsPerFrame; n++) {
        fluxes = eulerStep(segmentState, params.dt, modelVars);
        vasaFluxes = vasaEulerStep(segmentState, vasaState, params.dt, modelVars);
    }

    drawAll(fluxes, vasaFluxes);
    updateSvgColors();
}, params.miliSecondWait);



// ---- Initial draw ----
drawAll();
