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
            // Before black hole: gentle floating
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        } else {
            // Black hole active: proximity-based gravity
            const dx = this.blackHole.x - this.x;
            const dy = this.blackHole.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only pull if within range
            const attractionRange = 350;
            if (distance < attractionRange) {
                const angle = Math.atan2(dy, dx);
                const pullStrength = Math.min(12, (attractionRange - distance) / 20);

                // Pull toward black hole with spiral
                this.vx += Math.cos(angle) * pullStrength * 0.15;
                this.vy += Math.sin(angle) * pullStrength * 0.15;

                // Add spiral effect (perpendicular force)
                this.vx += Math.cos(angle + Math.PI / 2) * 0.8;
                this.vy += Math.sin(angle + Math.PI / 2) * 0.8;
            }

            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Damping (less damping = more energetic)
            this.vx *= 0.96;
            this.vy *= 0.96;

            // Check absorption (absorbed when VERY close)
            if (distance < this.blackHole.eventHorizon) {
                this.respawn();
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
            }

            // Check if offscreen and respawn from edges
            const margin = 100;
            if (this.x < -margin || this.x > canvas.width + margin ||
                this.y < -margin || this.y > canvas.height + margin) {
                this.respawn();
                this.vx = (Math.random() - 0.5) * 3;
                this.vy = (Math.random() - 0.5) * 3;
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

            if (this.x - this.accretionDiskRadius < 0 || this.x + this.accretionDiskRadius > canvas.width) {
                this.vx *= -1;
                this.x = Math.max(this.accretionDiskRadius, Math.min(canvas.width - this.accretionDiskRadius, this.x));
            }
            if (this.y - this.accretionDiskRadius < 0 || this.y + this.accretionDiskRadius > canvas.height) {
                this.vy *= -1;
                this.y = Math.max(this.accretionDiskRadius, Math.min(canvas.height - this.accretionDiskRadius, this.y));
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
    constructor() {
        this.x = Math.random() * canvas.width;
        this.width = Math.random() * 60 + 40;
        this.height = Math.random() * 200 + 150;
        this.y = canvas.height - this.height;
        this.color = Math.random() > 0.5 ? [100, 181, 246] : [206, 147, 216];
        this.windowPattern = [];

        // Generate window pattern
        for (let i = 0; i < Math.floor(this.height / 20); i++) {
            this.windowPattern.push(Math.random() > 0.3);
        }
    }

    draw(scrollProgress) {
        // Fade out during transition (0.4 to 0.6)
        let fadeOut;
        if (scrollProgress < 0.4) {
            fadeOut = 1;
        } else if (scrollProgress > 0.6) {
            fadeOut = 0;
        } else {
            fadeOut = 1 - ((scrollProgress - 0.4) / 0.2);
        }

        if (fadeOut <= 0) return;

        // Building structure
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${0.15 * fadeOut})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Building outline
        ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${0.4 * fadeOut})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Windows
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${0.6 * fadeOut})`;
        for (let i = 0; i < this.windowPattern.length; i++) {
            if (this.windowPattern[i]) {
                const wx = this.x + this.width * 0.2;
                const wy = this.y + i * 20 + 10;
                const ww = this.width * 0.6;
                const wh = 8;
                ctx.fillRect(wx, wy, ww, wh);
            }
        }
    }
}

class Plant {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height - Math.random() * 100 - 50;
        this.size = Math.random() * 30 + 20;
        this.type = Math.floor(Math.random() * 2);
    }

    draw(scrollProgress) {
        // Fade out during transition (0.4 to 0.6)
        let fadeOut;
        if (scrollProgress < 0.4) {
            fadeOut = 1;
        } else if (scrollProgress > 0.6) {
            fadeOut = 0;
        } else {
            fadeOut = 1 - ((scrollProgress - 0.4) / 0.2);
        }

        if (fadeOut <= 0) return;

        ctx.strokeStyle = `rgba(100, 200, 150, ${0.6 * fadeOut})`;
        ctx.lineWidth = 3;

        if (this.type === 0) {
            // Simple plant
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - this.size);
            ctx.stroke();

            // Leaves
            ctx.beginPath();
            ctx.arc(this.x - 5, this.y - this.size * 0.7, 8, 0, Math.PI * 2);
            ctx.arc(this.x + 5, this.y - this.size * 0.5, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 200, 150, ${0.4 * fadeOut})`;
            ctx.fill();
        } else {
            // Grass-like
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + i * 5, this.y);
                ctx.lineTo(this.x + i * 5 + (Math.random() - 0.5) * 3, this.y - this.size * 0.6);
                ctx.stroke();
            }
        }
    }
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
const buildings = Array.from({ length: 15 }, () => new Building());
const plants = Array.from({ length: 40 }, () => new Plant());
const dustParticles = Array.from({ length: 200 }, () => new DustParticle(blackHole));
const stars = Array.from({ length: 150 }, () => new Star());

// ==================== ANIMATION LOOP ====================
function animate() {
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
