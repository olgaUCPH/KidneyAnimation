// ==================== main.js ====================


    import { params } from "./config.js";
    import { createSegmentState, createVasaState } from "./state.js";
    import { eulerStep, vasaEulerStep } from "./model.js";
    import { drawHenle, drawVasa, drawArrows, drawVasaArrows, drawColorBar, drawDistal, drawCollecting } from "./draw.js";
    import { initUI } from "./ui.js";
    import { createFilledArray } from "./utils.js";
    import { initSvg, updateSvgColors } from "./svg.js";
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
const distalCtx = distalCanvas.getContext("2d");
distalCtx.scale(4, 4);

// ---- Collecting duct canvas context ----
const collectingCanvas = document.getElementById("collectingCanvas");
const collectingCtx = collectingCanvas.getContext("2d");
collectingCtx.scale(4, 4);


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
    distalCtx.clearRect(0, 0, distalCanvas.width, distalCanvas.height);
    collectingCtx.clearRect(0, 0, collectingCanvas.width, collectingCanvas.height);

    // Henle colorbar wrapper (title + canvas)
    const henleColorbarWrapper = document.querySelector(".colorbar-wrapper.henle");
    // Vasa colorbar wrapper (title + canvas)
    const vasaColorbarWrapper = document.querySelector(".colorbar-wrapper.vasa");
    
    // Henle
    if (showHenle) {
        drawHenle(ctx, segmentState);
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

    // Draw distal canvas unconditionally (use distal values if available)
    drawDistal(distalCtx, fluxes?.distal);

    // Draw collecting duct placeholder (solid magenta)
    drawCollecting(collectingCtx);


    
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

    // clamp to allowed range if you want
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


// ---- Headless simulation exporter (CSV) ----
/**
 * Run a headless simulation and export CSV files for Henle and Vasa time series.
 * Defaults: tEnd=200, sampleEvery=1 (samples every simulation step)
 * Usage in browser console: exportSimulationCSV(200, 10)
 */
export async function exportSimulationCSV(tStart = 0, tEnd = 2000, sampleEverySeconds = 1, modelVarsOverride = null) {
    const dt = params.dt;
    const totalT = Math.max(0, tEnd - tStart);
    const steps = Math.max(1, Math.round(totalT / dt));
    const sampleEverySteps = Math.max(1, Math.round(sampleEverySeconds / dt));

    // copy initial state
    const seg = {
        desc: createFilledArray(params.nSegments, params.Na0),
        asc: createFilledArray(params.nSegments, params.Na0),
        ints: createFilledArray(params.nSegments, params.Na0)
    };
    const vasa = {
        desc: createFilledArray(params.nVasa, params.Na0),
        asc: createFilledArray(params.nVasa, params.Na0)
    };

    const vars = modelVarsOverride ? Object.assign({}, modelVars, modelVarsOverride) : Object.assign({}, modelVars);

    // Prepare CSV arrays (rows)
    const henleRows = [];
    const vasaRows = [];

    // headers
    const henleHeader = ['time'];
    for (let i = 0; i < params.nSegments; i++) henleHeader.push(`desc_${i}`);
    for (let i = 0; i < params.nSegments; i++) henleHeader.push(`asc_${i}`);
    for (let i = 0; i < params.nSegments; i++) henleHeader.push(`ints_${i}`);
    henleRows.push(henleHeader);

    const vasaHeader = ['time'];
    for (let i = 0; i < params.nVasa; i++) vasaHeader.push(`v_desc_${i}`);
    for (let i = 0; i < params.nVasa; i++) vasaHeader.push(`v_asc_${i}`);
    vasaRows.push(vasaHeader);

    // sample initial
    function pushSample(t) {
        const h = [t];
        for (let i = 0; i < params.nSegments; i++) h.push(seg.desc[i]);
        for (let i = 0; i < params.nSegments; i++) h.push(seg.asc[i]);
        for (let i = 0; i < params.nSegments; i++) h.push(seg.ints[i]);
        henleRows.push(h);

        const v = [t];
        for (let i = 0; i < params.nVasa; i++) v.push(vasa.desc[i]);
        for (let i = 0; i < params.nVasa; i++) v.push(vasa.asc[i]);
        vasaRows.push(v);
    }

    pushSample(tStart);

    // Run simulation
    for (let step = 1; step <= steps; step++) {
        eulerStep(seg, dt, vars);
        vasaEulerStep(seg, vasa, dt, vars);

        if (step % sampleEverySteps === 0) {
            pushSample(tStart + step * dt);
        }
    }

    // convert to CSV and trigger downloads
    const henleCSV = arrayToCSV(henleRows);
    const vasaCSV = arrayToCSV(vasaRows);

    downloadCSV(henleCSV, `henle_timeseries_t${tEnd}.csv`);
    downloadCSV(vasaCSV, `vasa_timeseries_t${tEnd}.csv`);

    return { henleRowsCount: henleRows.length, vasaRowsCount: vasaRows.length };
}

function arrayToCSV(rows) {
    // choose separator: use semicolon for locales that use comma as decimal separator (Excel-friendly)
    const sep = (1.1).toLocaleString().includes(',') ? ';' : ',';
    return rows.map(r => r.map(v => {
        if (v === null || v === undefined) return '';
        // If using semicolon delimiter, convert decimal dot to comma for numeric values
        if (sep === ';') {
            const num = Number(v);
            if (Number.isFinite(num)) {
                // use plain string form (no thousands sep) and replace dot
                return String(num).replace('.', ',');
            }
        }
        return String(v);
    }).join(sep)).join('\n');
}

function downloadCSV(text, filename) {
    const blob = new Blob([text], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// expose helper to window for convenience
window.exportSimulationCSV = exportSimulationCSV;
