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

        const rowHeight = 30; // Reverted to more reasonable density
        const colWidth = 120;
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
                    speed: 0.4 + Math.random() * 0.8,
                    vx: 0,
                    vy: 0,
                    opacity: 1,
                    scale: 1
                };
                units.push(unit);
            }
        }
    }

    function animate() {
        // Calculate center once per frame for performance
        const envRect = envelope.getBoundingClientRect();
        const centerX = envRect.left + envRect.width / 2;
        const centerY = envRect.top + envRect.height / 2;

        units.forEach(unit => {
            if (isExploding && unit.isTargeted) {
                unit.x += unit.vx;
                unit.y += unit.vy;
                unit.vy += 0.1; // Lighter gravity for slower fall
                unit.opacity -= 0.008; // Much slower fade
                unit.el.style.opacity = unit.opacity;

                if (unit.opacity <= 0) {
                    unit.el.style.display = 'none';
                }
            } else if (isBeingPulled && unit.isTargeted) {
                const elapsed = Date.now() - unit.startTime;

                if (elapsed > unit.pullDelay) {
                    if (unit.orbitRadius > 10) {
                        // Galaxy Spiral Logic
                        // 1. Rotate (Anti-clockwise)
                        unit.orbitAngle += unit.orbitSpeed;

                        // 2. Shrink radius (collapse) with a bit of organic "wobble"
                        const wobble = Math.sin(Date.now() * 0.01 + unit.pullDelay) * 0.5;
                        // Slower collapse speed for "long collapse"
                        unit.orbitRadius *= (1 - unit.collapseSpeed);

                        // 3. Speed up rotation uniquely for each unit
                        // Slower acceleration
                        unit.orbitSpeed *= unit.accel;

                        // 4. Update position
                        unit.x = centerX + Math.cos(unit.orbitAngle) * (unit.orbitRadius + wobble);
                        unit.y = centerY + Math.sin(unit.orbitAngle) * (unit.orbitRadius + wobble);

                        // Get brighter as it approaches
                        unit.opacity = Math.min(1, 0.2 + (1 - unit.orbitRadius / 500));
                        unit.el.style.opacity = unit.opacity;
                    } else {
                        // The "Dense Spot" (Sun Core)
                        // Jitter around the center to look like a boiling sun
                        unit.x = centerX + (Math.random() - 0.5) * 15;
                        unit.y = centerY + (Math.random() - 0.5) * 15;
                        unit.isAtCenter = true;

                        // Make the core units very bright and slightly larger
                        unit.el.style.opacity = 1;
                        unit.el.style.color = '#ff00ff'; // Brighter purple/magenta
                        unit.el.style.textShadow = '0 0 10px #ff00ff';
                        unit.scale = 1.2;
                    }
                } else {
                    normalFlow(unit);
                }
            } else {
                normalFlow(unit);
            }

            unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) scale(${unit.scale || 1})`;
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
            // Strictly wait for ALL targeted units to be at center
            const allAtCenter = targetedUnits.every(u => u.isAtCenter);

            if (allAtCenter && targetedUnits.length > 0) {
                isExploding = true;
                targetedUnits.forEach(u => {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 2 + Math.random() * 6; // Much slower, graceful explosion
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

            const envRect = envelope.getBoundingClientRect();
            const centerX = envRect.left + envRect.width / 2;
            const centerY = envRect.top + envRect.height / 2;

            units.forEach(u => {
                u.isTargeted = Math.random() < 0.35;

                if (u.isTargeted) {
                    u.el.classList.add('purple');
                    u.startTime = Date.now();
                    u.pullDelay = Math.random() * 300; // Shorter delay for faster start

                    const dx = u.x - centerX;
                    const dy = u.y - centerY;
                    u.orbitRadius = Math.sqrt(dx * dx + dy * dy);
                    u.orbitAngle = Math.atan2(dy, dx);

                    // Faster collapse and orbit for "short phase"
                    u.orbitSpeed = -(0.05 + Math.random() * 0.15);
                    u.collapseSpeed = 0.03 + Math.random() * 0.05; // Faster collapse
                    u.accel = 1.02 + Math.random() * 0.03; // Faster acceleration
                }
            });
            console.log('Fast-Orbit Slow-Explosion Galaxy initiated! 🌌💜');
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
