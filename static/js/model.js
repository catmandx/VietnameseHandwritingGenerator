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

model.defaultDotConfigs = {
    // === CHỮ HOA (COMPOSITE & MULTI-STROKE UPPERCASE) ===
    'B': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Bắt đầu nét móc ngược trái (ĐK 6)', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu các nét', desc: '2 chấm: Bắt đầu Nét 1 & Nét 2 riêng biệt', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 0.80, y: 4.50, label: 'Nét 2' }] },
        { id: 'stages', name: '3. Chi tiết các điểm neo', desc: '4 chấm: Đặt bút, bắt đầu nét 2, thắt lưng, dừng bút', dots: [{ x: 0.40, y: 4.00, label: 'Đặt bút' }, { x: 0.80, y: 4.50, label: 'Bắt đầu nét 2' }, { x: 1.30, y: 2.50, label: 'Thắt lưng' }, { x: 0.80, y: 2.00, label: 'Dừng bút' }] }
    ],
    'H': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Bắt đầu Nét 1 cong trái', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu các nét', desc: '3 chấm: Nét 1 cong trái, Nét 2 khuyết xuôi, Nét 3 lượn ngang', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 1.80, y: 4.50, label: 'Nét 2' }, { x: 0.80, y: 2.50, label: 'Nét 3' }] },
        { id: 'stages', name: '3. Chi tiết 5 điểm neo', desc: '5 chấm: Đầy đủ các điểm uốn chuyển hướng của chữ H', dots: [{ x: 0.40, y: 4.00, label: 'Đặt bút nét 1' }, { x: 1.00, y: 1.00, label: 'Dừng nét 1' }, { x: 1.80, y: 4.50, label: 'Bắt đầu nét 2' }, { x: 2.20, y: 1.00, label: 'Dừng nét 2' }, { x: 0.80, y: 2.50, label: 'Nét 3' }] }
    ],
    'A': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.40, y: 1.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu các nét', desc: '3 chấm: Nét 1 cong trái, Nét 2 móc ngược, Nét 3 lượn', dots: [{ x: 0.40, y: 1.00, label: 'Nét 1' }, { x: 1.50, y: 4.50, label: 'Nét 2' }, { x: 0.60, y: 2.00, label: 'Nét 3' }] }
    ],
    'M': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 6', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu các nét', desc: '3 chấm: Các đỉnh móc của chữ M hoa', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 1.40, y: 4.50, label: 'Nét 2' }, { x: 2.20, y: 4.50, label: 'Nét 3' }] }
    ],
    'N': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 6', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu các nét', desc: '3 chấm: Bắt đầu 3 nét của chữ N hoa', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 1.50, y: 4.50, label: 'Nét 2' }, { x: 1.50, y: 1.00, label: 'Nét 3' }] }
    ],
    'P': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét móc ngược và Nét cong trên', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 0.80, y: 4.50, label: 'Nét 2' }] }
    ],
    'R': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét móc ngược và Nét cong thắt', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 0.80, y: 4.50, label: 'Nét 2' }] }
    ],
    'D': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 6', dots: [{ x: 0.80, y: 4.50, label: 'Nét 1' }] },
        { id: 'stages', name: '2. Đặt bút & thắt chân', desc: '2 chấm: Điểm đặt bút và điểm lượn thắt ở chân', dots: [{ x: 0.80, y: 4.50, label: 'Đặt bút' }, { x: 0.30, y: 0.50, label: 'Thắt chân' }] }
    ],
    'Đ': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 6', dots: [{ x: 0.80, y: 4.50, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Thân chữ và nét gạch ngang', dots: [{ x: 0.80, y: 4.50, label: 'Thân chữ' }, { x: 0.60, y: 3.00, label: 'Gạch ngang' }] }
    ],
    'K': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét 1 cong trái, Nét 2 móc thắt', dots: [{ x: 0.40, y: 4.00, label: 'Nét 1' }, { x: 1.80, y: 4.50, label: 'Nét 2' }] }
    ],
    'C': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm', dots: [{ x: 1.20, y: 4.50, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Đặt bút & dừng bút', desc: '2 chấm: Đặt bút dưới ĐK 6 và dừng bút trên ĐK 2', dots: [{ x: 1.20, y: 4.50, label: 'Đặt bút' }, { x: 0.80, y: 1.00, label: 'Dừng bút' }] }
    ],
    'G': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm', dots: [{ x: 1.20, y: 4.50, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Đặt bút & chuyển nét', desc: '2 chấm: Đặt bút và bắt đầu nét khuyết dưới', dots: [{ x: 1.20, y: 4.50, label: 'Đặt bút' }, { x: 1.60, y: 2.00, label: 'Khuyết dưới' }] }
    ],

    // === CHỮ THƯỜNG (STAGES OF LEARNING LOWERCASE) ===
    'a': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3 (chuẩn)', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Bắt đầu nét cong kín & Bắt đầu nét móc ngược', dots: [{ x: 0.65, y: 1.75, label: 'Nét 1' }, { x: 1.00, y: 2.00, label: 'Nét 2' }] },
        { id: 'stages', name: '3. Đầy đủ các điểm uốn', desc: '3 chấm: Đặt bút, chuyển nét móc và dừng bút', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }, { x: 1.00, y: 2.00, label: 'Nét 2' }, { x: 1.50, y: 1.00, label: 'Dừng bút' }] }
    ],
    'b': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Điểm uốn khuyết & thắt', desc: '3 chấm: Đặt bút, đỉnh khuyết trên (ĐK 6), điểm thắt bụng', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }, { x: 1.00, y: 5.00, label: 'Đỉnh khuyết' }, { x: 1.00, y: 2.00, label: 'Thắt bụng' }] }
    ],
    'c': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Đặt bút & dừng bút', desc: '2 chấm: Đặt bút và điểm dừng bút trên ĐK 2', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }, { x: 0.75, y: 1.00, label: 'Dừng bút' }] }
    ],
    'd': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét cong kín và nét móc ngược (cao 4 li)', dots: [{ x: 0.65, y: 1.75, label: 'Nét 1' }, { x: 1.00, y: 4.00, label: 'Nét 2' }] }
    ],
    'đ': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu các nét', desc: '3 chấm: Nét cong kín, nét móc ngược và nét gạch ngang', dots: [{ x: 0.65, y: 1.75, label: 'Nét 1' }, { x: 1.00, y: 4.00, label: 'Nét 2' }, { x: 0.80, y: 3.00, label: 'Nét 3' }] }
    ],
    'm': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Giữa ĐK 2 và ĐK 3', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 3 nét móc', desc: '3 chấm: Bắt đầu Nét móc 1, Nét móc 2, Nét móc 3', dots: [{ x: 0.20, y: 1.00, label: 'Nét 1' }, { x: 0.90, y: 1.00, label: 'Nét 2' }, { x: 1.60, y: 1.00, label: 'Nét 3' }] },
        { id: 'stages', name: '3. Điểm neo và dừng bút', desc: '4 chấm: Bắt đầu 3 nét và điểm dừng bút trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Nét 1' }, { x: 0.90, y: 1.00, label: 'Nét 2' }, { x: 1.60, y: 1.00, label: 'Nét 3' }, { x: 2.10, y: 1.00, label: 'Dừng bút' }] }
    ],
    'n': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Giữa ĐK 2 và ĐK 3', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét móc', desc: '2 chấm: Bắt đầu Nét móc 1 và Nét móc 2', dots: [{ x: 0.20, y: 1.00, label: 'Nét 1' }, { x: 0.90, y: 1.00, label: 'Nét 2' }] },
        { id: 'stages', name: '3. Điểm neo và dừng bút', desc: '3 chấm: Bắt đầu 2 nét và điểm dừng bút trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Nét 1' }, { x: 0.90, y: 1.00, label: 'Nét 2' }, { x: 1.40, y: 1.00, label: 'Dừng bút' }] }
    ],
    'e': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 1 một chút', dots: [{ x: 0.15, y: 0.25, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Đặt bút & dừng bút', desc: '2 chấm: Điểm đặt bút và điểm dừng bút trên ĐK 2', dots: [{ x: 0.15, y: 0.25, label: 'Đặt bút' }, { x: 0.75, y: 1.00, label: 'Dừng bút' }] }
    ],
    'h': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét khuyết trên (5 li) và nét móc 2 đầu', dots: [{ x: 0.20, y: 1.00, label: 'Nét khuyết' }, { x: 0.90, y: 1.00, label: 'Nét móc' }] }
    ],
    'k': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét khuyết trên (5 li) và nét móc thắt', dots: [{ x: 0.20, y: 1.00, label: 'Nét khuyết' }, { x: 0.90, y: 1.00, label: 'Nét thắt' }] }
    ],
    'l': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Đặt bút & đỉnh khuyết', desc: '2 chấm: Điểm đặt bút và đỉnh nét khuyết (ĐK 6)', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }, { x: 1.00, y: 5.00, label: 'Đỉnh khuyết' }] }
    ],
    'i': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'stages', name: '2. Đặt bút & dừng bút', desc: '2 chấm: Điểm đặt bút và điểm dừng bút trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }, { x: 0.70, y: 1.00, label: 'Dừng bút' }] }
    ],
    'u': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Trên ĐK 2', dots: [{ x: 0.20, y: 1.00, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét móc', desc: '2 chấm: Bắt đầu nét hất và nét móc ngược 2', dots: [{ x: 0.20, y: 1.00, label: 'Nét 1' }, { x: 0.90, y: 2.00, label: 'Nét 2' }] }
    ],
    'o': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] }
    ],
    'g': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét cong kín và nét khuyết dưới', dots: [{ x: 0.65, y: 1.75, label: 'Nét 1' }, { x: 1.00, y: 2.00, label: 'Nét 2' }] }
    ],
    'q': [
        { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm: Dưới ĐK 3', dots: [{ x: 0.65, y: 1.75, label: 'Đặt bút' }] },
        { id: 'strokes', name: '2. Bắt đầu 2 nét', desc: '2 chấm: Nét cong kín và nét thẳng đứng', dots: [{ x: 0.65, y: 1.75, label: 'Nét 1' }, { x: 1.00, y: 2.00, label: 'Nét 2' }] }
    ]
};

model.getGlyphDotConfigs = function(charUnit) {
    if (!charUnit) {
        return [{ id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm chuẩn', dots: [{ x: 0.25, y: 1.00, label: 'Đặt bút' }] }];
    }
    // 1. Check custom dotConfigs in glyph metadata
    if (model.glyphs && model.glyphs[charUnit] && Array.isArray(model.glyphs[charUnit].dotConfigs) && model.glyphs[charUnit].dotConfigs.length > 0) {
        return model.glyphs[charUnit].dotConfigs;
    }
    // 2. Remove accent mark if present
    const base = utils.removeAccents(charUnit);
    if (model.glyphs && model.glyphs[base] && Array.isArray(model.glyphs[base].dotConfigs) && model.glyphs[base].dotConfigs.length > 0) {
        return model.glyphs[base].dotConfigs;
    }
    // 3. Check default dot configs presets
    if (model.defaultDotConfigs && model.defaultDotConfigs[charUnit]) {
        return model.defaultDotConfigs[charUnit];
    }
    if (model.defaultDotConfigs && model.defaultDotConfigs[base]) {
        return model.defaultDotConfigs[base];
    }
    // 4. Fallback to startPoint metadata or default start points
    let sp = null;
    if (model.glyphs && model.glyphs[charUnit] && model.glyphs[charUnit].startPoint) {
        sp = model.glyphs[charUnit].startPoint;
    } else if (model.glyphs && model.glyphs[base] && model.glyphs[base].startPoint) {
        sp = model.glyphs[base].startPoint;
    } else if (model.defaultStartPoints && model.defaultStartPoints[charUnit]) {
        sp = model.defaultStartPoints[charUnit];
    } else if (model.defaultStartPoints && model.defaultStartPoints[base]) {
        sp = model.defaultStartPoints[base];
    } else {
        sp = { x: 0.25, y: 1.00 };
    }
    return [
        {
            id: 'start',
            name: '1. Điểm đặt bút (Chuẩn)',
            desc: '1 chấm chuẩn',
            dots: [{ x: sp.x, y: sp.y, label: 'Đặt bút' }]
        }
    ];
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
        return { id: 'start', name: '1. Điểm đặt bút (Chuẩn)', desc: '1 chấm chuẩn', dots: [{ x: 0.25, y: 1.00, label: 'Đặt bút' }] };
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
    return { x: 0.25, y: 1.00 };
};
