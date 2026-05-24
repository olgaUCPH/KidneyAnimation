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

        // Henle
        henleLoopBottom = svgDoc.getElementById("HenleLoop");
        //henleIntBottom = svgDoc.getElementById("HenleInt");
        henleOutline = svgDoc.getElementById("HenleOutline");
        henleDescText = svgDoc.getElementById("DescHenleText");
        henleAscText = svgDoc.getElementById("AscHenleText");
        henleText = svgDoc.getElementById("HenleText");

        // Vasa
        vasaLoopBottom = svgDoc.getElementById("VasaLoop");
        //vasaIntBottom = svgDoc.getElementById("VasaInt");
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
        // apply pending offset if set before load
        if (urineSampleOffset && urineSampleTop) {
            const t = `translate(0,-${urineSampleOffset})`;
            urineSampleTop.setAttribute('transform', t);
            if (urineSampleHighlight) urineSampleHighlight.setAttribute('transform', t);
        }
        // if a pending offset exists, also update the ml/min label in the SVG
        if (urineSampleOffset && mlMinText) {
            try {
                mlMinText.textContent = `${urineSampleOffset}`;
            } catch (err) {
                if (mlMinText.firstChild) mlMinText.firstChild.nodeValue = `${urineSampleOffset}`;
            }
        }

        // try to update L/day text based on the ml/min text if possible
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

        // get checkboxes
        showHenleCheckbox = document.getElementById("showHenle");
        showVasaCheckbox = document.getElementById("showVasa");
        

        // Get tooltip overlays
        const henleDescTooltip = svgDoc.getElementById("HenleDescTooltip");
        const henleAscTooltip = svgDoc.getElementById("HenleAscTooltip");
        const vasaDescTooltip  = svgDoc.getElementById("VasaDescTooltip");
        const vasaAscTooltip   = svgDoc.getElementById("VasaAscTooltip");

    });
}

// set collecting duct flow text in the SVG (element id: CdFlowText). Falls back to `MlMinText`.
export function setCdFlowText(value) {
    const textEl = cdFlowText || mlMinText;
    if (!textEl) return;
    const num = Number(value);
    if (Number.isFinite(num)) {
        const scaled = num * CD_DISPLAY_MULTIPLIER;
        const out = scaled.toFixed(2);
        try {
            textEl.textContent = out;
        } catch (err) {
            if (textEl.firstChild) textEl.firstChild.nodeValue = out;
        }
        // update L/day text (convert ml/min -> L/day)
        try {
            if (lDayText) {
                const lDayVal = scaled * 60 * 24 / 1000;
                const outL = lDayVal.toFixed(2);
                try {
                    lDayText.textContent = outL;
                } catch (err) {
                    if (lDayText.firstChild) lDayText.firstChild.nodeValue = outL;
                }
            }
        } catch (err) {
            // ignore any errors updating L/day text
        }
        // compute pixel height from scaled value, clamp to URINE_MAX_PX
        const rawPx = Math.max(0, scaled * URINE_HEIGHT_MULTIPLIER);
        const px = Math.min(rawPx, URINE_MAX_PX);
        try {
            // pass false to avoid updating the ml/min text (so CD text stays unchanged)
            setUrineSampleOffset(px, false);
        } catch (err) {
            // ignore if setter unavailable or SVG not loaded
        }
        // hide urine sample elements when flow is exactly zero
        try {
            const visible = num !== 0;
            const display = visible ? 'inline' : 'none';
            if (urineSampleBottom) urineSampleBottom.style.display = display;
            if (urineSampleTop) urineSampleTop.style.display = display;
            if (urineSampleColumn) urineSampleColumn.style.display = display;
            if (urineSampleHighlight) urineSampleHighlight.style.display = display;
            // urinary overflow should never show when flow is zero
        } catch (err) {
            console.log('Could not update urine sample visibility:', err);
            // ignore if elements not present or styling fails
        }
    } else {
        const out = String(value);
        try {
            textEl.textContent = out;
        } catch (err) {
            if (textEl.firstChild) textEl.firstChild.nodeValue = out;
        }
    }
}

// translate urine sample top and highlight by given pixels (positive moves up)
export function setUrineSampleOffset(px, updateMlMin = true) {
    // clamp pixel offset to range [0, 76] to ensure SVG height never exceeds 76px
    const requested = (px || 0);
    const clamped = Math.max(0, Math.min(requested, URINE_MAX_PX));
    urineSampleOffset = clamped;
    const t = `translate(0,-${urineSampleOffset})`;
    if (urineSampleTop) urineSampleTop.setAttribute('transform', t);
    if (urineSampleHighlight) urineSampleHighlight.setAttribute('transform', t);
    // stretch the column upwards by px by scaling about its bottom edge
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
        } catch (err) {
            // ignore if getBBox fails
        }
    }
    // update ml/min text to reflect pixel value (optional)
    if (updateMlMin && mlMinText) {
        try {
            mlMinText.textContent = `${urineSampleOffset}`;
        } catch (err) {
            // some SVG text nodes may require firstChild.nodeValue
            if (mlMinText.firstChild) mlMinText.firstChild.nodeValue = `${urineSampleOffset} ml/min`;
        }
        // also update L/day text if we can parse a numeric ml/min value
        if (lDayText) {
            try {
                const txt = mlMinText.textContent || (mlMinText.firstChild && mlMinText.firstChild.nodeValue) || '';
                const mlVal = Number(txt);
                if (Number.isFinite(mlVal)) {
                    const lDayVal = mlVal * 60 * 24 / 1000;
                    try {
                        lDayText.textContent = `${lDayVal.toFixed(2)}`;
                    } catch (err) {
                        if (lDayText.firstChild) lDayText.firstChild.nodeValue = `${lDayVal.toFixed(2)}`;
                    }
                }
            } catch (err) {
                // ignore
            }
        }
    }
}

export function updateSvgColors() {
    if (!henleLoopBottom) return; // wait until loaded

    const nSegments = segmentState.desc.length;
    const nVasa = vasaState.desc.length;

    // ---- Henle ----
    const showHenle = showHenleCheckbox?.checked ?? true;
    const henleDisplay = showHenle ? "inline" : "none";

    [henleLoopBottom, henleOutline, bowmanCap, collectingDuct, henleDescText, henleAscText, henleText].forEach(el => {
        if (el) el.style.display = henleDisplay;
    });

    if (showHenle) {
        const avgHenleBottom = (segmentState.desc[nSegments - 1] + segmentState.asc[0]) / 2;

        henleLoopBottom.style.fill = concentrationToColor(avgHenleBottom);
        //henleIntBottom.style.fill = concentrationToColor(bottomInt);
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
        // set urine sample fills (use same value for bottom, top, and column)
        const urineVal = (segmentState.cd && segmentState.cd.length > 0)
            ? segmentState.cd[segmentState.cd.length - 1]
            : segmentState.asc[nSegments - 1];
        const urineColor = concentrationToColor(urineVal);
        if (urineSampleBottom) urineSampleBottom.style.fill = urineColor;
        if (urineSampleTop) urineSampleTop.style.fill = urineColor;
        if (urineSampleColumn) urineSampleColumn.style.fill = urineColor;
    }

    // ---- Vasa ----
    const showVasa = showVasaCheckbox?.checked ?? true;
    const vasaDisplay = showVasa ? "inline" : "none";

    [vasaLoopBottom, vasaOutline, vasaOutline2, vasaDesc, vasaAsc, vasaDescText, vasaAscText, vasaText, vasaShadow1, vasaShadow2].forEach(el => {
        if (el) el.style.display = vasaDisplay;
    });

    if (showVasa) {
        const avgVasaBottom = (vasaState.desc[nVasa - 1] + vasaState.asc[0]) / 2;
        const topVasaDesc = vasaState.desc[0];
        const topVasaAsc = vasaState.asc[nVasa - 1];

        //vasaIntBottom.style.fill = concentrationToColor(bottomInt);
        vasaLoopBottom.style.fill = concentrationToColorVasa(avgVasaBottom);

        vasaDesc.style.fill = concentrationToColorVasa(topVasaDesc);
        vasaAsc.style.fill = concentrationToColorVasa(topVasaAsc);
    }
}
