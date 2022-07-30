const view = {

}

view.showComponents = function(name){
    let app = $('#app');
    switch(name){
        case 'baseList':
            app.html(components.baseListPage);
            let baseList = $("#baseList");
            let baseListHtml = baseList.html();
            let sortedData = Object.fromEntries(Object.entries(model.glyphData).sort())
            for (const [base, data] of Object.entries(sortedData)) {
                baseListHtml += `
                    ${components.baseCard.replace("{{name}}", base)}
                `
            }
            baseList.html(baseListHtml)
            //new base card modal
            $('#addNewBaseCardModal').on('shown.bs.modal', function () {
                $('#newBaseCardInput').trigger('focus')
            })
            let newBaseCardForm = $("#newBaseCardForm");
            newBaseCardForm.on('submit', function(e){
                e.preventDefault();
                controller.addNewBase(newBaseCardForm.children('input').val())
            })

            //Download json button
            $('#downloadJson').on('click', function(e){
                model.download('all.json', JSON.stringify(model.glyphData, null, 2))
            })

            //edit base
            baseList.children('.baseCard:not(:first-child)')
                    .on('click', view.populateEditForm)
            
            this.setUpEditModal()
            $(document).on('submit','form#editBaseForm',function(e){
                e.preventDefault()
                model.saveBaseData($(e.target).serializeArray())
             });
            break;
        default:
            app.html(components.loading)
    }
}

view.populateEditForm = function (e){
    let baseCard = $(e.target);
    let baseCardEditorModal = $('#editBaseModal').find('.modal-body')
    let editFormHtml = components.baseEditForm
    //form header
    baseCardEditorModal.html(editFormHtml);
    baseCardEditorModal.find('#baseCharacter').val(baseCard.text())
    baseCardEditorModal.find('#baseUnicode').val(baseCard.text().charCodeAt(0))
    //list types
    let types = model.glyphData[baseCard.text()].types;
    $('#numberOfTypes').val(types.length)
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        let numOfTypes = i + 1;
        view.addNewTypeEditor(numOfTypes)
        view.populateTypeEditor(type, numOfTypes)
    }
}

view.setUpEditModal = function (){
    let addNewTypeButton = $('#addNewTypeButton');
    addNewTypeButton.on('click', function(e){
        let numOfTypesDisplay = $('#numberOfTypes')
        numOfTypesDisplay.val(Number(numOfTypesDisplay.val())+1)
        view.addNewTypeEditor(numOfTypesDisplay.val())
    })
}

view.addNewTypeEditor = function(numOfTypes){
    let editForm = $('#editBaseForm');
    let typeEditorHtml = components.singleTypeEditor.replaceAll('NUM-PLACEHOLDER', numOfTypes);
    editForm.append(typeEditorHtml)
    let glyphInputLevel = $('#glyphinputlevel'+numOfTypes).get(0);
    view.addPasteHandler(glyphInputLevel, numOfTypes)
}

view.addPasteHandler = function (glyphInputLevel, numOfTypes){
    glyphInputLevel.addEventListener('paste', (e) => {
        e.preventDefault();
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        let listAccent = paste.trim().split(' ').map(element => element.trim()).filter(element => element.length != 0);;
        
        let listTones = ['level', 'acute', 'lower', 'rising', 'raised', 'heavy'];

        for (let j = 0; j < listAccent.length; j++) {
            const glyph = listAccent[j];
            const tone = listTones[j];
            $('#glyphinput'+tone+numOfTypes).val(glyph);
            $('#'+tone+numOfTypes).val(glyph.split('').map(char => char.charCodeAt(0)).join(','));
        
        }
    });
}

view.populateTypeEditor = function (typeData, numOfTypes){
    //populate with existing data
    let listTones = ['level', 'acute', 'lower', 'rising', 'raised', 'heavy'];
        
    for (let j = 0; j < listTones.length; j++) {
        const tone = listTones[j];
        const listGlyphPoint = typeData.accent[tone];
        if(!listGlyphPoint){continue;}
        let glyph = String.fromCharCode(...(listGlyphPoint.toString().split(',')))
        $('#glyphinput'+tone+numOfTypes).val(glyph);
        $('#'+tone+numOfTypes).val(listGlyphPoint);
    }
    if(typeData.isCap) 
        $("#isCap"+numOfTypes).prop('checked', typeData.isCap);
    if(typeData.prev){
        $("#prev"+numOfTypes).val(typeData.prev.filter(c=>c!=null).join(','))
        $("#noNeedPrev"+numOfTypes).prop('checked',typeData.prev.includes(null));
    }
    if(typeData.next){
        $("#next"+numOfTypes).val(typeData.next.filter(c=>c!=null).join(','))
        $("#noNeedNext"+numOfTypes).prop('checked',typeData.next.includes(null));
    }
}

