document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('love-stream-container');
    const phrase = "I LOVE YOU";
    const units = [];
    const mouse = { x: -1000, y: -1000 };
    const avoidanceRadius = 200;
    const avoidanceStrength = 60;

    let isBeingPulled = false;
    let isExploding = false;

    const trigger = document.querySelector('.question-trigger');

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
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        units.forEach(unit => {
            if (isExploding && unit.isTargeted) {
                unit.x += unit.vx;
                unit.y += unit.vy;

                // 3D Depth Logic (Asteroid Shower Feel)
                if (unit.vz) {
                    unit.z += unit.vz * 0.08;
                    unit.scale = Math.min(unit.z, 15);

                    if (unit.z > 8) {
                        unit.opacity -= 0.03;
                    }
                }

                unit.vy += 0.05;
                unit.opacity -= 0.005;
                unit.rotation += unit.vx * 2;
                unit.el.style.opacity = unit.opacity;

                if (unit.opacity <= 0) {
                    unit.el.style.display = 'none';
                }

                unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) translate(-50%, -50%) rotate(${unit.rotation}deg) scale(${unit.scale})`;
            } else if (isBeingPulled && unit.isTargeted) {
                const elapsed = Date.now() - unit.startTime;

                if (elapsed > unit.pullDelay) {
                    if (unit.orbitRadius > 5) {
                        unit.orbitAngle += unit.orbitSpeed;
                        const wobble = Math.sin(Date.now() * 0.01 + unit.pullDelay) * 2;
                        unit.orbitRadius *= (1 - unit.collapseSpeed);
                        unit.orbitSpeed *= unit.accel;

                        unit.x = centerX + Math.cos(unit.orbitAngle) * (unit.orbitRadius + wobble);
                        unit.y = centerY + Math.sin(unit.orbitAngle) * (unit.orbitRadius + wobble);

                        unit.rotation += unit.orbitSpeed * 30;
                        unit.scale = Math.max(0.1, 1 - (400 - unit.orbitRadius) / 600);

                        unit.el.style.opacity = Math.min(1, 0.2 + (1 - unit.orbitRadius / 800));
                        unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) translate(-50%, -50%) rotate(${unit.rotation}deg) scale(${unit.scale})`;
                    } else {
                        unit.x = centerX + (Math.random() - 0.5) * 10;
                        unit.y = centerY + (Math.random() - 0.5) * 10;
                        unit.isAtCenter = true;
                        unit.el.style.opacity = 0;
                    }
                } else {
                    normalFlow(unit);
                    unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) translate(-50%, -50%) scale(${unit.scale})`;
                }
            } else {
                normalFlow(unit);
                unit.el.style.transform = `translate(${unit.x}px, ${unit.y}px) translate(-50%, -50%) scale(${unit.scale})`;
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

        if (isBeingPulled && !isExploding) {
            const targetedUnits = units.filter(u => u.isTargeted);
            const allAtCenter = targetedUnits.every(u => u.isAtCenter);

            if (allAtCenter && targetedUnits.length > 0) {
                isExploding = true;

                // Show envelope after 1.5s delay
                setTimeout(() => {
                    const envelopeWrapper = document.querySelector('.envelope-wrapper');
                    if (envelopeWrapper) envelopeWrapper.classList.add('show');
                }, 1500);

                targetedUnits.forEach(u => {
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 5 + Math.random() * 15;
                    u.vx = Math.cos(angle) * velocity;
                    u.vy = Math.sin(angle) * velocity;

                    if (Math.random() < 0.15) {
                        u.vz = 0.5 + Math.random() * 4;
                        u.z = 0.1;
                    } else {
                        u.vz = 0;
                        u.scale = 0.5 + Math.random() * 1.5;
                    }

                    u.opacity = 1;
                    u.el.style.opacity = 1;
                    u.el.style.display = 'inline-block';
                });
            }
        }

        requestAnimationFrame(animate);
    }

    trigger.addEventListener('click', () => {
        if (!isBeingPulled) {
            isBeingPulled = true;
            trigger.style.opacity = '0';
            trigger.style.pointerEvents = 'none';

            // Fade out sender label and hint
            const senderLabel = document.querySelector('.sender-label');
            if (senderLabel) senderLabel.classList.add('hidden');

            const hint = document.querySelector('.interaction-hint');
            if (hint) hint.classList.add('hidden');

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            units.forEach(u => {
                u.isTargeted = Math.random() < 0.4;

                if (u.isTargeted) {
                    u.el.classList.add('purple');
                    u.startTime = Date.now();
                    u.pullDelay = Math.random() * 150;

                    const dx = u.x - centerX;
                    const dy = u.y - centerY;
                    u.orbitRadius = Math.sqrt(dx * dx + dy * dy);
                    u.orbitAngle = Math.atan2(dy, dx);

                    u.orbitSpeed = -(0.15 + Math.random() * 0.2);
                    u.collapseSpeed = 0.06 + Math.random() * 0.08;
                    u.accel = 1.05 + Math.random() * 0.05;
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

    // Envelope Interaction
    const envelope = document.querySelector('.envelope');
    const flap = document.querySelector('.envelope-flap');
    const letter = document.querySelector('.letter');

    if (envelope && flap) {
        envelope.addEventListener('click', () => {
            const isOpen = flap.style.transform === 'rotateX(180deg)';

            if (!isOpen) {
                // Open flap
                flap.style.transform = 'rotateX(180deg)';

                // Wait 1.3 seconds then slide out letter
                setTimeout(() => {
                    if (letter) {
                        letter.classList.add('out');

                        // After letter is out, zoom it in to become the new scene
                        setTimeout(() => {
                            letter.classList.add('full-screen');

                            // Hide everything else for a clean new scene
                            setTimeout(() => {
                                if (container) container.style.display = 'none';
                                const envelopeWrapper = document.querySelector('.envelope-wrapper');
                                if (envelopeWrapper) {
                                    // Hide all envelope parts except the letter which is now fixed
                                    const envelopeParts = envelopeWrapper.querySelectorAll('.envelope-back, .envelope-front-left, .envelope-front-right, .envelope-flap, .ribbon-stamp');
                                    envelopeParts.forEach(part => part.style.display = 'none');
                                }
                            }, 1000); // Wait for zoom to be well underway
                        }, 1500); // Wait for slide animation to finish
                    }
                }, 1300);
            } else {
                // Close flap and hide letter
                flap.style.transform = 'rotateX(0deg)';
                if (letter) {
                    letter.classList.remove('out');
                    letter.classList.remove('full-screen');
                }
            }
        });
    }

    init();
    animate();
});
