const model = {}

model.glyphs = {}

model.getData = function(){
    $.getJSON("/data/all.json", {_: new Date().getTime()} , function(data){
        model.glyphs = data
        utils.log(data)
    })
}

model.getUnicodeStr = function(word){
    utils.log(word)
    word = word.trim();
    let charArr = word.trim().split('');
    //join phu am ghep kh nh ch gh ph th
    let i = 0
    while (i < charArr.length - 1){
        let currChar = charArr[i];
        let nextChar = charArr[i+1];
        if ("kh nh ch gh ph th".split(' ').indexOf(currChar+nextChar) >= 0){
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

    // let baseChars = charArr.map(char => utils.removeAccents(char.toLowerCase()));
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
    utils.log('getGlyph', base, previous, char, next)
    let isUppercase = utils.isUpperCase(char);
    let accent = utils.getAccent(char);
    if(!Object.keys(model.glyphs).includes(base)){return char;}
    let currentSet = model.glyphs[base].types;
    for (const type of currentSet) {
        if ( type.prev.includes(previous) && type.next.includes(next) && type.isCap == isUppercase){
            let glyphs = String(type.accent[accent]);
            utils.log(glyphs)
            return glyphs.split(',').map(glyph => String.fromCharCode(glyph)).join('');
        }
    }
    return char;
}
