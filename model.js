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
            flowRateDesc[i] = Math.max(flowRateDesc[i], 0); // prevent negative flow
            dNa.desc[i] = F0 * params.Na0 - flowRateDesc[i] * segmentState.desc[i];
        } else {
            waterFluxDesc[i] = k * (segmentState.ints[i] - segmentState.desc[i]);
            flowRateDesc[i] = flowRateDesc[i - 1] - waterFluxDesc[i];
            flowRateDesc[i] = Math.max(flowRateDesc[i], 0); // prevent negative flow
            dNa.desc[i] = flowRateDesc[i - 1] * segmentState.desc[i - 1] - flowRateDesc[i] * segmentState.desc[i];
        }
    }

    // Ascending limb
    const Fa = Math.max(flowRateDesc[nSegments - 1], 0); // ensure non-negative
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

    // ----- Distal tubule (simple model with 10 segments) -----
    // The first distal segment is based on the end of the ascending limb,
    // TODO make n based on same as drawing (instead of defining twice)
    const nDistal = 10;
    const distal = new Array(nDistal).fill(0);
    const ascEnd = segmentState.asc[nSegments - 1];
    if (ascEnd !== undefined && Number.isFinite(ascEnd)) {
        // Converge toward target (300) across the distal segments.
        // Uses iterative relaxation: next = prev + rate*(target - prev).
        const target = 300;
        const rate = 0.15; // convergence rate per segment (0 < rate < 1)
        distal[0] = ascEnd;
        for (let d = 1; d < nDistal; d++) {
            distal[d] = distal[d - 1] + (target - distal[d - 1]) * rate;
        }
    }

    return { R: waterFluxDesc, RNa: saltFluxAsc, distal };
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
            Fdvr[i] = Math.max(Fdvr[i], 0); // prevent negative flow
            dNa.desc[i] = F0vr * params.Na0
                        - Fdvr[i] * vasaState.desc[i]
                        - params.knadvr * (vasaState.desc[i] - segmentState.ints[i]);
        } else {
            Fdvr[i] = Fdvr[i - 1] - Rdvr[i];
            Fdvr[i] = Math.max(Fdvr[i], 0); // prevent negative flow
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
            Favr[i] = Math.max(Favr[i], 0); // prevent negative flow
            dNa.asc[i] = F0avr * vasaState.asc[i] - Favr[i] * vasaState.asc[i]
                       - params.knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
        } else {
            Favr[i] = Favr[i - 1] - Ravr[i];
            Favr[i] = Math.max(Favr[i], 0); // prevent negative flow
            dNa.asc[i] = Favr[i - 1] * vasaState.asc[i - 1] - Favr[i] * vasaState.asc[i]
                       - params.knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
        }

        knaFluxAsc[i] = params.knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
    }

    // ---- INTERSTITIUM COUPLING ----
    // Recompute descending limb water flux (R) locally so we can compute interstitial water balance
    const henleR = new Array(nVasa).fill(0);
    for (let i = 0; i < nVasa; i++) {
        // use available segment values (if lengths differ, we clamp)
        const segDesc = segmentState.desc[i] ?? segmentState.desc[segmentState.desc.length - 1];
        const segInt = segmentState.ints[i] ?? segmentState.ints[segmentState.ints.length - 1];
        henleR[i] = params.k * (segInt - segDesc);
    }

    for (let i = 0; i < nVasa; i++) {
        const rev = nVasa - 1 - i;

        // Filtration term (interstitium volume coupling)
        const dFilt = -2 * params.k2 * (params.vol - params.vol); // placeholder when interstital volume not tracked

        // Water fluxes affecting the interstitium
        const dH2OF = Rdvr[i] + Ravr[rev];
        const dH2O = henleR[i] + dH2OF + dFilt;

        // Local ascending limb Na reabsorption (approximate, same form as Henle step)
        const delNa = segmentState.ints[rev] - segmentState.asc[i];
        const RNa_local = Math.max(params.maxRNa - (params.maxRNa / params.maxGrad) * delNa, 0);

        // Change in interstitial Na from transports and vasa exchanges
        const dRNa = -RNa_local
                     + params.knadvr * (vasaState.desc[i] - segmentState.ints[i])
                     + params.knaavr * (vasaState.asc[rev] - segmentState.ints[i])
                     - params.k1 * ( (Ravr[rev] * (segmentState.ints[i] + vasaState.asc[rev]) / 2) + (Rdvr[i] * (segmentState.ints[i] + vasaState.desc[i]) / 2) );

        // Update interstitium concentration using interstitium volume
        const vol = Math.max(params.vol, 1e-6);
        const deltaNa = ((-segmentState.ints[i] * dH2O) - dRNa) / vol;
        segmentState.ints[i] += deltaNa * dt;
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
