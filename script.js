document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('love-stream-container');
    const phrase = "I LOVE YOU";
    const units = [];
    const mouse = { x: -1000, y: -1000 };
    const avoidanceRadius = 200; // Larger radius for more gradual start
    const avoidanceStrength = 60;

    function init() {
        if (!container) return;
        container.innerHTML = '';
        units.length = 0;

        const rowHeight = 25; // Much denser rows
        const colWidth = 100; // Much denser columns
        const rows = Math.ceil(window.innerHeight / rowHeight) + 1;
        const cols = Math.ceil(window.innerWidth / colWidth) + 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const el = document.createElement('span');
                el.className = 'love-unit';
                el.textContent = phrase;
                container.appendChild(el);


                const unit = {
                    el: el,
                    baseX: (c * colWidth) - 50,
                    baseY: (r * rowHeight),
                    speed: 0.3 + Math.random() * 0.7, // Slower for the dense look
                };
                units.push(unit);
            }
        }
    }

    function animate() {
        units.forEach(unit => {
            // Move left to right
            unit.baseX += unit.speed;

            // Wrap around
            if (unit.baseX > window.innerWidth + 50) {
                unit.baseX = -100;
            }

            // Calculate avoidance
            const dx = unit.baseX + 30 - mouse.x;
            const dy = unit.baseY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let tx = 0;
            let ty = 0;

            if (dist < avoidanceRadius) {
                // Using a smoother power-based falloff for "gradual" feel
                const force = Math.pow((avoidanceRadius - dist) / avoidanceRadius, 1.5);
                tx = (dx / dist) * force * avoidanceStrength;
                ty = (dy / dist) * force * avoidanceStrength;
            }

            unit.el.style.transform = `translate(${unit.baseX + tx}px, ${unit.baseY + ty}px)`;
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    window.addEventListener('resize', init);

    init();
    animate();

    console.log('Interactive love stream initialized! 🖱️❤️');
});
