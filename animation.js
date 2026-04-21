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
