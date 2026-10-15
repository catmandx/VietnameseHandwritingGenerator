const model = {
    glyphGroups: null,
    glyphData: null
};

model.loadJsonData = function(){
    $.getJSON("/data/all.json", function(data){
        model.glyphData = data;
        view.showComponents('baseList')
    });
}

model.download = function(filename, text){
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);
}

model.saveBaseData = function(formData){
    let reduceFormData = function(data){
        return data.reduce((obj, item)=>{
            obj[item['name']] = item['value']
            return obj;
        }, {});
    }
    let data = reduceFormData(formData);
    console.log(data);
    let baseCharacter = data["baseCharacter"];
    let numberOfTypes = data["numberOfTypes"];
    let newBaseTypesData = [];
    for (let i = 1; i <= numberOfTypes; i++) {
        let newTypeData = {}
        newTypeData.isCap = !!data['isCap'+i]
        
        //prev list
        newTypeData.prev = []
        let prev = data['prev'+i];
        if(prev){
            prev = validatePrevAndNext(prev);
            if(prev === false){
                toastr.error("Previous field contains non-normal character!");
                $('#prev'+i).focus()
                return;
            }
            newTypeData.prev = prev.split(' ');
        }

        let noNeedPrev = !!data['noNeedPrev'+i];
        if (noNeedPrev){
            newTypeData.prev = [...newTypeData.prev, null];
        }
        
        //next list
        newTypeData.next = []
        let next = data['next'+i];
        if(next){
            next = validatePrevAndNext(next);
            if(next === false){
                toastr.error("Next field contains non-normal character!");
                $('#next'+i).focus()
                return;
            }
            newTypeData.next = next.split(' ');
        }

        let noNeedNext = !!data['noNeedNext'+i];
        if (noNeedNext){
            newTypeData.next = [...newTypeData.next, null];
        }

        //handle accent
        newTypeData.accent = {};
        let listAccents = ['level', 'acute', 'lower', 'rising', 'raised', 'heavy'];
        listAccents.forEach(accent => {
            let accentValue = data[accent+i];
            if(!accentValue){
                return;
            }
            newTypeData.accent[accent] = accentValue
        })
        newBaseTypesData.push(newTypeData);
    }
    if (!this.glyphData[baseCharacter]) {
        this.glyphData[baseCharacter] = {};
    }
    this.glyphData[baseCharacter].types = newBaseTypesData;

    // Handle Dot Configurations & Start Point
    let hasStartPoint = !!data['hasStartPoint'];
    let dotConfigsJson = data['dotConfigsJson'];
    let parsedConfigs = null;
    if (dotConfigsJson) {
        try {
            parsedConfigs = JSON.parse(dotConfigsJson);
        } catch (e) {
            console.error('Failed to parse dotConfigsJson', e);
        }
    }

    if (hasStartPoint && Array.isArray(parsedConfigs) && parsedConfigs.length > 0) {
        this.glyphData[baseCharacter].dotConfigs = parsedConfigs;
        const firstDot = parsedConfigs[0]?.dots?.[0];
        if (firstDot && typeof firstDot.x === 'number' && typeof firstDot.y === 'number') {
            this.glyphData[baseCharacter].startPoint = {
                x: Math.round(firstDot.x * 100) / 100,
                y: Math.round(firstDot.y * 100) / 100
            };
        }
    } else {
        delete this.glyphData[baseCharacter].dotConfigs;
        delete this.glyphData[baseCharacter].startPoint;
    }

    toastr.success('Save success!')
    if (typeof view.updateBaseCardBadge === 'function') {
        view.updateBaseCardBadge(baseCharacter);
    }
}

function validatePrevAndNext(text){
    if (!text) return '';
    text = text.replace(/[;,.:]/g,' ').replace(/\s{2,}/g,' ').trim();
    let tokens = text.split(' ').filter(Boolean);
    let validTokenRe = /^[a-zA-Z\u00C0-\u024F\u1EA0-\u1EF9]+$/i;
    for (const token of tokens) {
        if (!validTokenRe.test(token)) {
            return false;
        }
    }
    return tokens.join(' ');
}

function handleGlyphInput(e){
    let input = $(e);
    let inputValue = input.val().trim();
    let unicodeInputName = input.attr('for');
    let unicodeInput = $('#'+unicodeInputName);
    let listValue = inputValue.split('').map(char => char.charCodeAt(0)).join(',');
    unicodeInput.val(listValue);
}

