import { params } from "./config.js";
/**
 * One Euler step for Henle loop
 * @param {Object} segmentState - { desc: [], asc: [], ints: [] }
 * @param {number} dt - time step
 * @param {Object} modelVars - { k, maxRNa, F0 }
 * @returns {Object} fluxes { R: waterFluxDesc, RNa: saltFluxAsc }
 */
export function eulerStep(segmentState, dt = params.dt, modelVars = { k: params.k, maxRNa: params.maxRNa, F0: params.F0 }) {
    const { k, maxRNa, F0 } = modelVars; // extract slider-controlled params
    const nSegments = params.nSegments;

    const dNa = {
        desc: new Array(nSegments).fill(0),
        asc: new Array(nSegments).fill(0),
        ints: new Array(nSegments).fill(0)
    };

    const waterFluxDesc = new Array(nSegments).fill(0);
    const flowRateDesc = new Array(nSegments).fill(0);
    const saltFluxAsc = new Array(nSegments).fill(0);

    // Descending limb
    for (let i = 0; i < nSegments; i++) {
        if (i === 0) {
            waterFluxDesc[i] = k * (segmentState.ints[i] - segmentState.desc[i]);
            flowRateDesc[i] = F0 - waterFluxDesc[i];
            dNa.desc[i] = F0 * params.Na0 - flowRateDesc[i] * segmentState.desc[i];
        } else {
            waterFluxDesc[i] = k * (segmentState.ints[i] - segmentState.desc[i]);
            flowRateDesc[i] = flowRateDesc[i - 1] - waterFluxDesc[i];
            dNa.desc[i] = flowRateDesc[i - 1] * segmentState.desc[i - 1] - flowRateDesc[i] * segmentState.desc[i];
        }
    }

    // Ascending limb
    const Fa = flowRateDesc[nSegments - 1];
    for (let j = 0; j < nSegments; j++) {
        const revIndex = nSegments - 1 - j;
        const delNa = segmentState.ints[revIndex] - segmentState.asc[j];
        saltFluxAsc[j] = Math.max(maxRNa - (maxRNa / params.maxGrad) * delNa, 0);

        const prev = j === 0 ? segmentState.desc[nSegments - 1] : segmentState.asc[j - 1];
        dNa.asc[j] = Fa * (prev - segmentState.asc[j]) - saltFluxAsc[j];
    }

    // Interstitium
    for (let j = 0; j < nSegments; j++) {
        dNa.ints[j] = saltFluxAsc[nSegments - 1 - j] - params.k1 * segmentState.ints[j] * waterFluxDesc[j];
    }

    // Update state
    for (let i = 0; i < nSegments; i++) {
        segmentState.desc[i] += dNa.desc[i] * dt;
        segmentState.asc[i] += dNa.asc[i] * dt;
        segmentState.ints[i] += dNa.ints[i] * dt;
    }

    return { R: waterFluxDesc, RNa: saltFluxAsc };
}

/**
 * One Euler step for Vasa Recta
 * @param {Object} segmentState - Henle segment state
 * @param {Object} vasaState - { desc: [], asc: [] }
 * @param {number} dt - time step
 * @param {Object} modelVars - {F0vr} (vasa recta inlet flow, from slider)
 * @returns {Object} fluxes for visualization
 */
export function vasaEulerStep(segmentState, vasaState, dt = params.dt, modelVars = { F0vr: params.F0vr }) {
    const nVasa = params.nVasa;
    const { F0vr } = modelVars;

    const dNa = { desc: new Array(nVasa).fill(0), asc: new Array(nVasa).fill(0), ints: new Array(nVasa).fill(0) };
    const Rdvr = new Array(nVasa).fill(0);
    const Fdvr = new Array(nVasa).fill(0);
    const Ravr = new Array(nVasa).fill(0);
    const Favr = new Array(nVasa).fill(0);
    const knadFluxDesc = new Array(nVasa).fill(0);
    const knaFluxAsc = new Array(nVasa).fill(0);

    // ---- DESCENDING VASA ----
    for (let i = 0; i < nVasa; i++) {
        Rdvr[i] = params.kdvr * (segmentState.ints[i] - vasaState.desc[i]);

        if (i === 0) {
            Fdvr[i] = F0vr - Rdvr[i];
            dNa.desc[i] = F0vr * params.Na0
                        - Fdvr[i] * vasaState.desc[i]
                        - params.knadvr * (vasaState.desc[i] - segmentState.ints[i]);
        } else {
            Fdvr[i] = Fdvr[i - 1] - Rdvr[i];
            dNa.desc[i] = Fdvr[i - 1] * vasaState.desc[i - 1]
                        - Fdvr[i] * vasaState.desc[i]
                        - params.knadvr * (vasaState.desc[i] - segmentState.ints[i]);
        }

        knadFluxDesc[i] = params.knadvr * (vasaState.desc[i] - segmentState.ints[i]);
    }

    // ---- ASCENDING VASA ----
    const F0avr = Fdvr[nVasa - 1];
    for (let i = 0; i < nVasa; i++) {
        const revIndex = nVasa - 1 - i;
        Ravr[i] = params.kavr * (segmentState.ints[revIndex] - vasaState.asc[i]);

        if (i === 0) {
            Favr[i] = F0avr - Ravr[i];
            dNa.asc[i] = F0avr * vasaState.asc[i] - Favr[i] * vasaState.asc[i]
                       - params.knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
        } else {
            Favr[i] = Favr[i - 1] - Ravr[i];
            dNa.asc[i] = Favr[i - 1] * vasaState.asc[i - 1] - Favr[i] * vasaState.asc[i]
                       - params.knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
        }

        knaFluxAsc[i] = params.knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
    }

    // ---- INTERSTITIUM COUPLING ----
    for (let i = 0; i < nVasa; i++) {
        // Combine Na and water fluxes from descending & ascending vasa recta
        const RNa_total = dNa.desc[i] + dNa.asc[nVasa - 1 - i];
        const RH2O_total = Rdvr[i] + Ravr[nVasa - 1 - i];

        // Compute the change in interstitial Na concentration (osmolarity)
        const deltaOsm = ((3000 + RNa_total) / (10 + RH2O_total)) - 300;

        // Update the interstitial osmolarity
        const scaling_factor = 5;
        segmentState.ints[i] += deltaOsm * dt * scaling_factor;
    }

    // ---- UPDATE VASA STATE ----
    for (let i = 0; i < nVasa; i++) {
        vasaState.desc[i] += dNa.desc[i] * dt;
        vasaState.asc[i] += dNa.asc[i] * dt;
    }

    return {
        Rdvr, Fdvr, Ravr, Favr,
        R: Rdvr,
        RNa: knaFluxAsc
    };
    
}
