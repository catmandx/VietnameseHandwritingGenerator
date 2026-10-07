const view = {};

view.sampleTexts = {
    "sample1": "Nét chữ nết người",
    "sample2": "Công cha như núi Thái Sơn\nNghĩa mẹ như nước trong nguồn chảy ra\nMột lòng thờ mẹ kính cha\nCho tròn chữ hiếu mới là đạo con",
    "sample3": "Học ăn, học nói, học gói, học mở",
    "sample4": "Trường của em be bé\nNằm ở giữa rừng cây\nCô giáo em tre trẻ\nDạy em hát rất hay",
    "sample5": "a ă â b c d đ e ê g h i k l m n o ô ơ p q r s t u ư v x y\nA Ă Â B C D Đ E Ê G H I K L M N O Ô Ơ P Q R S T U Ư V X Y"
};

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

    // Setup word drag interactions (drag handle at top left of word)
    view.setupDragInteractions();

    // Trigger initial render
    view.render();
};

view.escapeHtml = function (str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

view.render = function () {
    if (!model.isLoaded) return;
    const $input = $('#input');
    const rawLines = $input.val().split('\n');

    const linesData = rawLines.map(rawLine => {
        // Expand tabs to 4 spaces
        const line = rawLine.replace(/[\t]/g, "    ");
        const tokens = line.split(/(\s+)/);
        const lineTokens = [];
        for (const token of tokens) {
            if (!token) continue;
            if (/^\s+$/.test(token)) {
                lineTokens.push({ type: 'space', text: token });
            } else {
                const converted = model.getUnicodeStr(token);
                lineTokens.push({ type: 'word', text: converted, raw: token });
            }
        }
        return lineTokens;
    });

    view.updateLines(linesData);
};

view.updateLines = function (linesData) {
    const $result = $('#result');
    const $existingLines = $result.children('p.line');

    // 1. Remove excess lines if text was deleted
    if ($existingLines.length > linesData.length) {
        $existingLines.slice(linesData.length).remove();
    }
    // 2. Add new lines if text has more lines
    else if ($existingLines.length < linesData.length) {
        for (let i = $existingLines.length; i < linesData.length; i++) {
            const $newLine = $('<p class="line" id="line-' + i + '"></p>');
            $result.append($newLine);
        }
    }

    // 3. Update line content while preserving existing word margins
    $result.children('p.line').each(function (index, el) {
        const $el = $(el);
        $el.attr('id', 'line-' + index);
        const lineTokens = linesData[index] || [];

        // Collect existing word margins to preserve user adjustments across re-renders
        const existingMargins = [];
        $el.children('.word').each(function () {
            const ml = this.style.marginLeft;
            existingMargins.push(ml || null);
        });

        const wordTokens = lineTokens.filter(t => t.type === 'word');

        if (wordTokens.length === 0) {
            // Non-breaking space keeps the empty line height intact on the grid
            $el.empty().html('&nbsp;');
            return;
        }

        let wordIndex = 0;
        let html = '';
        for (const token of lineTokens) {
            if (token.type === 'space') {
                html += `<span class="word-space">${view.escapeHtml(token.text)}</span>`;
            } else {
                const preserved = existingMargins[wordIndex];
                const styleAttr = preserved ? ` style="margin-left: ${preserved};"` : '';
                html += `<span class="word" data-word-idx="${wordIndex}"${styleAttr}>` +
                    `<span class="word-handle no-print">` +
                        `<span class="btn-word-drag" title="Kéo để dịch chuyển (và các từ phía sau)"><i class="fa-solid fa-up-down-left-right"></i></span>` +
                        `<span class="btn-word-reset" title="Đặt lại vị trí ban đầu"><i class="fa-solid fa-arrow-rotate-left"></i></span>` +
                    `</span>` +
                    `<span class="word-text">${view.escapeHtml(token.text)}</span>` +
                `</span>`;
                wordIndex++;
            }
        }
        $el.empty().html(html);
    });
};

view.setupDragInteractions = function () {
    const $result = $('#result');
    let dragState = null;

    // Pointer down on .btn-word-drag: start dragging word
    $result.on('pointerdown', '.btn-word-drag', function (e) {
        if (e.button !== undefined && e.button !== 0) return;

        const handleEl = this;
        const $word = $(handleEl).closest('.word');
        const wordEl = $word[0];
        const $line = $word.closest('p.line');
        const wordIdx = parseInt($word.attr('data-word-idx'), 10) || 0;

        if (typeof handleEl.setPointerCapture === 'function') {
            try {
                handleEl.setPointerCapture(e.pointerId);
            } catch (_) {}
        }

        const startMargin = parseFloat(wordEl.style.marginLeft) || 0;

        // Determine minMargin so word cannot overlap previous word or go beyond line origin
        let minMargin = 0;
        if (wordIdx === 0) {
            minMargin = 0;
        } else {
            const $prevWord = $line.find(`.word[data-word-idx="${wordIdx - 1}"]`);
            if ($prevWord.length) {
                const prevRect = $prevWord[0].getBoundingClientRect();
                const currentRect = wordEl.getBoundingClientRect();
                const gap = currentRect.left - prevRect.right;
                minMargin = startMargin - (gap - 2);
                minMargin = Math.min(minMargin, startMargin);
            } else {
                minMargin = 0;
            }
        }

        dragState = {
            pointerId: e.pointerId,
            handleEl: handleEl,
            wordEl: wordEl,
            $word: $word,
            startX: e.clientX,
            startMargin: startMargin,
            minMargin: minMargin
        };

        $word.addClass('is-dragging');
        $('body').addClass('is-word-dragging');

        e.preventDefault();
        e.stopPropagation();
    });

    // Pointer move: update word margin-left
    function handlePointerMove(e) {
        if (!dragState || dragState.pointerId !== e.pointerId) return;

        const deltaX = e.clientX - dragState.startX;
        let newMargin = dragState.startMargin + deltaX;
        newMargin = Math.max(dragState.minMargin, newMargin);
        dragState.wordEl.style.marginLeft = Math.round(newMargin) + 'px';
    }

    $result.on('pointermove', '.btn-word-drag', handlePointerMove);
    $(window).on('pointermove', handlePointerMove);

    // Pointer up / cancel: finish drag
    function endDrag(e) {
        if (!dragState || dragState.pointerId !== e.pointerId) return;

        if (typeof dragState.handleEl.releasePointerCapture === 'function') {
            try {
                dragState.handleEl.releasePointerCapture(e.pointerId);
            } catch (_) {}
        }

        dragState.$word.removeClass('is-dragging');
        $('body').removeClass('is-word-dragging');
        dragState = null;
    }

    $(window).on('pointerup pointercancel', endDrag);

    // Reset icon click: reset word margin to 0
    $result.on('click', '.btn-word-reset', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const $word = $(this).closest('.word');
        $word.css('margin-left', '0px');
    });

    // Double-click empty line background: reset all words on that line
    $result.on('dblclick', 'p.line', function (e) {
        if ($(e.target).closest('.word').length) return;
        $(this).find('.word').each(function () {
            this.style.marginLeft = '0px';
        });
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
        const $line = $(this);
        const lineWords = [];
        $line.children('.word').each(function () {
            const wordEl = this;
            const wordText = $(wordEl).find('.word-text').text() || $(wordEl).text();
            lineWords.push({
                text: wordText,
                offsetLeft: wordEl.offsetLeft,
                offsetWidth: wordEl.offsetWidth
            });
        });
        lines.push({
            words: lineWords
        });
    });

    if (lines.length === 0 || !lines.some(l => l.words.length > 0)) {
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
        l.words.forEach(w => {
            const textW = Math.max(w.offsetWidth, measureCtx.measureText(w.text).width);
            const wordRight = subGridPx + w.offsetLeft + textW;
            if (wordRight > maxLineRight) {
                maxLineRight = wordRight;
            }
        });
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
        lineObj.words.forEach(word => {
            const xPos = gridOriginX + word.offsetLeft;
            ctx.fillText(word.text, xPos, yPos);
        });
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