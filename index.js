// ==================== CANVAS SETUP ====================
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==================== MATH EQUATIONS ====================
const mathSymbols = [
    '∫', '∂', '∑', 'π', 'θ', 'λ', 'μ', 'σ', 'Δ', '∇',
    'α', 'β', 'γ', 'ω', '∞', '√', '≈', '≠', '≤', '≥',
    'f(x)', 'dy/dx', 'lim', 'sin', 'cos', 'tan', 'log',
    'e^x', 'x²', 'x³', '∈', '∀', '∃', '⊂', '⊃'
];

class MathEquation {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.6; // Spread across more of the viewport
        this.text = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        this.size = Math.random() * 20 + 15;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.drift = Math.random() * 0.3 - 0.15;
    }

    draw(scrollProgress) {
        const fadeOut = Math.max(0, 1 - scrollProgress * 2);
        ctx.font = `${this.size}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(100, 181, 246, ${this.opacity * fadeOut})`;
        ctx.fillText(this.text, this.x, this.y);
    }
}

// ==================== BLACK HOLE & PARTICLES ====================
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 400 + 200;
        this.x = Math.cos(angle) * distance;
        this.y = Math.sin(angle) * distance;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.5 + 0.3;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.hue = Math.random() * 60 + 200; // Blue-purple range
    }

    update(blackHole) {
        const dx = blackHole.x - this.x;
        const dy = blackHole.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Spiral toward black hole
        this.x += Math.cos(angle) * this.speed + Math.cos(angle + Math.PI / 2) * 0.5;
        this.y += Math.sin(angle) * this.speed + Math.sin(angle + Math.PI / 2) * 0.5;

        // Event horizon - reset if too close
        if (distance < blackHole.radius) {
            this.reset();
        }
    }

    draw(blackHole, scrollProgress) {
        const fadeIn = Math.min(1, scrollProgress * 1.5);
        ctx.beginPath();
        ctx.arc(
            blackHole.x + this.x,
            blackHole.y + this.y,
            this.size,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity * fadeIn})`;
        ctx.fill();
    }
}

class BlackHole {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height * 0.6; // Center vertically in viewport
        this.radius = 80;
        this.glowRadius = 200;
    }

    draw(scrollProgress) {
        const fadeIn = Math.min(1, scrollProgress * 1.5);

        // Accretion disk glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius,
            this.x, this.y, this.glowRadius
        );
        gradient.addColorStop(0, `rgba(138, 43, 226, ${0.4 * fadeIn})`);
        gradient.addColorStop(0.5, `rgba(75, 0, 130, ${0.2 * fadeIn})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Black hole core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeIn})`;
        ctx.fill();

        // Event horizon ring
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.6 * fadeIn})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    updatePosition() {
        this.x = canvas.width / 2;
        this.y = canvas.height * 0.6;
    }
}

// ==================== STARS ====================
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
    }

    draw(scrollProgress) {
        const fadeIn = Math.min(1, scrollProgress * 1.5);
        const twinkle = Math.sin(Date.now() * this.twinkleSpeed) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * twinkle * fadeIn})`;
        ctx.fill();
    }
}

// ==================== INITIALIZATION ====================
const mathEquations = Array.from({ length: 50 }, () => new MathEquation());
const blackHole = new BlackHole();
const particles = Array.from({ length: 150 }, () => new Particle());
const stars = Array.from({ length: 100 }, () => new Star());

// ==================== ANIMATION LOOP ====================
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);

    // Draw math equations (fade out as you scroll)
    mathEquations.forEach(eq => eq.draw(scrollProgress));

    // Draw stars (fade in as you scroll)
    stars.forEach(star => star.draw(scrollProgress));

    // Draw black hole (fade in as you scroll)
    blackHole.draw(scrollProgress);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update(blackHole);
        particle.draw(blackHole, scrollProgress);
    });

    requestAnimationFrame(animate);
}

animate();

// Update black hole position on resize
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
