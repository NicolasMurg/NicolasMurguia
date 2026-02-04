// ==================== CANVAS SETUP ====================
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==================== MATH EQUATIONS ====================
const mathSymbols = [
    '∫', '∂', '∑', 'π', 'θ', 'λ', 'μ', 'σ', 'Δ', '∇',
    'α', 'β', 'γ', 'ω', '∞', '√', '≈', '≠', '≤', '≥',
    'f(x)', 'dy/dx', 'lim', 'sin', 'cos', 'tan', 'log',
    'e^x', 'x²', 'x³', '∈', '∀', '∃', '⊂', '⊃', 'Σ', 'Φ'
];

class MathEquation {
    constructor(blackHole, isInitial = false) {
        this.blackHole = blackHole;
        this.respawn(isInitial);
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }

    respawn(isInitial = false) {
        if (isInitial) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        } else {
            const side = Math.floor(Math.random() * 4);
            if (side === 0) {
                this.x = Math.random() * canvas.width;
                this.y = -50;
            } else if (side === 1) {
                this.x = canvas.width + 50;
                this.y = Math.random() * canvas.height;
            } else if (side === 2) {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 50;
            } else {
                this.x = -50;
                this.y = Math.random() * canvas.height;
            }
        }

        this.text = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        this.size = Math.random() * 25 + 20;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update(scrollProgress) {
        if (scrollProgress < 0.5) {
            // Before black hole: friction slows symbols down
            this.vx *= 0.995;
            this.vy *= 0.995;

            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        } else {
            // Friction — symbols slow down naturally every frame
            this.vx *= 0.985;
            this.vy *= 0.985;

            // Black hole gravity
            const dx = this.blackHole.x - this.x;
            const dy = this.blackHole.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Normalized direction toward black hole
                const nx = dx / distance;
                const ny = dy / distance;

                // Gravity: stronger when closer (inverse distance, capped)
                const gravity = Math.min(3, 800 / (distance * distance) * 10);
                this.vx += nx * gravity;
                this.vy += ny * gravity;
            }

            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Recalculate distance after moving
            const newDx = this.blackHole.x - this.x;
            const newDy = this.blackHole.y - this.y;
            const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);

            // Absorbed when within event horizon
            if (newDistance < this.blackHole.eventHorizon) {
                this.respawn();
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
            }

            // Respawn if offscreen
            const margin = 100;
            if (this.x < -margin || this.x > canvas.width + margin ||
                this.y < -margin || this.y > canvas.height + margin) {
                this.respawn();
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
            }
        }

        this.rotation += this.rotationSpeed;
    }

    draw(scrollProgress) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.font = `${this.size}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(100, 181, 246, 0.5)';

        ctx.fillStyle = `rgba(100, 181, 246, ${this.opacity})`;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}

// ==================== BOUNCING BLACK HOLE ====================
class BlackHole {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.vx = 3;
        this.vy = 2.5;
        this.eventHorizon = 70;
        this.radius = 130;
        this.accretionDiskRadius = 250;
        this.time = 0;
    }

    update(scrollProgress) {
        if (scrollProgress >= 0.5) {
            // Bounce off walls
            this.x += this.vx;
            this.y += this.vy;

            if (this.x - this.eventHorizon < 0 || this.x + this.eventHorizon > canvas.width) {
                this.vx *= -1;
                this.x = Math.max(this.eventHorizon, Math.min(canvas.width - this.eventHorizon, this.x));
            }
            if (this.y - this.eventHorizon < 0 || this.y + this.eventHorizon > canvas.height) {
                this.vy *= -1;
                this.y = Math.max(this.eventHorizon, Math.min(canvas.height - this.eventHorizon, this.y));
            }
        }
    }

    draw(scrollProgress) {
        const fadeIn = Math.max(0, (scrollProgress - 0.5) * 2);

        if (fadeIn <= 0) return;

        this.time += 0.015;

        // Gravitational lensing
        const lensGradient = ctx.createRadialGradient(
            this.x, this.y, this.eventHorizon,
            this.x, this.y, this.accretionDiskRadius * 1.5
        );
        lensGradient.addColorStop(0, `rgba(20, 20, 60, ${0.4 * fadeIn})`);
        lensGradient.addColorStop(0.5, `rgba(40, 20, 80, ${0.2 * fadeIn})`);
        lensGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.accretionDiskRadius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = lensGradient;
        ctx.fill();

        // Rotating accretion disk
        ctx.save();
        ctx.translate(this.x, this.y);

        for (let i = 0; i < 3; i++) {
            ctx.rotate(this.time + i * Math.PI / 1.5);

            const diskGradient = ctx.createRadialGradient(
                0, 0, this.radius,
                0, 0, this.accretionDiskRadius
            );

            diskGradient.addColorStop(0, `rgba(255, 120, 0, ${0.7 * fadeIn})`);
            diskGradient.addColorStop(0.3, `rgba(255, 80, 0, ${0.5 * fadeIn})`);
            diskGradient.addColorStop(0.6, `rgba(200, 40, 100, ${0.3 * fadeIn})`);
            diskGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.accretionDiskRadius, this.accretionDiskRadius * 0.3, 0, 0, Math.PI * 2);
            ctx.fillStyle = diskGradient;
            ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;

        // Event horizon glow
        const horizonGradient = ctx.createRadialGradient(
            this.x, this.y, this.eventHorizon * 0.5,
            this.x, this.y, this.radius
        );
        horizonGradient.addColorStop(0, `rgba(255, 150, 0, ${0.9 * fadeIn})`);
        horizonGradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.6 * fadeIn})`);
        horizonGradient.addColorStop(1, `rgba(100, 20, 80, ${0.3 * fadeIn})`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = horizonGradient;
        ctx.fill();

        // Black hole core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.eventHorizon, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeIn})`;
        ctx.fill();

        // Photon sphere
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.8 * fadeIn})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(255, 200, 100, ${0.9 * fadeIn})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// ==================== MOUNTAIN & AURORA BACKGROUND ====================
class Mountain {
    constructor(layer) {
        this.layer = layer; // 0 = far back, 1 = mid, 2 = front
        this.points = [];

        // Layer-specific settings
        if (layer === 0) {
            this.baseY = canvas.height * 0.55;
            this.peakMin = canvas.height * 0.15;
            this.peakMax = canvas.height * 0.3;
            this.color = [20, 30, 60];
            this.baseAlpha = 0.6;
            this.snowLine = 0.35;
        } else if (layer === 1) {
            this.baseY = canvas.height * 0.65;
            this.peakMin = canvas.height * 0.25;
            this.peakMax = canvas.height * 0.45;
            this.color = [15, 22, 48];
            this.baseAlpha = 0.75;
            this.snowLine = 0.4;
        } else {
            this.baseY = canvas.height * 0.78;
            this.peakMin = canvas.height * 0.4;
            this.peakMax = canvas.height * 0.6;
            this.color = [8, 14, 32];
            this.baseAlpha = 0.9;
            this.snowLine = 0.5;
        }

        this._generatePoints();
    }

    _generatePoints() {
        this.points = [];
        const segments = Math.floor(canvas.width / (30 + this.layer * 20)) + 2;
        const segWidth = canvas.width / (segments - 1);

        for (let i = 0; i <= segments; i++) {
            const x = i * segWidth - segWidth;
            const peakHeight = this.peakMin + Math.random() * (this.peakMax - this.peakMin);
            // Create jagged peaks with variation
            const isMajorPeak = Math.random() > 0.6;
            const y = isMajorPeak
                ? canvas.height - peakHeight
                : canvas.height - peakHeight * (0.5 + Math.random() * 0.35);
            this.points.push({ x, y });
        }
    }

    draw(scrollProgress) {
        let fadeOut;
        if (scrollProgress < 0.4) {
            fadeOut = 1;
        } else if (scrollProgress > 0.6) {
            fadeOut = 0;
        } else {
            fadeOut = 1 - ((scrollProgress - 0.4) / 0.2);
        }
        if (fadeOut <= 0) return;

        const [r, g, b] = this.color;
        const a = this.baseAlpha * fadeOut;

        // Draw mountain silhouette with smooth curves
        ctx.beginPath();
        ctx.moveTo(-10, canvas.height);

        for (let i = 0; i < this.points.length; i++) {
            if (i === 0) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            } else {
                // Smooth curve between points
                const prev = this.points[i - 1];
                const curr = this.points[i];
                const cpx = (prev.x + curr.x) / 2;
                ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
                if (i === this.points.length - 1) {
                    ctx.lineTo(curr.x, curr.y);
                }
            }
        }

        ctx.lineTo(canvas.width + 10, canvas.height);
        ctx.closePath();

        // Mountain body gradient
        const grad = ctx.createLinearGradient(0, canvas.height * 0.15, 0, canvas.height);
        grad.addColorStop(0, `rgba(${r + 15}, ${g + 20}, ${b + 40}, ${a})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a})`);
        grad.addColorStop(1, `rgba(${r - 5}, ${g - 5}, ${b + 10}, ${a * 0.9})`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Snow caps on peaks
        if (this.layer < 2) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < this.points.length; i++) {
                const p = this.points[i];
                const snowDepth = 25 + this.layer * 10;
                if (p.y < canvas.height * this.snowLine) {
                    ctx.moveTo(p.x - 15 - this.layer * 5, p.y + snowDepth);
                    ctx.quadraticCurveTo(p.x - 8, p.y + 3, p.x, p.y);
                    ctx.quadraticCurveTo(p.x + 8, p.y + 3, p.x + 15 + this.layer * 5, p.y + snowDepth);
                }
            }
            ctx.fillStyle = `rgba(200, 210, 230, ${0.25 * fadeOut})`;
            ctx.fill();
            ctx.restore();
        }

        // Subtle edge highlight (moonlight)
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const cpx = (prev.x + curr.x) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
        }
        ctx.strokeStyle = `rgba(100, 140, 200, ${0.12 * fadeOut})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

class AuroraWave {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.yBase = canvas.height * (0.08 + (index / total) * 0.3);
        this.amplitude = 30 + Math.random() * 50;
        this.frequency = 0.002 + Math.random() * 0.003;
        this.speed = 0.0004 + Math.random() * 0.0006;
        this.phase = Math.random() * Math.PI * 2;
        this.thickness = 60 + Math.random() * 80;

        // Aurora color - greens, teals, and purples
        const palettes = [
            { r: 50, g: 220, b: 120 },   // green
            { r: 30, g: 200, b: 160 },   // teal
            { r: 80, g: 180, b: 220 },   // cyan
            { r: 120, g: 100, b: 220 },  // purple
            { r: 60, g: 240, b: 100 },   // bright green
        ];
        this.color = palettes[Math.floor(Math.random() * palettes.length)];
    }

    draw(scrollProgress) {
        let fadeOut;
        if (scrollProgress < 0.4) {
            fadeOut = 1;
        } else if (scrollProgress > 0.6) {
            fadeOut = 0;
        } else {
            fadeOut = 1 - ((scrollProgress - 0.4) / 0.2);
        }
        if (fadeOut <= 0) return;

        const time = Date.now() * this.speed + this.phase;
        const { r, g, b } = this.color;

        ctx.beginPath();

        // Top edge of aurora ribbon
        const topPoints = [];
        for (let x = -20; x <= canvas.width + 20; x += 8) {
            const wave1 = Math.sin(x * this.frequency + time) * this.amplitude;
            const wave2 = Math.sin(x * this.frequency * 1.7 + time * 1.3) * this.amplitude * 0.4;
            const y = this.yBase + wave1 + wave2;
            topPoints.push({ x, y });
        }

        // Draw filled aurora band
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
            ctx.lineTo(topPoints[i].x, topPoints[i].y);
        }
        // Bottom edge (offset by thickness)
        for (let i = topPoints.length - 1; i >= 0; i--) {
            const extraWave = Math.sin(topPoints[i].x * this.frequency * 0.8 + time * 0.7) * 15;
            ctx.lineTo(topPoints[i].x, topPoints[i].y + this.thickness + extraWave);
        }
        ctx.closePath();

        // Aurora gradient - brighter in center, transparent at edges
        const grad = ctx.createLinearGradient(0, this.yBase - this.amplitude, 0, this.yBase + this.thickness + this.amplitude);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${0.06 * fadeOut})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.1 * fadeOut})`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${0.06 * fadeOut})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width * 1.5;
        this.y = Math.random() * canvas.height * 0.4;
        this.length = 60 + Math.random() * 100;
        this.speed = 4 + Math.random() * 6;
        this.angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.3;
        this.opacity = 0;
        this.fadeInDone = false;
        this.life = 0;
        this.maxLife = 80 + Math.random() * 120;
        this.active = Math.random() > 0.97; // rarely active
    }

    update() {
        if (!this.active) {
            if (Math.random() > 0.998) this.active = true;
            return;
        }

        this.life++;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Fade in then out
        if (this.life < 15) {
            this.opacity = this.life / 15;
        } else if (this.life > this.maxLife - 20) {
            this.opacity = (this.maxLife - this.life) / 20;
        } else {
            this.opacity = 1;
        }

        if (this.life > this.maxLife || this.x < -200 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw(scrollProgress) {
        let fadeOut;
        if (scrollProgress < 0.4) {
            fadeOut = 1;
        } else if (scrollProgress > 0.6) {
            fadeOut = 0;
        } else {
            fadeOut = 1 - ((scrollProgress - 0.4) / 0.2);
        }
        if (fadeOut <= 0 || !this.active || this.opacity <= 0) return;

        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * fadeOut * 0.8})`);
        grad.addColorStop(0.3, `rgba(180, 220, 255, ${this.opacity * fadeOut * 0.4})`);
        grad.addColorStop(1, `rgba(100, 180, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * fadeOut * 0.9})`;
        ctx.fill();
    }
}

// Generate mountain layers
function generateMountains() {
    const result = [];
    for (let layer = 0; layer < 3; layer++) {
        result.push(new Mountain(layer));
    }
    return result;
}

function generateAurora() {
    const result = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
        result.push(new AuroraWave(i, count));
    }
    return result;
}

function generateShootingStars() {
    const result = [];
    for (let i = 0; i < 4; i++) {
        result.push(new ShootingStar());
    }
    return result;
}

// ==================== DUST PARTICLES ====================
class DustParticle {
    constructor(blackHole) {
        this.blackHole = blackHole;
        this.reset();
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 300 + 200;
        this.x = Math.cos(angle) * distance;
        this.y = Math.sin(angle) * distance;
        this.size = Math.random() * 1.5 + 0.5;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.hue = Math.random() * 60 + 20;
    }

    update() {
        const dx = -this.x;
        const dy = -this.y;
        const distance = Math.sqrt(this.x * this.x + this.y * this.y);
        const angle = Math.atan2(dy, dx);

        this.x += Math.cos(angle) * this.speed + Math.cos(angle + Math.PI / 2) * 0.8;
        this.y += Math.sin(angle) * this.speed + Math.sin(angle + Math.PI / 2) * 0.8;

        if (distance < this.blackHole.eventHorizon) {
            this.reset();
        }
    }

    draw(scrollProgress) {
        const fadeIn = Math.max(0, (scrollProgress - 0.5) * 2);
        ctx.beginPath();
        ctx.arc(
            this.blackHole.x + this.x,
            this.blackHole.y + this.y,
            this.size,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity * fadeIn})`;
        ctx.fill();
    }
}

// ==================== STARS ====================
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
    }

    draw(transitionFactor) {
        const twinkle = Math.sin(Date.now() * this.twinkleSpeed) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * twinkle * transitionFactor})`;
        ctx.fill();
    }
}

// ==================== INITIALIZATION ====================
const blackHole = new BlackHole();
const mathEquations = Array.from({ length: 60 }, () => new MathEquation(blackHole, true));
const mountains = generateMountains();
const auroraWaves = generateAurora();
const shootingStars = generateShootingStars();
const dustParticles = Array.from({ length: 200 }, () => new DustParticle(blackHole));
const stars = Array.from({ length: 150 }, () => new Star());

// ==================== ANIMATION LOOP ====================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scrollProgress = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight));

    // Smooth transition between utopia and space
    // Transition window: 0.4 to 0.6 (centered at 0.5)
    let transitionFactor;
    if (scrollProgress < 0.4) {
        transitionFactor = 0; // Full utopia
    } else if (scrollProgress > 0.6) {
        transitionFactor = 1; // Full space
    } else {
        // Smooth transition between 0.4 and 0.6
        transitionFactor = (scrollProgress - 0.4) / 0.2;
    }

    // Blend background colors - night sky with subtle aurora tint
    const nightSkyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const utopiaOpacity = 1 - transitionFactor;

    if (utopiaOpacity > 0) {
        nightSkyGradient.addColorStop(0, `rgba(5, 10, 30, ${0.4 * utopiaOpacity})`);
        nightSkyGradient.addColorStop(0.3, `rgba(10, 20, 50, ${0.3 * utopiaOpacity})`);
        nightSkyGradient.addColorStop(0.6, `rgba(15, 25, 55, ${0.25 * utopiaOpacity})`);
        nightSkyGradient.addColorStop(1, `rgba(8, 12, 35, ${0.35 * utopiaOpacity})`);
        ctx.fillStyle = nightSkyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Layer space gradient on top with increasing opacity
    if (transitionFactor > 0) {
        const spaceGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.height
        );
        spaceGradient.addColorStop(0, `rgba(10, 10, 30, ${transitionFactor})`);
        spaceGradient.addColorStop(1, `rgba(0, 0, 0, ${transitionFactor})`);
        ctx.fillStyle = spaceGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw aurora borealis (behind mountains)
    auroraWaves.forEach(wave => wave.draw(scrollProgress));

    // Draw mountain landscape (fades out during transition)
    mountains.forEach(mountain => mountain.draw(scrollProgress));

    // Update and draw shooting stars
    shootingStars.forEach(star => {
        star.update();
        star.draw(scrollProgress);
    });

    // Mountain base fog/mist glow
    if (utopiaOpacity > 0) {
        const mistGlow = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
        mistGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        mistGlow.addColorStop(0.4, `rgba(20, 40, 80, ${0.1 * utopiaOpacity})`);
        mistGlow.addColorStop(0.7, `rgba(15, 30, 60, ${0.2 * utopiaOpacity})`);
        mistGlow.addColorStop(1, `rgba(10, 15, 40, ${0.3 * utopiaOpacity})`);
        ctx.fillStyle = mistGlow;
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    }

    // Draw stars (fade in during transition)
    if (transitionFactor > 0) {
        stars.forEach(star => star.draw(transitionFactor));
    }

    // Update and draw black hole
    blackHole.update(scrollProgress);
    blackHole.draw(scrollProgress);

    // Draw dust particles
    if (scrollProgress > 0.5) {
        dustParticles.forEach(particle => {
            particle.update();
            particle.draw(scrollProgress);
        });
    }

    // Update and draw math equations
    mathEquations.forEach(eq => {
        eq.update(scrollProgress);
        eq.draw(scrollProgress);
    });

    requestAnimationFrame(animate);
}

animate();

// ==================== SCROLL ANIMATIONS ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${index * 0.1}s`;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.fade-in, .slide-in').forEach((el) => {
    observer.observe(el);
});
