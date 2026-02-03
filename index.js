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

// ==================== FUTURISTIC UTOPIA BACKGROUND ====================
class Building {
    constructor(x, width, layer) {
        this.x = x;
        this.width = width;
        this.layer = layer; // 0 = back, 1 = mid, 2 = front

        // Taller buildings in back, shorter in front for depth
        if (layer === 0) {
            this.height = Math.random() * 250 + 300;
            this.baseAlpha = 0.08;
        } else if (layer === 1) {
            this.height = Math.random() * 200 + 200;
            this.baseAlpha = 0.12;
        } else {
            this.height = Math.random() * 150 + 120;
            this.baseAlpha = 0.18;
        }

        this.y = canvas.height - this.height;
        this.color = [
            [80, 160, 230],
            [120, 200, 255],
            [180, 130, 220],
            [100, 220, 200],
            [150, 180, 255]
        ][Math.floor(Math.random() * 5)];

        // Window grid
        this.windowCols = Math.max(1, Math.floor(this.width / 18));
        this.windowRows = Math.floor(this.height / 22);
        this.windows = [];
        for (let r = 0; r < this.windowRows; r++) {
            this.windows[r] = [];
            for (let c = 0; c < this.windowCols; c++) {
                this.windows[r][c] = Math.random() > 0.25;
            }
        }

        // Rooftop features
        this.hasAntenna = Math.random() > 0.5;
        this.antennaHeight = Math.random() * 40 + 20;
        this.hasSpire = Math.random() > 0.7;
        this.spireHeight = Math.random() * 60 + 30;
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

        const r = this.color[0], g = this.color[1], b = this.color[2];
        const a = this.baseAlpha * fadeOut;

        // Building body
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Outline
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 2.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Horizontal floor lines
        for (let i = 0; i < this.windowRows; i++) {
            const ly = this.y + i * 22;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(this.x, ly);
            ctx.lineTo(this.x + this.width, ly);
            ctx.stroke();
        }

        // Windows
        const wPadX = 5;
        const wPadY = 4;
        const wWidth = (this.width - wPadX * 2) / this.windowCols - 3;
        const wHeight = 10;
        for (let r2 = 0; r2 < this.windowRows; r2++) {
            for (let c = 0; c < this.windowCols; c++) {
                if (this.windows[r2][c]) {
                    const wx = this.x + wPadX + c * ((this.width - wPadX * 2) / this.windowCols) + 1.5;
                    const wy = this.y + r2 * 22 + wPadY;
                    // Window glow
                    ctx.fillStyle = `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 30)}, ${fadeOut * 0.5})`;
                    ctx.fillRect(wx, wy, wWidth, wHeight);
                }
            }
        }

        // Antenna
        if (this.hasAntenna) {
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${fadeOut * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width * 0.5, this.y);
            ctx.lineTo(this.x + this.width * 0.5, this.y - this.antennaHeight);
            ctx.stroke();
            // Blinking light
            const blink = Math.sin(Date.now() * 0.003 + this.x) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(this.x + this.width * 0.5, this.y - this.antennaHeight, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 80, 80, ${blink * fadeOut})`;
            ctx.fill();
        }

        // Spire
        if (this.hasSpire) {
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 1.5})`;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width * 0.35, this.y);
            ctx.lineTo(this.x + this.width * 0.5, this.y - this.spireHeight);
            ctx.lineTo(this.x + this.width * 0.65, this.y);
            ctx.closePath();
            ctx.fill();
        }
    }
}

class Plant {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height - Math.random() * 40 - 10;
        this.size = Math.random() * 25 + 15;
        this.type = Math.floor(Math.random() * 3);
        // Pre-calculate random offsets so they don't jitter each frame
        this.grassOffsets = [];
        for (let i = -3; i <= 3; i++) {
            this.grassOffsets.push((Math.random() - 0.5) * 6);
        }
        this.leafAngle = Math.random() * 0.5 + 0.2;
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

        if (this.type === 0) {
            // Tree with trunk and canopy
            ctx.strokeStyle = `rgba(80, 160, 120, ${0.5 * fadeOut})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - this.size);
            ctx.stroke();

            // Canopy (layered circles)
            ctx.fillStyle = `rgba(60, 200, 130, ${0.25 * fadeOut})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size - 8, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(80, 220, 150, ${0.2 * fadeOut})`;
            ctx.beginPath();
            ctx.arc(this.x - 7, this.y - this.size + 2, 9, 0, Math.PI * 2);
            ctx.arc(this.x + 7, this.y - this.size + 2, 9, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 1) {
            // Grass cluster
            ctx.strokeStyle = `rgba(100, 200, 150, ${0.4 * fadeOut})`;
            ctx.lineWidth = 2;
            let idx = 0;
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + i * 4, this.y);
                ctx.quadraticCurveTo(
                    this.x + i * 4 + this.grassOffsets[idx],
                    this.y - this.size * 0.5,
                    this.x + i * 4 + this.grassOffsets[idx] * 1.5,
                    this.y - this.size * 0.7
                );
                ctx.stroke();
                idx++;
            }
        } else {
            // Glowing flower
            ctx.strokeStyle = `rgba(80, 180, 140, ${0.4 * fadeOut})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(this.x + 5, this.y - this.size * 0.6, this.x + 3, this.y - this.size);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.x + 3, this.y - this.size - 3, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 150, 255, ${0.5 * fadeOut})`;
            ctx.fill();
        }
    }
}

// Generate skyline buildings in layers
function generateBuildings() {
    const result = [];
    // 3 layers: back, mid, front
    for (let layer = 0; layer < 3; layer++) {
        let x = -20;
        while (x < canvas.width + 20) {
            const width = Math.random() * 50 + 30 + (2 - layer) * 15;
            const gap = Math.random() * 8 + 2;
            result.push(new Building(x, width, layer));
            x += width + gap;
        }
    }
    return result;
}

function generatePlants() {
    const result = [];
    for (let i = 0; i < 60; i++) {
        result.push(new Plant());
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
const buildings = generateBuildings();
const plants = generatePlants();
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

    // Blend background colors
    const utopiaGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const utopiaOpacity = 1 - transitionFactor;

    if (utopiaOpacity > 0) {
        utopiaGradient.addColorStop(0, `rgba(100, 200, 255, ${0.15 * utopiaOpacity})`);
        utopiaGradient.addColorStop(1, `rgba(150, 100, 200, ${0.1 * utopiaOpacity})`);
        ctx.fillStyle = utopiaGradient;
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

    // Draw futuristic cityscape (fades out during transition)
    buildings.forEach(building => building.draw(scrollProgress));
    plants.forEach(plant => plant.draw(scrollProgress));

    // Ground horizon glow
    if (utopiaOpacity > 0) {
        const groundGlow = ctx.createLinearGradient(0, canvas.height - 60, 0, canvas.height);
        groundGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        groundGlow.addColorStop(0.5, `rgba(80, 200, 180, ${0.08 * utopiaOpacity})`);
        groundGlow.addColorStop(1, `rgba(100, 180, 255, ${0.15 * utopiaOpacity})`);
        ctx.fillStyle = groundGlow;
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
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
