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

// ==================== NEWTON MODE ====================
let newtonMode = true;
const bgToggle = document.getElementById('bg-toggle');

// Pre-generate cloud positions so they don't jitter
const newtonClouds = [
    { x: 0.15, y: 0.12, w: 120, h: 40, speed: 0.00003 },
    { x: 0.55, y: 0.08, w: 90, h: 30, speed: 0.00005 },
    { x: 0.8, y: 0.18, w: 100, h: 35, speed: 0.00002 },
];

// Pre-generate random star positions so they stay stable across frames
const newtonStars = Array.from({ length: 150 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.2 + 0.5,
}));

function drawNewtonScene(scrollProgress) {
    const w = canvas.width;
    const h = canvas.height;

    // --- Night sky gradient ---
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#05051a');
    sky.addColorStop(0.3, '#0a0f2e');
    sky.addColorStop(0.6, '#101835');
    sky.addColorStop(0.8, '#0e1a1e');
    sky.addColorStop(1, '#0a1a0d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // --- Stars (randomized, stable per session) ---
    for (let i = 0; i < 150; i++) {
        const sx = newtonStars[i].x * w;
        const sy = newtonStars[i].y * h * 0.6;
        const sr = newtonStars[i].r;
        const time = Date.now();
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 + i);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 240, ${0.3 + twinkle * 0.7})`;
        ctx.fill();
    }

    // --- Moon ---
    const moonX = w * 0.12;
    const moonY = h * 0.15;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#f5ecd0';
    ctx.fill();
    // Moon surface detail — dark maria (large patches)
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
    ctx.clip();

    // Large dark maria regions — each with a different darkness
    const maria = [
        { dx: -12, dy: -8, rx: 10, ry: 7, rot: -0.3, a: 0.45 },
        { dx: 8, dy: 2, rx: 12, ry: 8, rot: 0.5, a: 0.25 },
        { dx: -4, dy: 14, rx: 8, ry: 5, rot: 0.2, a: 0.35 },
        { dx: 14, dy: -14, rx: 6, ry: 4, rot: -0.4, a: 0.15 },
    ];
    maria.forEach(m => {
        ctx.fillStyle = `rgba(160, 150, 120, ${m.a})`;
        ctx.beginPath();
        ctx.ellipse(moonX + m.dx, moonY + m.dy, m.rx, m.ry, m.rot, 0, Math.PI * 2);
        ctx.fill();
    });

    // Scattered craters — each with its own fixed darkness
    const craters = [
        { dx: -18, dy: -12, r: 3, a: 0.55 },
        { dx: -14, dy: 2, r: 2, a: 0.2 },
        { dx: -20, dy: 10, r: 2.5, a: 0.4 },
        { dx: -6, dy: -18, r: 2, a: 0.15 },
        { dx: 4, dy: -16, r: 3.5, a: 0.5 },
        { dx: 16, dy: -6, r: 2.5, a: 0.25 },
        { dx: 20, dy: 8, r: 2, a: 0.6 },
        { dx: 8, dy: 16, r: 3, a: 0.3 },
        { dx: -10, dy: 20, r: 2, a: 0.45 },
        { dx: 0, dy: 5, r: 4, a: 0.35 },
        { dx: -22, dy: -2, r: 1.5, a: 0.5 },
        { dx: 12, dy: 18, r: 1.5, a: 0.2 },
    ];
    craters.forEach(c => {
        ctx.beginPath();
        ctx.arc(moonX + c.dx, moonY + c.dy, c.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 130, 100, ${c.a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX + c.dx - 0.5, moonY + c.dy - 0.5, c.r + 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 250, 230, ${c.a * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    ctx.restore();

    // --- Clouds (dark, wispy) ---
    const time2 = Date.now();
    newtonClouds.forEach(cloud => {
        const cx = (cloud.x * w + time2 * cloud.speed * w) % (w + 200) - 100;
        const cy = cloud.y * h;
        ctx.fillStyle = 'rgba(30, 40, 60, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cloud.w, cloud.h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - cloud.w * 0.35, cy + 5, cloud.w * 0.6, cloud.h * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + cloud.w * 0.3, cy + 3, cloud.w * 0.5, cloud.h * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // --- Rolling hills (background) ---
    const hillBaseY = h * 0.72;

    // Far hill
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.25, hillBaseY - 60, w * 0.5, hillBaseY - 20);
    ctx.quadraticCurveTo(w * 0.75, hillBaseY + 20, w, hillBaseY - 40);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = '#0f2a0c';
    ctx.fill();

    // Near hill
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.3, hillBaseY + 10, w * 0.55, hillBaseY + 40);
    ctx.quadraticCurveTo(w * 0.8, hillBaseY + 20, w, hillBaseY + 50);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = '#0a1f08';
    ctx.fill();

    // --- Ground ---
    ctx.fillStyle = '#081a06';
    ctx.fillRect(0, h * 0.88, w, h * 0.12);

    // Grass line
    ctx.strokeStyle = '#153a12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let gx = 0; gx < w; gx += 12) {
        ctx.moveTo(gx, h * 0.88);
        ctx.lineTo(gx + 3, h * 0.88 - 6 - Math.random() * 4);
        ctx.moveTo(gx + 6, h * 0.88);
        ctx.lineTo(gx + 4, h * 0.88 - 5 - Math.random() * 3);
    }
    ctx.stroke();

    // --- Tree (far right) ---
    const treeX = w * 0.9;
    const treeBaseY = h * 0.88;
    const trunkHeight = h * 0.35;
    const trunkTop = treeBaseY - trunkHeight;

    // Trunk
    ctx.fillStyle = '#1e1408';
    ctx.beginPath();
    ctx.moveTo(treeX - 12, treeBaseY);
    ctx.quadraticCurveTo(treeX - 14, treeBaseY - trunkHeight * 0.5, treeX - 8, trunkTop);
    ctx.lineTo(treeX + 8, trunkTop);
    ctx.quadraticCurveTo(treeX + 14, treeBaseY - trunkHeight * 0.5, treeX + 12, treeBaseY);
    ctx.closePath();
    ctx.fill();

    // Trunk bark texture
    ctx.strokeStyle = 'rgba(30, 18, 8, 0.4)';
    ctx.lineWidth = 1;
    for (let ty = trunkTop + 20; ty < treeBaseY; ty += 18) {
        ctx.beginPath();
        ctx.moveTo(treeX - 8, ty);
        ctx.quadraticCurveTo(treeX, ty - 4, treeX + 8, ty);
        ctx.stroke();
    }

    // Branch extending left (where apple hangs) — directly above Newton
    const newtonX = treeX - 30;
    const branchStartY = trunkTop + 30;
    const branchEndX = newtonX;
    const branchEndY = branchStartY + 15;

    ctx.strokeStyle = '#1e1408';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(treeX - 5, branchStartY);
    ctx.quadraticCurveTo(treeX - 40, branchStartY - 8, branchEndX, branchEndY);
    ctx.stroke();

    // Small branch right side
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(treeX + 5, trunkTop + 40);
    ctx.quadraticCurveTo(treeX + 50, trunkTop + 25, treeX + 75, trunkTop + 35);
    ctx.stroke();

    // Canopy (overlapping circles)
    const canopyColors = ['#0e3a0c', '#0c3008', '#124012', '#0a2a08', '#154515'];
    const canopyCircles = [
        { dx: 0, dy: -25, r: 55 },
        { dx: -40, dy: -10, r: 45 },
        { dx: 40, dy: -10, r: 45 },
        { dx: -25, dy: -45, r: 40 },
        { dx: 25, dy: -45, r: 40 },
        { dx: 0, dy: -55, r: 35 },
        { dx: -55, dy: 5, r: 35 },
        { dx: 55, dy: 5, r: 35 },
    ];

    canopyCircles.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(treeX + c.dx, trunkTop + c.dy, c.r, 0, Math.PI * 2);
        ctx.fillStyle = canopyColors[i % canopyColors.length];
        ctx.fill();
    });

    // Leaf detail on canopy edges
    ctx.fillStyle = 'rgba(50, 160, 45, 0.3)';
    canopyCircles.forEach(c => {
        ctx.beginPath();
        ctx.arc(treeX + c.dx, trunkTop + c.dy, c.r + 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // --- Newton (sitting under tree, leaning on trunk) ---
    const newtonBaseY = treeBaseY;
    const headRadius = 14;
    const headY = newtonBaseY - 58;

    // Coat / body (long period coat, wider)
    ctx.fillStyle = '#2a1a12';
    ctx.beginPath();
    ctx.moveTo(newtonX - 22, newtonBaseY);
    ctx.lineTo(newtonX + 28, newtonBaseY);
    ctx.lineTo(newtonX + 12, newtonBaseY - 42);
    ctx.lineTo(newtonX - 10, newtonBaseY - 42);
    ctx.closePath();
    ctx.fill();

    // Coat collar / lapels
    ctx.strokeStyle = '#3d2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(newtonX - 2, newtonBaseY - 42);
    ctx.lineTo(newtonX - 6, newtonBaseY - 30);
    ctx.moveTo(newtonX + 4, newtonBaseY - 42);
    ctx.lineTo(newtonX + 8, newtonBaseY - 30);
    ctx.stroke();

    // Legs (extended forward, with shoes)
    ctx.fillStyle = '#1a1210';
    ctx.beginPath();
    ctx.moveTo(newtonX - 16, newtonBaseY);
    ctx.lineTo(newtonX - 40, newtonBaseY - 4);
    ctx.lineTo(newtonX - 38, newtonBaseY + 4);
    ctx.lineTo(newtonX - 13, newtonBaseY + 4);
    ctx.closePath();
    ctx.fill();
    // Shoe
    ctx.fillStyle = '#100c08';
    ctx.beginPath();
    ctx.ellipse(newtonX - 40, newtonBaseY, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(newtonX, headY, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#d4a574';
    ctx.fill();

    // Long curly wig (Newton's signature look)
    ctx.fillStyle = '#4a4040';
    // Left side curls — flowing down past shoulders
    ctx.beginPath();
    ctx.moveTo(newtonX - headRadius, headY - 4);
    ctx.quadraticCurveTo(newtonX - headRadius - 10, headY + 8, newtonX - headRadius - 6, headY + 20);
    ctx.quadraticCurveTo(newtonX - headRadius - 12, headY + 30, newtonX - headRadius - 4, headY + 40);
    ctx.quadraticCurveTo(newtonX - headRadius + 2, headY + 38, newtonX - headRadius + 4, headY + 28);
    ctx.quadraticCurveTo(newtonX - headRadius - 2, headY + 18, newtonX - headRadius + 2, headY + 6);
    ctx.closePath();
    ctx.fill();
    // Right side curls
    ctx.beginPath();
    ctx.moveTo(newtonX + headRadius, headY - 4);
    ctx.quadraticCurveTo(newtonX + headRadius + 10, headY + 8, newtonX + headRadius + 6, headY + 20);
    ctx.quadraticCurveTo(newtonX + headRadius + 12, headY + 30, newtonX + headRadius + 4, headY + 40);
    ctx.quadraticCurveTo(newtonX + headRadius - 2, headY + 38, newtonX + headRadius - 4, headY + 28);
    ctx.quadraticCurveTo(newtonX + headRadius + 2, headY + 18, newtonX + headRadius - 2, headY + 6);
    ctx.closePath();
    ctx.fill();
    // Top of wig
    ctx.beginPath();
    ctx.ellipse(newtonX, headY - headRadius + 2, headRadius + 4, 8, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Middle curls (center part visible)
    ctx.beginPath();
    ctx.moveTo(newtonX, headY - headRadius + 4);
    ctx.lineTo(newtonX - 1, headY - headRadius - 2);
    ctx.lineTo(newtonX + 1, headY - headRadius - 2);
    ctx.closePath();
    ctx.fill();

    // Facial features (minimal)
    ctx.fillStyle = '#2a1a10';
    // Eyes
    ctx.beginPath();
    ctx.arc(newtonX - 4, headY - 2, 1.5, 0, Math.PI * 2);
    ctx.arc(newtonX + 4, headY - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Nose
    ctx.strokeStyle = '#8a6a4a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(newtonX, headY);
    ctx.lineTo(newtonX - 1, headY + 3);
    ctx.stroke();

    // --- Apple (falls straight down) ---
    const appleStartX = newtonX;
    const appleStartY = branchEndY + 8;
    const appleTargetY = headY - headRadius - 6;

    // Apple falls based on scroll progress
    const fallProgress = Math.min(1, scrollProgress / 0.92);
    // Ease-in (gravity acceleration)
    const easedFall = fallProgress * fallProgress;
    const appleX = appleStartX;
    const appleY = appleStartY + (appleTargetY - appleStartY) * easedFall;
    const appleRadius = 8;

    // Apple body
    ctx.beginPath();
    ctx.arc(appleX, appleY, appleRadius, 0, Math.PI * 2);
    const appleGrad = ctx.createRadialGradient(appleX - 2, appleY - 2, 1, appleX, appleY, appleRadius);
    appleGrad.addColorStop(0, '#e83030');
    appleGrad.addColorStop(0.7, '#c42020');
    appleGrad.addColorStop(1, '#8b1515');
    ctx.fillStyle = appleGrad;
    ctx.fill();

    // Apple highlight
    ctx.beginPath();
    ctx.arc(appleX - 2, appleY - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#3d2817';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(appleX, appleY - appleRadius);
    ctx.lineTo(appleX + 1, appleY - appleRadius - 6);
    ctx.stroke();

    // Leaf on stem
    ctx.fillStyle = '#3a8a30';
    ctx.beginPath();
    ctx.ellipse(appleX + 4, appleY - appleRadius - 4, 5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // --- Impact effect (when apple reaches Newton) ---
    if (fallProgress >= 0.95) {
        const impactIntensity = Math.min(1, (fallProgress - 0.95) / 0.05);
        const impactX = appleX;
        const impactY = appleTargetY;

        // Starburst lines
        ctx.strokeStyle = `rgba(255, 230, 100, ${0.7 * impactIntensity})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const innerR = 12;
            const outerR = 22 + impactIntensity * 10;
            ctx.beginPath();
            ctx.moveTo(impactX + Math.cos(angle) * innerR, impactY + Math.sin(angle) * innerR);
            ctx.lineTo(impactX + Math.cos(angle) * outerR, impactY + Math.sin(angle) * outerR);
            ctx.stroke();
        }

        // Thought bubble with F = mg
        const bubbleX = newtonX + 55;
        const bubbleY = headY - 45;

        // Bubble dots (trail from head to bubble)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * impactIntensity})`;
        ctx.beginPath();
        ctx.arc(newtonX + 18, headY - 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(newtonX + 32, headY - 30, 5, 0, Math.PI * 2);
        ctx.fill();

        // Main bubble
        ctx.beginPath();
        ctx.ellipse(bubbleX, bubbleY, 38, 22, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * impactIntensity})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(200, 200, 200, ${0.5 * impactIntensity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // "F = mg" text
        ctx.font = 'italic 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(30, 30, 30, ${impactIntensity})`;
        ctx.fillText('F = mg', bubbleX, bubbleY);
    }
}

bgToggle.addEventListener('click', () => {
    newtonMode = !newtonMode;
    bgToggle.classList.toggle('active', !newtonMode);
    canvas.style.background = newtonMode
        ? 'radial-gradient(ellipse at bottom, #2d1f10 0%, #1a1a2e 100%)'
        : 'radial-gradient(ellipse at top, #0c1428 0%, #060a14 50%, #0a0a0a 100%)';
});

// Position the toggle button to the right of the nav bar
function positionToggle() {
    const nav = document.getElementById('site-nav');
    const rect = nav.getBoundingClientRect();
    bgToggle.style.left = (rect.right + 8) + 'px';
    bgToggle.style.top = (rect.top + (rect.height - bgToggle.offsetHeight) / 2) + 'px';
}
positionToggle();
window.addEventListener('resize', positionToggle);

// ==================== ANIMATION LOOP ====================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scrollProgress = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight));

    // Newton mode: draw apple scene and skip everything else
    if (newtonMode) {
        drawNewtonScene(scrollProgress);
        requestAnimationFrame(animate);
        return;
    }

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

// ==================== NAV SCROLL SPY ====================
const navLinks = document.querySelectorAll('.nav-link');
const navSections = [];

navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(id);
    if (section) navSections.push({ link, section });
});

function updateActiveNav() {
    const scrollY = window.scrollY + 80;

    let current = navSections[0];
    for (const entry of navSections) {
        if (entry.section.offsetTop <= scrollY) {
            current = entry;
        }
    }

    navLinks.forEach(link => link.classList.remove('active'));
    if (current) current.link.classList.add('active');
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();
