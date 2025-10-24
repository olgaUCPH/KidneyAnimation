// ==================== main.js ====================


import { params } from "./config.js";
import { createSegmentState, createVasaState } from "./state.js";
import { eulerStep, vasaEulerStep } from "./model.js";
import { drawHenle, drawVasa, drawArrows, drawVasaArrows, drawColorBar } from "./draw.js";
import { initUI } from "./ui.js";
import { createFilledArray } from "./utils.js";
import { initSvg, updateSvgColors } from "./svg.js";


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
    F0: 2
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
    drawHenle(ctx, segmentState);
    drawArrows(ctx, fluxes.R, fluxes.RNa);

    drawVasa(vasaCtx, vasaState, segmentState);
    drawVasaArrows(vasaCtx, vasaFluxes.R, vasaFluxes.RNa);

    drawColorBar(ctxBar);
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
