import { params } from "./config.js";
import { concentrationToColor, concentrationToColorVasa } from "./draw.js";

// svg.js
let henleLoopBottom, henleOutline;
let vasaLoopBottom, vasaOutline, vasaOutline2;
let vasaDesc, vasaAsc;
let bowmanCap, collectingDuct;

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

        // Vasa
        vasaLoopBottom = svgDoc.getElementById("VasaLoop");
        //vasaIntBottom = svgDoc.getElementById("VasaInt");
        vasaOutline = svgDoc.getElementById("VasaOutline");
        vasaOutline2 = svgDoc.getElementById("vasaOutline");
        vasaDesc = svgDoc.getElementById("VasaDesc");
        vasaAsc = svgDoc.getElementById("VasaAsc");

        // Other structures
        bowmanCap = svgDoc.getElementById("BowmanCapsule");
        collectingDuct = svgDoc.getElementById("CollectingDuct");

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

export function updateSvgColors() {
    if (!henleLoopBottom) return; // wait until loaded

    const nSegments = segmentState.desc.length;
    const nVasa = vasaState.desc.length;

    // ---- Henle ----
    const showHenle = showHenleCheckbox?.checked ?? true;
    const henleDisplay = showHenle ? "inline" : "none";

    [henleLoopBottom, henleOutline, bowmanCap, collectingDuct].forEach(el => {
        if (el) el.style.display = henleDisplay;
    });

    if (showHenle) {
        const avgHenleBottom = (segmentState.desc[nSegments - 1] + segmentState.asc[0]) / 2;

        henleLoopBottom.style.fill = concentrationToColor(avgHenleBottom);
        //henleIntBottom.style.fill = concentrationToColor(bottomInt);
        bowmanCap.style.fill = concentrationToColor(params.Na0);
        collectingDuct.style.fill = concentrationToColor(segmentState.asc[nSegments - 1]);
    }

    // ---- Vasa ----
    const showVasa = showVasaCheckbox?.checked ?? true;
    const vasaDisplay = showVasa ? "inline" : "none";

    [vasaLoopBottom, vasaOutline, vasaOutline2, vasaDesc, vasaAsc].forEach(el => {
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
