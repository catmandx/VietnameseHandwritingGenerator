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

        $result.html("<p style=\"\">" + linesResult.join("</p><p>") + "</p>")
    })
}

view.changeFontSizeInput = function () {
    var fontSizeInput = $("#font-size-input").val();
    var input = $("#input");
    var result = $("#result");
    var fontSizeSelect = $("font-size-select");
    if (isNaN(fontSizeInput) === false) {
        input.css("font-size", fontSizeInput + "pt");
        result.css("font-size", fontSizeInput + "pt");
        fontSizeSelect.val("" + fontSizeInput);
    }
}

view.changeFontSizeSelect = function () {
    var fontSizeSelect = $("#font-size-select").val();
    var input = $("#input");
    var result = $("#result");
    var fontSizeInput = $("#font-size-input");
    input.css("font-size", fontSizeSelect + "pt");
    result.css("font-size", fontSizeSelect + "pt");
    fontSizeInput.val("" + fontSizeSelect);
}

view.changeColorText = function(){
    var colorValue = document.getElementById("font-color-input");
    var input = document.getElementById("input");
    var result = document.getElementById("result");

    input.style.color = colorValue.value;
    result.style.color = colorValue.value;

}