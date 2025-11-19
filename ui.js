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

    // ---- CONST ----
    const K_MULT = 200000; // display multiplier    
    const F0_MULT = 50;
    const F0VR_MULT = 76.92;

    kValueDisplay.textContent = (parseFloat(kSlider.value) * K_MULT).toFixed(0);
    maxRNaValueDisplay.textContent = parseFloat(maxRNaSlider.value).toFixed(0); 
    F0ValueDisplay.textContent = (parseFloat(F0Slider.value) * F0_MULT).toFixed(0);
    FvasaValueDisplay.textContent = parseFloat(FvasaSlider.value * F0VR_MULT).toFixed(0)

    // ---- Sliders ----
    kSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `Water permeability determines how much water is reabsorbed in the descending limb of the loop of Henle. A permeability of 100% corresponds to the normal value for the water reabsorption rate.`;
    });

    kSlider.addEventListener("touchstart", (e) => {
        infoText.textContent = `Water permeability determines how much water is reabsorbed in the descending limb of the loop of Henle. A permeability of 100% corresponds to the normal value for the water reabsorption rate.`;
    });

   kSlider.addEventListener("change", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.k = val;  // keep real small value for model
        kValueDisplay.textContent = (val * K_MULT).toFixed(0); // show friendly number
    });

    maxRNaSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `NaCl reabsorption controls how much NaCl the ascending limb actively pumps into the interstitium. A NaCl reabsorption of 100% corresponds to the normal value for the reabsorption rate.`;
    });

        maxRNaSlider.addEventListener("change", (e) => {
        modelVars.maxRNa = parseFloat(e.target.value);
        maxRNaValueDisplay.textContent = e.target.value;
    });

    F0Slider.addEventListener("mouseover", (e) => {
        infoText.textContent = `Loop of Henle flow sets the flow of isotonic fluid entering the descending limb of the loop of Henle. An flow of 100% corresponds to the normal value for the inflow of isotonic fluid to the descending limb.`;
    });

    F0Slider.addEventListener("change", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.F0 = val;  // keep real small value for model
        F0ValueDisplay.textContent = (val * F0_MULT).toFixed(0); // show friendly number
    });

    FvasaSlider.addEventListener("mouseover", (e) => {

        infoText.textContent = `Vasa recta flow sets the blood flow entering the descending vasa recta. A vasa recta inflow of 100% corresponds to the normal value for the inflow of blood.`;
    });

        FvasaSlider.addEventListener("change", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.F0vr = val;  // keep real small value for model
        const displayVal = Math.round(val * F0VR_MULT / 5) * 5;
        FvasaValueDisplay.textContent = displayVal;

        //infoText.textContent = `Vasa recta flow sets the blood flow entering the descending vasa recta. A vasa recta flow of 100% corresponds to the normal value.`;
    });

    showHenle.addEventListener("mouseover", () => {
        infoText.textContent = `Countercurrent multiplication occurs in the loop of Henle.
            - The ascending limb increases the medullary osmolarity by actively pumping sodium and chloride into the medullary interstitium.
            - The descending limb is permeable to water but not to solutes, so water leaves into the increasingly salty medulla.
            - This interaction “multiplies” small differences in solute concentration along the loop, creating a steep osmotic gradient in the medulla.`;
    });

    showVasa.addEventListener("mouseover", () => {
        infoText.textContent = `Countercurrent exchange happens in the vasa recta.
            - Descending limb blood loses water and gains sodium chloride.
            - Ascending limb blood gains water and loses sodium chloride.
            - This helps maintain the medullary gradient while allowing nutrient and gas exchange.`;
    
    });


    // ---- Reset button ----
    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", () => {
        // Reset model values
        modelVars.k = 0.0005;
        modelVars.maxRNa = 100;
        modelVars.F0 = 2;
        modelVars.F0vr = 1.3;

        // Reset slider positions
        kSlider.value = modelVars.k;
        maxRNaSlider.value = modelVars.maxRNa;
        F0Slider.value = modelVars.F0;
        FvasaSlider.value = modelVars.F0vr;

        // Update displayed values with multipliers
        kValueDisplay.textContent = (modelVars.k * K_MULT).toFixed(0);
        maxRNaValueDisplay.textContent = modelVars.maxRNa.toFixed(0); // no multiplier for maxRNa
        F0ValueDisplay.textContent = (modelVars.F0 * F0_MULT).toFixed(0);
        FvasaValueDisplay.textContent = Math.round(modelVars.F0vr * F0VR_MULT / 5) * 5; // rounds to nearest 5

    if (onReset) onReset();
    });

    // ---- Replay button ----
    const replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", () => {
        if (onReplay) onReplay();
    });

;
}
