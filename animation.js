/**
 * CHRONOS - Luxury Clock Product Template
 * Primary Animation Engine: GSAP 3
 */

const PRODUCTS_PER_CYCLE = 1; // Solo spotlight for luxury feel
let PRODUCTS = [];
let currentBatch = 0;

async function loadProducts() {
    try {
        const response = await fetch('./products.json');
        const data = await response.json();
        PRODUCTS = data.products || [];

        if (PRODUCTS.length === 0) {
            console.warn('No products found in products.json');
            return;
        }
    } catch (error) {
        console.error('Failed to load products.json:', error);
    }

    initGlobalAnimations();
    startCycle();
}

function initGlobalAnimations() {
    initClockNumbers();

    // Continuous Gear Rotations
    gsap.to(".gear-large .gear-img", {
        rotation: 360,
        duration: 40,
        ease: "none",
        repeat: -1
    });

    gsap.to(".gear-small .gear-img", {
        rotation: -360,
        duration: 25,
        ease: "none",
        repeat: -1
    });

    // Background slow breathing
    gsap.to("#background", {
        scale: 1.1,
        duration: 20,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });

    // Clock second hand sweep
    gsap.to("#second-hand", {
        rotation: 360,
        duration: 60,
        ease: "none",
        repeat: -1
    });
}

function initClockNumbers() {
    const container = document.getElementById('clock-numbers');
    if (!container) return;

    for (let i = 1; i <= 12; i++) {
        const numEl = document.createElement('div');
        numEl.className = 'clock-number';
        numEl.innerText = i;

        // Calculate position
        const angle = (i * 30) - 90; // 360/12 = 30 degrees per number, offset by -90 to start at 12
        const radius = 35; // vh, slightly inside the 40vh radius frame

        const x = Math.cos(angle * (Math.PI / 180)) * radius;
        const y = Math.sin(angle * (Math.PI / 180)) * radius;

        gsap.set(numEl, {
            x: `${x}vh`,
            y: `${y}vh`
        });

        container.appendChild(numEl);
    }

    // Reactive glow as second hand passes
    gsap.ticker.add(() => {
        const rotation = gsap.getProperty("#second-hand", "rotation") % 360;
        const normalizedRotation = rotation < 0 ? rotation + 360 : rotation;

        document.querySelectorAll('.clock-number').forEach((num, index) => {
            const numAngle = ((index + 1) * 30); // 1 = 30deg, 2 = 60deg... 12 = 360deg

            // Calculate distance between hand and number
            let diff = Math.abs(normalizedRotation - numAngle);
            if (diff > 180) diff = 360 - diff;

            if (diff < 15) {
                const intensity = 1 - (diff / 15);
                gsap.set(num, {
                    opacity: 0.6 + (intensity * 0.4),
                    scale: 1 + (intensity * 0.2),
                    color: intensity > 0.5 ? '#ffffff' : '#d4af37',
                    textShadow: `0 0 ${10 + (intensity * 20)}px var(--primary)`
                });
            } else {
                gsap.set(num, {
                    opacity: 0.6,
                    scale: 1,
                    color: '#d4af37',
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                });
            }
        });
    });
}

function getBatch(batchIndex) {
    const start = (batchIndex * PRODUCTS_PER_CYCLE) % Math.max(PRODUCTS.length, 1);
    const batch = [];
    for (let i = 0; i < PRODUCTS_PER_CYCLE; i++) {
        if (PRODUCTS.length > 0) {
            batch.push(PRODUCTS[(start + i) % PRODUCTS.length]);
        }
    }
    return batch;
}

function renderBatch(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach((product, index) => {
        const productEl = document.createElement('div');
        productEl.className = 'product';
        productEl.innerHTML = `
            <div class="product-image-container">
                <img class="product-image" src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/800x800/10181f/00b7af?text=Luxury+Collection'">
            </div>
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                <div class="product-price">${product.price}</div>
                <div class="product-meta">${product.meta || 'Masterpiece | Precision | Elegance'}</div>
            </div>
        `;
        container.appendChild(productEl);
    });
}

function animateCycle(batchIndex) {
    const batch = getBatch(batchIndex);
    renderBatch(batch);

    const product = document.querySelector('.product');
    const image = document.querySelector('.product-image-container');
    const name = document.querySelector('.product-name');
    const price = document.querySelector('.product-price');
    const meta = document.querySelector('.product-meta');

    const tl = gsap.timeline({
        onComplete: () => {
            // Wait a moment before starting next cycle
            gsap.delayedCall(1, () => animateCycle(batchIndex + 1));
        }
    });

    // 1. Entrance Phase
    tl.set(product, { opacity: 1 });
    tl.from(image, {
        x: -200,
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out"
    });

    tl.from(name, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out"
    }, "-=1");

    tl.from(price, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    }, "-=0.8");

    tl.from(meta, {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    }, "-=0.6");

    // "Ticking" animation on the name
    tl.to(name, {
        scale: 1.02,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut"
    }, "-=0.5");

    // 2. Living Moment
    tl.to(image, {
        y: -20,
        duration: 4,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut"
    }, "-=0.5");

    // 3. Exit Phase
    tl.to(product, {
        opacity: 0,
        scale: 1.1,
        duration: 1.5,
        ease: "power3.in"
    }, "+=0.5");
}

function startCycle() {
    animateCycle(0);
}

window.addEventListener('DOMContentLoaded', loadProducts);
