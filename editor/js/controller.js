const controller = {}

controller.initEditor = function(){
    view.showComponents('loading')
    model.loadJsonData();
    
}

controller.addNewBase = function(base){
    base = (base || '').trim();
    if (base.length > 3 || base.length < 1){
        $('#newBaseCardInput').val('');
        return;
    }
    console.log('add new base', base);
    if (!model.glyphData) model.glyphData = {};
    if (!model.glyphData[base]) {
        model.glyphData[base] = { types: [] };
    }
    const closeBtn = document.getElementById("btnCloseNewBaseModal");
    if (closeBtn) closeBtn.click();
    view.showComponents('baseList');
}