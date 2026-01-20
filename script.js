document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('love-stream-container');
    const phrase = "I LOVE YOU";
    const units = [];
    const mouse = { x: -1000, y: -1000 };
    const avoidanceRadius = 150;
    const avoidanceStrength = 50;

    function init() {
        if (!container) return;
        container.innerHTML = '';
        units.length = 0;

        const rowHeight = 50; // Increased spacing slightly
        const colWidth = 200;
        const rows = Math.ceil(window.innerHeight / rowHeight) + 1;
        const cols = Math.ceil(window.innerWidth / colWidth) + 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const el = document.createElement('span');
                el.className = 'love-unit';
                el.textContent = phrase;
                container.appendChild(el);

                // Stagger the starting positions so they don't look like a grid
                const randomOffsetX = Math.random() * 50;
                const randomOffsetY = Math.random() * 10;

                const unit = {
                    el: el,
                    baseX: (c * colWidth) - 100 + randomOffsetX,
                    baseY: (r * rowHeight) + randomOffsetY,
                    speed: 0.5 + Math.random() * 1.5,
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
            if (unit.baseX > window.innerWidth + 100) {
                unit.baseX = -150;
            }

            // Calculate avoidance
            const dx = unit.baseX + 50 - mouse.x; // +50 to center the effect roughly
            const dy = unit.baseY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let tx = 0;
            let ty = 0;

            if (dist < avoidanceRadius) {
                const force = (avoidanceRadius - dist) / avoidanceRadius;
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
