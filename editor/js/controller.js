const controller = {}

controller.initEditor = function(){
    view.showComponents('loading')
    model.loadJsonData();
    
}

controller.addNewBase = function(base){
    if(base.length > 3 || base.length < 1 
        // || model.glyphData.hasOwnProperty(base.toLowerCase())
        ){
        $('#newBaseCardInput').val('')
        return;
    }
    console.log('add new base', base)
    model.glyphData[base] = {};
    document.getElementById("btnCloseNewBaseModal").click();
    view.showComponents('baseList')

}