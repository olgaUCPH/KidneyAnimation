// ==================== ui.js ====================
import { params } from "./config.js";

/**
 * Initialize sliders and buttons
 * @param {Object} modelVars - { k, maxRNa, F0 } (model variables)
 * @param {Function} onReset - callback to reset the simulation
 * @param {Function} onReplay - callback to replay the simulation
 */
export function initUI(modelVars, onReset, onReplay) {
    // ---- Sliders ----
    const kSlider = document.getElementById("kSlider");
    const kValueDisplay = document.getElementById("kValue");

    const maxRNaSlider = document.getElementById("maxRNaSlider");
    const maxRNaValueDisplay = document.getElementById("maxRNaValue");

    const F0Slider = document.getElementById("F0Slider");
    const F0ValueDisplay = document.getElementById("F0Value");

    // ---- Slider events ----
    kSlider.addEventListener("input", () => {
        modelVars.k = parseFloat(kSlider.value);
        kValueDisplay.textContent = modelVars.k.toFixed(4);
    });

    maxRNaSlider.addEventListener("input", () => {
        modelVars.maxRNa = parseFloat(maxRNaSlider.value);
        maxRNaValueDisplay.textContent = modelVars.maxRNa.toFixed(0);
    });

    F0Slider.addEventListener("input", () => {
        modelVars.F0 = parseFloat(F0Slider.value);
        F0ValueDisplay.textContent = modelVars.F0.toFixed(1);
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
