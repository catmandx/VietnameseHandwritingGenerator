const view = {}

view.addHandler = function () {
    var $input = $('#input');
    var $result = $('#result');
    $input.on('keyup', function (e) {
        //type
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

        $result.html("<p>" + linesResult.join("</p><p>") + "</p>")
        $result.children('p').each(function(eq, el) {
            el = $(el);
            if(typeof(el.attr('id')) === "undefined") {
                el.attr('class', 'line')
                el.attr('id', 'line-' + eq);
            }
        }).on("mouseenter", function(){
            let $line = $(this)
            let menu = `<div>
            <i class="fa-solid fa-arrow-left"></i>
            <i class="fa-solid fa-hand-dots"></i>
            <i class="fa-solid fa-arrow-right"></i>
            <div>
            `
            let $menu = $.parseHTML(menu)
            
            $($menu[0]).children().eq(0).on('click', $line, function(event){
                console.log(event.data.parent())
                if(event.data.parent().hasClass('small')){
                    event.data.css('margin-left', '-=3.6pt');
                }else{
                    event.data.css('margin-left', '-=7.2pt');
                }
            })

            $($menu[0]).children().eq(2).on('click', $line, function(event){
                if(event.data.parent().hasClass('small')){
                    event.data.css('margin-left', '+=3.6pt');
                }else{
                    event.data.css('margin-left', '+=7.2pt');
                }
            })

            $($menu[0]).children().eq(1).on('click', $line, function(event){
                //drag, todo, now its just reset button
                event.data.css('margin-left', '0');
            })

            $line.append($menu)
        }).on("mouseleave", function(){
            let $line = $(this)
            $line.children('div').remove()
        })
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


function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }