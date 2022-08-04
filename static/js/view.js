const view = {}

view.addHandler = function () {
    var $input = $('#input');
    var $result = $('#result');
    $input.on('keyup', function (e) {
        let lines = $input.val().split('\n');
        let linesResult = lines.map(input => {
            let words = input.replace(/[\s]/g, " ").split(" ");
            let result = []
            for (const word of words) {
                let unicodeWord = model.getUnicodeStr(word);
                result.push(unicodeWord)
            }
            return result.join(' ');
        });
        let $lines = $result.children('p');
        view.addOrRemoveLines($lines, linesResult)
        view.addLineHandler($result)
        view.populateResult(linesResult)
    })
}

view.changeFontSize = function (input){
    var fontSize = input.value;
    switch (fontSize) {
        case "36":
            $("#result").addClass('small')
            $("#result > p").addClass('small')
            break;
        case "72":
        default:
            $("#result").removeClass('small')
            $("#result > p").removeClass('small')
            break;
    }
}

view.changeColorText = function(){
    var colorValue = document.getElementById("font-color-input");
    var input = document.getElementById("input");
    var result = document.getElementById("result");

    input.style.color = colorValue.value;
    result.style.color = colorValue.value;

}

view.changeBoardColor = function(input) {
    var boardColor = input.value;
    switch (boardColor) {
        case "white":
            $(".board").removeClass('black')
            $(".board").addClass('white')
            break;
        case "black":
        default:
            $(".board").removeClass('white')
            $(".board").addClass('black')
            break;
    }
}

view.changeWeight = function(input){
    var isBold = input.checked;
    if(isBold){
        $("#result").addClass('bold')
    }else{
        $("#result").removeClass('bold')
    }
}

view.changeStyle = function(input){
    var isItalics = input.checked;
    if(isItalics){
        $(".grid").addClass('italics')
    }else{
        $(".grid").removeClass('italics')
    }
}

view.addLineHandler = function($result) {
    $result.children('p').each(function(eq, el) {
        el = $(el);
        if(typeof(el.attr('id')) === "undefined") {
            el.attr('class', 'line')
            el.attr('id', 'line-' + eq);
        }
    }).on("mouseenter", function(){
        let $line = $(this)
        if($line.is(':empty')){
            return
        }
        let menu = `<div>
        <i class="fa-solid fa-arrow-rotate-left"></i>
        <i class="fa-solid fa-arrow-left"></i>
        <i class="fa-solid fa-hand-dots"></i>
        <i class="fa-solid fa-arrow-right"></i>
        <div>
        `
        let $menu = $.parseHTML(menu)
        
        $($menu[0]).children().eq(0).on('click', $line, function(event){
            //reset button
            event.data.css('margin-left', '0');
        })

        $($menu[0]).children().eq(1).on('click', $line, function(event){
            console.log(event.data.parent())
            if(event.data.parent().hasClass('small')){
                event.data.css('margin-left', '-=3.6pt');
            }else{
                event.data.css('margin-left', '-=7.2pt');
            }
        })

        $($menu[0]).children().eq(3).on('click', $line, function(event){
            if(event.data.parent().hasClass('small')){
                event.data.css('margin-left', '+=3.6pt');
            }else{
                event.data.css('margin-left', '+=7.2pt');
            }
        })

        $($menu[0]).children().eq(2).on('mousedown', $line, function(event){
            //drag, todo, now its just reset button
            event.data.addClass('dragging');
            if(!event.data.attr('x-cord')){
                event.data.attr('x-cord', event.pageX)
            }
        })

        $(document.body).on('mouseup', $line, function(event){
            $('.dragging').removeClass('dragging');
        })

        $(document.body).on('mousemove', function(event){
            $line = $('.dragging')
            if($line){
                let origX = $line.attr('x-cord');
                $line.css("margin-left", event.pageX - origX);
            }
        })

        $line.append($menu)
    }).on("mouseleave", function(){
        let $line = $(this)
        $line.children('div').remove()
    })
}

view.addOrRemoveLines = function($lines, linesResult){
    if($lines.length == linesResult.length){
        return
    }
    if ($lines.length > linesResult.length){
        $lines.children('p').each(function(eq,el){
            if(eq > (linesResult.length - 1)){
                $(el).remove()
            }
        })
    }else{
        for (let i = 0; i < linesResult.length - $lines.length; i++) {
            $('#result').append('<p></p>')
        }
    }
}

view.populateResult = function(linesResult){
    $('#result').children('p').each(function(eq, el){
        $(el).text(linesResult[eq])
    })
}