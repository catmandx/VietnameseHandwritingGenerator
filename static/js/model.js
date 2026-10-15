const model = {};
window.model = model;

model.glyphs = {}
model.isLoaded = false;

model.getData = function(callback){
    return $.getJSON("/data/all.json", function(data){
        model.glyphs = data;
        model.isLoaded = true;
        model.buildGlyphCodeMap();
        utils.log('Loaded glyph definitions:', Object.keys(data).length);
        if (typeof callback === 'function') {
            callback(data);
        }
    }).fail(function(err){
        console.error("Failed to load /data/all.json", err);
    });
}

model.buildGlyphCodeMap = function () {
    model.glyphCodeMap = {};
    if (!model.glyphs) return;
    for (const [key, val] of Object.entries(model.glyphs)) {
        if (val && Array.isArray(val.types)) {
            for (const type of val.types) {
                if (type && type.accent) {
                    for (const [accName, accVal] of Object.entries(type.accent)) {
                        if (accVal !== undefined && accVal !== null) {
                            String(accVal).split(',').forEach(codeStr => {
                                const code = parseInt(codeStr.trim(), 10);
                                if (!isNaN(code)) {
                                    model.glyphCodeMap[code] = key;
                                    model.glyphCodeMap[String.fromCharCode(code)] = key;
                                }
                            });
                        }
                    }
                }
            }
        }
    }
};

model.getUnicodeStr = function(word){
    utils.log(word)
    word = word.trim();
    let charArr = word.trim().split('');
    //join phu am ghep kh nh ch gh ph th
    let i = 0
    while (i < charArr.length - 1){
        let currChar = charArr[i];
        let nextChar = charArr[i+1];
        if ("kh nh ch gh ph th Gh".split(' ').indexOf(currChar+nextChar) >= 0){
            charArr[i] = currChar+nextChar;
            charArr.splice(i+1,1);
        }
        i++;
    }

    //join ooc oon
    i = 0
    while (i < charArr.length - 2){
        let currChar = charArr[i];
        let nextChar = charArr[i+1];
        let nextChar2 = charArr[i+2]
        if ("ooc oóc oọc oon oón oòn".split(' ').indexOf(currChar+nextChar+nextChar2) >= 0){
            charArr[i] = currChar+nextChar+nextChar2;
            charArr.splice(i+1,2);
        }
        i++;
    }

    let baseChars = charArr.map(char => utils.removeAccents(char));
    let unicodeString = "";
    let base = null;
    let prev = null;
    let curr = null;
    let next = null;
    for (let i = 0; i < charArr.length; i++) {
        base = baseChars[i];
        curr = charArr[i];
        prev = i == 0 ? null: baseChars[i-1];
        next = i == charArr.length - 1 ? null: baseChars[i+1];
        if(!utils.isLetter(prev)){prev = null}
        if(!utils.isLetter(next)){next = null}
        let glyph = model.getGlyph(base, prev, curr, next);
        utils.log('glyph', glyph)
        unicodeString += glyph;
    }
    return unicodeString;
}

model.getGlyph = function (base, previous, char, next){
    utils.log('getGlyph', base, previous, char, next);
    let isUppercase = utils.isUpperCase(char);
    let accent = utils.getAccent(char);
    if (!model.glyphs || !model.glyphs[base]) { return char; }
    let currentSet = model.glyphs[base].types;
    if (!Array.isArray(currentSet)) { return char; }
    for (const type of currentSet) {
        if (type.prev.includes(previous) && type.next.includes(next) && type.isCap == isUppercase){
            if (type.accent && type.accent[accent] !== undefined && type.accent[accent] !== null && String(type.accent[accent]).trim() !== "") {
                let glyphs = String(type.accent[accent]);
                utils.log(glyphs);
                return glyphs.split(',').map(glyph => {
                    const code = parseInt(glyph.trim(), 10);
                    return isNaN(code) ? '' : String.fromCharCode(code);
                }).join('');
            }
        }
    }
    return char;
}

model.defaultStartPoints = {
    // Nét cong kín / hở (dưới ĐK 3 khoảng 2/3 bề rộng ô)
    'a': { x: 0.65, y: 1.75 },
    'ă': { x: 0.65, y: 1.75 },
    'â': { x: 0.65, y: 1.75 },
    'o': { x: 0.65, y: 1.75 },
    'ô': { x: 0.65, y: 1.75 },
    'ơ': { x: 0.65, y: 1.75 },
    'c': { x: 0.65, y: 1.75 },
    'd': { x: 0.65, y: 1.75 },
    'đ': { x: 0.65, y: 1.75 },
    'q': { x: 0.65, y: 1.75 },
    'g': { x: 0.65, y: 1.75 },
    'x': { x: 0.65, y: 1.75 },

    // Nét móc xuôi / 2 đầu / hất (trên ĐK 2)
    'm': { x: 0.20, y: 1.00 },
    'n': { x: 0.20, y: 1.00 },
    'i': { x: 0.20, y: 1.00 },
    'u': { x: 0.20, y: 1.00 },
    'ư': { x: 0.20, y: 1.00 },
    'p': { x: 0.20, y: 1.00 },
    't': { x: 0.20, y: 1.00 },
    'v': { x: 0.20, y: 1.00 },
    'y': { x: 0.20, y: 1.00 },

    // Nét khuyết trên (trên ĐK 2)
    'b': { x: 0.20, y: 1.00 },
    'l': { x: 0.20, y: 1.00 },
    'h': { x: 0.20, y: 1.00 },
    'k': { x: 0.20, y: 1.00 },

    // Nét vòng / thắt (trên ĐK 1)
    'e': { x: 0.15, y: 0.25 },
    'ê': { x: 0.15, y: 0.25 },
    'r': { x: 0.15, y: 0.00 },
    's': { x: 0.15, y: 0.00 },

    // Chữ ghép
    'kh': { x: 0.20, y: 1.00 },
    'nh': { x: 0.20, y: 1.00 },
    'ch': { x: 0.65, y: 1.75 },
    'gh': { x: 0.65, y: 1.75 },
    'ph': { x: 0.20, y: 1.00 },
    'th': { x: 0.20, y: 1.00 },

    // Chữ hoa (đặt bút ở ĐK 2 hoặc ĐK 3 / ĐK 5)
    'A': { x: 0.40, y: 1.00 },
    'Ă': { x: 0.40, y: 1.00 },
    'Â': { x: 0.40, y: 1.00 },
    'B': { x: 0.40, y: 4.00 },
    'C': { x: 1.20, y: 4.50 },
    'D': { x: 0.80, y: 4.50 },
    'Đ': { x: 0.80, y: 4.50 },
    'E': { x: 0.80, y: 4.50 },
    'Ê': { x: 0.80, y: 4.50 },
    'G': { x: 1.20, y: 4.50 },
    'Gh': { x: 1.20, y: 4.50 },
    'H': { x: 0.40, y: 4.00 },
    'I': { x: 0.80, y: 4.50 },
    'K': { x: 0.40, y: 4.00 },
    'L': { x: 0.80, y: 4.50 },
    'M': { x: 0.40, y: 4.00 },
    'N': { x: 0.40, y: 4.00 },
    'O': { x: 1.00, y: 4.50 },
    'Ô': { x: 1.00, y: 4.50 },
    'Ơ': { x: 1.00, y: 4.50 },
    'P': { x: 0.40, y: 4.00 },
    'Q': { x: 1.00, y: 4.50 },
    'R': { x: 0.40, y: 4.00 },
    'S': { x: 0.80, y: 4.50 },
    'T': { x: 0.80, y: 4.50 },
    'U': { x: 0.80, y: 4.50 },
    'Ư': { x: 0.80, y: 4.50 },
    'V': { x: 0.80, y: 4.50 },
    'X': { x: 0.80, y: 4.50 },
    'Y': { x: 0.80, y: 4.50 }
};

model.getFirstCharUnit = function(word) {
    if (!word) return 'a';
    word = word.trim();
    if (!word) return 'a';

    // 1. Check compound consonants first (e.g. "kh", "nh", "ch", "gh", "ph", "th", "Gh")
    if (word.length >= 2) {
        const twoChar = word.substring(0, 2);
        if (["kh", "nh", "ch", "gh", "ph", "th", "Gh"].includes(twoChar)) {
            return twoChar;
        }
    }

    // 2. Check if first char is a converted font glyph (or mapped glyph code)
    const firstChar = word.charAt(0);
    const firstCharCode = word.charCodeAt(0);
    if (!model.glyphCodeMap && model.glyphs) {
        model.buildGlyphCodeMap();
    }
    if (model.glyphCodeMap && (model.glyphCodeMap[firstChar] || model.glyphCodeMap[firstCharCode])) {
        return model.glyphCodeMap[firstChar] || model.glyphCodeMap[firstCharCode];
    }

    return firstChar;
};

model.getGlyphDotConfigs = function(charUnit) {
    if (!charUnit) {
        return [];
    }
    // 1. Check custom dotConfigs in glyph metadata
    if (model.glyphs && model.glyphs[charUnit] && Array.isArray(model.glyphs[charUnit].dotConfigs) && model.glyphs[charUnit].dotConfigs.length > 0) {
        return model.glyphs[charUnit].dotConfigs;
    }
    // 2. Remove accent mark if present
    const base = (typeof utils !== 'undefined' && utils.removeAccents) ? utils.removeAccents(charUnit) : charUnit;
    if (base !== charUnit && model.glyphs && model.glyphs[base] && Array.isArray(model.glyphs[base].dotConfigs) && model.glyphs[base].dotConfigs.length > 0) {
        return model.glyphs[base].dotConfigs;
    }
    // 3. Fallback to startPoint metadata in model.glyphs (saved from editor)
    let sp = null;
    if (model.glyphs && model.glyphs[charUnit] && model.glyphs[charUnit].startPoint) {
        sp = model.glyphs[charUnit].startPoint;
    } else if (base !== charUnit && model.glyphs && model.glyphs[base] && model.glyphs[base].startPoint) {
        sp = model.glyphs[base].startPoint;
    }
    if (sp && typeof sp.x === 'number' && typeof sp.y === 'number') {
        return [
            {
                id: 'start',
                name: '1. Điểm đặt bút (Chuẩn)',
                desc: '1 chấm chuẩn',
                dots: [{ x: sp.x, y: sp.y, label: 'Đặt bút' }]
            }
        ];
    }
    return [];
};

model.getGlyphDotConfig = function(charUnit, configId, dynamicDots) {
    // Architectural hook for runtime dynamic dotting
    if (dynamicDots && Array.isArray(dynamicDots) && dynamicDots.length > 0) {
        return {
            id: 'dynamic',
            name: 'Chấm tự do',
            desc: `${dynamicDots.length} chấm tùy chỉnh`,
            dots: dynamicDots
        };
    }
    const configs = model.getGlyphDotConfigs(charUnit);
    if (!configs || configs.length === 0) {
        return null;
    }
    if (configId) {
        const found = configs.find(c => c.id === configId);
        if (found) return found;
    }
    return configs[0];
};

model.getGlyphStartPoint = function(charUnit) {
    const cfg = model.getGlyphDotConfig(charUnit);
    if (cfg && cfg.dots && cfg.dots.length > 0 && typeof cfg.dots[0].x === 'number') {
        return { x: cfg.dots[0].x, y: cfg.dots[0].y };
    }
    return null;
};
