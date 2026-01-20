document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('love-stream-container');
    const text = "I LOVE YOU ";

    function createStream() {
        container.innerHTML = '';
        const rowHeight = 30; // height of each row in pixels
        const rows = Math.ceil(window.innerHeight / rowHeight);

        for (let i = 0; i < rows; i++) {
            const row = document.createElement('div');
            row.className = 'love-stream-row';
            row.style.top = `${i * rowHeight}px`;

            // Randomize speed and starting position for a "crazy" effect
            const duration = 10 + Math.random() * 20; // between 10s and 30s
            const delay = Math.random() * -20; // random start position

            row.style.animationDuration = `${duration}s`;
            row.style.animationDelay = `${delay}s`;

            // Alternate direction or just keep left-to-right as requested
            // User specifically asked left to right.

            // We need enough text to cover the screen twice to loop smoothly
            // "I LOVE YOU " is about 120px at 24px font size.
            // We'll repeat it enough times to be much wider than the screen.
            const repeatCount = Math.ceil((window.innerWidth * 2) / 100) + 10;
            row.textContent = text.repeat(repeatCount);

            container.appendChild(row);
        }
    }

    createStream();

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(createStream, 250);
    });

    console.log('Love stream initialized! ❤️');
});
