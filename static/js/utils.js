const utils = {}

utils.log = function (...args) {
    controller.doLog ? console.log(...args) : null;
}

utils.isLetter = function (c) {
    return !/[`~!@#$%^&*()_+\-=\[\]\{\};':",./<>?\\|0-9]+/.test(c)
}

utils.getAccent = function (char) {
    char = char.toLowerCase();
    let accentList = {
        'acute': 'áắấóốớéếíúứý',
        'lower': 'àằầòồờèềìùừỳ',
        'rising': 'ảẳẩỏổởẻểỉủửỷ',
        'raised': 'ãẵẫõỗỡẽễĩũữỹ',
        'heavy': 'ạặậọộợẹệịụựỵ',
    }
    for (const [accent, characters] of Object.entries(accentList)) {
        //special cases
        if (/ooc/.test(char)) { return "level"; }
        if (/oon/.test(char)) { return "level"; }
        if (/oòn/.test(char)) { return "lower"; }
        if (/oón/.test(char)) { return "acute"; }
        if (/oóc/.test(char)) { return "acute"; }
        if (/oọc/.test(char)) { return "heavy"; }
        //normal cases
        var re = new RegExp('[' + characters + ']', 'g');
        if (re.test(char)) {
            return accent;
        }
    }
    return 'level';
}

utils.isUpperCase = function (str) {
    if (str === "Gh") { return true; };
    if (str.length != 1) { return false; };
    let uppercaseLetters = [
        "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
        "DĐ",
        "EÈẺẼÉẸÊỀỂỄẾỆ",
        "IÌỈĨÍỊ",
        "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
        "UÙỦŨÚỤƯỪỬỮỨỰ",
        "YỲỶỸÝỴ",
        "BCGHKLMNPQRSTVX"
    ]
    for (var i = 0; i < uppercaseLetters.length; i++) {
        var re = new RegExp('[' + uppercaseLetters[i] + ']', 'g');
        if (re.test(str)) {
            return true;
        }
    }
    return false;
}

utils.removeAccents = function (str) {
    // if(/ooc/.test(char) || /oọc/.test(char) || /oóc/.test(char)){return "ooc";}
    // if(/oon/.test(char)){return "oon";}
    var AccentsMap = [
        "aàảãáạ",
        "ăằẳẵắặ",
        "âầẩẫấậ",
        "AÀẢÃÁẠ",
        "ĂẰẲẴẮẶ",
        "ÂẦẨẪẤẬ",
        "eèẻẽéẹ",
        "êềểễếệ",
        "EÈẺẼÉẸ",
        "ÊỀỂỄẾỆ",
        "iìỉĩíị",
        "IÌỈĨÍỊ",
        "oòỏõóọ",
        "ôồổỗốộ",
        "ơờởỡớợ",
        "OÒỎÕÓỌ",
        "ÔỒỔỖỐỘ",
        "ƠỜỞỠỚỢ",
        "uùủũúụ",
        "ưừửữứự",
        "UÙỦŨÚỤ",
        "ƯỪỬỮỨỰ",
        "yỳỷỹýỵ",
        "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
        var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        var char = AccentsMap[i][0];
        str = str.replace(re, char);
    }
    return str;
}

utils.stripHtml = function (str) {
    return str.replace(/(<([^>]+)>)/gi, "");
}