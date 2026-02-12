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
                                        typeText(LETTER_MESSAGE, document.querySelector('.letter-content'), 100, startConfessionSequence);
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


    // Type text function with callback support and character indexing
    function typeText(text, element, speed = 100, callback) {
        if (!element) return;
        element.textContent = "";
        let i = 0;

        function type() {
            if (i < text.length) {
                const char = text.charAt(i);

                if (char === '\n') {
                    element.appendChild(document.createElement('br'));
                } else {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.className = 'source-char'; // Mark as source
                    // Make sure spaces are visible/take up space
                    if (char === ' ') span.innerHTML = '&nbsp;';

                    element.appendChild(span);
                }

                i++;

                // Auto-scroll to bottom
                const parent = element.parentElement;
                if (parent && (parent.classList.contains('full-screen') || parent.classList.contains('confession-letter'))) {
                    parent.scrollTop = parent.scrollHeight;
                }

                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        }
        type();
    }

    function startConfessionSequence() {
        const letter = document.querySelector('.letter');
        const confessionContainer = document.querySelector('.confession-letter');
        const confessionContent = document.querySelector('.confession-content');

        if (letter && confessionContainer && confessionContent) {
            // Split View Animation
            letter.classList.add('split-view');
            confessionContainer.classList.add('visible');

            // Wait for split transition to finish before starting animation
            setTimeout(() => {
                // Prepare Destination
                confessionContent.innerHTML = '';
                const msg = (typeof CONFESSION_MESSAGE !== 'undefined') ? CONFESSION_MESSAGE : "Confession placeholder...";
                const destSpans = [];

                // Helper to create a word container
                function createWordContainer() {
                    const span = document.createElement('span');
                    span.style.display = 'inline-block';
                    span.style.whiteSpace = 'nowrap';
                    return span;
                }

                let currentWord = createWordContainer();
                confessionContent.appendChild(currentWord);

                // Create placeholder spans for destination, grouped by words
                for (let i = 0; i < msg.length; i++) {
                    const char = msg[i];

                    if (char === '\n') {
                        confessionContent.appendChild(document.createElement('br'));
                        currentWord = createWordContainer(); // Start new word container after newline
                        confessionContent.appendChild(currentWord);
                    } else if (char === ' ') {
                        // Spaces are separate, not inside the "word" block usually, or end a word
                        // Actually, let's just append a space span directly to content to allow wrapping point
                        const spaceSpan = document.createElement('span');
                        spaceSpan.innerHTML = '&nbsp;';
                        spaceSpan.className = 'dest-char confirmed-space';
                        confessionContent.appendChild(spaceSpan);

                        // Track space for animation if needed (usually just reveals instantly)
                        destSpans.push({ span: spaceSpan, char: ' ' });

                        // Start new word container for next chars
                        currentWord = createWordContainer();
                        confessionContent.appendChild(currentWord);
                    } else {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.className = 'dest-char';
                        currentWord.appendChild(span);
                        destSpans.push({ span, char });
                    }
                }

                // Get Source Spans (from the typed letter)
                // We convert to array to easily filter/find
                const sourceSpans = Array.from(document.querySelectorAll('.letter-content .source-char'))
                    .map(el => ({ el, char: el.textContent, used: false }));

                // Animation Loop
                let currentIndex = 0;

                function animateNextChar() {
                    if (currentIndex >= destSpans.length) return;

                    const targetObj = destSpans[currentIndex];
                    const targetSpan = targetObj.span;
                    const targetChar = targetObj.char;

                    // Skip spaces for flying, just reveal them
                    if (targetChar === ' ') {
                        targetSpan.classList.add('revealed');
                        currentIndex++;
                        setTimeout(animateNextChar, 20);
                        return;
                    }

                    // Find matching available source char (case-insensitive?)
                    // Let's match exact or lowercase
                    const availableSource = sourceSpans.find(s => !s.used && s.char.toLowerCase() === searchChar.toLowerCase());

                    if (availableSource) {
                        // Found! Fly it over
                        availableSource.used = true;

                        // Create a flying clone
                        const flyer = document.createElement('span');
                        flyer.textContent = availableSource.char;
                        flyer.className = 'flying-char';

                        // Get positions
                        const sourceRect = availableSource.el.getBoundingClientRect();
                        const destRect = targetSpan.getBoundingClientRect();

                        // Set initial position
                        flyer.style.top = `${sourceRect.top}px`;
                        flyer.style.left = `${sourceRect.left}px`;

                        document.body.appendChild(flyer);

                        // Dim source
                        availableSource.el.classList.add('used');

                        // Force reflow
                        flyer.getBoundingClientRect();

                        // Animate to destination
                        flyer.style.top = `${destRect.top}px`;
                        flyer.style.left = `${destRect.left}px`;

                        // When done, reveal target and remove flyer
                        setTimeout(() => {
                            targetSpan.classList.add('revealed');
                            flyer.remove();
                        }, 1000); // Matches transition duration

                    } else {
                        // Not found! Magical Reveal
                        targetSpan.classList.add('revealed');
                        targetSpan.classList.add('magical-appear');
                        targetSpan.style.color = '#fff'; // Flash white?
                        setTimeout(() => {
                            targetSpan.style.color = '';
                        }, 1500);
                    }

                    currentIndex++;
                    setTimeout(animateNextChar, 50); // Speed of typing/flying sequence
                }



                animateNextChar();

                // Show proposal after animation + delay
                setTimeout(() => {
                    const proposal = document.querySelector('.proposal-container');
                    if (proposal) proposal.classList.add('visible');

                    // Auto-scroll to bottom of confession to show buttons
                    const parent = confessionContent.parentElement;
                    if (parent) {
                        parent.scrollTop = parent.scrollHeight;
                        // Keep scrolling for a bit to ensure visibility during fade in
                        let scrollInterval = setInterval(() => {
                            parent.scrollTop = parent.scrollHeight;
                        }, 100);
                        setTimeout(() => clearInterval(scrollInterval), 2000);
                    }
                }, (destSpans.length * 50) + 2000); // Wait for typing + buffer

            }, 1000);
        }
    }

    // Update the trigger call to pass callback
    // We need to find where typeText is called in init/animate logic
    // Actually it's inside the envelope click handler. Let's find that.


    init();
    animate();

    // Music Control
    const music = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-control');

    if (music && musicBtn) {
        music.volume = 0.5; // Set volume to 50%

        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play()
                    .then(() => {
                        musicBtn.classList.add('playing');
                        musicBtn.textContent = '♫'; // Music note
                    })
                    .catch(error => {
                        console.log("Audio play failed:", error);
                    });
            } else {
                music.pause();
                musicBtn.classList.remove('playing');
                musicBtn.textContent = '♪'; // Eighth note
            }
        });

        // Try to auto-play on first interaction
        document.body.addEventListener('click', function () {
            if (music.paused && !musicBtn.classList.contains('playing')) {
                // only if user hasn't explicitly paused it (though difficult to track simply)
                // Just attempt play if paused
                // music.play().then(...).catch(...)
                // Actually, let's keep it manual toggle to be safe, or just silent start
            }
        }, { once: true });
    }
});
