/**
 * Cham.jsx - Adobe Illustrator ExtendScript
 *
 * Script to duplicate start-point guide dots (or selected elements)
 * across lines and blocks for handwriting practice worksheets (tập viết ô ly).
 */

var scriptName = 'Cham',
settingFile = {
    name: scriptName + '__setting.json',
    folder: Folder.myDocuments + '/LA_AI_Scripts/'
};

var isSuccess = false,
win = new Window('dialog', scriptName, undefined);
win.orientation = 'column';
win.alignChildren = 'fill';

var panel = win.add('panel', undefined, 'Cách chấm');
panel.orientation = 'column';
panel.alignChildren = 'fill';
panel.margins = 20;

var group1 = panel.add('group');
group1.orientation = 'row';
group1.alignChildren = 'center';
var caption = group1.add('statictext', undefined, 'Cỡ giấy:');
var bigSelection = group1.add('radiobutton', undefined, 'To');
var smallSelection = group1.add('radiobutton', undefined, 'Bé');
smallSelection.value = true;

var group2 = panel.add('group');
group2.orientation = 'row';
group2.alignChildren = ['fill', 'fill'];

var group2X = group2.add('group');
group2X.orientation = 'column';
group2X.alignChildren = 'left';
var caption2 = group2X.add('statictext', undefined, 'Số dòng:'),
numOfLineInput = group2X.add('edittext', [0, 0, 80, 25], 1);

var group2Y = group2.add('group');
group2Y.orientation = 'column';
group2Y.alignChildren = 'left';
var caption2Y = group2Y.add('statictext', undefined, 'Khoảng cách:'),
spacesInput = group2Y.add('edittext', [0, 0, 80, 25], 0);
spacesInput.helpTip = 'Khoảng cách giữa 2 chấm liền nhau trên cùng dòng';

var groupCheckbox = panel.add('group');
groupCheckbox.orientation = 'column';
groupCheckbox.alignChildren = 'left';
var deleteCheckbox = groupCheckbox.add('checkbox', undefined, 'Xoá phần chọn'),
fullDotCheckbox = groupCheckbox.add('checkbox', [0, 0, 150, 20], 'Chấm hết.');
fullDotCheckbox.helpTip = 'BỎ CHỌN sẽ chấm chỉ dòng 1 và các đầu dòng tiếp theo.';

deleteCheckbox.value = true;
fullDotCheckbox.value = true;

var preview = win.add('checkbox', undefined, 'Preview');

var winButtons = win.add('group');
winButtons.orientation = 'row';
winButtons.alignChildren = ['fill', 'fill'];
winButtons.margins = 0;

var cancel = winButtons.add('button', undefined, 'Cancel');
cancel.helpTip = 'Press Esc to Close';
cancel.onClick = function () { win.close(); };

var ok = winButtons.add('button', undefined, 'OK');
ok.helpTip = 'Hoặc nhấn Enter';
ok.onClick = function() {
    startAction();
    if (isSuccess) { win.close(); }
};
ok.active = true;
win.center();
win.show();

function startAction(){
    if (smallSelection.value) {
        var size = [14, 20];
    } else if (bigSelection.value) {
        var size = [17, 27];
    }
    
    var numOfLine = parseInt(numOfLineInput.text);
    var spaces = parseInt(spacesInput.text);
    if (size != undefined && numOfLine != undefined && spaces != undefined 
    && ((numOfLine < 14 && bigSelection.value)
    || (numOfLine < 11 && smallSelection.value))) {
        var numIn1Line = parseInt((size[0] + 1) / spaces);
        var doc = app.activeDocument;
        var sel = doc.selection;
        for (var i = 0; i < numOfLine; i++) {
            for (var j = 0; j < numIn1Line; j++) {
                if (i == 0 && j == 0) {
                    // empty - skip origin (handled by duplicate / delete logic)
                } else if (((i == 0 || j == 0) && !fullDotCheckbox.value) || fullDotCheckbox.value) {
                    for (var k = 0; k < sel.length; k++) {
                        var obj = sel[k].duplicate();
                        obj.selected = false;
                        var pos = obj.position;
                        obj.position = [pos[0] + j * 28.3465 * spaces, pos[1] - i * 56.693];
                    }
                }
            }
        }

        if (deleteCheckbox.value) {
            for (var i = sel.length - 1; i > -1; i--) {
                var obj = sel[i];
                obj.remove();
            }
        }
        isSuccess = true;
    } else {
        alert("Nhớ nhập đúng format, kích cỡ và số dòng!");
    }
}

function throwException(ex){
    var message;
    switch(ex){
        case 1:
            message = 'Nhiều dòng quá';
            break;
        case 2:
            message = 'Khoảng cách phải lớn hơn 1';
            break;
    }
}
