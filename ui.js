// ==================== ui.js ====================
import { params } from "./config.js";

/**
 * Initialize sliders and buttons
 * @param {Object} modelVars - { k, maxRNa, F0 } (model variables)
 * @param {Function} onReset - callback to reset the simulation
 * @param {Function} onReplay - callback to replay the simulation
 */
export function initUI(modelVars, onReset, onReplay) {
    // ---- Grab slider and display elements ----
    const kSlider = document.getElementById("kSlider");
    const maxRNaSlider = document.getElementById("maxRNaSlider");
    const F0Slider = document.getElementById("F0Slider");
    const FvasaSlider = document.getElementById("FvasaSlider"); // NEW

    const kValueDisplay = document.getElementById("kValue");
    const maxRNaValueDisplay = document.getElementById("maxRNaValue");
    const F0ValueDisplay = document.getElementById("F0Value");
    const FvasaValueDisplay = document.getElementById("FvasaValue"); // NEW

    // Info box and related init
    const infoText = document.getElementById("infoText");
    const showHenle = document.getElementById("showHenle");
    const showVasa = document.getElementById("showVasa");

    // ---- Sliders ----
    kSlider.addEventListener("input", (e) => {
        modelVars.k = parseFloat(e.target.value);
        kValueDisplay.textContent = e.target.value;
        
        infoText.textContent = ``;
    });

    maxRNaSlider.addEventListener("input", (e) => {
        modelVars.maxRNa = parseFloat(e.target.value);
        maxRNaValueDisplay.textContent = e.target.value;
    });

    F0Slider.addEventListener("input", (e) => {
        modelVars.F0 = parseFloat(e.target.value);
        F0ValueDisplay.textContent = e.target.value;
    });

    FvasaSlider.addEventListener("input", (e) => {
        modelVars.F0vr = parseFloat(e.target.value); // update live parameter
        FvasaValueDisplay.textContent = e.target.value;
    });


    showHenle.addEventListener("change", () => {
        infoText.textContent = `Countercurrent multiplication occurs in the loop of Henle.
            - The ascending limb increases the medullary osmolarity by actively pumping sodium and chloride into the medullary interstitium.
            - The descending limb is permeable to water but not to solutes, so water leaves into the increasingly salty medulla.
            - This interaction “multiplies” small differences in solute concentration along the loop, creating a steep osmotic gradient in the medulla.`;
    });

    showVasa.addEventListener("change", () => {
        infoText.textContent = `Countercurrent exchange happens in the vasa recta.
            - Descending limb blood loses water and gains sodium chloride.
            - Ascending limb blood gains water and loses sodium chloride.
            - This helps maintain the medullary gradient while allowing nutrient and gas exchange.`;
    
    });


    // ---- Reset button ----
    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", () => {
        modelVars.k = 0.0005;
        modelVars.maxRNa = 100;
        modelVars.F0 = 2;
        modelVars.F0vr = 1.3;

        kSlider.value = modelVars.k;
        maxRNaSlider.value = modelVars.maxRNa;
        F0Slider.value = modelVars.F0;
        FvasaSlider.value = modelVars.F0vr;

        kValueDisplay.textContent = modelVars.k.toFixed(4);
        maxRNaValueDisplay.textContent = modelVars.maxRNa.toFixed(0);
        F0ValueDisplay.textContent = modelVars.F0.toFixed(1);
        FvasaValueDisplay.textContent = modelVars.F0vr.toFixed(2);

        if (onReset) onReset();
    });

    // ---- Replay button ----
    const replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", () => {
        if (onReplay) onReplay();
    });
}
