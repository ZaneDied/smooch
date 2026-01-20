document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('love-stream-container');
    const envelope = document.querySelector('.envelope');
    const phrase = "I LOVE YOU";
    const units = [];
    const mouse = { x: -1000, y: -1000 };
    const avoidanceRadius = 200;
    const avoidanceStrength = 60;

    let isBeingPulled = false;
    let isExploding = false;
    let explosionTime = 0;

    function init() {
        if (!container) return;
        container.innerHTML = '';
        units.length = 0;

        const rowHeight = 25;
        const colWidth = 100;
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
                    x: (c * colWidth) - 50,
                    y: (r * rowHeight),
                    speed: 0.3 + Math.random() * 0.7,
                    vx: 0,
                    vy: 0,
                    opacity: 1
                };
                units.push(unit);
            }
        }
    }

    function animate() {
        const envRect = envelope.getBoundingClientRect();
        const centerX = envRect.left + envRect.width / 2;
        const centerY = envRect.top + envRect.height / 2;

        units.forEach(unit => {
            if (isExploding && unit.isTargeted) {
                // Explosion phase: move outward
                unit.x += unit.vx;
                unit.y += unit.vy;
                unit.vy += 0.15; // gravity
                unit.opacity -= 0.015;
                unit.el.style.opacity = unit.opacity;

                if (unit.opacity <= 0) {
                    unit.el.style.display = 'none';
                }
            } else if (isBeingPulled && unit.isTargeted) {
                const elapsed = Date.now() - unit.startTime;

                if (elapsed > unit.pullDelay) {
                    // Pulling phase: move towards envelope center with a spiral
                    const dx = centerX - unit.x;
                    const dy = centerY - unit.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 10) {
                        // Dynamic pull: acceleration + slight spiral
                        const angle = Math.atan2(dy, dx);
                        const spiral = 0.5; // Strength of the spiral

                        // Move closer
                        unit.x += Math.cos(angle) * (dist * 0.15);
                        unit.y += Math.sin(angle) * (dist * 0.15);

                        // Add spiral motion
                        unit.x += Math.cos(angle + Math.PI / 2) * (dist * spiral * 0.1);
                        unit.y += Math.sin(angle + Math.PI / 2) * (dist * spiral * 0.1);
                    } else {
                        unit.x = centerX;
                        unit.y = centerY;
                        unit.isAtCenter = true;
                    }
                } else {
                    // Still in normal flow until delay is over
                    normalFlow(unit);
                }
            } else {
                normalFlow(unit);
            }

            unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px)`;
        });

        function normalFlow(unit) {
            unit.baseX += unit.speed;
            if (unit.baseX > window.innerWidth + 50) {
                unit.baseX = -100;
            }

            const dx = unit.baseX + 30 - mouse.x;
            const dy = unit.baseY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let tx = 0;
            let ty = 0;

            if (dist < avoidanceRadius) {
                const force = Math.pow((avoidanceRadius - dist) / avoidanceRadius, 1.5);
                tx = (dx / dist) * force * avoidanceStrength;
                ty = (dy / dist) * force * avoidanceStrength;
            }

            unit.x = unit.baseX + tx;
            unit.y = unit.baseY + ty;
        }

        // Check if targeted units are pulled in to trigger explosion
        if (isBeingPulled && !isExploding) {
            const targetedUnits = units.filter(u => u.isTargeted);
            const allAtCenter = targetedUnits.every(u => u.isAtCenter || (Date.now() - explosionTime > 3000));

            if (allAtCenter) {
                isExploding = true;
                targetedUnits.forEach(u => {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 8 + Math.random() * 20; // More explosive
                    u.vx = Math.cos(angle) * velocity;
                    u.vy = Math.sin(angle) * velocity;
                });
            }
        }

        requestAnimationFrame(animate);
    }

    envelope.addEventListener('click', () => {
        if (!isBeingPulled) {
            isBeingPulled = true;
            explosionTime = Date.now();

            units.forEach(u => {
                // Only target about 50% of the units for the firework
                u.isTargeted = Math.random() > 0.5;

                if (u.isTargeted) {
                    // Add a random delay for each unit to make the pull look more organic/dynamic
                    u.pullDelay = Math.random() * 500;
                    u.startTime = Date.now();

                    u.el.classList.add('purple');
                }
            });
            console.log('Envelope clicked! Dynamic love pull initiated... 💜');
        }
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    window.addEventListener('resize', init);

    init();
    animate();
});
