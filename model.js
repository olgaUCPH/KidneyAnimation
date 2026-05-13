import { params } from "./config.js";
import { setCdFlowText } from "./svg.js";
/**
 * One Euler step for Henle loop
 * @param {Object} segmentState - { desc: [], asc: [], ints: [], dist?: [], cd?: [] }
 * @param {number} dt - time step
 * @param {Object} modelVars - { k, maxRNa, F0 }
 * @returns {Object} fluxes { R: waterFluxDesc, RNa: saltFluxAsc }
 */
export function eulerStep(segmentState, dt = params.dt, modelVars = { k: params.k, maxRNa: params.maxRNa, F0: params.F0, kcd: params.kcd }) {
    const { k, maxRNa, F0, kcd } = modelVars; // extract slider-controlled params
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

    // ----- Distal tubule + cortical collecting duct (simplified) -----
    const nDist = params.nDist || 0;
    const Rdist = new Array(nDist).fill(0);
    const Fdist = new Array(nDist).fill(0);
    const dNaDist = new Array(nDist).fill(0);

    if (nDist > 0) {
        const distState = segmentState.dist || new Array(nDist).fill(params.Na0);
        const inletConcDist = segmentState.asc[nSegments - 1];
        const F0dt = Fa;

        for (let i = 0; i < nDist; i++) {
            if (i === 0) {
                Rdist[i] = params.kdt * (params.Na0 - distState[i]);
                Fdist[i] = Math.max(F0dt - Rdist[i], 0);
                dNaDist[i] = F0dt * inletConcDist - Fdist[i] * distState[i] - params.knadt * distState[i];
            } else {
                Rdist[i] = params.kdt * (params.Na0 - distState[i]);
                Fdist[i] = Math.max(Fdist[i - 1] - Rdist[i], 0);
                dNaDist[i] = Fdist[i - 1] * distState[i - 1] - Fdist[i] * distState[i] - params.knadt * distState[i];
            }
        }

        // update distal state
        if (segmentState.dist) {
            for (let i = 0; i < nDist; i++) segmentState.dist[i] += dNaDist[i] * dt;
        }
    }

    // ----- Medullary collecting duct (simplified) -----
    const nCD = params.nCD || 0;
    const Rcd = new Array(nCD).fill(0);
    const Fcd = new Array(nCD).fill(0);
    const dNaCd = new Array(nCD).fill(0);

    if (nCD > 0) {
        const cdState = segmentState.cd || new Array(nCD).fill(params.Na0);
        const inletConcCd = segmentState.dist[segmentState.dist.length - 1];
        const F0cd = (Fdist.length > 0) ? Fdist[Fdist.length - 1] : 0;

        for (let i = 0; i < nCD; i++) {
            if (i === 0) {
                Rcd[i] = kcd * (segmentState.ints[i] - cdState[i]);
                Fcd[i] = F0cd - Rcd[i];
                dNaCd[i] = F0cd * inletConcCd - Fcd[i] * cdState[i] - params.knacd * cdState[i];
            } else {
                Rcd[i] = kcd * (segmentState.ints[i] - cdState[i]);
                Fcd[i] = Math.max(Fcd[i - 1] - Rcd[i], 0);
                dNaCd[i] = Fcd[i - 1] * cdState[i - 1] - Fcd[i] * cdState[i] - params.knacd * cdState[i];
            }        }
            //console.log(segmentState.ints[nCD-1])
        // update SVG text with collecting duct outlet flow (if available)
        try {
            if (typeof setCdFlowText === 'function') setCdFlowText(Fcd[nCD - 1]);
        } catch (err) {
            // ignore if SVG not loaded or function unavailable
        }

        // update collecting duct state (clamp concentrations to be non-negative)
        if (segmentState.cd) {
            for (let i = 0; i < nCD; i++) {
                segmentState.cd[i] = Math.max(segmentState.cd[i] + dNaCd[i] * dt, 0);
            }
        }
    }

    return { R: waterFluxDesc, RNa: saltFluxAsc, Rdist, Fdist, Rcd, Fcd };
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
    for (let i = 0; i < nVasa; i++) {
        // Combine Na and water fluxes from descending & ascending vasa recta
        const RNa_total = dNa.desc[i] + dNa.asc[nVasa - 1 - i];
        const RH2O_total = Rdvr[i] + Ravr[nVasa - 1 - i];

        // Compute the change in interstitial Na concentration (osmolarity)
        const denom = Math.max(10 + RH2O_total, 1e-6); // avoid division-by-zero or negative denominator
        const deltaOsm = ((3000 + RNa_total) / denom) - 300;

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
