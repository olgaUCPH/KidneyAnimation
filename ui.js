// ==================== ui.js ====================
import { params } from "./config.js";

/**
 * Initialize sliders and buttons
 * @param {Object} modelVars - { k, maxRNa, F0, F0vr, kcd, knacd} (model variables)
 * @param {Function} onReset - callback to reset the simulation
 * @param {Function} onReplay - callback to replay the simulation
 */
export function initUI(modelVars, onReset, onReplay) {
    // ---- Grab slider and display elements ----
    const kSlider = document.getElementById("kSlider");
    const maxRNaSlider = document.getElementById("maxRNaSlider");
    const F0Slider = document.getElementById("F0Slider");
    const FvasaSlider = document.getElementById("FvasaSlider"); // NEW
    const kcdSlider = document.getElementById("kcdSlider"); // NEW
    const knacdSlider = document.getElementById("knacdSlider");

    const kValueDisplay = document.getElementById("kValue");
    const maxRNaValueDisplay = document.getElementById("maxRNaValue");
    const F0ValueDisplay = document.getElementById("F0Value");
    const FvasaValueDisplay = document.getElementById("FvasaValue"); // NEW
    const kcdValueDisplay = document.getElementById("kcdValue"); // NEW
    const knacdValueDisplay = document.getElementById("knacdValue");

    // Info box and related init
    const infoText = document.getElementById("infoText");
    const showHenle = document.getElementById("showHenle");
    const showVasa = document.getElementById("showVasa");

    // ---- CONST ----
    const K_MULT = 200000; // display multiplier for `k`
    const KCD_MULT = 100 / 0.00006; // 1,000,000 so kcd=0.0001 -> 100%
    const F0_MULT = 50;
    const F0VR_MULT = 100;
    const KNACD_MULT = 10000;

    kValueDisplay.textContent = (parseFloat(kSlider.value) * K_MULT).toFixed(0);
    maxRNaValueDisplay.textContent = parseFloat(maxRNaSlider.value).toFixed(0); 
    F0ValueDisplay.textContent = (parseFloat(F0Slider.value) * F0_MULT).toFixed(0);
    FvasaValueDisplay.textContent = parseFloat(FvasaSlider.value * F0VR_MULT).toFixed(0)
    kcdValueDisplay.textContent = (parseFloat(kcdSlider.value) * KCD_MULT).toFixed(0);
    knacdValueDisplay.textContent = (parseFloat(knacdSlider.value) * KNACD_MULT).toFixed(0);
    const henleColorBar = document.getElementById("colorBar");
    const vasaColorBar = document.getElementById("colorBarVasa");

    // ---- Sliders ----
    kSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `Water permeability determines how much water is reabsorbed in the descending limb of the loop of Henle. A permeability of 100% corresponds to the normal value for the water reabsorption rate.`;
    });

    kSlider.addEventListener("touchstart", (e) => {
        infoText.textContent = `Water permeability determines how much water is reabsorbed in the descending limb of the loop of Henle. A permeability of 100% corresponds to the normal value for the water reabsorption rate.`;
    });

   kSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.k = val;  // keep real small value for model
        kValueDisplay.textContent = (val * K_MULT).toFixed(0); // show friendly number
    });

   // Na reab in distal tubule and collecting duct slider 
    knacdSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `The reabsorbtion of NaCl in the collecting duct is the main site for determining renal NaCl excretion. The reabsorption rate is regulated by aldosterone`;
    });

    knacdSlider.addEventListener("touchstart", (e) => {
        infoText.textContent = `The reabsorbtion of NaCl in the collecting duct is the main site for determining renal NaCl excretion. The reabsorption rate is regulated by aldosterone`;
    });

    knacdSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.knacd = val;  // keep real small value for model
        knacdValueDisplay.textContent = (val * KNACD_MULT).toFixed(0); // show friendly number (0–200%)
    });

   // Collecting duct slider (kcd)
   kcdSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `Collecting duct water permeability determines water reabsorption in the medullary collecting duct and is ADH-sensitive.`;
    });

    kcdSlider.addEventListener("touchstart", (e) => {
        infoText.textContent = `Collecting duct water permeability determines water reabsorption in the medullary collecting duct and is ADH-sensitive.`;
    });

    kcdSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.kcd = val;  // keep real small value for model
        kcdValueDisplay.textContent = (val * KCD_MULT).toFixed(0); // show friendly number (0–200%)
    });

    maxRNaSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `NaCl reabsorption controls how much NaCl the ascending limb actively pumps into the interstitium. A NaCl reabsorption of 100% corresponds to the normal value for the reabsorption rate.`;
    });

    maxRNaSlider.addEventListener("touchstart", (e) => {
        infoText.textContent = `NaCl reabsorption controls how much NaCl the ascending limb actively pumps into the interstitium. A NaCl reabsorption of 100% corresponds to the normal value for the reabsorption rate.`;
    });

    maxRNaSlider.addEventListener("input", (e) => {
        modelVars.maxRNa = parseFloat(e.target.value);
        maxRNaValueDisplay.textContent = e.target.value;
    });

    F0Slider.addEventListener("mouseover", (e) => {
        infoText.textContent = `Loop of Henle flow sets the flow of isotonic fluid entering the descending limb of the loop of Henle. An flow of 100% corresponds to the normal value for the inflow of isotonic fluid to the descending limb.`;
    });

    F0Slider.addEventListener("touchstart", (e) => {
        infoText.textContent = `Loop of Henle flow sets the flow of isotonic fluid entering the descending limb of the loop of Henle. An flow of 100% corresponds to the normal value for the inflow of isotonic fluid to the descending limb.`;
    });

    F0Slider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        modelVars.F0 = val;  // keep real small value for model
        F0ValueDisplay.textContent = (val * F0_MULT).toFixed(0); // show friendly number
    });

    FvasaSlider.addEventListener("mouseover", (e) => {
        infoText.textContent = `Vasa recta flow sets the blood flow entering the descending vasa recta. A vasa recta inflow of 100% corresponds to the normal value for the inflow of blood.`;
    });

    FvasaSlider.addEventListener("touchstart", (e) => {
        infoText.textContent = `Vasa recta flow sets the blood flow entering the descending vasa recta. A vasa recta inflow of 100% corresponds to the normal value for the inflow of blood.`;
    });   

    FvasaSlider.addEventListener("input", (e) => {
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

    showHenle.addEventListener("touchstart", () => {
        infoText.textContent = `Countercurrent multiplication occurs in the loop of Henle.
            - The ascending limb increases the medullary osmolarity by actively pumping sodium and chloride into the medullary interstitium.
            - The descending limb is permeable to water but not to solutes, so water leaves into the increasingly salty medulla.
            - This interaction “multiplies” small differences in solute concentration along the loop, creating a steep osmotic gradient in the medulla.`;
    });

    showVasa.addEventListener("touchstart", () => {
        infoText.textContent = `Countercurrent exchange happens in the vasa recta.
            - Descending limb blood loses water and gains sodium chloride.
            - Ascending limb blood gains water and loses sodium chloride.
            - This helps maintain the medullary gradient while allowing nutrient and gas exchange.`;
    
    });

    showVasa.addEventListener("mouseover", () => {
        infoText.textContent = `Countercurrent exchange happens in the vasa recta.
            - Descending limb blood loses water and gains sodium chloride.
            - Ascending limb blood gains water and loses sodium chloride.
            - This helps maintain the medullary gradient while allowing nutrient and gas exchange.`;
    
    });

    // Color bars
    // Henle color bar
    henleColorBar.addEventListener("mouseover", () => {
        infoText.textContent = "The color bar shows the osmolarity (mOsm/L) in the medullary intestitium and in loop of Henle.";
    });

    henleColorBar.addEventListener("touchstart", () => {
        infoText.textContent = "The color bar shows the osmolarity (mOsm/L) in the medullary intestitium and in loop of Henle";
    });

    henleColorBar.addEventListener("mouseout", () => {
        infoText.textContent = "The concentration gradient in the kidney is created and maintained by two closely related processes: Countercurrent multiplication and Countercurrent exchange.";
    });


    // Vasa color bar
    vasaColorBar.addEventListener("mouseover", () => {
        infoText.textContent = "The color bar shows the osmolarity (mOsm/L) in the vasa recta.";
    });

    vasaColorBar.addEventListener("touchstart", () => {
        infoText.textContent = "This color bar shows the osmolarity (mOsm/L) in the vasa recta.";
    });


    vasaColorBar.addEventListener("mouseout", () => {
        infoText.textContent = "The concentration gradient in the kidney is created and maintained by two closely related processes: Countercurrent multiplication and Countercurrent exchange.";
    });

    // ---- Reset button ----
    const resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", () => {
        // Reset model values
        modelVars.k = 0.0005;
        modelVars.maxRNa = 100;
        modelVars.F0 = 2;
        modelVars.F0vr = params.F0vr;
        modelVars.kcd = params.kcd;
        modelVars.knacd = params.knacd;

        // Reset slider positions
        kSlider.value = modelVars.k;
        maxRNaSlider.value = modelVars.maxRNa;
        F0Slider.value = modelVars.F0;
        FvasaSlider.value = modelVars.F0vr;
        kcdSlider.value = modelVars.kcd;
        knacdSlider.value = modelVars.knacd;

        // Update displayed values with multipliers
        kValueDisplay.textContent = (modelVars.k * K_MULT).toFixed(0);
        maxRNaValueDisplay.textContent = modelVars.maxRNa.toFixed(0); // no multiplier for maxRNa
        F0ValueDisplay.textContent = (modelVars.F0 * F0_MULT).toFixed(0);
        FvasaValueDisplay.textContent = Math.round(modelVars.F0vr * F0VR_MULT / 5) * 5; // rounds to nearest 5
        kcdValueDisplay.textContent = (modelVars.kcd * KCD_MULT).toFixed(0);
        knacdValueDisplay.textContent = 100;

    if (onReset) onReset();
    });

    // ---- Replay button ----
    const replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", () => {
        if (onReplay) onReplay();
    });

;
}
