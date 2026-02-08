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
                            if (letter) {
                                // Get current position to prevent jumping
                                const rect = letter.getBoundingClientRect();
                                letter.style.top = `${rect.top}px`;
                                letter.style.left = `${rect.left}px`;
                                letter.style.margin = '0';

                                // Move to body to escape transformed parent
                                document.body.appendChild(letter);

                                // Trigger full-screen in next frame
                                requestAnimationFrame(() => {
                                    letter.classList.add('full-screen');

                                    // Start typing after zoom finishes
                                    setTimeout(() => {
                                        // Use the message from message.js
                                        typeText(LETTER_MESSAGE, document.querySelector('.letter-content'), 50, startConfession);
                                    }, 1500);
                                });

                                // Hide everything else for a clean new scene
                                setTimeout(() => {
                                    if (container) container.style.display = 'none';
                                    const envelopeWrapper = document.querySelector('.envelope-wrapper');
                                    if (envelopeWrapper) envelopeWrapper.style.display = 'none';
                                    const senderLabel = document.querySelector('.sender-label');
                                    if (senderLabel) senderLabel.style.display = 'none';
                                    const triggerText = document.querySelector('.question-trigger');
                                    if (triggerText) triggerText.style.display = 'none';
                                }, 1000);
                            }
                        }, 1500);
                    }
                }, 1300);
            } else {
                // Close flap and hide letter
                flap.style.transform = 'rotateX(0deg)';
                if (letter) {
                    letter.classList.remove('out');
                    letter.classList.remove('full-screen');
                    const content = letter.querySelector('.letter-content');
                    if (content) content.textContent = "";

                    // Move back to envelope
                    const envelope = document.querySelector('.envelope');
                    if (envelope && letter.parentElement === document.body) {
                        envelope.appendChild(letter);
                        letter.style.top = '10px';
                        letter.style.left = '10px';
                    }
                }

                // Restore visibility
                if (container) container.style.display = 'block';
                const envelopeWrapper = document.querySelector('.envelope-wrapper');
                if (envelopeWrapper) envelopeWrapper.style.display = 'block';
                const senderLabel = document.querySelector('.sender-label');
                if (senderLabel) senderLabel.classList.remove('hidden');
                const triggerText = document.querySelector('.question-trigger');
                if (triggerText) {
                    triggerText.style.opacity = '1';
                    triggerText.style.pointerEvents = 'all';
                }
                isBeingPulled = false;
                isExploding = false;
            }
        });
    }

    // New Function: Transition to Split View and Start Enchantment
    function startConfession() {
        const letter = document.querySelector('.letter');
        const confessionDisplay = document.getElementById('confession-display');

        if (!letter || !confessionDisplay) return;

        // 1. Split View
        letter.classList.add('split-view');
        confessionDisplay.classList.add('visible');

        // 2. Prepare Confession Text (Destination)
        const rawConfession = (typeof CONFESSION_MESSAGE !== 'undefined') ? CONFESSION_MESSAGE : "I Love You";
        const destSpans = [];

        for (let char of rawConfession) {
            if (char === '\n') {
                confessionDisplay.appendChild(document.createElement('br'));
                continue;
            }

            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'confess-char'; // Opacity 0 initially
            confessionDisplay.appendChild(span);

            if (char.trim()) {
                destSpans.push({ span, char });
            } else {
                span.classList.add('revealed');
            }
        }

        // 3. Gather Source Spans (From the Letter)
        const letterContent = document.querySelector('.letter-content');
        const sourceSpans = Array.from(letterContent.querySelectorAll('.letter-char'));

        function findSource(char) {
            const matches = sourceSpans.filter(s => s.textContent.toLowerCase() === char.toLowerCase());
            if (matches.length > 0) {
                return matches[Math.floor(Math.random() * matches.length)];
            }
            return null;
        }

        // 4. Animate Loop
        let currentIndex = 0;

        function animateNext() {
            if (currentIndex >= destSpans.length) return;

            const targetObj = destSpans[currentIndex];
            const targetSpan = targetObj.span;
            const char = targetObj.char;

            const sourceSpan = findSource(char);

            if (sourceSpan) {
                // FLY!
                const flyer = document.createElement('span');
                flyer.textContent = char;
                flyer.className = 'flying-char';

                const sRect = sourceSpan.getBoundingClientRect();
                const dRect = targetSpan.getBoundingClientRect();

                flyer.style.top = `${sRect.top}px`;
                flyer.style.left = `${sRect.left}px`;
                flyer.style.fontSize = getComputedStyle(sourceSpan).fontSize;

                document.body.appendChild(flyer);

                setTimeout(() => {
                    // Move
                    flyer.style.top = `${dRect.top}px`;
                    flyer.style.left = `${dRect.left}px`;
                }, 10);

                // Flash source
                const originalColor = sourceSpan.style.color;
                sourceSpan.style.color = '#fff';
                sourceSpan.style.textShadow = '0 0 10px #fff';
                setTimeout(() => {
                    sourceSpan.style.color = originalColor;
                    sourceSpan.style.textShadow = 'none';
                }, 300);

                // On arrival
                setTimeout(() => {
                    targetSpan.classList.add('revealed');
                    flyer.remove();
                }, 1200);

            } else {
                // No source? Fade in slowly
                setTimeout(() => {
                    targetSpan.classList.add('revealed');
                }, 500);
            }

            currentIndex++;
            setTimeout(animateNext, 50);
        }

        setTimeout(animateNext, 1000);
    }


    // Enchantment Table Effect Logic
    function typeText(text, element, speed = 50) {
        if (!element) return;
        element.textContent = "";

        // 1. Prepare Destination
        // Split text into spans so we have a target for each letter
        const destSpans = [];
        for (let char of text) {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'dest-char';
            // Handle newlines
            if (char === '\n') {
                element.appendChild(document.createElement('br'));
            } else {
                element.appendChild(span);
                destSpans.push({ span, char });
            }
        }

        // 2. Prepare Source (Confession Text)
        const sourceContainer = document.getElementById('confession-container');
        if (sourceContainer) {
            sourceContainer.innerHTML = '';
            sourceContainer.classList.add('visible');

            // Fill with CONFESSION_MESSAGE until we have enough potential sources
            // or just display it nicely.
            // Let's just put the message there repeatedly to fill space
            const sourceText = CONFESSION_MESSAGE.repeat(3);
            const sourceSpans = [];

            for (let char of sourceText) {
                if (char === '\n') {
                    sourceContainer.appendChild(document.createElement('br'));
                    continue;
                }
                const s = document.createElement('span');
                s.textContent = char;
                s.style.opacity = '0.5';
                s.style.transition = 'opacity 0.2s';
                sourceContainer.appendChild(s);

                // Only track non-whitespace for flying source candidates
                if (char.trim()) {
                    sourceSpans.push({ el: s, char, used: false });
                }
            }

            // 3. Animate
            let currentIndex = 0;

            function animateNextChar() {
                if (currentIndex >= destSpans.length) {
                    // Done!
                    setTimeout(() => {
                        sourceContainer.classList.remove('visible');
                    }, 2000);
                    return;
                }

                const targetObj = destSpans[currentIndex];
                const targetSpan = targetObj.span;
                const targetChar = targetObj.char;

                // Skip spaces/newlines for animation, just reveal them
                if (!targetChar.trim()) {
                    targetSpan.classList.add('revealed');
                    currentIndex++;
                    setTimeout(animateNextChar, speed / 2); // Faster for spaces
                    return;
                }

                // Find a matching character in source that hasn't been used recently?
                // Or just random matching char?
                const availableSources = sourceSpans.filter(s => s.char.toLowerCase() === targetChar.toLowerCase());
                let sourceObj = null;

                if (availableSources.length > 0) {
                    // Pick a random one or one near the top? Random looks more "magical"
                    sourceObj = availableSources[Math.floor(Math.random() * availableSources.length)];
                }

                if (sourceObj) {
                    // Create Flying Clone
                    const flyer = document.createElement('span');
                    flyer.textContent = sourceObj.char;
                    flyer.className = 'flying-char';

                    // Get positions
                    const sourceRect = sourceObj.el.getBoundingClientRect();
                    const destRect = targetSpan.getBoundingClientRect();

                    // Start at source
                    flyer.style.top = `${sourceRect.top}px`;
                    flyer.style.left = `${sourceRect.left}px`;
                    flyer.style.fontSize = '14px'; // Start small like source

                    document.body.appendChild(flyer);

                    // Flash the source char
                    sourceObj.el.style.color = '#fff';
                    sourceObj.el.style.textShadow = '0 0 10px #fff';
                    setTimeout(() => {
                        sourceObj.el.style.color = '';
                        sourceObj.el.style.textShadow = '';
                    }, 300);

                    // Force reflow
                    flyer.getBoundingClientRect();

                    // Animate to destination
                    // Use a curve?
                    // Simple transition for now, maybe add keyframes for curve later if needed
                    flyer.style.transition = `all 0.8s cubic-bezier(0.19, 1, 0.22, 1)`;
                    flyer.style.top = `${destRect.top}px`;
                    flyer.style.left = `${destRect.left}px`;
                    flyer.style.fontSize = '42px'; // Scale up to dest size (or whatever dest size is)

                    // On complete
                    setTimeout(() => {
                        targetSpan.classList.add('revealed');
                        flyer.remove();
                        const parent = element.parentElement;
                        if (parent && parent.classList.contains('full-screen')) {
                            parent.scrollTop = parent.scrollHeight;
                        }

                    }, 800);

                } else {
                    // No source found, just reveal
                    targetSpan.classList.add('revealed');
                }

                currentIndex++;
                setTimeout(animateNextChar, speed);
            }

            // Start animation loop
            animateNextChar();
        }
    }

    init();
    animate();
});
