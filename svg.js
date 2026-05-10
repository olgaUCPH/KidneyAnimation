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
let urineSampleOffset = 0;


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

        // apply pending offset if set before load
        if (urineSampleOffset && urineSampleTop) {
            const t = `translate(0,-${urineSampleOffset})`;
            urineSampleTop.setAttribute('transform', t);
            if (urineSampleHighlight) urineSampleHighlight.setAttribute('transform', t);
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

// translate urine sample top and highlight by given pixels (positive moves up)
export function setUrineSampleOffset(px) {
    urineSampleOffset = px || 0;
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
