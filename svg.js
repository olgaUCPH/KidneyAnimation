import { params } from "./config.js";
import { concentrationToColor, concentrationToColorVasa } from "./draw.js";

// svg.js
let henleLoopBottom, henleOutline;
let henleDescText, henleAscText, henleText;
let vasaLoopBottom, vasaOutline, vasaOutline2;
let vasaDesc, vasaAsc, vasaDescText, vasaAscText, vasaText;
let bowmanCap, collectingDuct, aboveCollectingDuct;

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

        // Other structures
        bowmanCap = svgDoc.getElementById("BowmanCapsule");
        collectingDuct = svgDoc.getElementById("CollectingDuct");
        aboveCollectingDuct = svgDoc.getElementById("AboveCollectingDuct");

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

    [henleLoopBottom, henleOutline, bowmanCap, collectingDuct, henleDescText, henleAscText, henleText].forEach(el => {
        if (el) el.style.display = henleDisplay;
    });

    if (showHenle) {
        const avgHenleBottom = (segmentState.desc[nSegments - 1] + segmentState.asc[0]) / 2;

        henleLoopBottom.style.fill = concentrationToColor(avgHenleBottom);
        //henleIntBottom.style.fill = concentrationToColor(bottomInt);
        bowmanCap.style.fill = concentrationToColor(params.Na0);
        collectingDuct.style.fill = concentrationToColor(segmentState.asc[nSegments - 1]);
        if (aboveCollectingDuct) {
            const lastDist = (segmentState.dist && segmentState.dist.length > 0)
                ? segmentState.dist[segmentState.dist.length - 1]
                : segmentState.asc[nSegments - 1];
            aboveCollectingDuct.style.fill = concentrationToColor(lastDist);
        }
    }

    // ---- Vasa ----
    const showVasa = showVasaCheckbox?.checked ?? true;
    const vasaDisplay = showVasa ? "inline" : "none";

    [vasaLoopBottom, vasaOutline, vasaOutline2, vasaDesc, vasaAsc, vasaDescText, vasaAscText, vasaText].forEach(el => {
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
