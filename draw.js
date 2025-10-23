// ==================== draw.js ====================
import { params } from "./config.js";

/**
 * Map osmolarity to Henle loop color
 */
export function concentrationToColor(c) {
    const ratio = Math.min(1, Math.max(0, c / params.maxConcentration));
    let r, g, b;

    if (ratio < 0.33) {
        const t = ratio / 0.33;
        r = 0;
        g = Math.round(255 * t);
        b = 255;
    } else if (ratio < 0.66) {
        const t = (ratio - 0.33) / 0.33;
        r = Math.round(255 * t);
        g = 255;
        b = Math.round(255 * (1 - t));
    } else {
        const t = (ratio - 0.66) / 0.34;
        r = 255;
        g = Math.round(255 - t * (255 - 165));
        b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Map osmolarity to Vasa Recta color
 */
export function concentrationToColorVasa(c) {
    const ratio = Math.min(1, Math.max(0, c / params.maxConcentration));
    const r = Math.round(255 * ratio);
    const g = 0;
    const b = Math.round(255 * (1 - ratio));
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Draw Henle loop
 */
export function drawHenle(ctx, segmentState) {
    ctx.clearRect(0, 0, params.totalWidth, params.totalHeight);

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

        const magNaDesc = RNa[j] / 200 * params.vasaArrowScale;
        drawArrowOn(vasaCtx, xDesc + params.descWidthVasa, y, xDesc + params.descWidthVasa - magNaDesc, y, "black");

        const magWaterDesc = 5 * R[params.nVasa - 1 - j] * params.vasaArrowScale;
        drawArrowOn(vasaCtx, xDesc + params.descWidthVasa, y, xDesc + params.descWidthVasa + magWaterDesc, y, "red");

        const magNaAsc = RNa[j] / 200 * params.vasaArrowScale;
        drawArrowOn(vasaCtx, xAsc, y, xAsc - magNaAsc, y, "black");

        const magWaterAsc = 5 * R[params.nVasa - 1 - j] * params.vasaArrowScale;
        drawArrowOn(vasaCtx, xAsc, y, xAsc + magWaterAsc, y, "red");
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
