const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.6; // Matches CSS 60%
    ctx.imageSmoothingEnabled = false;
}

function drawLED(bitmap) {
    const h = bitmap.length;
    const w = bitmap[0].length;

    // Vertical Word Wrap Logic
    if ((currentY + h) * LED_SIZE > canvas.height - 20) {
        currentY = 10;
        currentX += (w * LED_SIZE) + COLUMN_SPACING;
    }

    bitmap.forEach((row, rowIndex) => {
        [...row].forEach((pixel, colIndex) => {
            if (pixel === "1") {
                ctx.fillStyle = "#00FF41";
                ctx.fillRect(
                    currentX + (colIndex * LED_SIZE),
                    currentY * LED_SIZE + (rowIndex * LED_SIZE),
                    LED_SIZE - 1,
                    LED_SIZE - 1
                );
            }
        });
    });
    currentY += h; // No gap between joined glyphs
}

function drawGlyphOnCanvas(bitmap, canvas) {
    const ctx = canvas.getContext('2d');
    const h = bitmap.length;
    const w = bitmap[0].length;
    const ledSize = Math.min(canvas.width / w, canvas.height / h);
    const xOffset = (canvas.width - (w * ledSize)) / 2;
    const yOffset = (canvas.height - (h * ledSize)) / 2;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bitmap.forEach((row, rowIndex) => {
        [...row].forEach((pixel, colIndex) => {
            if (pixel === "1") {
                ctx.fillStyle = "#00FF41";
                ctx.fillRect(
                    xOffset + (colIndex * ledSize),
                    yOffset + (rowIndex * ledSize),
                    ledSize -1,
                    ledSize-1
                );
            }
        });
    });
}