const view = {};

view.sampleTexts = {
    "sample1": "Nét chữ nết người",
    "sample2": "Công cha như núi Thái Sơn\nNghĩa mẹ như nước trong nguồn chảy ra\nMột lòng thờ mẹ kính cha\nCho tròn chữ hiếu mới là đạo con",
    "sample3": "Học ăn, học nói, học gói, học mở",
    "sample4": "Trường của em be bé\nNằm ở giữa rừng cây\nCô giáo em tre trẻ\nDạy em hát rất hay",
    "sample5": "a ă â b c d đ e ê g h i k l m n o ô ơ p q r s t u ư v x y\nA Ă Â B C D Đ E Ê G H I K L M N O Ô Ơ P Q R S T U Ư V X Y"
};

view.activeLine = null;

view.init = function () {
    const $input = $('#input');

    // Default text if empty
    if (!$input.val().trim()) {
        $input.val("Nét chữ nết người");
    }

    // Input listener (handles typing, paste, cut, composition IME)
    $input.on('input propertychange', function () {
        view.render();
    });

    // Font size selector
    $('#font-size-select').on('change', function () {
        view.changeFontSize(this.value);
    });

    // Font color picker
    $('#font-color-input').on('input change', function () {
        view.changeColorText(this.value);
    });

    // Board color selector
    $('#board-color-select').on('change', function () {
        view.changeBoardColor(this.value);
    });

    // Bold weight checkbox
    $('#weight-checkbox').on('change', function () {
        view.changeWeight(this.checked);
    });

    // Italic / Slant checkbox
    $('#style-checkbox').on('change', function () {
        view.changeStyle(this.checked);
    });

    // Setup floating line toolbar on the grid (never alters p.line DOM -> no jumping!)
    view.setupLineInteractions();

    // Trigger initial render
    view.render();
};

view.render = function () {
    if (!model.isLoaded) return;
    const $input = $('#input');
    const lines = $input.val().split('\n');
    const linesResult = lines.map(line => {
        const words = line.replace(/[\t]/g, "    ").split(" ");
        const result = [];
        for (const word of words) {
            result.push(model.getUnicodeStr(word));
        }
        return result.join(' ');
    });

    view.updateLines(linesResult);
};

view.updateLines = function (linesResult) {
    const $result = $('#result');
    const $existingLines = $result.children('p.line');

    // 1. Remove excess lines if text was deleted
    if ($existingLines.length > linesResult.length) {
        $existingLines.slice(linesResult.length).remove();
    }
    // 2. Add new lines if text has more lines
    else if ($existingLines.length < linesResult.length) {
        for (let i = $existingLines.length; i < linesResult.length; i++) {
            const $newLine = $('<p class="line" id="line-' + i + '"></p>');
            $result.append($newLine);
        }
    }

    // 3. Update line content while preserving existing inline margins
    $result.children('p.line').each(function (index, el) {
        const $el = $(el);
        $el.attr('id', 'line-' + index);
        const text = linesResult[index];
        if (text && text.trim().length > 0) {
            $el.text(text);
        } else {
            // Non-breaking space keeps the empty line height intact on the grid
            $el.html('&nbsp;');
        }
    });

    // Hide line toolbar if active line was removed
    if (view.activeLine && !$.contains(document, view.activeLine[0])) {
        $('#line-toolbar').hide();
        view.activeLine = null;
    }
};

view.setupLineInteractions = function () {
    const $grid = $('.grid');
    
    // Create single floating toolbar once inside .grid
    let $toolbar = $('#line-toolbar');
    if ($toolbar.length === 0) {
        $toolbar = $(`
            <div id="line-toolbar" class="line-toolbar no-print">
                <button type="button" class="btn-nudge btn-reset" title="Đặt lại vị trí ban đầu">
                    <i class="fa-solid fa-arrow-rotate-left"></i>
                </button>
                <button type="button" class="btn-nudge btn-left" title="Dịch sang trái">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <button type="button" class="btn-nudge btn-right" title="Dịch sang phải">
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `);
        $grid.append($toolbar);
    }

    let hideTimer = null;

    function positionToolbar($line) {
        if (!$line || $line.length === 0) return;
        view.activeLine = $line;
        const linePos = $line.position();
        const marginLeft = parseFloat($line.css('margin-left')) || 0;
        
        $toolbar.css({
            top: (linePos.top - 24) + 'px',
            left: (linePos.left + marginLeft + 14) + 'px',
            display: 'inline-flex'
        });
    }

    $grid.on('mouseenter', 'p.line', function () {
        if (hideTimer) clearTimeout(hideTimer);
        positionToolbar($(this));
    });

    $grid.on('mouseleave', 'p.line', function (e) {
        const toEl = e.relatedTarget;
        if ($(toEl).closest('#line-toolbar').length) return;
        hideTimer = setTimeout(() => {
            $toolbar.hide();
        }, 200);
    });

    $toolbar.on('mouseenter', function () {
        if (hideTimer) clearTimeout(hideTimer);
    });

    $toolbar.on('mouseleave', function (e) {
        const toEl = e.relatedTarget;
        if ($(toEl).closest('p.line').length) return;
        hideTimer = setTimeout(() => {
            $toolbar.hide();
        }, 200);
    });

    $toolbar.on('click', '.btn-reset', function (e) {
        e.stopPropagation();
        if (view.activeLine && view.activeLine.length) {
            view.activeLine.css('margin-left', '0px');
            positionToolbar(view.activeLine);
        }
    });

    $toolbar.on('click', '.btn-left', function (e) {
        e.stopPropagation();
        if (view.activeLine && view.activeLine.length) {
            const step = $('#result').hasClass('small') ? 4.8 : 9.6;
            const currentMargin = parseFloat(view.activeLine.css('margin-left')) || 0;
            const newMargin = currentMargin - step;
            view.activeLine.css('margin-left', newMargin + 'px');
            positionToolbar(view.activeLine);
        }
    });

    $toolbar.on('click', '.btn-right', function (e) {
        e.stopPropagation();
        if (view.activeLine && view.activeLine.length) {
            const step = $('#result').hasClass('small') ? 4.8 : 9.6;
            const currentMargin = parseFloat(view.activeLine.css('margin-left')) || 0;
            const newMargin = currentMargin + step;
            view.activeLine.css('margin-left', newMargin + 'px');
            positionToolbar(view.activeLine);
        }
    });
};

view.changeFontSize = function (fontSize) {
    const $result = $("#result");
    if (fontSize === "36") {
        $result.addClass('small');
    } else {
        $result.removeClass('small');
    }
};

view.changeColorText = function (color) {
    if (!color) {
        color = document.getElementById("font-color-input").value;
    }
    $("#result").css('color', color);
    $("#font-color-input").val(color);
};

view.changeBoardColor = function (boardColor) {
    const $board = $(".board");
    const $colorInput = $("#font-color-input");

    if (boardColor === "white") {
        $board.removeClass('black').addClass('white');
        // Default ink purple for paper
        const paperInk = "#2b1055";
        $colorInput.val(paperInk);
        $("#result").css('color', paperInk);
    } else {
        $board.removeClass('white').addClass('black');
        // Default chalk white for chalkboard
        const chalkWhite = "#ffffff";
        $colorInput.val(chalkWhite);
        $("#result").css('color', chalkWhite);
    }
};

view.changeWeight = function (isBold) {
    if (isBold) {
        $("#result").addClass('bold');
    } else {
        $("#result").removeClass('bold');
    }
};

view.changeStyle = function (isItalics) {
    if (isItalics) {
        $(".grid").addClass('italics');
    } else {
        $(".grid").removeClass('italics');
    }
};

view.loadSample = function (sampleKey) {
    if (view.sampleTexts[sampleKey]) {
        $('#input').val(view.sampleTexts[sampleKey]);
        view.render();
    }
};

view.downloadFont = function (fontType) {
    const fontFiles = {
        'normal': { file: 'HP001N30.ttf', name: 'HP001_Thuong_N30.ttf' },
        'bold': { file: 'HP001B30.ttf', name: 'HP001_Dam_B30.ttf' }
    };

    const target = fontFiles[fontType] || fontFiles['normal'];
    const link = document.createElement('a');
    link.href = '/static/font/' + target.file;
    link.download = target.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

view.exportToPng = async function () {
    const $result = $('#result');
    const isSmall = $result.hasClass('small');
    const isBold = $result.hasClass('bold');
    const isItalics = $('.grid').hasClass('italics');
    const isWhiteBoard = $('.board').hasClass('white');
    const textColor = $result.css('color') || (isWhiteBoard ? '#2b1055' : '#ffffff');

    const lines = [];
    $result.children('p.line').each(function () {
        const text = $(this).text().replace(/\u00a0/g, ' ');
        const marginLeft = parseFloat($(this).css('margin-left')) || 0;
        lines.push({ text: text, marginLeft: marginLeft });
    });

    if (lines.length === 0) {
        alert("Chưa có nội dung để xuất ảnh!");
        return;
    }

    // Ensure custom font is ready before drawing
    if (document.fonts) {
        await document.fonts.ready;
    }

    const scale = 2; // Retina sharpness
    const ptToPx = 96 / 72; // 1.3333333333333333
    const subGridPx = 14.4 * ptToPx; // 19.2px
    const bigGridPx = subGridPx * 4; // 76.8px

    const fontSizePx = (isSmall ? 37 : 72) * ptToPx;
    const lineHeightPx = (isSmall ? (36 + 14.4 * 1.5) : (72 + 14.4 * 3)) * ptToPx; // 76.8px or 153.6px

    // 1. Accurately measure the widest line
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = `${isBold ? 'bold' : 'normal'} ${fontSizePx}px HP001, sans-serif`;

    let maxLineRight = 0;
    lines.forEach(l => {
        const textW = measureCtx.measureText(l.text).width;
        const lineRight = subGridPx + l.marginLeft + textW;
        if (lineRight > maxLineRight) {
            maxLineRight = lineRight;
        }
    });

    // Grid origins matching CSS background-position: var(--grid-unit) calc(var(--grid-unit) * 2.5)
    const gridOriginX = subGridPx; // 19.2px
    const gridOriginY = subGridPx * 2.5; // 48px (shifted half cell lower)

    // Dynamic width so long text is NEVER cut off
    const minViewportWidth = Math.max(window.innerWidth || 1200, 1000);
    const slantExtra = isItalics ? 140 : 0;
    const neededWidth = Math.max(minViewportWidth, maxLineRight + bigGridPx * 2 + slantExtra);
    const widthPx = Math.ceil(neededWidth / bigGridPx) * bigGridPx;

    // First line baseline rests on major line:
    // In 72pt mode: gridOriginY + 8 sub-grids = 192px (Major line 2)
    // In 36pt mode: gridOriginY + 4 sub-grids = 115.2px (Major line 1)
    const firstBaselineY = gridOriginY + (isSmall ? 4 : 8) * subGridPx;
    const lastBaselineY = firstBaselineY + (lines.length - 1) * lineHeightPx;
    const neededHeight = lastBaselineY + bigGridPx * 2;
    const heightPx = Math.ceil(neededHeight / bigGridPx) * bigGridPx;

    const canvas = document.createElement('canvas');
    canvas.width = widthPx * scale;
    canvas.height = heightPx * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // 2. Draw Background
    if (isWhiteBoard) {
        ctx.fillStyle = '#ffffff';
    } else {
        ctx.fillStyle = '#496e53'; // Chalkboard green
    }
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 3. Draw Grid Lines synchronized with CSS gridOrigin
    const majorColor = isWhiteBoard ? 'rgba(100, 110, 140, 0.5)' : 'rgba(220, 220, 220, 0.7)';
    const minorColor = isWhiteBoard ? 'rgba(140, 160, 200, 0.28)' : 'rgba(200, 200, 200, 0.32)';

    // Horizontal grid lines
    const startY = gridOriginY % subGridPx;
    for (let y = startY; y <= heightPx; y += subGridPx) {
        const k = Math.round((y - gridOriginY) / subGridPx);
        const isMajor = (k % 4 === 0);
        ctx.beginPath();
        ctx.strokeStyle = isMajor ? majorColor : minorColor;
        ctx.lineWidth = isMajor ? 1.5 : 0.75;
        ctx.moveTo(0, y);
        ctx.lineTo(widthPx, y);
        ctx.stroke();
    }

    // Vertical grid lines (respecting slant if italics)
    const slantOffset = isItalics ? Math.tan(17 * Math.PI / 180) : 0;
    const xMin = -heightPx * slantOffset;
    const xMax = widthPx + heightPx * slantOffset;
    const startX = (gridOriginX % subGridPx) - heightPx * slantOffset;

    for (let x = startX; x <= xMax; x += subGridPx) {
        const k = Math.round((x - gridOriginX) / subGridPx);
        const isMajor = (k % 4 === 0);
        ctx.beginPath();
        ctx.strokeStyle = isMajor ? majorColor : minorColor;
        ctx.lineWidth = isMajor ? 1.5 : 0.75;
        ctx.moveTo(x, 0);
        ctx.lineTo(x - heightPx * slantOffset, heightPx);
        ctx.stroke();
    }

    // 4. Draw Text
    ctx.save();
    if (isItalics) {
        ctx.transform(1, 0, -Math.tan(17 * Math.PI / 180), 1, 0, 0);
    }

    ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSizePx}px HP001, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'alphabetic';

    lines.forEach((lineObj, idx) => {
        const yPos = firstBaselineY + (idx * lineHeightPx);
        const xPos = gridOriginX + lineObj.marginLeft;
        ctx.fillText(lineObj.text, xPos, yPos);
    });
    ctx.restore();

    // 5. Trigger Download
    canvas.toBlob(function (blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'viet-chu-dep-oly.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
};