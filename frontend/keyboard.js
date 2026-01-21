const keyboardContainer = document.getElementById('keyboard');

function renderKeyboard() {
    KEY_LAYOUT.forEach(id => {
        const key = document.createElement('div');
        key.className = 'key';

        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        key.appendChild(canvas);

        const glyphData = GLYPHS[id] || GLYPHS[`${id}_S`] || GLYPHS[`${id}_M`];
        if (glyphData) {
            drawGlyphOnCanvas(glyphData.bitmap, canvas);
        } else {
            key.textContent = id;
        }

        key.addEventListener('pointerdown', (e) => triggerGlyph(id, e.shiftKey));
        keyboardContainer.appendChild(key);
    });
}

function handlePhysicalKeyboard(e) {
    const keyMap = {
        'q': 'C01', 'w': 'C02', 'e': 'C03', 'r': 'C04', 't': 'C05',
        'y': 'C06', 'u': 'C07', 'i': 'C08', 'o': 'C09', 'p': 'C10',
        'a': 'C11', 's': 'C12', 'd': 'C13', 'f': 'C14', 'g': 'C15',
        'h': 'C16', 'j': 'C17', 'k': 'C18', 'l': 'C19',
        'z': 'C20', 'x': 'C21', 'c': 'C22', 'v': 'C23', 'b': 'C24',
        'n': 'C25', 'm': 'C26'
    };

    const id = keyMap[e.key.toLowerCase()];
    if (id) {
        triggerGlyph(id, e.shiftKey);
    }
}