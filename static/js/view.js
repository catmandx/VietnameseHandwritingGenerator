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

    // Preload blackboard background image
    view.blackboardImg = new Image();
    view.blackboardImg.src = '/static/img/blackboard.png';

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
    const layout = $('#board-color-select').val();
    const isBlackboard = layout === 'blackboard' || $('.board').hasClass('blackboard');
    const isWhite10x14 = layout === 'white_10x14' || $('.board').hasClass('white_10x14');
    const rawLines = $input.val().split('\n');

    if (isBlackboard) {
        // In blackboard mode, each input line gets its own blackboard slate!
        let lines = rawLines.map(l => l.replace(/[\t]/g, "    "));
        // Remove trailing empty lines if more than 1
        while (lines.length > 1 && lines[lines.length - 1].trim() === '' && lines[lines.length - 2].trim() === '') {
            lines.pop();
        }
        if (lines.length === 0) {
            lines = [''];
        }

        const linesData = lines.map(line => {
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

        view.syncBlackboards(linesData);
        view.adjustBlackboardFontSize();
    } else if (isWhite10x14) {
        let lines = rawLines.map(l => l.replace(/[\t]/g, "    "));
        while (lines.length > 1 && lines[lines.length - 1].trim() === '' && lines[lines.length - 2].trim() === '') {
            lines.pop();
        }
        if (lines.length === 0) {
            lines = [''];
        }

        const linesData = lines.map(line => {
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

        view.syncWhite10x14(linesData);
    } else {
        view.syncNormalBoard();
        const $result = $('#result');
        $result.css({ 'font-size': '', 'top': '', 'left': '', 'position': '', 'width': '', 'max-width': '', 'min-width': '', 'white-space': '' });

        const linesData = rawLines.map(rawLine => {
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
        $result.css({ 'font-size': '', 'top': '' });
    }
};

view.syncBlackboards = function (linesData) {
    const $container = $('.board-container');
    let $existingBoards = $container.children('.board.blackboard');

    // If container had normal boards (not blackboard), clean them out
    if ($container.children('.board:not(.blackboard)').length > 0) {
        $container.empty();
        $existingBoards = $();
    }

    // 1. Remove excess blackboards
    if ($existingBoards.length > linesData.length) {
        $existingBoards.slice(linesData.length).remove();
        $existingBoards = $container.children('.board.blackboard');
    }

    // 2. Add missing blackboards
    const isSmall = $('#font-size-select').val() === '36' || $('#result').hasClass('small');
    const isBold = $('#weight-checkbox').is(':checked');
    const color = $('#font-color-input').val() || '#ffd700';
    const isItalics = $('#style-checkbox').is(':checked');

    if ($existingBoards.length < linesData.length) {
        for (let i = $existingBoards.length; i < linesData.length; i++) {
            const idAttr = i === 0 ? 'id="result"' : `id="result-${i}"`;
            const $newBoard = $(`
                <div class="board blackboard ${isItalics ? 'italics' : ''}" data-board-idx="${i}">
                    <div class="grid ${isItalics ? 'italics' : ''}">
                        <div class="result-text ${isSmall ? 'small' : ''} ${isBold ? 'bold' : ''}" ${idAttr} style="color: ${color};">
                            <p class="line" id="line-${i}"></p>
                        </div>
                    </div>
                </div>
            `);
            $container.append($newBoard);
        }
        $existingBoards = $container.children('.board.blackboard');
    }

    // 3. Update each blackboard's single line
    $existingBoards.each(function (index, boardEl) {
        const $board = $(boardEl);
        $board.attr('data-board-idx', index);
        const $resultText = $board.find('.result-text, #result');
        if (index === 0) {
            $resultText.attr('id', 'result');
        } else {
            $resultText.attr('id', 'result-' + index);
        }

        let $line = $resultText.children('p.line').first();
        if (!$line.length) {
            $line = $(`<p class="line" id="line-${index}"></p>`);
            $resultText.append($line);
        }

        const lineTokens = linesData[index] || [];
        view.renderLineElement($line, lineTokens, index);
    });
};

view.syncNormalBoard = function () {
    const $container = $('.board-container');
    const $boards = $container.children('.board');

    // If multiple boards exist, or the single board is blackboard or white_10x14, replace with single normal board
    if ($boards.length !== 1 || $boards.hasClass('blackboard') || $boards.hasClass('white_10x14')) {
        $container.empty();
        const currentColor = $('#board-color-select').val() || 'black';
        const isBold = $('#weight-checkbox').is(':checked');
        const color = $('#font-color-input').val() || (currentColor === 'white' ? '#2b1055' : '#ffffff');
        const isSmall = $('#font-size-select').val() === '36';
        const isItalics = $('#style-checkbox').is(':checked');

        const $normalBoard = $(`
            <div class="board ${currentColor} ${isItalics ? 'italics' : ''}">
                <div class="grid ${isItalics ? 'italics' : ''}">
                    <div id="result" class="result-text ${isBold ? 'bold' : ''} ${isSmall ? 'small' : ''}" style="color: ${color};"></div>
                </div>
            </div>
        `);
        $container.append($normalBoard);
    }
};

view.syncWhite10x14 = function (linesData) {
    const $container = $('.board-container');
    let $existingBoards = $container.children('.board.white_10x14');

    // If container had boards that are NOT white_10x14, clean them out
    if ($container.children('.board:not(.white_10x14)').length > 0) {
        $container.empty();
        $existingBoards = $();
    }

    const isSmall = $('#font-size-select').val() === '36' || $('#result').hasClass('small');
    const isBold = $('#weight-checkbox').is(':checked');
    const color = $('#font-color-input').val() || '#2b1055';
    const isItalics = $('#style-checkbox').is(':checked');

    // 14 blocks tall: small font (1 block/line) fits 14 lines; large font (2 blocks/line) fits 7 lines
    const linesPerPage = isSmall ? 14 : 7;
    const totalPages = Math.max(1, Math.ceil(linesData.length / linesPerPage));

    // 1. Remove excess pages
    if ($existingBoards.length > totalPages) {
        $existingBoards.slice(totalPages).remove();
        $existingBoards = $container.children('.board.white_10x14');
    }

    // 2. Add missing pages
    if ($existingBoards.length < totalPages) {
        for (let p = $existingBoards.length; p < totalPages; p++) {
            const idAttr = p === 0 ? 'id="result"' : `id="result-p${p}"`;
            const $newPage = $(`
                <div class="board white white_10x14 ${isItalics ? 'italics' : ''}" data-page-idx="${p}">
                    <div class="grid ${isItalics ? 'italics' : ''}">
                        <div class="result-text ${isSmall ? 'small' : ''} ${isBold ? 'bold' : ''}" ${idAttr} style="color: ${color};"></div>
                    </div>
                </div>
            `);
            $container.append($newPage);
        }
        $existingBoards = $container.children('.board.white_10x14');
    }

    // 3. Populate lines for each page
    $existingBoards.each(function (pIdx, boardEl) {
        const $board = $(boardEl);
        $board.attr('data-page-idx', pIdx);
        if (isItalics) {
            $board.addClass('italics');
            $board.find('.grid').addClass('italics');
        } else {
            $board.removeClass('italics');
            $board.find('.grid').removeClass('italics');
        }

        const $resultText = $board.find('.result-text, #result');
        if (pIdx === 0) {
            $resultText.attr('id', 'result');
        } else {
            $resultText.attr('id', 'result-p' + pIdx);
        }

        if (isSmall) {
            $resultText.addClass('small');
        } else {
            $resultText.removeClass('small');
        }

        if (isBold) {
            $resultText.addClass('bold');
        } else {
            $resultText.removeClass('bold');
        }
        $resultText.css('color', color);

        const startLineIdx = pIdx * linesPerPage;
        const endLineIdx = Math.min(startLineIdx + linesPerPage, linesData.length);
        const pageLinesData = linesData.slice(startLineIdx, endLineIdx);

        // Manage <p class="line"> inside $resultText
        let $existingLines = $resultText.children('p.line');
        if ($existingLines.length > pageLinesData.length) {
            $existingLines.slice(pageLinesData.length).remove();
            $existingLines = $resultText.children('p.line');
        }
        if ($existingLines.length < pageLinesData.length) {
            for (let l = $existingLines.length; l < pageLinesData.length; l++) {
                const globalLineIdx = startLineIdx + l;
                const $newLine = $(`<p class="line" id="line-${globalLineIdx}"></p>`);
                $resultText.append($newLine);
            }
            $existingLines = $resultText.children('p.line');
        }

        // Render each line
        $existingLines.each(function (lIdx, lineEl) {
            const globalLineIdx = startLineIdx + lIdx;
            const $line = $(lineEl);
            $line.attr('id', 'line-' + globalLineIdx);
            view.renderLineElement($line, pageLinesData[lIdx] || [], globalLineIdx);
        });
    });
};

view.adjustBlackboardFontSize = function () {
    const $results = $('.board.blackboard .result-text, .board.blackboard #result');
    if (!$results.length) return;

    const isSmall = $('#font-size-select').val() === '36' || $results.first().hasClass('small');
    // Large font: capitalized glyphs like I are 5 cells high, normal glyphs like o are 2 cells high -> font size = 281.5px
    // Small font: capitalized glyphs like I are 2.5 cells high, normal glyphs like o are 1 cell high -> font size = 140.75px
    const finalSize = isSmall ? 140.75 : 281.5;

    // Baseline calculation:
    // Target Line 2 baseline is anchored on y = 408.05px (thick horizontal grid line).
    // In font HP001 (line-height: 1), baseline offset from top of CSS line box is ~0.769 * finalSize.
    // 281.5px: baseline offset = 216px -> top = 192px.
    // 140.75px: baseline offset = 108px -> top = 300px.
    const topPx = Math.round(408.05 - (0.769 * finalSize));
    const baselineOffset = 408.05 - topPx;

    $results.each(function () {
        this.style.setProperty('--baseline-offset', baselineOffset + 'px');
        $(this).css({
            'font-size': finalSize + 'px',
            'top': topPx + 'px'
        });
        if (isSmall) {
            $(this).addClass('small');
        } else {
            $(this).removeClass('small');
        }
    });
};

view.renderLineElement = function ($line, lineTokens, lineIndex) {
    $line.attr('id', 'line-' + lineIndex);

    // Collect existing word margins & stretch to preserve user adjustments across re-renders
    const existingMargins = [];
    const existingStretches = [];
    const existingNatWidths = [];
    $line.children('.word').each(function () {
        const ml = this.style.marginLeft;
        const stretch = $(this).attr('data-stretch');
        const natW = $(this).attr('data-natural-width');
        existingMargins.push(ml || null);
        existingStretches.push(stretch ? parseFloat(stretch) : null);
        existingNatWidths.push(natW ? parseFloat(natW) : null);
    });

    const wordTokens = lineTokens.filter(t => t.type === 'word');

    if (wordTokens.length === 0) {
        // Non-breaking space keeps the empty line height intact on the grid
        $line.empty().html('&nbsp;');
        return;
    }

    let wordIndex = 0;
    let html = '';
    for (const token of lineTokens) {
        if (token.type === 'space') {
            html += `<span class="word-space">${view.escapeHtml(token.text)}</span>`;
        } else {
            const preservedMargin = existingMargins[wordIndex];
            const preservedStretch = existingStretches[wordIndex];
            const preservedNatW = existingNatWidths[wordIndex];

            let wordStyles = [];
            if (preservedMargin) {
                wordStyles.push(`margin-left: ${preservedMargin}`);
            }
            let stretchAttr = '';
            let natWAttr = '';
            let textStyles = [];
            if (preservedStretch && preservedStretch !== 1) {
                stretchAttr = ` data-stretch="${preservedStretch}"`;
                if (preservedNatW) {
                    natWAttr = ` data-natural-width="${preservedNatW}"`;
                    wordStyles.push(`width: ${(preservedNatW * preservedStretch).toFixed(2)}px`);
                    textStyles.push(`width: ${preservedNatW}px`);
                }
                textStyles.push(`display: inline-block`, `vertical-align: baseline`, `transform: scaleX(${preservedStretch})`, `transform-origin: 0 0`);
            }
            const styleAttr = wordStyles.length ? ` style="${wordStyles.join('; ')};"` : '';
            const textStyleAttr = textStyles.length ? ` style="${textStyles.join('; ')};"` : '';

            html += `<span class="word" data-word-idx="${wordIndex}"${stretchAttr}${natWAttr}${styleAttr}>` +
                `<span class="word-handle no-print">` +
                    `<span class="btn-word-drag" title="Kéo để dịch chuyển (và các từ phía sau)"><i class="fa-solid fa-up-down-left-right"></i></span>` +
                    `<span class="btn-word-reset" title="Đặt lại vị trí ban đầu"><i class="fa-solid fa-arrow-rotate-left"></i></span>` +
                `</span>` +
                `<span class="word-text"${textStyleAttr}>${view.escapeHtml(token.text)}</span>` +
                `<span class="btn-word-stretch no-print" title="Kéo để kéo giãn chữ (Nhấp đúp để đặt lại cỡ chữ)"></span>` +
            `</span>`;
            wordIndex++;
        }
    }
    $line.empty().html(html);
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

    // 3. Update line content while preserving existing word margins and stretch
    $result.children('p.line').each(function (index, el) {
        view.renderLineElement($(el), linesData[index] || [], index);
    });
};

view.setupDragInteractions = function () {
    const $container = $('.board-container');
    let dragState = null;
    let stretchState = null;

    // Tap / click word to activate handles on touch / mobile devices
    $container.on('pointerdown click', '.word', function (e) {
        if ($(e.target).closest('.btn-word-stretch, .btn-word-drag, .btn-word-reset').length) {
            return;
        }
        $('.word.is-active').not(this).removeClass('is-active');
        $(this).addClass('is-active');
    });

    $(document).on('pointerdown click', function (e) {
        if (!$(e.target).closest('.word').length) {
            $('.word.is-active').removeClass('is-active');
        }
    });

    // Pointer down on .btn-word-drag: start dragging word
    $container.on('pointerdown', '.btn-word-drag', function (e) {
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
        const dragCfg = (window.APP_CONFIG && window.APP_CONFIG.dragPastStart) || {};
        const maxLeftDrag = dragCfg.maxLeftDragPx !== undefined ? dragCfg.maxLeftDragPx : 28.35;

        // Determine minMargin so word cannot overlap previous word, but allow dragging left past start of line up to half a cell
        let minMargin = 0;
        if (wordIdx === 0) {
            minMargin = -maxLeftDrag;
        } else {
            const $prevWord = $line.find(`.word[data-word-idx="${wordIdx - 1}"]`);
            if ($prevWord.length) {
                const prevRect = $prevWord[0].getBoundingClientRect();
                const currentRect = wordEl.getBoundingClientRect();
                const gap = currentRect.left - prevRect.right;
                minMargin = startMargin - (gap - 2);
                minMargin = Math.min(minMargin, startMargin);
            } else {
                minMargin = -maxLeftDrag;
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

        $('.word.is-active').not($word).removeClass('is-active');
        $word.addClass('is-dragging is-active');
        $('body').addClass('is-word-dragging');

        e.preventDefault();
        e.stopPropagation();
    });

    // Pointer move: update word margin-left
    function handlePointerMove(e) {
        if (!dragState) return;
        // Safety: for non-touch pointers, if pointer button is no longer down, finish drag immediately
        if (e.pointerType !== 'touch' && e.buttons !== undefined && (e.buttons & 1) === 0) {
            endDrag(e);
            return;
        }
        if (e.pointerId !== undefined && dragState.pointerId !== undefined && e.pointerId !== dragState.pointerId) {
            return;
        }

        const deltaX = e.clientX - dragState.startX;
        let newMargin = dragState.startMargin + deltaX;
        newMargin = Math.max(dragState.minMargin, newMargin);
        dragState.wordEl.style.marginLeft = Math.round(newMargin) + 'px';
    }

    $container.on('pointermove mousemove', '.btn-word-drag', handlePointerMove);
    $(window).on('pointermove mousemove', handlePointerMove);

    // Pointer up / cancel / blur: finish drag
    function endDrag(e) {
        if (!dragState) return;
        if (e && e.pointerId !== undefined && dragState.pointerId !== undefined && e.pointerId !== dragState.pointerId) {
            return;
        }

        if (dragState.handleEl && typeof dragState.handleEl.releasePointerCapture === 'function') {
            try {
                if (dragState.pointerId !== undefined) {
                    dragState.handleEl.releasePointerCapture(dragState.pointerId);
                }
            } catch (_) {}
        }

        if (dragState.$word) {
            dragState.$word.removeClass('is-dragging');
        }
        $('body').removeClass('is-word-dragging');
        dragState = null;
    }

    $(window).on('pointerup pointercancel mouseup blur', endDrag);
    $(document).on('pointerup pointercancel mouseup', endDrag);
    $container.on('lostpointercapture', '.btn-word-drag', endDrag);

    let lastStretchClick = 0;
    let lastStretchEl = null;

    // Pointer down on .btn-word-stretch: start stretching word
    $container.on('pointerdown', '.btn-word-stretch', function (e) {
        if (e.button !== undefined && e.button !== 0) return;

        const handleEl = this;
        const now = Date.now();
        if (lastStretchEl === handleEl && (now - lastStretchClick) < 400) {
            // Double-click / double-tap detected: reset stretch only back to 100%
            lastStretchClick = 0;
            lastStretchEl = null;
            const $word = $(handleEl).closest('.word');
            $word.css('width', '').removeAttr('data-stretch').removeAttr('data-natural-width');
            $word.children('.word-text').css({
                'width': '',
                'transform': ''
            });
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        lastStretchClick = now;
        lastStretchEl = handleEl;

        const $word = $(handleEl).closest('.word');
        const $wordText = $word.children('.word-text');
        const $line = $word.closest('p.line');
        const $board = $word.closest('.board');

        if (typeof handleEl.setPointerCapture === 'function') {
            try {
                handleEl.setPointerCapture(e.pointerId);
            } catch (_) {}
        }

        const cfg = (window.APP_CONFIG && window.APP_CONFIG.wordStretch) || {
            stretchTargetPercent: 121.89,
            minStretchPercent: 100,
            maxStretchPercent: 150,
            snapTolerancePercent: 2.5
        };

        const targetScale = cfg.stretchTargetPercent / 100;
        const minScale = cfg.minStretchPercent / 100;
        const maxScale = cfg.maxStretchPercent / 100;
        const snapTolerance = cfg.snapTolerancePercent / 100;

        const currentScale = parseFloat($word.attr('data-stretch')) || 1.0;
        let naturalWidth = parseFloat($word.attr('data-natural-width'));
        if (!naturalWidth) {
            const rect = $wordText[0].getBoundingClientRect();
            naturalWidth = currentScale !== 1.0 ? (rect.width / currentScale) : rect.width;
            $word.attr('data-natural-width', naturalWidth);
        }

        let $guideline = $board.find('.snap-guideline');
        if (!$guideline.length) {
            $guideline = $('<div class="snap-guideline no-print"></div>');
            $board.append($guideline);
        }

        const boardRect = $board[0].getBoundingClientRect();
        const lineRect = $line[0].getBoundingClientRect();
        const wordRect = $word[0].getBoundingClientRect();

        // Calculate snap guideline position on board (anchored at target width right edge)
        const wordStartLeftOnBoard = wordRect.left - boardRect.left + $board.scrollLeft();
        const targetSnapLeft = wordStartLeftOnBoard + (naturalWidth * targetScale);
        const lineTopOnBoard = lineRect.top - boardRect.top + $board.scrollTop();

        $guideline.css({
            top: lineTopOnBoard + 'px',
            height: lineRect.height + 'px',
            left: targetSnapLeft + 'px',
            display: 'block'
        }).removeClass('is-snapped');

        stretchState = {
            pointerId: e.pointerId,
            handleEl: handleEl,
            $word: $word,
            $wordText: $wordText,
            $stretchBtn: $(handleEl),
            $line: $line,
            $board: $board,
            $guideline: $guideline,
            naturalWidth: naturalWidth,
            currentScale: currentScale,
            startX: e.clientX,
            startWidth: naturalWidth * currentScale,
            targetScale: targetScale,
            minScale: minScale,
            maxScale: maxScale,
            snapTolerance: snapTolerance
        };

        $('.word.is-active').not($word).removeClass('is-active');
        $word.addClass('is-stretching is-active');
        $(handleEl).addClass('is-stretching');
        $('body').addClass('is-word-stretching');

        e.preventDefault();
        e.stopPropagation();
    });

    // Pointer move for stretch
    function handleStretchMove(e) {
        if (!stretchState) return;
        // Safety: for non-touch pointers, if pointer button is no longer down, finish stretch immediately
        if (e.pointerType !== 'touch' && e.buttons !== undefined && (e.buttons & 1) === 0) {
            endStretch(e);
            return;
        }
        if (e.pointerId !== undefined && stretchState.pointerId !== undefined && e.pointerId !== stretchState.pointerId) {
            return;
        }

        const deltaX = e.clientX - stretchState.startX;
        let newWidth = stretchState.startWidth + deltaX;
        let newScale = newWidth / stretchState.naturalWidth;
        newScale = Math.max(stretchState.minScale, Math.min(stretchState.maxScale, newScale));

        const isSnapped = Math.abs(newScale - stretchState.targetScale) <= stretchState.snapTolerance;
        if (isSnapped) {
            newScale = stretchState.targetScale;
            stretchState.$stretchBtn.addClass('is-snapped');
            stretchState.$guideline.addClass('is-snapped');
        } else {
            stretchState.$stretchBtn.removeClass('is-snapped');
            stretchState.$guideline.removeClass('is-snapped');
        }

        const scaledWidth = Math.round(stretchState.naturalWidth * newScale * 100) / 100;
        stretchState.$word.css('width', scaledWidth + 'px');
        stretchState.$word.attr('data-stretch', newScale.toFixed(4));
        stretchState.$wordText.css({
            'display': 'inline-block',
            'vertical-align': 'baseline',
            'width': stretchState.naturalWidth + 'px',
            'transform': 'scaleX(' + newScale + ')',
            'transform-origin': '0 0'
        });
    }

    $container.on('pointermove mousemove', '.btn-word-stretch', handleStretchMove);
    $(window).on('pointermove mousemove', handleStretchMove);

    // Pointer up for stretch
    function endStretch(e) {
        if (!stretchState) return;
        if (e && e.pointerId !== undefined && stretchState.pointerId !== undefined && e.pointerId !== stretchState.pointerId) {
            return;
        }

        if (stretchState.handleEl && typeof stretchState.handleEl.releasePointerCapture === 'function') {
            try {
                if (stretchState.pointerId !== undefined) {
                    stretchState.handleEl.releasePointerCapture(stretchState.pointerId);
                }
            } catch (_) {}
        }

        if (stretchState.$word) {
            stretchState.$word.removeClass('is-stretching');
        }
        if (stretchState.$stretchBtn) {
            stretchState.$stretchBtn.removeClass('is-stretching is-snapped');
        }
        $('body').removeClass('is-word-stretching');
        if (stretchState.$guideline) {
            stretchState.$guideline.removeClass('is-snapped').hide();
        }
        stretchState = null;
    }

    $(window).on('pointerup pointercancel mouseup blur', endStretch);
    $(document).on('pointerup pointercancel mouseup', endStretch);
    $container.on('lostpointercapture', '.btn-word-stretch', endStretch);

    // Double-click on .btn-word-stretch: reset stretch only back to 100%
    $container.on('dblclick', '.btn-word-stretch', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const $word = $(this).closest('.word');
        $word.css('width', '').removeAttr('data-stretch');
        $word.children('.word-text').css({
            'width': '',
            'transform': ''
        });
    });

    // Reset button .btn-word-reset: resets BOTH margin-left and stretch
    let lastResetTime = 0;
    $container.on('pointerdown click', '.btn-word-reset', function (e) {
        if (e.type === 'pointerdown' && e.button !== undefined && e.button !== 0) return;
        const now = Date.now();
        if (now - lastResetTime < 250) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        lastResetTime = now;
        e.stopPropagation();
        e.preventDefault();
        const $word = $(this).closest('.word');
        $word.addClass('is-active');
        $word.css({ 'margin-left': '0px', 'width': '' }).removeAttr('data-stretch');
        $word.children('.word-text').css({
            'width': '',
            'transform': ''
        });
    });

    // Double-click empty line background: reset all words on that line
    $container.on('dblclick', 'p.line', function (e) {
        if ($(e.target).closest('.word').length) return;
        $(this).find('.word').each(function () {
            this.style.marginLeft = '0px';
            this.style.width = '';
            $(this).removeAttr('data-stretch');
            $(this).children('.word-text').css({
                'width': '',
                'transform': ''
            });
        });
    });
};

view.changeFontSize = function (fontSize) {
    const $results = $('.result-text, #result');
    if (fontSize === "36") {
        $results.addClass('small');
    } else {
        $results.removeClass('small');
    }
    const layout = $('#board-color-select').val();
    const isBlackboard = layout === 'blackboard' || $('.board').hasClass('blackboard');
    const isWhite10x14 = layout === 'white_10x14' || $('.board').hasClass('white_10x14');

    if (isBlackboard) {
        view.adjustBlackboardFontSize();
    } else if (isWhite10x14) {
        view.render();
    } else {
        $results.css({ 'font-size': '', 'top': '' });
    }
};

view.changeColorText = function (color) {
    if (!color) {
        color = document.getElementById("font-color-input").value;
    }
    $('.result-text, #result').css('color', color);
    $("#font-color-input").val(color);
};

view.changeBoardColor = function (boardColor) {
    const $colorInput = $("#font-color-input");

    if (boardColor === "white") {
        view.syncNormalBoard();
        const $board = $(".board");
        $board.removeClass('blackboard black white_10x14').addClass('white');
        const paperInk = "#2b1055";
        $colorInput.val(paperInk);
        $('.result-text, #result').css({ 'color': paperInk, 'font-size': '', 'top': '', 'left': '', 'position': '', 'width': '', 'min-width': '', 'white-space': '' });
    } else if (boardColor === "white_10x14") {
        const paperInk = "#2b1055";
        $colorInput.val(paperInk);
    } else if (boardColor === "blackboard") {
        // Automatically change font size to small (36pt / 1 ô ly)
        $('#font-size-select').val('36');
        // Automatically change weight to normal instead of bold
        $('#weight-checkbox').prop('checked', false);
        // Automatically set text color to yellow
        const chalkYellow = "#ffd700";
        $colorInput.val(chalkYellow);
    } else {
        view.syncNormalBoard();
        const $board = $(".board");
        $board.removeClass('blackboard white white_10x14').addClass('black');
        const chalkWhite = "#ffffff";
        $colorInput.val(chalkWhite);
        $('.result-text, #result').css({ 'color': chalkWhite, 'font-size': '', 'top': '', 'left': '', 'position': '', 'width': '', 'min-width': '', 'white-space': '' });
    }
    view.render();
};

view.changeWeight = function (isBold) {
    if (isBold) {
        $('.result-text, #result').addClass('bold');
    } else {
        $('.result-text, #result').removeClass('bold');
    }
};

view.changeStyle = function (isItalics) {
    if (isItalics) {
        $(".grid, .board").addClass('italics');
    } else {
        $(".grid, .board").removeClass('italics');
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

view.generateFileName = function (layoutPrefix, text) {
    let cleanText = (text || '')
        .toLowerCase()
        .trim()
        .replace(/[\s\t\n]+/g, '_')
        .replace(/[/\\:*?"<>|#%&{}+,;=~`^!@$()[\].,]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

    if (!cleanText) cleanText = 'chu_dep';
    let prefix = layoutPrefix || 'blackboard';
    let base = `${prefix}_${cleanText}`;

    // Max 50 characters total including '.png' (46 chars for base)
    if (base.length > 46) {
        base = base.substring(0, 46).replace(/_+$/, '');
    }
    return base + '.png';
};

view.exportBlackboardToPng = async function () {
    const $boards = $('.board.blackboard');
    if (!$boards.length) return;

    const isBold = $('#weight-checkbox').is(':checked') || $('.result-text, #result').hasClass('bold');
    const isItalics = $('.grid').hasClass('italics') || $('.board').hasClass('italics') || $('#style-checkbox').is(':checked');
    const textColor = $('#font-color-input').val() || '#ffd700';

    // Ultra HD resolution export: 4x of A4 Landscape (3368 x 2380)
    const S = 4;
    const widthPx = 842 * S;
    const heightPx = 595 * S;
    const baselineY = 408.05 * S; // 816.1px (Line 2 baseline)
    const startX = 96.092 * S;    // 192.18px

    // Ensure custom font is ready before drawing
    if (document.fonts) {
        await document.fonts.ready;
    }

    const isSmall = $('#font-size-select').val() === '36' || $('.result-text, #result').hasClass('small');
    const domFontSize = isSmall ? 140.75 : 281.5;
    const exportFontSize = domFontSize * S;

    // Get raw input lines for file naming
    const rawInputLines = $('#input').val().split('\n').map(l => l.replace(/[\t]/g, "    ")).map(l => l.trim()).filter(l => l.length > 0);

    const exportSingleBoard = function (bgImg, boardEl, bIdx) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = widthPx;
            canvas.height = heightPx;
            const ctx = canvas.getContext('2d');

            // 1. Draw exact blackboard background
            ctx.drawImage(bgImg, 0, 0, widthPx, heightPx);

            // 2. Collect words for this board
            const $line = $(boardEl).find('p.line').first();
            const words = [];
            $line.children('.word').each(function () {
                const wordEl = this;
                const wordText = $(wordEl).find('.word-text').text() || $(wordEl).text();
                const stretch = parseFloat($(wordEl).attr('data-stretch')) || 1.0;
                words.push({
                    text: wordText,
                    offsetLeft: wordEl.offsetLeft,
                    offsetWidth: wordEl.offsetWidth,
                    stretch: stretch
                });
            });

            // Original line text for filename
            const rawLineText = rawInputLines[bIdx] || words.map(w => w.text).join(' ');

            if (words.length > 0) {
                // 3. Draw text anchored on Line 2 baseline
                ctx.save();
                if (isItalics) {
                    ctx.translate(0, baselineY);
                    ctx.transform(1, 0, -Math.tan(17 * Math.PI / 180), 1, 0, 0);
                    ctx.translate(0, -baselineY);
                }

                ctx.font = `${isBold ? 'bold' : 'normal'} ${exportFontSize}px HP001, serif`;
                ctx.fillStyle = textColor;
                ctx.textBaseline = 'alphabetic';

                words.forEach(word => {
                    const xPos = startX + (word.offsetLeft * S);
                    if (word.stretch && word.stretch !== 1.0) {
                        ctx.save();
                        ctx.translate(xPos, baselineY);
                        ctx.scale(word.stretch, 1.0);
                        ctx.fillText(word.text, 0, 0);
                        ctx.restore();
                    } else {
                        ctx.fillText(word.text, xPos, baselineY);
                    }
                });

                ctx.restore();
            }

            const fileName = view.generateFileName('blackboard', rawLineText);

            canvas.toBlob(function (blob) {
                if (!blob) {
                    resolve();
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    resolve();
                }, 200);
            }, 'image/png');
        });
    };

    const doExportAll = async function (bgImg) {
        for (let i = 0; i < $boards.length; i++) {
            await exportSingleBoard(bgImg, $boards[i], i);
            if (i < $boards.length - 1) {
                await new Promise(r => setTimeout(r, 400));
            }
        }
    };

    if (view.blackboardImg && view.blackboardImg.complete && view.blackboardImg.naturalWidth > 0) {
        await doExportAll(view.blackboardImg);
    } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async function () {
            await doExportAll(img);
        };
        img.src = '/static/img/blackboard.png';
    }
};

view.exportWhite10x14ToPng = async function () {
    const $boards = $('.board.white_10x14');
    if (!$boards.length) return;

    const isSmall = $('#font-size-select').val() === '36' || $('.board.white_10x14 .result-text, #result').hasClass('small');
    const isBold = $('#weight-checkbox').is(':checked') || $('.result-text, #result').hasClass('bold');
    const isItalics = $('.grid').hasClass('italics') || $('.board').hasClass('italics') || $('#style-checkbox').is(':checked');
    const textColor = $('#font-color-input').val() || '#2b1055';

    // Ensure custom font is ready before drawing
    if (document.fonts) {
        await document.fonts.ready;
    }

    const scale = 4; // Ultra HD resolution (4x) for crystal-clear zooming and printing
    const ptToPx = 96 / 72; // 1.3333333333333333
    const subGridPx = 14.4 * ptToPx; // 19.2px

    // Dimensions: 42 cells wide (1 + 40 + 1), 60 cells tall (2 + 56 + 2)
    const widthPx = 806.4;
    const heightPx = 1152;
    const canvasWidth = Math.round(widthPx * scale); // 3226px
    const canvasHeight = Math.round(heightPx * scale); // 4608px

    const gridOriginX = subGridPx; // 19.2px (1 cell buffer left)
    const gridOriginY = subGridPx * 2; // 38.4px (2 cells buffer top)

    const fontSizePx = (isSmall ? 37 : 72) * ptToPx;
    const lineHeightPx = (isSmall ? (subGridPx * 4) : (subGridPx * 8)); // 76.8px or 153.6px
    const firstBaselineY = gridOriginY + (isSmall ? 4 : 8) * subGridPx; // Line 1 baseline at y = 6 cells or 10 cells

    const exportSinglePage = function (boardEl, pIdx) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);

            // 1. Draw Paper Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, widthPx, heightPx);

            // 2. Draw Grid Lines (Crisp and opaque for printing)
            const majorColor = 'rgba(60, 75, 115, 0.9)';
            const minorColor = 'rgba(90, 115, 165, 0.7)';

            // Horizontal grid lines
            for (let y = 0; y <= heightPx + 0.1; y += subGridPx) {
                const k = Math.round((y - gridOriginY) / subGridPx);
                const isMajor = (k % 4 === 0);
                ctx.beginPath();
                ctx.strokeStyle = isMajor ? majorColor : minorColor;
                ctx.lineWidth = isMajor ? 2.0 : 1.0;
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
                ctx.lineWidth = isMajor ? 2.0 : 1.0;
                ctx.moveTo(x, 0);
                ctx.lineTo(x - heightPx * slantOffset, heightPx);
                ctx.stroke();
            }

            // 3. Draw Text
            ctx.save();
            if (isItalics) {
                ctx.transform(1, 0, -Math.tan(17 * Math.PI / 180), 1, 0, 0);
            }

            ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSizePx}px HP001, sans-serif`;
            ctx.fillStyle = textColor;
            ctx.textBaseline = 'alphabetic';

            const $lines = $(boardEl).find('p.line');
            const pageTexts = [];

            $lines.each(function (lIdx) {
                const yPos = firstBaselineY + (lIdx * lineHeightPx);
                const $line = $(this);
                const words = [];
                $line.children('.word').each(function () {
                    const wordEl = this;
                    const wordText = $(wordEl).find('.word-text').text() || $(wordEl).text();
                    const stretch = parseFloat($(wordEl).attr('data-stretch')) || 1.0;
                    words.push({
                        text: wordText,
                        offsetLeft: wordEl.offsetLeft,
                        offsetWidth: wordEl.offsetWidth,
                        stretch: stretch
                    });
                });

                if (words.length > 0) {
                    pageTexts.push(words.map(w => w.text).join(' '));
                }

                words.forEach(word => {
                    const xPos = gridOriginX + word.offsetLeft;
                    if (word.stretch && word.stretch !== 1.0) {
                        ctx.save();
                        ctx.translate(xPos, yPos);
                        ctx.scale(word.stretch, 1.0);
                        ctx.fillText(word.text, 0, 0);
                        ctx.restore();
                    } else {
                        ctx.fillText(word.text, xPos, yPos);
                    }
                });
            });

            ctx.restore();

            const firstText = pageTexts[0] || 'chu_dep';
            const pageSuffix = $boards.length > 1 ? `_p${pIdx + 1}` : '';
            const fileName = view.generateFileName('white_10x14' + pageSuffix, firstText);

            canvas.toBlob(function (blob) {
                if (!blob) {
                    resolve();
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    resolve();
                }, 200);
            }, 'image/png');
        });
    };

    for (let i = 0; i < $boards.length; i++) {
        await exportSinglePage($boards[i], i);
        if (i < $boards.length - 1) {
            await new Promise(r => setTimeout(r, 400));
        }
    }
};

view.exportToPng = async function () {
    const $board = $('.board');
    if ($board.hasClass('blackboard') || $('#board-color-select').val() === 'blackboard') {
        view.exportBlackboardToPng();
        return;
    }
    if ($board.hasClass('white_10x14') || $('#board-color-select').val() === 'white_10x14') {
        view.exportWhite10x14ToPng();
        return;
    }

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
            const stretch = parseFloat($(wordEl).attr('data-stretch')) || 1.0;
            lineWords.push({
                text: wordText,
                offsetLeft: wordEl.offsetLeft,
                offsetWidth: wordEl.offsetWidth,
                stretch: stretch
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

    const scale = 4; // Ultra HD resolution (4x) for crystal-clear zooming and printing
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

    // 3. Draw Grid Lines synchronized with CSS gridOrigin (Crisp and opaque for printing)
    const majorColor = isWhiteBoard ? 'rgba(60, 75, 115, 0.9)' : 'rgba(220, 220, 220, 0.7)';
    const minorColor = isWhiteBoard ? 'rgba(90, 115, 165, 0.7)' : 'rgba(200, 200, 200, 0.32)';

    // Horizontal grid lines
    const startY = gridOriginY % subGridPx;
    for (let y = startY; y <= heightPx; y += subGridPx) {
        const k = Math.round((y - gridOriginY) / subGridPx);
        const isMajor = (k % 4 === 0);
        ctx.beginPath();
        ctx.strokeStyle = isMajor ? majorColor : minorColor;
        ctx.lineWidth = isMajor ? 2.0 : 1.0;
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
        ctx.lineWidth = isMajor ? 2.0 : 1.0;
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
            if (word.stretch && word.stretch !== 1.0) {
                ctx.save();
                ctx.translate(xPos, yPos);
                ctx.scale(word.stretch, 1.0);
                ctx.fillText(word.text, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(word.text, xPos, yPos);
            }
        });
    });
    ctx.restore();

    // 5. Trigger Download
    const rawInputLines = $('#input').val().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const layout = $('#board-color-select').val();
    const fileName = view.generateFileName(layout, rawInputLines[0] || 'chu_dep');

    canvas.toBlob(function (blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
};