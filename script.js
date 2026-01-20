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

    // Create Black Hole element
    const blackHole = document.createElement('div');
    blackHole.className = 'black-hole';
    document.body.appendChild(blackHole);

    function init() {
        if (!container) return;
        container.innerHTML = '';
        units.length = 0;

        const rowHeight = 30;
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
                    scale: 1,
                    rotation: 0,
                    stretch: 1
                };
                units.push(unit);
            }
        }
    }

    function animate() {
        const envRect = envelope.getBoundingClientRect();
        const centerX = envRect.left + envRect.width / 2;
        const centerY = envRect.top + envRect.height / 2;

        // Update black hole position
        blackHole.style.left = `${centerX}px`;
        blackHole.style.top = `${centerY}px`;

        units.forEach(unit => {
            if (isExploding && unit.isTargeted) {
                unit.x += unit.vx;
                unit.y += unit.vy;
                unit.vy += 0.05; // Very light gravity
                unit.opacity -= 0.005;
                unit.rotation += unit.vx * 2;
                unit.el.style.opacity = unit.opacity;

                if (unit.opacity <= 0) {
                    unit.el.style.display = 'none';
                }

                unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) rotate(${unit.rotation}deg) scale(${unit.scale})`;
            } else if (isBeingPulled && unit.isTargeted) {
                const elapsed = Date.now() - unit.startTime;

                if (elapsed > unit.pullDelay) {
                    if (unit.orbitRadius > 5) {
                        // Galaxy Spiral Logic (Debris spinning)
                        unit.orbitAngle += unit.orbitSpeed;
                        const wobble = Math.sin(Date.now() * 0.01 + unit.pullDelay) * 2;
                        unit.orbitRadius *= (1 - unit.collapseSpeed);
                        unit.orbitSpeed *= unit.accel;

                        unit.x = centerX + Math.cos(unit.orbitAngle) * (unit.orbitRadius + wobble);
                        unit.y = centerY + Math.sin(unit.orbitAngle) * (unit.orbitRadius + wobble);

                        // Rotation for "debris" look
                        unit.rotation += unit.orbitSpeed * 30;
                        unit.scale = Math.max(0.1, 1 - (400 - unit.orbitRadius) / 600);

                        unit.el.style.opacity = Math.min(1, 0.2 + (1 - unit.orbitRadius / 800));
                        unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) rotate(${unit.rotation}deg) scale(${unit.scale})`;
                    } else {
                        // The "Dense Spot"
                        unit.x = centerX + (Math.random() - 0.5) * 10;
                        unit.y = centerY + (Math.random() - 0.5) * 10;
                        unit.isAtCenter = true;
                        unit.el.style.opacity = 0; // Hide at center before explosion
                    }
                } else {
                    normalFlow(unit);
                    unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) scale(${unit.scale})`;
                }
            } else {
                normalFlow(unit);
                unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) scale(${unit.scale})`;
            }
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
            unit.scale = 1;
        }

        // Check if targeted units are pulled in to trigger explosion
        if (isBeingPulled && !isExploding) {
            const targetedUnits = units.filter(u => u.isTargeted);
            const allAtCenter = targetedUnits.every(u => u.isAtCenter);

            if (allAtCenter && targetedUnits.length > 0) {
                isExploding = true;
                blackHole.style.opacity = '0'; // Hide black hole on explosion

                targetedUnits.forEach(u => {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 5 + Math.random() * 15; // Much faster explosion
                    u.vx = Math.cos(angle) * velocity;
                    u.vy = Math.sin(angle) * velocity;
                    u.opacity = 1;
                    u.el.style.opacity = 1;
                    u.el.style.display = 'inline-block';
                    u.scale = 0.5 + Math.random() * 1.5;
                });
            }
        }

        requestAnimationFrame(animate);
    }

    envelope.addEventListener('click', () => {
        if (!isBeingPulled) {
            isBeingPulled = true;
            blackHole.classList.add('active');
            explosionTime = Date.now();

            const envRect = envelope.getBoundingClientRect();
            const centerX = envRect.left + envRect.width / 2;
            const centerY = envRect.top + envRect.height / 2;

            units.forEach(u => {
                u.isTargeted = Math.random() < 0.4; // More units targeted

                if (u.isTargeted) {
                    u.el.classList.add('purple');
                    u.startTime = Date.now();
                    u.pullDelay = Math.random() * 300;

                    const dx = u.x - centerX;
                    const dy = u.y - centerY;
                    u.orbitRadius = Math.sqrt(dx * dx + dy * dy);
                    u.orbitAngle = Math.atan2(dy, dx);

                    u.orbitSpeed = -(0.05 + Math.random() * 0.1);
                    u.collapseSpeed = 0.03 + Math.random() * 0.05;
                    u.accel = 1.02 + Math.random() * 0.03;
                }
            });
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
