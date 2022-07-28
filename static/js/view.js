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