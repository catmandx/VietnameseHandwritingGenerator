const controller = {}

controller.doLog = false;

controller.initEditor = function(){
    controller.initLogging();
    view.init();
    model.getData(function(){
        view.render();
        if (typeof view.checkDraftOnLoad === 'function') {
            view.checkDraftOnLoad();
        }
    });
}

controller.initLogging = function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if(urlParams.has('debug')){
        controller.doLog = true;
    }
}