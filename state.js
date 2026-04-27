// ==================== state.js ====================
import { params } from "./config.js";

/**
 * Create initial state for Henle loop segments
 */
export function createSegmentState() {
    const { nSegments, Na0, nDist, nCD } = params;
    return {
        desc: new Array(nSegments).fill(Na0),
        asc: new Array(nSegments).fill(Na0),
        ints: new Array(nSegments).fill(Na0),
        // Distal tubule + cortical collecting duct
        dist: new Array(nDist).fill(Na0),
        // Medullary collecting duct
        cd: new Array(nCD).fill(Na0)
    };
}

/**
 * Create initial state for Vasa Recta
 */
export function createVasaState() {
    const { nVasa, Na0 } = params;
    return {
        desc: new Array(nVasa).fill(Na0),
        asc: new Array(nVasa).fill(Na0)
    };
}

/**
 * Reset an existing Henle loop state to initial values
 */
export function resetSegmentState(state) {
    const { nSegments, Na0, nDist, nCD } = params;
    state.desc.fill(Na0);
    state.asc.fill(Na0);
    state.ints.fill(Na0);
    if (state.dist) state.dist.fill(Na0);
    if (state.cd) state.cd.fill(Na0);
}

/**
 * Reset an existing Vasa Recta state to initial values
 */
export function resetVasaState(state) {
    const { nVasa, Na0 } = params;
    state.desc.fill(Na0);
    state.asc.fill(Na0);
}
