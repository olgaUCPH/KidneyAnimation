import { params } from "./config.js";
import { concentrationToColor, concentrationToColorVasa } from "./draw.js";

// svg.js
let henleLoopBottom, henleOutline;
let henleDescText, henleAscText, henleText;
let vasaLoopBottom, vasaOutline, vasaOutline2;
let vasaDesc, vasaAsc, vasaDescText, vasaAscText, vasaText;
let vasaShadow1, vasaShadow2;
let bowmanCap, collectingDuct, aboveCollectingDuct, belowCollectingDuct;
let urineSampleBottom, urineSampleTop, urineSampleColumn, urineSampleHighlight;
let mlMinText, lDayText;
let cdFlowText;
let urineSampleOffset = 0;

// display / clamp constants
const URINE_MAX_PX = 76; // maximum visible urine column translation in px
const CD_DISPLAY_MULTIPLIER = 20; // multiplier applied to CD value for display
const URINE_HEIGHT_MULTIPLIER = 12; // multiplier applied to scaled value to compute pixel height


let segmentState, vasaState;  // store references

// references to checkboxes
let showHenleCheckbox, showVasaCheckbox;

export function initSvg(segment, vasa) {
    segmentState = segment;
    vasaState = vasa;

    const overlay = document.getElementById("overlaySvg");
    console.log('Loading SVG overlay');

    window.addEventListener("load", () => {
        console.log('SVG loaded');
        const svgDoc = overlay.contentDocument;

        // Loop of Henle
        henleLoopBottom = svgDoc.getElementById("HenleLoop");
        henleOutline = svgDoc.getElementById("HenleOutline");
        henleDescText = svgDoc.getElementById("DescHenleText");
        henleAscText = svgDoc.getElementById("AscHenleText");
        henleText = svgDoc.getElementById("HenleText");

        // Vasa Recta
        vasaLoopBottom = svgDoc.getElementById("VasaLoop");
        vasaOutline = svgDoc.getElementById("VasaOutline");
        vasaOutline2 = svgDoc.getElementById("vasaOutline");
        vasaDesc = svgDoc.getElementById("VasaDesc");
        vasaAsc = svgDoc.getElementById("VasaAsc");
        vasaDescText = svgDoc.getElementById("DescVasaText");
        vasaAscText = svgDoc.getElementById("AscVasaText");
        vasaText = svgDoc.getElementById("VasaText");
        vasaShadow1 = svgDoc.getElementById("VasaShadow1");
        vasaShadow2 = svgDoc.getElementById("VasaShadow2");

        // Other structures
        bowmanCap = svgDoc.getElementById("BowmanCapsule");
        collectingDuct = svgDoc.getElementById("CollectingDuct");
        aboveCollectingDuct = svgDoc.getElementById("AboveCollectingDuct");
        belowCollectingDuct = svgDoc.getElementById("BelowCollectingDuct");

        // Urine sample
        urineSampleBottom = svgDoc.getElementById("UrineSampleBottom");
        urineSampleTop = svgDoc.getElementById("UrineSampleTop");
        urineSampleColumn = svgDoc.getElementById("UrineSampleColumn");
        urineSampleHighlight = svgDoc.getElementById("UrineSampleHighlight");
        mlMinText = svgDoc.getElementById("MlMinText");
        lDayText = svgDoc.getElementById("LDayText");
        cdFlowText = svgDoc.getElementById("CdFlowText");

        if (urineSampleOffset && urineSampleTop) {
            const t = `translate(0,-${urineSampleOffset})`;
            urineSampleTop.setAttribute('transform', t);
            if (urineSampleHighlight) urineSampleHighlight.setAttribute('transform', t);
        }
        // Update the ml/min label in the SVG
        if (urineSampleOffset && mlMinText) {
            try {
                mlMinText.textContent = `${urineSampleOffset}`;
            } catch (err) {
                if (mlMinText.firstChild) mlMinText.firstChild.nodeValue = `${urineSampleOffset}`;
            }
        }

        // Update L/day text based on the ml/min text if possible
        if (urineSampleOffset && lDayText) {
            try {
                // prefer numeric ml/min value from mlMinText if available
                let mlMinVal = NaN;
                if (mlMinText) {
                    const txt = mlMinText.textContent || (mlMinText.firstChild && mlMinText.firstChild.nodeValue) || '';
                    mlMinVal = Number(txt);
                }
                if (Number.isFinite(mlMinVal)) {
                    const lDayVal = mlMinVal * 60 * 24 / 1000; // convert ml/min -> L/day
                    lDayText.textContent = `${lDayVal.toFixed(2)}`;
                } else {
                    lDayText.textContent = `${urineSampleOffset}`;
                }
            } catch (err) {
                if (lDayText.firstChild) lDayText.firstChild.nodeValue = `${urineSampleOffset}`;
            }
        }

        // Get checkboxes
        showHenleCheckbox = document.getElementById("showHenle");
        showVasaCheckbox = document.getElementById("showVasa");


        // Get tooltip overlays
        const henleDescTooltip = svgDoc.getElementById("HenleDescTooltip");
        const henleAscTooltip = svgDoc.getElementById("HenleAscTooltip");
        const vasaDescTooltip = svgDoc.getElementById("VasaDescTooltip");
        const vasaAscTooltip = svgDoc.getElementById("VasaAscTooltip");

    });
}

// Set collecting duct flow text in the SVG (element id: CdFlowText). Falls back to `MlMinText`.
export function setCdFlowText(value) {
    // Primary text element: prefer `CdFlowText`, fall back to `MlMinText`.
    const textEl = cdFlowText || mlMinText;
    if (!textEl) return;

    const num = Number(value);
    if (Number.isFinite(num)) {
        // Display scaled numeric value (ml/min multiplied for presentation).
        const scaled = num * CD_DISPLAY_MULTIPLIER;
        const out = scaled.toFixed(2);
        try { textEl.textContent = out; } catch (err) { if (textEl.firstChild) textEl.firstChild.nodeValue = out; }

        // Update L/day text if available (convert ml/min -> L/day).
        if (lDayText) {
            try {
                const lDayVal = (scaled * 60 * 24) / 1000;
                const outL = lDayVal.toFixed(2);
                try { lDayText.textContent = outL; } catch (err) { if (lDayText.firstChild) lDayText.firstChild.nodeValue = outL; }
            } catch (_) { /* ignore conversion errors */ }
        }

        // Compute and clamp urine-sample pixel translation, then update SVG.
        const rawPx = Math.max(0, scaled * URINE_HEIGHT_MULTIPLIER);
        const px = Math.min(rawPx, URINE_MAX_PX);
        try { setUrineSampleOffset(px, false); } catch (_) { /* ignore if unavailable */ }

        // Show or hide urine-sample SVG parts when flow is zero.
        try {
            const display = (num !== 0) ? 'inline' : 'none';
            if (urineSampleBottom) urineSampleBottom.style.display = display;
            if (urineSampleTop) urineSampleTop.style.display = display;
            if (urineSampleColumn) urineSampleColumn.style.display = display;
            if (urineSampleHighlight) urineSampleHighlight.style.display = display;
        } catch (err) {
            console.log('Could not update urine sample visibility:', err);
        }
    } else {
        // Non-numeric: just write the raw value.
        const out = String(value);
        try { textEl.textContent = out; } catch (err) { if (textEl.firstChild) textEl.firstChild.nodeValue = out; }
    }
}

// Translate urine-sample SVG parts by `px` (positive moves up). Optionally update ml/min and L/day labels.
export function setUrineSampleOffset(px, updateMlMin = true) {
    const requested = px || 0;
    const clamped = Math.max(0, Math.min(requested, URINE_MAX_PX));
    urineSampleOffset = clamped;

    const t = `translate(0,-${urineSampleOffset})`;
    if (urineSampleTop) urineSampleTop.setAttribute('transform', t);
    if (urineSampleHighlight) urineSampleHighlight.setAttribute('transform', t);

    // Stretch column by scaling about its bottom edge (best-effort; ignore failures).
    if (urineSampleColumn && typeof urineSampleColumn.getBBox === 'function') {
        try {
            const bbox = urineSampleColumn.getBBox();
            const origH = bbox.height || 1;
            const newH = Math.max(0.1, origH + urineSampleOffset);
            const scaleY = newH / origH;
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height;
            const colTransform = `translate(${cx},${cy}) scale(1,${scaleY}) translate(${-cx},${-cy})`;
            urineSampleColumn.setAttribute('transform', colTransform);
        } catch (_) { /* ignore getBBox / transform errors */ }
    }

    // Optionally update ml/min and L/day labels.
    if (updateMlMin && mlMinText) {
        try { mlMinText.textContent = `${urineSampleOffset}`; }
        catch (_) { if (mlMinText.firstChild) mlMinText.firstChild.nodeValue = `${urineSampleOffset} ml/min`; }

        if (lDayText) {
            try {
                const txt = mlMinText.textContent || (mlMinText.firstChild && mlMinText.firstChild.nodeValue) || '';
                const mlVal = Number(txt);
                if (Number.isFinite(mlVal)) {
                    const lDayVal = (mlVal * 60 * 24) / 1000; // ml/min -> L/day
                    try { lDayText.textContent = `${lDayVal.toFixed(2)}`; }
                    catch (_) { if (lDayText.firstChild) lDayText.firstChild.nodeValue = `${lDayVal.toFixed(2)}`; }
                }
            } catch (_) { /* ignore parsing errors */ }
        }
    }
}

export function updateSvgColors() {
    if (!henleLoopBottom) return; // SVG not loaded yet

    const nSegments = segmentState.desc.length;
    const nVasa = vasaState.desc.length;

    // Henle: show/hide and color fills
    const showHenle = showHenleCheckbox?.checked ?? true;
    const henleDisplay = showHenle ? "inline" : "none";
    [henleLoopBottom, henleOutline, bowmanCap, collectingDuct, henleDescText, henleAscText, henleText]
        .forEach(el => { if (el) el.style.display = henleDisplay; });

    if (showHenle) {
        const avgHenleBottom = (segmentState.desc[nSegments - 1] + segmentState.asc[0]) / 2;
        henleLoopBottom.style.fill = concentrationToColor(avgHenleBottom);
        bowmanCap.style.fill = concentrationToColor(params.Na0);
        collectingDuct.style.fill = concentrationToColor(segmentState.asc[nSegments - 1]);

        if (belowCollectingDuct) {
            const bottomCdVal = (segmentState.cd && segmentState.cd.length > 0)
                ? segmentState.cd[segmentState.cd.length - 1]
                : segmentState.asc[nSegments - 1];
            belowCollectingDuct.style.fill = concentrationToColor(bottomCdVal);
        }

        if (aboveCollectingDuct) {
            const lastDist = (segmentState.dist && segmentState.dist.length > 0)
                ? segmentState.dist[segmentState.dist.length - 1]
                : segmentState.asc[nSegments - 1];
            aboveCollectingDuct.style.fill = concentrationToColor(lastDist);
        }

        // Urine sample fills (bottom, top, column)
        const urineVal = (segmentState.cd && segmentState.cd.length > 0)
            ? segmentState.cd[segmentState.cd.length - 1]
            : segmentState.asc[nSegments - 1];
        const urineColor = concentrationToColor(urineVal);
        if (urineSampleBottom) urineSampleBottom.style.fill = urineColor;
        if (urineSampleTop) urineSampleTop.style.fill = urineColor;
        if (urineSampleColumn) urineSampleColumn.style.fill = urineColor;
    }

    // Vasa: show/hide and color fills
    const showVasa = showVasaCheckbox?.checked ?? true;
    const vasaDisplay = showVasa ? "inline" : "none";
    [vasaLoopBottom, vasaOutline, vasaOutline2, vasaDesc, vasaAsc, vasaDescText, vasaAscText, vasaText, vasaShadow1, vasaShadow2]
        .forEach(el => { if (el) el.style.display = vasaDisplay; });

    if (showVasa) {
        const avgVasaBottom = (vasaState.desc[nVasa - 1] + vasaState.asc[0]) / 2;
        const topVasaDesc = vasaState.desc[0];
        const topVasaAsc = vasaState.asc[nVasa - 1];

        vasaLoopBottom.style.fill = concentrationToColorVasa(avgVasaBottom);
        vasaDesc.style.fill = concentrationToColorVasa(topVasaDesc);
        vasaAsc.style.fill = concentrationToColorVasa(topVasaAsc);
    }
}
