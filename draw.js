// ==================== draw.js ====================
import { params } from "./config.js";
import { data, evaluate_cmap } from './colormaps.js';

/**
 * Map osmolarity to Henle loop color using a colormap
 */


// Pick a colormap.
const HenleColormap = (x) => evaluate_cmap(x, 'turbo', false);
const VasaColormap = (x) => evaluate_cmap(x, 'coolwarm', true);

export function concentrationToColor(c) {
    const cMin = 0;
    const cMax = params.maxConcentration;
    const clamped = Math.min(cMax, Math.max(cMin, c));

    // Normalize to [0, 1]
    const ratio = (clamped - cMin) / (cMax - cMin);
   
    // Use the colormap function
    const [r, g, b] = HenleColormap(ratio);

    return `rgb(${r}, ${g}, ${b})`;
}


export function concentrationToColorVasa(c) {
    // Clamp the concentration to [100, max-100]
    const cMin = 200;
    const cMax = params.maxConcentration - 300;
    const clamped = Math.min(cMax, Math.max(cMin, c));

    // Normalize to [0, 1]
    const ratio = (clamped - cMin) / (cMax - cMin);

    // Use the colormap function
    const [r, g, b] = VasaColormap(ratio);

    return `rgb(${r}, ${g}, ${b})`;
}



/**
 * Draw Henle loop
 */
export function drawHenle(ctx, segmentState) {
    // ctx.clearRect(0, 0, params.totalWidth, params.totalHeight);

    for (let i = 0; i < params.nSegments; i++) {
        const y = i * params.segmentHeight;

        // Descending
        ctx.fillStyle = concentrationToColor(segmentState.desc[i]);
        ctx.fillRect(0, y, params.descWidth, params.segmentHeight);

        // Interstitium
        ctx.fillStyle = concentrationToColor(segmentState.ints[i]);
        ctx.fillRect(params.descWidth, y, params.intWidth, params.segmentHeight);

        // Ascending (reversed display)
        ctx.fillStyle = concentrationToColor(segmentState.asc[params.nSegments - 1 - i]);
        ctx.fillRect(params.descWidth + params.intWidth, y, params.ascWidth, params.segmentHeight);
    }
}

/**
 * Draw Vasa Recta
 */
export function drawVasa(vasaCtx, vasaState, segmentState) {
    vasaCtx.clearRect(0, 0, params.totalWidthVasa, params.totalHeightVasa);

    const xDesc = 0;
    const xInt = params.descWidthVasa;
    const xAsc = params.descWidthVasa + params.intWidthVasa;

    for (let i = 0; i < params.nVasa; i++) {
        const y = i * params.segmentHeightVasa;

        // Descending vasa
        vasaCtx.fillStyle = concentrationToColorVasa(vasaState.desc[i]);
        vasaCtx.fillRect(xDesc, y, params.descWidthVasa, params.segmentHeightVasa);

        // Interstitium
        vasaCtx.fillStyle = concentrationToColor(segmentState.ints[i]);
        vasaCtx.fillRect(xInt, y, params.intWidthVasa, params.segmentHeightVasa);

        // Ascending vasa (reversed)
        const ascValue = vasaState.asc[params.nVasa - 1 - i];
        vasaCtx.fillStyle = concentrationToColorVasa(ascValue);
        vasaCtx.fillRect(xAsc, y, params.ascWidthVasa, params.segmentHeightVasa);
    }
}

/**
 * Draw a single arrow
 */
export function drawArrowOn(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 6;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6),
               y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6),
               y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

/**
 * Draw Henle loop arrows
 */
export function drawArrows(ctx, R, RNa) {
    for (let i = 0; i < params.nSegments; i++) {
        const y = i * params.segmentHeight + params.segmentHeight / 2;
        const magnitude = Math.abs(R[i]) * params.waterArrowScale;

        if (R[i] > 0) {
            drawArrowOn(ctx, params.descWidth, y, params.descWidth + magnitude, y, "black");
        } else if (R[i] < 0) {
            drawArrowOn(ctx, params.descWidth, y, params.descWidth - magnitude, y, "black");
        }
    }

    const ascX = params.descWidth + params.intWidth;
    for (let j = 0; j < params.nSegments; j++) {
        const revIndex = params.nSegments - 1 - j;
        const y = revIndex * params.segmentHeight + params.segmentHeight / 2;
        const magnitude = Math.abs(RNa[j]) * params.saltArrowScale;
        if (RNa[j] > 0) {
            drawArrowOn(ctx, ascX, y, ascX - magnitude, y, "red");
        }
    }
}

/**
 * Draw Vasa Recta arrows
 */
export function drawVasaArrows(vasaCtx, R, RNa) {
    const xDesc = 0;
    const xAsc = params.descWidthVasa + params.intWidthVasa;

    for (let j = 0; j < params.nVasa; j++) {
        const y = j * params.segmentHeightVasa + params.segmentHeightVasa / 2;

        // Descending vasa
        const magWaterDesc = R[j] * params.waterArrowScale * params.vasaArrowScale;
        const magNaDesc = RNa[j] * params.saltArrowScale * params.vasaArrowScale * params.vasaSaltArrowScale;

        drawArrowOn(vasaCtx, xDesc + params.descWidthVasa, y, xDesc + params.descWidthVasa + magWaterDesc, y, "red");
        drawArrowOn(vasaCtx, xDesc + params.descWidthVasa, y, xDesc + params.descWidthVasa - magNaDesc, y, "black");

        // Ascending vasa
        const magWaterAsc = R[j] * params.waterArrowScale * params.vasaArrowScale;
        const magNaAsc = RNa[j] * params.saltArrowScale * params.vasaArrowScale * params.vasaSaltArrowScale;

        drawArrowOn(vasaCtx, xAsc, y, xAsc + magWaterAsc, y, "red");
        drawArrowOn(vasaCtx, xAsc, y, xAsc - magNaAsc, y, "black");
    }
}


/**
 * Draw color bar for Henle loop
 */
export function drawColorBar(ctxBar) {
    const height = ctxBar.canvas.height;
    const width = ctxBar.canvas.width;
    const nTicks = params.maxConcentration / params.colorbarTickStep;

    for (let i = 0; i < height; i++) {
        const c = params.maxConcentration * i / height;
        ctxBar.fillStyle = concentrationToColor(c);
        ctxBar.fillRect(0, i, width, 1);
    }

    ctxBar.strokeStyle = "black";
    ctxBar.fillStyle = "black";
    ctxBar.font = "50px Arial";
    ctxBar.textAlign = "right";
    ctxBar.textBaseline = "middle";
    ctxBar.lineWidth = 5;

    for (let t = 0; t <= nTicks; t++) {
        const value = t * params.colorbarTickStep;
        const y = (value / params.maxConcentration) * height;
        ctxBar.beginPath();
        ctxBar.moveTo(width - 25, y);
        ctxBar.lineTo(width, y);
        ctxBar.stroke();
        ctxBar.fillText(value, width - 30, y);
    }
}
