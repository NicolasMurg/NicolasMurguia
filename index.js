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
    constructor(blackHole) {
        this.blackHole = blackHole;
        this.respawn();
    }

    respawn() {
        // Start from edges of screen
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { // top
            this.x = Math.random() * canvas.width;
            this.y = -50;
        } else if (side === 1) { // right
            this.x = canvas.width + 50;
            this.y = Math.random() * canvas.height;
        } else if (side === 2) { // bottom
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 50;
        } else { // left
            this.x = -50;
            this.y = Math.random() * canvas.height;
        }

        this.text = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        this.size = Math.random() * 25 + 20;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.absorbed = false;
    }

    update(scrollProgress) {
        if (scrollProgress < 0.3) {
            // Before black hole appears, just float
            this.x += (Math.random() - 0.5) * 0.5;
            this.y += (Math.random() - 0.5) * 0.5;
        } else {
            // Black hole gravity pulls math symbols
            const dx = this.blackHole.x - this.x;
            const dy = this.blackHole.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // Gravity strength increases as black hole fades in
            const gravityStrength = (scrollProgress - 0.3) * 2;
            const pullForce = Math.min(5, (1000 / distance) * gravityStrength);

            // Spiral toward black hole
            this.x += Math.cos(angle) * pullForce + Math.cos(angle + Math.PI / 2) * 1.5;
            this.y += Math.sin(angle) * pullForce + Math.sin(angle + Math.PI / 2) * 1.5;

            // Check if absorbed
            if (distance < this.blackHole.eventHorizon) {
                this.respawn();
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

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(100, 181, 246, 0.5)';

        ctx.fillStyle = `rgba(100, 181, 246, ${this.opacity})`;
        ctx.fillText(this.text, 0, 0);

        ctx.restore();
    }
}

// ==================== BLACK HOLE ====================
class BlackHole {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.eventHorizon = 60; // Point of no return
        this.radius = 120; // Visible black disk
        this.accretionDiskRadius = 250;
        this.time = 0;
    }

    draw(scrollProgress) {
        const fadeIn = Math.max(0, (scrollProgress - 0.3) * 2);

        if (fadeIn <= 0) return;

        this.time += 0.01;

        // Draw gravitational lensing effect (outer glow)
        const lensGradient = ctx.createRadialGradient(
            this.x, this.y, this.eventHorizon,
            this.x, this.y, this.accretionDiskRadius * 1.5
        );
        lensGradient.addColorStop(0, `rgba(20, 20, 60, ${0.3 * fadeIn})`);
        lensGradient.addColorStop(0.5, `rgba(40, 20, 80, ${0.15 * fadeIn})`);
        lensGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.accretionDiskRadius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = lensGradient;
        ctx.fill();

        // Draw accretion disk (rotating matter)
        ctx.save();
        ctx.translate(this.x, this.y);

        for (let i = 0; i < 3; i++) {
            ctx.rotate(this.time + i * Math.PI / 1.5);

            const diskGradient = ctx.createRadialGradient(
                0, 0, this.radius,
                0, 0, this.accretionDiskRadius
            );

            diskGradient.addColorStop(0, `rgba(255, 120, 0, ${0.6 * fadeIn})`);
            diskGradient.addColorStop(0.3, `rgba(255, 80, 0, ${0.4 * fadeIn})`);
            diskGradient.addColorStop(0.6, `rgba(200, 40, 100, ${0.2 * fadeIn})`);
            diskGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.accretionDiskRadius, this.accretionDiskRadius * 0.3, 0, 0, Math.PI * 2);
            ctx.fillStyle = diskGradient;
            ctx.fill();
        }

        ctx.restore();
        ctx.globalAlpha = 1;

        // Draw event horizon glow
        const horizonGradient = ctx.createRadialGradient(
            this.x, this.y, this.eventHorizon * 0.5,
            this.x, this.y, this.radius
        );
        horizonGradient.addColorStop(0, `rgba(255, 150, 0, ${0.8 * fadeIn})`);
        horizonGradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.5 * fadeIn})`);
        horizonGradient.addColorStop(1, `rgba(100, 20, 80, ${0.2 * fadeIn})`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = horizonGradient;
        ctx.fill();

        // Draw black hole core (pure black)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.eventHorizon, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeIn})`;
        ctx.fill();

        // Draw photon sphere (bright ring)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.7 * fadeIn})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(255, 200, 100, ${0.8 * fadeIn})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    updatePosition() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
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

    draw(scrollProgress) {
        const fadeIn = Math.max(0, (scrollProgress - 0.2) * 1.5);
        const twinkle = Math.sin(Date.now() * this.twinkleSpeed) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * twinkle * fadeIn})`;
        ctx.fill();
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
        this.hue = Math.random() * 60 + 20; // Orange to red
    }

    update() {
        const dx = -this.x;
        const dy = -this.y;
        const distance = Math.sqrt(this.x * this.x + this.y * this.y);
        const angle = Math.atan2(dy, dx);

        // Spiral toward black hole
        this.x += Math.cos(angle) * this.speed + Math.cos(angle + Math.PI / 2) * 0.8;
        this.y += Math.sin(angle) * this.speed + Math.sin(angle + Math.PI / 2) * 0.8;

        // Reset if absorbed
        if (distance < this.blackHole.eventHorizon) {
            this.reset();
        }
    }

    draw(scrollProgress) {
        const fadeIn = Math.max(0, (scrollProgress - 0.3) * 2);
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

// ==================== INITIALIZATION ====================
const blackHole = new BlackHole();
const mathEquations = Array.from({ length: 60 }, () => new MathEquation(blackHole));
const stars = Array.from({ length: 150 }, () => new Star());
const dustParticles = Array.from({ length: 200 }, () => new DustParticle(blackHole));

// ==================== ANIMATION LOOP ====================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scrollProgress = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight));

    // Draw stars background
    stars.forEach(star => star.draw(scrollProgress));

    // Draw and update dust particles
    if (scrollProgress > 0.3) {
        dustParticles.forEach(particle => {
            particle.update();
            particle.draw(scrollProgress);
        });
    }

    // Draw black hole
    blackHole.draw(scrollProgress);

    // Update and draw math equations
    mathEquations.forEach(eq => {
        eq.update(scrollProgress);
        eq.draw(scrollProgress);
    });

    requestAnimationFrame(animate);
}

animate();

// Update positions on resize
window.addEventListener('resize', () => {
    blackHole.updatePosition();
});

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
