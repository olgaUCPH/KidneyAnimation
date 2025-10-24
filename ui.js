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

    const kValueDisplay = document.getElementById("kValue");
    const maxRNaValueDisplay = document.getElementById("maxRNaValue");
    const F0ValueDisplay = document.getElementById("F0Value");

    // ---- Sliders ----
    kSlider.addEventListener("input", (e) => {
        modelVars.k = parseFloat(e.target.value);
        kValueDisplay.textContent = e.target.value;
    });

    maxRNaSlider.addEventListener("input", (e) => {
        modelVars.maxRNa = parseFloat(e.target.value);
        maxRNaValueDisplay.textContent = e.target.value;
    });

    F0Slider.addEventListener("input", (e) => {
        modelVars.F0 = parseFloat(e.target.value);
        F0ValueDisplay.textContent = e.target.value;
    });

    // ---- Reset button ----
    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", () => {
        modelVars.k = 0.0005;
        modelVars.maxRNa = 100;
        modelVars.F0 = 2;

        kSlider.value = modelVars.k;
        maxRNaSlider.value = modelVars.maxRNa;
        F0Slider.value = modelVars.F0;

        kValueDisplay.textContent = modelVars.k.toFixed(4);
        maxRNaValueDisplay.textContent = modelVars.maxRNa.toFixed(0);
        F0ValueDisplay.textContent = modelVars.F0.toFixed(1);

        if (onReset) onReset();
    });

    // ---- Replay button ----
    const replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", () => {
        if (onReplay) onReplay();
    });
}
