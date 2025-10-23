// ==================== svg.js ====================
import { params } from "./config.js";
import { createSegmentState, createVasaState } from "./state.js";
import { concentrationToColor, concentrationToColorVasa } from "./draw.js";

// svg.js
let henleLoopBottom, henleIntBottom;
let vasaLoopBottom, vasaIntBottom;
let vasaDesc, vasaAsc;
let glomerulus, collectingDuct;

let segmentState, vasaState;  // store references

export function initSvg(segment, vasa) {
    segmentState = segment;
    vasaState = vasa;

    const overlay = document.getElementById("overlaySvg");

    overlay.addEventListener("load", () => {
        const svgDoc = overlay.contentDocument;
        henleLoopBottom = svgDoc.getElementById("HenleLoop");
        henleIntBottom = svgDoc.getElementById("HenleInt");

        vasaLoopBottom = svgDoc.getElementById("VasaLoop");
        vasaIntBottom = svgDoc.getElementById("VasaInt");

        vasaDesc = svgDoc.getElementById("VasaDesc");
        vasaAsc = svgDoc.getElementById("VasaAsc");

        glomerulus = svgDoc.getElementById("Glomerulus");
        collectingDuct = svgDoc.getElementById("CollectingDuct");
    });
}

export function updateSvgColors() {
    if (!henleLoopBottom) return; // wait until loaded

    const nSegments = segmentState.desc.length;
    const nVasa = vasaState.desc.length;

    // Henle
    const avgHenleBottom = (segmentState.desc[nSegments - 1] + segmentState.asc[0]) / 2;
    const bottomInt = segmentState.ints[nSegments - 1];

    henleLoopBottom.style.fill = concentrationToColor(avgHenleBottom);
    henleIntBottom.style.fill = concentrationToColor(bottomInt);

    // Vasa
    const avgVasaBottom = (vasaState.desc[nVasa - 1] + vasaState.asc[0]) / 2;
    const topVasaDesc = vasaState.desc[0];
    const topVasaAsc = vasaState.asc[nVasa - 1];

    vasaIntBottom.style.fill = concentrationToColor(bottomInt);
    vasaLoopBottom.style.fill = concentrationToColorVasa(avgVasaBottom);

    vasaDesc.style.fill = concentrationToColorVasa(topVasaDesc);
    vasaAsc.style.fill = concentrationToColorVasa(topVasaAsc);

    glomerulus.style.fill = concentrationToColor(params.Na0);
    collectingDuct.style.fill = concentrationToColor(segmentState.asc[nSegments - 1]);
}
