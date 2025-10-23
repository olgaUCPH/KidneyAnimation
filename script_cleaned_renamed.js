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

    // -- 1.2 Vasa recta parameters --
    const kdvr = 0.01;   // water permeability, descending vasa recta
    const kavr = 0.01;   // water permeability, ascending vasa recta
    const knadvr = 0.001; // Na permeability, descending
    const knaavr = 0.001; // Na permeability, ascending
    const F0vr = 1.3;    // flow into descending vasa recta

    // -- 1.3 Henle graph --
    const nSegments = 20;   // Vertical segments
    const totalHeight = 400;
    const totalWidth = 240;

    // specify interstitium width explicitly, then split remaining width for the two limbs
    const interstitiumWidth = 109;                 // pick desired px for interstitium
    const limbWidth = (totalWidth - interstitiumWidth) / 2; // width for each limb

    const segmentHeight = totalHeight / nSegments;
    const descWidth = limbWidth;
    const intWidth = interstitiumWidth;
    const ascWidth = limbWidth;


    // -- 1.4 Arrows --
    const waterArrowScale = 350;
    const saltArrowScale = 0.8;

    const vasaArrowScale = 0;
    const vasaSaltArrowScale = 0;


    // -- 1.5 Vasa recta --
    const nVasa = nSegments; 
    const totalHeightVasa = 300;
    const totalWidthVasa = 225;

    // specify interstitium width explicitly, then split remaining width for the two limbs
    const interstitiumWidthVasa = 130;                 // pick desired px for interstitium
    const limbWidthVasa = (totalWidthVasa - interstitiumWidthVasa) / 2; // width for each limb

    const segmentHeightVasa = totalHeightVasa / nVasa;
    const descWidthVasa = limbWidthVasa;
    const intWidthVasa = interstitiumWidthVasa;
    const ascWidthVasa = limbWidthVasa;


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


    const vasaCanvas = document.getElementById("vasaCanvas");
    const vasaCtx = vasaCanvas.getContext("2d");

    const vasaScale = 4;
    vasaCtx.scale(vasaScale, vasaScale);

    //-- 2.2 SVG elements
    const overlay = document.getElementById("overlaySvg");
    let henleLoopBottom, henleIntBottom;
    let vasaLoopBottom, vasaIntBottom;
    let vasaDesc, vasaAsc;
    let glomerulus, collectingDuct;
    
    overlay.addEventListener("load", () => {
        const svgObj = overlay.contentDocument;
        henleLoopBottom = svgObj.getElementById("HenleLoop");
        henleIntBottom = svgObj.getElementById("HenleInt");

        vasaLoopBottom = svgObj.getElementById("VasaLoop");
        vasaIntBottom = svgObj.getElementById("VasaInt");

        vasaDesc = svgObj.getElementById("VasaDesc");
        vasaAsc = svgObj.getElementById("VasaAsc");

        glomerulus = svgObj.getElementById("Glomerulus");
        collectingDuct = svgObj.getElementById("CollectingDuct");




    });

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

    // -- Replay button --
    const replayButton = document.getElementById("replayButton");
    replayButton.addEventListener("click", () => {
    // Just reset the container states (not variables)
    segmentState.desc = new Array(nSegments).fill(Na0);
    segmentState.asc = new Array(nSegments).fill(Na0);
    segmentState.ints = new Array(nSegments).fill(Na0);

    // Optional: immediately redraw so the reset is visible right away
    draw();
    drawArrows(new Array(nSegments).fill(0), new Array(nSegments).fill(0));
    });

    // ==================== 3. System state ====================
    // Creating arrays for every segment. Sets value to osmolarity of isotonic fluid
    // TODO mak const instad?
    let segmentState = {
        desc: new Array(nSegments).fill(Na0),
        asc: new Array(nSegments).fill(Na0),
        ints: new Array(nSegments).fill(Na0)
    };

    // Vasa recta state arrays
    let vasaState = {
        desc: new Array(nVasa).fill(Na0), // descending vasa recta osmolarity
        asc: new Array(nVasa).fill(Na0)   // ascending vasa recta osmolarity
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

        let vasaFlux = {
        R: new Array(nVasa).fill(0),     // water flux
        RNa: new Array(nVasa).fill(0)    // NaCl flux
        };


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


function vasaEulerStep(segmentState, vasaState, dt) {
    const dNa = {
        desc: new Array(nVasa).fill(0),
        asc: new Array(nVasa).fill(0)
    };

    // Water reabsorption fluxes (descending & ascending)
    const Rdvr = new Array(nVasa).fill(0);  // water flux in descending vasa recta
    const Fdvr = new Array(nVasa).fill(0);  // flow rate in descending vasa recta
    const Ravr = new Array(nVasa).fill(0);  // water flux in ascending vasa recta
    const Favr = new Array(nVasa).fill(0);  // flow rate in ascending vasa recta

    // NEW: Na transfer (membrane) fluxes for visualization
    const knadFluxDesc = new Array(nVasa).fill(0); // Na flux between dVasa <-> interstitium
    const knaFluxAsc  = new Array(nVasa).fill(0); // Na flux between aVasa <-> interstitium

    // ------------------------------
    // Descending vasa recta
    // ------------------------------
    for (let i = 0; i < nVasa; i++) {
        // Water reabsorption
        Rdvr[i] = kdvr * (segmentState.ints[i] - vasaState.desc[i]);

        if (i === 0) {
            Fdvr[i] = F0vr - Rdvr[i];
            dNa.desc[i] = F0vr * Na0
                        - Fdvr[i] * vasaState.desc[i]
                        - knadvr * (Na0 - segmentState.ints[i]);
        } else {
            Fdvr[i] = Fdvr[i - 1] - Rdvr[i];
            dNa.desc[i] = Fdvr[i - 1] * vasaState.desc[i - 1]
                        - Fdvr[i] * vasaState.desc[i]
                        - knadvr * (vasaState.desc[i] - segmentState.ints[i]);
        }

        // store membrane Na flux (positive = vasa -> interstitium)
        knadFluxDesc[i] = knadvr * (vasaState.desc[i] - segmentState.ints[i]);
    }

    // ------------------------------
    // Ascending vasa recta
    // ------------------------------
    const F0avr = Fdvr[nVasa - 1]; // flow entering ascending limb = flow leaving descending

    for (let i = 0; i < nVasa; i++) {
        const revIndex = nVasa - 1 - i;  // reversed vertically

        // Water reabsorption
        Ravr[i] = kavr * (segmentState.ints[revIndex] - vasaState.asc[i]);

        if (i === 0) {
            Favr[i] = F0avr - Ravr[i];
            dNa.asc[i] = F0avr * vasaState.asc[i]   // use local value
                       - Favr[i] * vasaState.asc[i]
                       - knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
        } else {
            Favr[i] = Favr[i - 1] - Ravr[i];
            dNa.asc[i] = Favr[i - 1] * vasaState.asc[i - 1]
                       - Favr[i] * vasaState.asc[i]
                       - knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
        }

        // store membrane Na flux (positive = vasa -> interstitium)
        knaFluxAsc[i] = knaavr * (vasaState.asc[i] - segmentState.ints[revIndex]);
    }

    // ------------------------------
    // Update the state variables
    // ------------------------------
    for (let i = 0; i < nVasa; i++) {
        vasaState.desc[i] += dNa.desc[i] * dt;
        vasaState.asc[i] += dNa.asc[i] * dt;
    }

    // Return useful quantities for visualization
    return {
        Rdvr,  // descending water flux
        Fdvr,  // descending flow
        Ravr,  // ascending water flux
        Favr,  // ascending flow
        // added aliases expected by drawVasaArrows:
        R: Rdvr,          // water flux array used by drawVasaArrows
        RNa: knaFluxAsc   // Na flux across ascending vasa membrane (for red arrows)
    };
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


    function concentrationToColorVasa(c) {
    // Ratio: 0 = min, 1 = max
    const ratio = Math.min(1, Math.max(0, c / maxConcentration));

    // Linear interpolation between blue (0,0,255) and red (255,0,0)
    const r = Math.round(255 * ratio);         // increases from 0 → 255
    const g = 0;                               // stays 0 (no green)
    const b = Math.round(255 * (1 - ratio));   // decreases from 255 → 0

    return `rgb(${r}, ${g}, ${b})`;
    }



    // -- 5.2 Loop of Henle --
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < nSegments; i++) {
            const y = i * segmentHeight; // vertical position

            // Descending
            ctx.fillStyle = concentrationToColor(segmentState.desc[i]);
            ctx.fillRect(0, y, descWidth, segmentHeight);

            // Interstitium
            ctx.fillStyle = concentrationToColor(segmentState.ints[i]);
            ctx.fillRect(descWidth, y, intWidth, segmentHeight);

            // Ascending (reversed display)
            ctx.fillStyle = concentrationToColor(segmentState.asc[nSegments-1-i]);
            ctx.fillRect(descWidth + intWidth, y, ascWidth, segmentHeight);
        }
    }

    function drawVasaRecta() {
    // clear
    vasaCtx.clearRect(0, 0, vasaCanvas.width, vasaCanvas.height);

    // x positions (model units; ctx is already scaled)
    const xDesc = 0;
    const xInt  = descWidthVasa;
    const xAsc  = descWidthVasa + intWidthVasa;

    for (let i = 0; i < nVasa; i++) {
        const y = i * segmentHeightVasa;

        // descending vasa (left)
        vasaCtx.fillStyle = concentrationToColorVasa(vasaState.desc[i]);
        vasaCtx.fillRect(xDesc, y, descWidthVasa, segmentHeightVasa);

        // interstitium (middle) — using segmentState.ints, not vasa color
        vasaCtx.fillStyle = concentrationToColor(segmentState.ints[i]);
        vasaCtx.fillRect(xInt, y, intWidthVasa, segmentHeightVasa);

        // ascending vasa (right) — use reversed index for vertical flip
        const ascValue = vasaState.asc[nVasa - 1 - i];
        vasaCtx.fillStyle = concentrationToColorVasa(ascValue);
        vasaCtx.fillRect(xAsc, y, ascWidthVasa, segmentHeightVasa);
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
    function drawArrowOn(ctx, x1, y1, x2, y2, color) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

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

    function drawArrows(R, RNa) {
        // removed nested helper, use drawArrowOn(ctx,...)

        // __Descending limb → water movement (black arrows)__
        for (let i = 0; i < nSegments; i++) {
            const y = i * segmentHeight + segmentHeight/2; 
            const magnitude = Math.abs(R[i]) * waterArrowScale;

            if (R[i] > 0) {
                drawArrowOn(ctx, descWidth, y, descWidth + magnitude, y, "black");
            } else if (R[i] < 0) {
                drawArrowOn(ctx, descWidth, y, descWidth - magnitude, y, "black");
            }
        }

        // __Ascending limb → NaCl movement (red arrows)__
        const ascX = descWidth + intWidth; // left edge of ascending
        for (let j = 0; j < nSegments; j++) {
            const revIndex = nSegments - 1 - j;
            const y = revIndex * segmentHeight + segmentHeight/2;

            const magnitude = Math.abs(RNa[j]) * saltArrowScale;

            if (RNa[j] > 0) {
                drawArrowOn(ctx, ascX, y, ascX - magnitude, y, "red");
            }
        }

        // labels unchanged...
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("H₂O", descWidth/2, canvas.height / 16); 
        ctx.fillStyle = "red";
        ctx.fillText("NaCl", totalWidth-descWidth/2, canvas.height / 16); 
    }


    

    
function drawVasaArrows(R, RNa) {
    const xDesc = 0;
    const xInt = descWidthVasa;
    const xAsc = descWidthVasa + intWidthVasa;

    for (let i = 0; i < nVasa; i++) {
        const y = i * segmentHeightVasa + segmentHeightVasa / 2;
        const magnitude = Math.abs(R[i]) * waterArrowScale * vasaArrowScale;
        if (R[i] > 0) {
            drawArrowOn(vasaCtx, xDesc + descWidthVasa, y, xDesc + descWidthVasa + magnitude, y, "black");
        } else if (R[i] < 0) {
            drawArrowOn(vasaCtx, xDesc + descWidthVasa, y, xDesc + descWidthVasa - magnitude, y, "black");
        }
    }

    for (let j = 0; j < nVasa; j++) {
        // use j (array order) instead of reversed index
        const y = j * segmentHeightVasa + segmentHeightVasa / 2;
        const magnitude = Math.abs(RNa[j]) * saltArrowScale * vasaArrowScale * vasaSaltArrowScale;
        if (RNa[j] > 0) {
            drawArrowOn(vasaCtx, xAsc, y, xAsc - magnitude, y, "red");
        }
    }
}

function updateSvgColors() {

  // === Henle Loop ===
  const avgHenleBottom = (segmentState.desc[nSegments - 1] + segmentState.asc[0]) / 2;
  const bottomInt = segmentState.ints[nSegments - 1];

  henleLoopBottom.style.fill = concentrationToColor(avgHenleBottom);
  henleIntBottom.style.fill = concentrationToColor(bottomInt);

  // === Vasa Recta ===
  const avgVasaBottom = (vasaState.desc[nVasa - 1] + vasaState.asc[0]) / 2;
  const topVasaDesc = vasaState.desc[0];        // entering descending limb
  const topVasaAsc = vasaState.asc[nVasa - 1];  // exiting ascending limb

  vasaIntBottom.style.fill = concentrationToColor(bottomInt); // Reusing interstitium color, not vasa color
  vasaLoopBottom.style.fill = concentrationToColorVasa(avgVasaBottom);

  vasaDesc.style.fill = concentrationToColorVasa(topVasaDesc);
  vasaAsc.style.fill = concentrationToColorVasa(topVasaAsc);

  // === Glomerulus and Collecting Duct ===
  glomerulus.style.fill = concentrationToColor(Na0);
  collectingDuct.style.fill = concentrationToColor(segmentState.asc[nSegments - 1]);
}




    // Draw color bar
    drawColorBar()

    // ==================== 6. Animation loop ====================
    setInterval(() => {
        let fluxes, vasaFluxes;
        for (let n = 0; n < eulerStepsPerFrame; n++) {
            fluxes = eulerStep(segmentState, dt);
            vasaFluxes = vasaEulerStep(segmentState, vasaState, dt);
        }

        draw();                     // Henle loop
        drawArrows(fluxes.R, fluxes.RNa);

        drawVasaRecta();             // Draw vasa segments
        drawVasaArrows(vasaFluxes.R, vasaFluxes.RNa);  // Overlay arrows

        updateSvgColors()
    }, miliSecondWait);

