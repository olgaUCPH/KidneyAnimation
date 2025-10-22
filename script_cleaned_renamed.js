// TODO Question --> how do parameters like k, maxGRad, F0, etc. change in terms of # of segments? 

// ==================== 1. Parameters ====================
// -- 1.1 Model parameters --
const k1 = 0.5;         // Reflection coefficient for NaCl
const Na0 = 300;        // Osmolarity of the isotonic fluid into the descending limb
const maxGrad = 250;    // Maximum gradient for NaCl in ascending limb, before reabsorption stops 
const dt = 0.01;        // Time step

// -- 1.2 Model variables --> change to simulate 
let k = 0.0005;       // Water permeability of descending limb
let maxRNa = 100;     // Maximum rate of NaCL reabsorption
let F0 = 2;           // Flow of isotonic fluid into the descending limb

// -- 1.3 Henle graph --
const nSegments = 20;   // Vertical segments
const totalHeight = 400;    
const totalWidth = 240;    
const segmentHeight = totalHeight/nSegments;
const segmentWidth = totalWidth/3   // 3 parts, ascending, descending and interstits

// -- 1.4 Arrows --
const waterArrowScale = 250;
const saltArrowScale = 0.5;

// -- 1.5 Color bar --
const maxConcentration = 1600;
const colorbarTickStep = 200; 

// -- 1.6 Animation parameters --
const eulerStepsPerFrame = 80;
const framesPerSecond = 30;
const miliSecondWait = 1000/framesPerSecond


// ==================== 2. Canvas setup ====================
// -- 2.1 Canvas --
const canvas = document.getElementById("henleCanvas");
const ctx = canvas.getContext("2d");
const colorBarCanvas = document.getElementById("colorBar");
const ctxBar = colorBarCanvas.getContext("2d");

const scale = 4;
ctx.scale(scale, scale)

// -- 2.2 Sliders -- 
// -- TODO make numbers show up as biological values rather than model numbers

// __ 2.2.1 Get slider elements and value displays
const kSlider = document.getElementById("kSlider");
const kValueDisplay = document.getElementById("kValue");

const maxRNaSlider = document.getElementById("maxRNaSlider");
const maxRNaValueDisplay = document.getElementById("maxRNaValue");

const F0Slider = document.getElementById("F0Slider");
const F0ValueDisplay = document.getElementById("F0Value");

// __ 2.2.2 Update variables whenever sliders move
kSlider.addEventListener("input", () => {
  k = parseFloat(kSlider.value);
  kValueDisplay.textContent = k.toFixed(4);
});

maxRNaSlider.addEventListener("input", () => {
  maxRNa = parseFloat(maxRNaSlider.value);
  maxRNaValueDisplay.textContent = maxRNa.toFixed(0);
});

F0Slider.addEventListener("input", () => {
  F0 = parseFloat(F0Slider.value);
  F0ValueDisplay.textContent = F0.toFixed(1);
});

// -- Reset sliders button --
const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", () => {
  // Reset variables
  k = 0.0005;
  maxRNa = 100;
  F0 = 2;

  // Reset sliders
  kSlider.value = k;
  maxRNaSlider.value = maxRNa;
  F0Slider.value = F0;

  // Reset display
  kValueDisplay.textContent = k.toFixed(4);
  maxRNaValueDisplay.textContent = maxRNa;
  F0ValueDisplay.textContent = F0.toFixed(1);
  
    segmentState.desc = new Array(nSegments).fill(Na0) 
    segmentState.asc = new Array(nSegments).fill(Na0) 
    segmentState.ints = new Array(nSegments).fill(Na0) 

});


// ==================== 3. System state ====================
// Creating arrays for every segment. Sets value to osmolarity of isotonic fluid
// TODO mak const instad?
let segmentState = {
    desc: new Array(nSegments).fill(Na0),
    asc: new Array(nSegments).fill(Na0),
    ints: new Array(nSegments).fill(Na0)
};



// ==================== 4. Model functions ====================
function eulerStep(segmentState, dt) {
    // Changes to system state
    const dNa = {
        desc: new Array(nSegments).fill(0),
        asc: new Array(nSegments).fill(0),
        ints: new Array(nSegments).fill(0)
    };

    const waterFluxDesc = new Array(nSegments).fill(0);    // Waterflux out of the descending limb
    const flowRateDesc = new Array(nSegments).fill(0);     // Flow rate through the descending limb
    const saltFluxAsc = new Array(nSegments).fill(0);      // NaCl reabsorption from the ascending limb into interstits

    // Descending limb
    for (let i = 0; i < nSegments; i++) {
        if (i === 0) {
            waterFluxDesc[i] = k * (segmentState.ints[i] - segmentState.desc[i]);
            flowRateDesc[i] = F0 - waterFluxDesc[i];
            dNa.desc[i] = F0*Na0 - flowRateDesc[i]*segmentState.desc[i];

        } else {
            waterFluxDesc[i] = k * (segmentState.ints[i] - segmentState.desc[i]);
            flowRateDesc[i] = flowRateDesc[i-1] - waterFluxDesc[i];
            dNa.desc[i] = flowRateDesc[i-1]*segmentState.desc[i-1] - flowRateDesc[i]*segmentState.desc[i];
        }
    }

    // Ascending limb
    const Fa = flowRateDesc[nSegments-1];  // flow into ascending limb = outflow from desc
    for (let j = 0; j < nSegments; j++) {
        const revIndex = nSegments - 1 - j;  

        const delNa = segmentState.ints[revIndex] - segmentState.asc[j];
        saltFluxAsc[j] = Math.max(maxRNa - (maxRNa/maxGrad) * delNa, 0);

        const prev = (j === 0) ? segmentState.desc[nSegments-1] : segmentState.asc[j-1];
        dNa.asc[j] = Fa * (prev - segmentState.asc[j]) - saltFluxAsc[j];
    }

    // Interstitium
    for (let j = 0; j < nSegments; j++) {
        dNa.ints[j] = saltFluxAsc[nSegments-1-j] - k1*segmentState.ints[j]*waterFluxDesc[j];
    }

    // Update state
    for (let i = 0; i < nSegments; i++) {
        segmentState.desc[i] += dNa.desc[i]*dt;
        segmentState.asc[i] += dNa.asc[i]*dt;
        segmentState.ints[i] += dNa.ints[i]*dt;
    }

    // return flux arrays so we can draw arrows
    return { R: waterFluxDesc, RNa: saltFluxAsc };
}



// ==================== 5. Drawing functions ====================
// -- 5.1 Color mapping---
function concentrationToColor(c) {
    // Ratio: 0 = min, 1 = max
    const ratio = Math.min(1, Math.max(0, c / maxConcentration));

    let r, g, b;

    if (ratio < 0.33) {
        // Blue (0,0,255) → Cyan (0,255,255)
        const t = ratio / 0.33;
        r = 0;
        g = Math.round(255 * t);
        b = 255;
    } else if (ratio < 0.66) {
        // Cyan (0,255,255) → Yellow (255,255,0)
        const t = (ratio - 0.33) / 0.33;
        r = Math.round(255 * t);
        g = 255;
        b = Math.round(255 * (1 - t));
    } else {
        // Yellow (255,255,0) → Orange (255,165,0)
        const t = (ratio - 0.66) / 0.34;  // remainder to 1
        r = 255;
        g = Math.round(255 - t * (255 - 165)); // 255 → 165
        b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
}


// -- 5.2 Loop of Henle --
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < nSegments; i++) {
        const y = i * segmentHeight; // vertical position

        // Descending
        ctx.fillStyle = concentrationToColor(segmentState.desc[i]);
        ctx.fillRect(0, y, segmentWidth, segmentHeight);

        // Interstitium
        ctx.fillStyle = concentrationToColor(segmentState.ints[i]);
        ctx.fillRect(segmentWidth, y, segmentWidth, segmentHeight);

        // Ascending (reversed display)
        ctx.fillStyle = concentrationToColor(segmentState.asc[nSegments-1-i]);
        ctx.fillRect(segmentWidth*2, y, segmentWidth, segmentHeight);
        // TODO change equation to fit without reverse order?
    }
}

// -- 5.3 Color bar --
function drawColorBar() {
    const height = colorBarCanvas.height;
    const width = colorBarCanvas.width;

    
    const nTicks = maxConcentration / colorbarTickStep;

    // Draw gradient (top = 0, bottom = max)
    for (let i = 0; i < height; i++) {
        const c = maxConcentration * i / height; // top = 0, bottom = max
        ctxBar.fillStyle = concentrationToColor(c);
        ctxBar.fillRect(0, i, width, 1);
    }

    // Add ticks and numeric labels every 200 units
    ctxBar.strokeStyle = "black";
    ctxBar.fillStyle = "black";
    ctxBar.font = "50px Arial";
    ctxBar.textAlign = "right";
    ctxBar.textBaseline = "middle";
    ctxBar.lineWidth = 5; 
    // TODO mov to CSS?
   
    for (let t = 0; t <= nTicks; t++) {
        const value = t * colorbarTickStep;
        const y = (value / maxConcentration) * height; // matches flipped gradient

        // Tick line
        ctxBar.beginPath();
        ctxBar.moveTo(width - 25, y);
        ctxBar.lineTo(width, y);
        ctxBar.stroke();

        // Numeric label
        ctxBar.fillText(value, width - 30, y);
    }
}

// -- 5.4 Arrows --
function drawArrows(R, RNa) {
    // Arrow helper
    function drawArrow(x1, y1, x2, y2, color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        // Line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 6;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI/6),
                   y2 - headLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI/6),
                   y2 - headLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
    }

// __Descending limb → water movement (black arrows)__
    for (let i = 0; i < nSegments; i++) {
    const y = i * segmentHeight + segmentHeight/2; 
    const magnitude = Math.abs(R[i]) * waterArrowScale;

    if (R[i] > 0) {
        // Water exits DESC → INT
        drawArrow(segmentWidth, y, segmentWidth + magnitude, y, "black");
    } else if (R[i] < 0) {
        // (rare) water backflow INT → DESC
        drawArrow(segmentWidth, y, segmentWidth - magnitude, y, "black");
    }
    }

// __Ascending limb → NaCl movement (red arrows)__
    for (let j = 0; j < nSegments; j++) {
    // y-position must match reversed display
    const revIndex = nSegments - 1 - j;
    const y = revIndex * segmentHeight + segmentHeight/2;

    const magnitude = Math.abs(RNa[j]) * saltArrowScale; // scale factor

    if (RNa[j] > 0) {
        // start at ASC wall (x=160), point left into INT
        drawArrow(segmentWidth*2, y, segmentWidth*2 - magnitude, y, "red");
    }
    }

    // Single labels for the fluxes
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // H2O label (descending → interstitium)
    ctx.fillText("H₂O", segmentWidth/2, canvas.height / 16); 

    // NaCl label (ascending → interstitium)
    ctx.fillStyle = "red";
    ctx.fillText("NaCl", totalWidth-segmentWidth/2, canvas.height / 16); 

}



// Draw color bar
drawColorBar()

// ==================== 6. Animation loop ====================
setInterval(() => {
  let fluxes;
  for (let n = 0; n < eulerStepsPerFrame; n++) {
    fluxes = eulerStep(segmentState, dt);
  }
  draw();
  drawArrows(fluxes.R, fluxes.RNa);
}, miliSecondWait); 