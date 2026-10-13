const view = {};
window.view = view;
view.lineDotConfigs = {};
view.resetLineDotConfigs = function () {
    view.lineDotConfigs = {};
    if ($('#dotting-line-select').length) {
        $('#dotting-line-select').val('all');
        $('#btn-reset-line-dotting').hide();
    }
};

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
        view.resetLineDotConfigs();
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

    // Dotting controls listeners
    $('#dotting-checkbox').on('change', function () {
        if (this.checked) {
            $('#dotting-options').show();
            view.updateDottingLineSelect();
            view.updateDottingControlsState();
        } else {
            $('#dotting-options').hide();
        }
        view.render();
    });

    $('#dotting-line-select').on('change', function () {
        const val = this.value;
        if (val === 'all') {
            const globalCfg = view.getDottingConfig();
            $('#dotting-spaces-input').val(globalCfg.spaces);
            $('#dotting-reps-input').val(globalCfg.repetitions);
            $('#dotting-fulldot-checkbox').prop('checked', globalCfg.fullDot);
            $('#btn-reset-line-dotting').hide();
        } else {
            const lineIdx = parseInt(val, 10);
            const cfg = view.getDottingConfig(lineIdx);
            $('#dotting-spaces-input').val(cfg.spaces);
            $('#dotting-reps-input').val(cfg.repetitions);
            $('#dotting-fulldot-checkbox').prop('checked', cfg.fullDot);
            if (view.lineDotConfigs[lineIdx] && view.lineDotConfigs[lineIdx].isCustom) {
                $('#btn-reset-line-dotting').show();
            } else {
                $('#btn-reset-line-dotting').hide();
            }
        }
        view.updateDottingControlsState();
    });

    $('#btn-reset-line-dotting').on('click', function () {
        const val = $('#dotting-line-select').val();
        if (val !== 'all') {
            const lineIdx = parseInt(val, 10);
            delete view.lineDotConfigs[lineIdx];
            view.updateDottingLineSelect();
            $('#dotting-line-select').val(val).trigger('change');
            view.render();
        }
    });

    $('#dotting-spaces-input').on('input change', function () {
        let val = parseInt(this.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 10) val = 10;
        this.value = val;

        const selectedLine = $('#dotting-line-select').val();
        if (selectedLine && selectedLine !== 'all') {
            const lineIdx = parseInt(selectedLine, 10);
            if (!view.lineDotConfigs[lineIdx]) view.lineDotConfigs[lineIdx] = {};
            view.lineDotConfigs[lineIdx].spaces = val;
            view.lineDotConfigs[lineIdx].isCustom = true;
            $('#btn-reset-line-dotting').show();
        }
        view.updateDottingControlsState();
        view.render();
        view.updateDottingLineSelect();
    });

    $('#dotting-reps-input').on('input change', function () {
        let val = parseInt(this.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 50) val = 50;
        this.value = val;

        const selectedLine = $('#dotting-line-select').val();
        if (selectedLine && selectedLine !== 'all') {
            const lineIdx = parseInt(selectedLine, 10);
            if (!view.lineDotConfigs[lineIdx]) view.lineDotConfigs[lineIdx] = {};
            view.lineDotConfigs[lineIdx].repetitions = val;
            view.lineDotConfigs[lineIdx].isCustom = true;
            $('#btn-reset-line-dotting').show();
        }
        view.render();
    });

    $('#dotting-lines-input').on('input change', function () {
        let val = parseInt(this.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 30) val = 30;
        this.value = val;
        view.render();
        view.updateDottingLineSelect();
    });

    $('#dotting-fulldot-checkbox').on('change', function () {
        const selectedLine = $('#dotting-line-select').val();
        if (selectedLine && selectedLine !== 'all') {
            const lineIdx = parseInt(selectedLine, 10);
            if (!view.lineDotConfigs[lineIdx]) view.lineDotConfigs[lineIdx] = {};
            view.lineDotConfigs[lineIdx].fullDot = this.checked;
            view.lineDotConfigs[lineIdx].isCustom = true;
            $('#btn-reset-line-dotting').show();
        }
        view.render();
    });

    $('#dotting-color-input').on('input change', function () {
        view.render();
    });

    view.updateDottingControlsState();
    view.updateDottingLineSelect();

    // Trigger initial render
    view.render();
};

view.isDottingActive = function () {
    const rawVal = $('#input').val() || '';
    const hasAnyText = rawVal.trim().length > 0;
    if (!hasAnyText) return false;
    return $('#dotting-checkbox').is(':checked');
};

view.getDottingConfig = function (lineIndex) {
    const enabled = view.isDottingActive();
    const layout = $('#board-color-select').val();
    const isBlackboard = (layout === 'blackboard');
    const isWhite11x14 = (layout === 'white_11x14' || layout === 'white_10x14');

    const globalSpaces = Math.max(1, parseInt($('#dotting-spaces-input').val(), 10) || 2);
    const globalLinesCount = Math.max(1, parseInt($('#dotting-lines-input').val(), 10) || 1);
    const globalFullDot = $('#dotting-fulldot-checkbox').is(':checked');
    const color = $('#dotting-color-input').val() || '#e53935';

    let globalReps;
    if (isWhite11x14) {
        globalReps = Math.min(11, Math.max(1, Math.floor(12 / globalSpaces)));
    } else if (isBlackboard) {
        globalReps = Math.min(3, Math.max(1, Math.floor(4 / globalSpaces)));
    } else {
        globalReps = Math.max(1, parseInt($('#dotting-reps-input').val(), 10) || 5);
    }

    if (lineIndex !== undefined && lineIndex !== null && view.lineDotConfigs && view.lineDotConfigs[lineIndex]) {
        const lineCfg = view.lineDotConfigs[lineIndex];
        const spaces = lineCfg.spaces !== undefined ? lineCfg.spaces : globalSpaces;
        let reps;
        if (isWhite11x14) {
            reps = Math.min(11, Math.max(1, Math.floor(12 / spaces)));
        } else if (isBlackboard) {
            reps = Math.min(3, Math.max(1, Math.floor(4 / spaces)));
        } else {
            reps = lineCfg.repetitions !== undefined ? lineCfg.repetitions : globalReps;
        }
        const fullDot = lineCfg.fullDot !== undefined ? lineCfg.fullDot : globalFullDot;

        return {
            enabled: enabled,
            spaces: spaces,
            repetitions: reps,
            linesCount: globalLinesCount,
            fullDot: fullDot,
            color: color,
            isBlackboard: isBlackboard,
            isWhite11x14: isWhite11x14,
            isCustom: !!lineCfg.isCustom
        };
    }

    return {
        enabled: enabled,
        spaces: globalSpaces,
        repetitions: globalReps,
        linesCount: globalLinesCount,
        fullDot: globalFullDot,
        color: color,
        isBlackboard: isBlackboard,
        isWhite11x14: isWhite11x14,
        isCustom: false
    };
};

view.updateDottingControlsState = function () {
    const layout = $('#board-color-select').val();
    const isBlackboard = (layout === 'blackboard');
    const isWhite11x14 = (layout === 'white_11x14' || layout === 'white_10x14');

    const selectedLine = $('#dotting-line-select').val();
    let spaces, reps;

    if (selectedLine && selectedLine !== 'all') {
        const lineIdx = parseInt(selectedLine, 10);
        const cfg = view.getDottingConfig(lineIdx);
        spaces = cfg.spaces;
        reps = cfg.repetitions;
        if (view.lineDotConfigs[lineIdx] && view.lineDotConfigs[lineIdx].isCustom) {
            $('#btn-reset-line-dotting').show();
        } else {
            $('#btn-reset-line-dotting').hide();
        }
    } else {
        spaces = Math.max(1, parseInt($('#dotting-spaces-input').val(), 10) || 2);
        $('#btn-reset-line-dotting').hide();
    }

    const $repsInput = $('#dotting-reps-input');
    const $repsBadge = $('#dotting-reps-badge');

    if (isWhite11x14) {
        const autoReps = Math.min(11, Math.max(1, Math.floor(12 / spaces)));
        $repsInput.val(autoReps).prop('disabled', true);
        $repsBadge.text(`Tự động: ${autoReps}`).attr('title', 'Tính tự động theo chiều rộng 11 ô của trang');
    } else if (isBlackboard) {
        const autoReps = Math.min(3, Math.max(1, Math.floor(4 / spaces)));
        $repsInput.val(autoReps).prop('disabled', true);
        $repsBadge.text(`Tự động: ${autoReps}`).attr('title', 'Tính tự động theo chiều rộng 3 ô của bảng con');
    } else {
        $repsInput.prop('disabled', false);
        $repsBadge.text('Tự do').attr('title', 'Tự do chọn số chấm lặp trên dòng vô hạn');
        if (reps !== undefined) {
            $repsInput.val(reps);
        }
    }
};

view.updateDottingLineSelect = function () {
    const $select = $('#dotting-line-select');
    if (!$select.length) return;
    const currentVal = $select.val() || 'all';

    const rawLines = ($('#input').val() || '').split('\n');
    const hasAnyText = ($('#input').val() || '').trim().length > 0;

    let html = '<option value="all">Tất cả các dòng</option>';
    if (hasAnyText) {
        for (let i = 0; i < rawLines.length; i++) {
            const lineText = (rawLines[i] || '').trim();
            if (!lineText) {
                continue; // Only track lines that have text, ignore empty lines
            }
            const customCfg = view.lineDotConfigs[i];
            const cfg = view.getDottingConfig(i);
            const customBadge = (customCfg && customCfg.isCustom) ? ` [Cách ${cfg.spaces} ô]` : '';
            const preview = ` "${lineText.slice(0, 15)}${lineText.length > 15 ? '...' : ''}"`;
            html += `<option value="${i}">Dòng ${i + 1}${customBadge}:${preview}</option>`;
        }
    }
    $select.html(html);

    if ($select.find(`option[value="${currentVal}"]`).length) {
        $select.val(currentVal);
    } else {
        $select.val('all');
    }
};

view.renderDotsForLine = function ($line, lineTokens, lineIndex, config) {
    if (!config) config = view.getDottingConfig(lineIndex);
    const hasAnyText = ($('#input').val() || '').trim().length > 0;
    if (!config.enabled || !hasAnyText) {
        $line.find('.guide-dots-layer').remove();
        return;
    }

    $line.find('.guide-dots-layer').remove();

    // 1. Check if this line has text
    let wordTokens = (lineTokens || []).filter(t => t.type === 'word');
    if (wordTokens.length === 0) {
        const domWords = $line.children('.word');
        if (domWords.length > 0) {
            wordTokens = Array.from(domWords).map(w => ({ type: 'word', text: $(w).find('.word-text').text() || $(w).text() }));
        }
    }
    const hasText = wordTokens.length > 0;

    // If this line does not have text, it is an empty practice line: only draw if lineIndex < config.linesCount
    if (!hasText && lineIndex >= config.linesCount) {
        return;
    }

    // Identify glyph character unit for this line
    let charUnit = null;
    if (hasText) {
        const rawOrText = wordTokens[0].raw || wordTokens[0].text;
        charUnit = model.getFirstCharUnit(rawOrText);
    } else {
        // Line is empty, look up preceding line with text or textarea
        let found = null;
        for (let i = lineIndex - 1; i >= 0; i--) {
            const $prevLine = $(`#line-${i}`);
            if ($prevLine.length) {
                const $prevWord = $prevLine.children('.word').first();
                if ($prevWord.length) {
                    const text = $prevWord.find('.word-text').text() || $prevWord.text();
                    if (text && text.trim()) {
                        found = model.getFirstCharUnit(text);
                        break;
                    }
                }
            }
        }
        if (!found) {
            const rawInputLines = $('#input').val().split('\n').map(l => l.trim()).filter(l => l.length > 0);
            found = rawInputLines.length > 0 ? model.getFirstCharUnit(rawInputLines[0].split(/\s+/)[0]) : 'a';
        }
        charUnit = found;
    }

    const startPoint = model.getGlyphStartPoint(charUnit);

    // 2. Determine geometry units
    const isSmall = $('#font-size-select').val() === '36' || $line.closest('.result-text').hasClass('small') || $('#result').hasClass('small');
    const isBlackboard = config.isBlackboard;

    let olyUnitPx, blockWidth, dotSizePx;
    if (isBlackboard) {
        olyUnitPx = isSmall ? 28.15 : 56.3;
        blockWidth = 225.2;
        dotSizePx = isSmall ? 8 : 14;
    } else {
        olyUnitPx = isSmall ? 9.6 : 19.2;
        blockWidth = 76.8;
        dotSizePx = isSmall ? 5 : 7;
    }

    // 3. Measure baseline Y inside $line
    let baselineY = 0;
    const $probe = $('<span style="display:inline-block;vertical-align:baseline;width:0;height:0;visibility:hidden;pointer-events:none;"></span>');
    $line.append($probe);
    baselineY = $probe[0].offsetTop;
    $probe.remove();

    if (baselineY <= 0) {
        if (isBlackboard) {
            baselineY = isSmall ? 108.75 : 216.75;
        } else {
            baselineY = isSmall ? 58.2 : 115.95;
        }
    }

    const dotY = baselineY - (startPoint.y * olyUnitPx);

    // 4. Measure start X (accounting for word stretch!)
    let startX0 = 0;
    const $firstWord = $line.children('.word').first();
    if ($firstWord.length) {
        const stretch = parseFloat($firstWord.attr('data-stretch')) || 1.0;
        startX0 = $firstWord[0].offsetLeft + (startPoint.x * olyUnitPx * stretch);
    } else {
        // On empty line, align with preceding line with words if possible
        let foundWordOffset = null;
        let foundWordStretch = 1.0;
        for (let i = lineIndex - 1; i >= 0; i--) {
            const $prevWord = $(`#line-${i}`).children('.word').first();
            if ($prevWord.length) {
                foundWordOffset = $prevWord[0].offsetLeft;
                foundWordStretch = parseFloat($prevWord.attr('data-stretch')) || 1.0;
                break;
            }
        }
        if (foundWordOffset !== null) {
            startX0 = foundWordOffset + (startPoint.x * olyUnitPx * foundWordStretch);
        } else {
            const $line0Word = $('#line-0').children('.word').first();
            if ($line0Word.length) {
                const l0Stretch = parseFloat($line0Word.attr('data-stretch')) || 1.0;
                startX0 = $line0Word[0].offsetLeft + (startPoint.x * olyUnitPx * l0Stretch);
            } else {
                startX0 = startPoint.x * olyUnitPx;
            }
        }
    }

    // 5. Build guide dots
    const $dotsLayer = $('<div class="guide-dots-layer"></div>');
    for (let j = 0; j < config.repetitions; j++) {
        // Line with text is a model line: ALWAYS draw all dots for that line!
        // Empty line is a practice line: draw all dots if fullDot is true, else only j === 0
        if (hasText || config.fullDot || j === 0) {
            const dotX = startX0 + (j * blockWidth * config.spaces);
            const $dot = $('<span class="guide-dot"></span>').css({
                left: dotX + 'px',
                top: dotY + 'px',
                width: dotSizePx + 'px',
                height: dotSizePx + 'px',
                backgroundColor: config.color
            });
            $dotsLayer.append($dot);
        }
    }
    $line.append($dotsLayer);
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
    const isBlackboard = (layout === 'blackboard');
    const isWhite11x14 = (layout === 'white_11x14' || layout === 'white_10x14');
    let rawLines = $input.val().split('\n');

    const hasAnyText = $input.val().trim().length > 0;
    const dotConfig = view.getDottingConfig();
    if (dotConfig && dotConfig.enabled && hasAnyText && dotConfig.linesCount > rawLines.length) {
        while (rawLines.length < dotConfig.linesCount) {
            rawLines.push('');
        }
    }

    if (isBlackboard) {
        // In blackboard mode, each input line gets its own blackboard slate!
        let lines = rawLines.map(l => l.replace(/[\t]/g, "    "));
        // Remove trailing empty lines if more than 1 (unless dotting is active)
        if (!dotConfig.enabled) {
            while (lines.length > 1 && lines[lines.length - 1].trim() === '' && lines[lines.length - 2].trim() === '') {
                lines.pop();
            }
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
    } else if (isWhite11x14) {
        let lines = rawLines.map(l => l.replace(/[\t]/g, "    "));
        if (!dotConfig.enabled) {
            while (lines.length > 1 && lines[lines.length - 1].trim() === '' && lines[lines.length - 2].trim() === '') {
                lines.pop();
            }
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

        view.syncWhite11x14(linesData);
    } else {
        view.syncNormalBoard();
        const $result = $('#result');
        $result.css({ 'font-size': '', 'top': '', 'left': '', 'position': '', 'width': '', 'max-width': '', 'min-width': '', 'white-space': '' });

        let lines = rawLines.map(l => l.replace(/[\t]/g, "    "));
        if (!dotConfig.enabled) {
            while (lines.length > 1 && lines[lines.length - 1].trim() === '' && lines[lines.length - 2].trim() === '') {
                lines.pop();
            }
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

        view.updateLines(linesData);
        $result.css({ 'font-size': '', 'top': '' });
    }
    view.updateDottingLineSelect();
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

    // If multiple boards exist, or the single board is blackboard or white_11x14/white_10x14, replace with single normal board
    if ($boards.length !== 1 || $boards.hasClass('blackboard') || $boards.hasClass('white_11x14') || $boards.hasClass('white_10x14')) {
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

view.syncWhite11x14 = function (linesData) {
    const $container = $('.board-container');
    let $existingBoards = $container.children('.board.white_11x14, .board.white_10x14');

    // If container had boards that are NOT white_11x14/white_10x14, clean them out
    if ($container.children('.board:not(.white_11x14):not(.white_10x14)').length > 0) {
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
        $existingBoards = $container.children('.board.white_11x14, .board.white_10x14');
    }

    // 2. Add missing pages
    if ($existingBoards.length < totalPages) {
        for (let p = $existingBoards.length; p < totalPages; p++) {
            const idAttr = p === 0 ? 'id="result"' : `id="result-p${p}"`;
            const $newPage = $(`
                <div class="board white white_11x14 white_10x14 ${isItalics ? 'italics' : ''}" data-page-idx="${p}">
                    <div class="grid ${isItalics ? 'italics' : ''}">
                        <div class="result-text ${isSmall ? 'small' : ''} ${isBold ? 'bold' : ''}" ${idAttr} style="color: ${color};"></div>
                    </div>
                </div>
            `);
            $container.append($newPage);
        }
        $existingBoards = $container.children('.board.white_11x14, .board.white_10x14');
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
view.syncWhite10x14 = view.syncWhite11x14;

view.adjustBlackboardFontSize = function () {
    const $results = $('.board.blackboard .result-text, .board.blackboard #result');
    if (!$results.length) return;

    const isSmall = $('#font-size-select').val() === '36' || $results.first().hasClass('small');
    // Large font: capitalized glyphs like I are 5 cells high, normal glyphs like o are 2 cells high -> font size = 281.5px
    // Small font: capitalized glyphs like I are 2.5 cells high, normal glyphs like o are 1 cell high -> font size = 140.75px
    const finalSize = isSmall ? 140.75 : 281.5;

    // Baseline calculation:
    // Target Line 2 baseline is anchored on y = 408.8px (thick horizontal grid line, shifted slightly into guideline).
    // In font HP001 (line-height: 1), baseline offset from top of CSS line box is ~0.769 * finalSize.
    // 281.5px: baseline offset = 216px -> top = 192.75px.
    // 140.75px: baseline offset = 108px -> top = 300.75px.
    const topPx = Math.round(408.8 - (0.769 * finalSize));
    const baselineOffset = 408.8 - topPx;

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
        if (view.isDottingActive()) {
            view.renderDotsForLine($line, lineTokens, lineIndex);
        } else {
            $line.find('.guide-dots-layer').remove();
        }
        $line.find('.line-dot-controls, .line-dot-wrapper, .btn-line-dot-badge').remove();
        return;
    }

    let wordIndex = 0;
    let html = '';
    const lineDotConfig = view.getDottingConfig(lineIndex);
    const isDotActive = view.isDottingActive();

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

            const dotBadgeHtml = (isDotActive && wordIndex === 0) ? `
                <span class="line-dot-wrapper">
                    <button type="button" class="btn-line-dot-badge ${lineDotConfig.isCustom ? 'is-custom' : ''}" data-line-idx="${lineIndex}" title="Dòng ${lineIndex + 1}: Cách ${lineDotConfig.spaces} ô (Nhấp để chỉnh riêng)">
                        <i class="fa-solid fa-circle-dot"></i> Cách ${lineDotConfig.spaces} ô
                    </button>
                </span>` : '';

            const rawTokenAttr = ` data-raw="${view.escapeHtml(token.raw || token.text)}"`;
            html += `<span class="word" data-word-idx="${wordIndex}"${rawTokenAttr}${stretchAttr}${natWAttr}${styleAttr}>` +
                `<span class="word-handle no-print">` +
                    `<span class="btn-word-drag" title="Kéo để dịch chuyển (và các từ phía sau)"><i class="fa-solid fa-up-down-left-right"></i></span>` +
                    `<span class="btn-word-reset" title="Đặt lại vị trí ban đầu"><i class="fa-solid fa-arrow-rotate-left"></i></span>` +
                    dotBadgeHtml +
                `</span>` +
                `<span class="word-text"${textStyleAttr}>${view.escapeHtml(token.text)}</span>` +
                `<span class="btn-word-stretch no-print" title="Kéo để kéo giãn chữ (Nhấp đúp để đặt lại cỡ chữ)"></span>` +
            `</span>`;
            wordIndex++;
        }
    }
    $line.empty().html(html);
    if (view.isDottingActive()) {
        view.renderDotsForLine($line, lineTokens, lineIndex);
    } else {
        $line.find('.guide-dots-layer').remove();
    }
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
        if (view.isDottingActive()) {
            const $line = dragState.$word.closest('p.line');
            const lineIdx = parseInt($line.attr('id').replace('line-', ''), 10) || 0;
            view.renderDotsForLine($line, null, lineIdx);
        }
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
            if (view.isDottingActive()) {
                const $line = dragState.$word.closest('p.line');
                const lineIdx = parseInt($line.attr('id').replace('line-', ''), 10) || 0;
                view.renderDotsForLine($line, null, lineIdx);
            }
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
            if (view.isDottingActive()) {
                const $line = $word.closest('p.line');
                const lineIdx = parseInt($line.attr('id').replace('line-', ''), 10) || 0;
                view.renderDotsForLine($line, null, lineIdx);
            }
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

        if (view.isDottingActive() && stretchState.$line) {
            const lineIdx = parseInt(stretchState.$line.attr('id').replace('line-', ''), 10) || 0;
            view.renderDotsForLine(stretchState.$line, null, lineIdx);
        }
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
        if (view.isDottingActive() && stretchState.$line) {
            const lineIdx = parseInt(stretchState.$line.attr('id').replace('line-', ''), 10) || 0;
            view.renderDotsForLine(stretchState.$line, null, lineIdx);
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
        if (view.isDottingActive()) {
            const $line = $word.closest('p.line');
            const lineIdx = parseInt($line.attr('id').replace('line-', ''), 10) || 0;
            view.renderDotsForLine($line, null, lineIdx);
        }
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
        if (view.isDottingActive()) {
            const $line = $word.closest('p.line');
            const lineIdx = parseInt($line.attr('id').replace('line-', ''), 10) || 0;
            view.renderDotsForLine($line, null, lineIdx);
        }
    });

    // Double-click empty line background: reset all words on that line
    $container.on('dblclick', 'p.line', function (e) {
        if ($(e.target).closest('.word, .line-dot-wrapper, .line-dot-popover').length) return;
        $(this).find('.word').each(function () {
            this.style.marginLeft = '0px';
            this.style.width = '';
            $(this).removeAttr('data-stretch');
            $(this).children('.word-text').css({
                'width': '',
                'transform': ''
            });
        });
        if (view.isDottingActive()) {
            const lineIdx = parseInt($(this).attr('id').replace('line-', ''), 10) || 0;
            view.renderDotsForLine($(this), null, lineIdx);
        }
    });

    // Line dotting badge popover click handlers
    $container.on('click', '.btn-line-dot-badge', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const $badge = $(this);
        const $wrapper = $badge.closest('.line-dot-wrapper');
        const $word = $badge.closest('.word');
        const $line = $badge.closest('p.line');
        const lineIdx = parseInt($badge.attr('data-line-idx'), 10);

        // If clicking on already open popover button, toggle close
        if ($wrapper.children('.line-dot-popover').length) {
            $('.line-dot-popover').remove();
            $('.word').removeClass('is-dotting-open');
            $('p.line').removeClass('has-dot-popover');
            return;
        }

        // Close any other open popovers
        $('.line-dot-popover').remove();
        $('.word').removeClass('is-dotting-open');
        $('p.line').removeClass('has-dot-popover');

        $line.addClass('has-dot-popover');
        $word.addClass('is-dotting-open');

        // Select this line in top toolbar
        $('#dotting-line-select').val(lineIdx).trigger('change');

        const cfg = view.getDottingConfig(lineIdx);
        const $popover = $(`
            <div class="line-dot-popover no-print">
                <div class="popover-header">
                    <strong>Dòng ${lineIdx + 1}</strong>
                    <button type="button" class="popover-close" title="Đóng">&times;</button>
                </div>
                <div class="popover-row">
                    <label>Khoảng cách:</label>
                    <div class="step-control">
                        <button type="button" class="btn-step" data-action="dec" title="Giảm khoảng cách">-</button>
                        <span class="step-val step-spaces-val">${cfg.spaces} ô</span>
                        <button type="button" class="btn-step" data-action="inc" title="Tăng khoảng cách">+</button>
                    </div>
                </div>
                <div class="popover-row">
                    <label>Số chấm:</label>
                    <span class="step-val step-reps-val">${cfg.repetitions}</span>
                </div>
                <div class="popover-row">
                    <label style="cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                        <input type="checkbox" class="popover-fulldot" ${cfg.fullDot ? 'checked' : ''} /> Chấm hết dòng
                    </label>
                </div>
                ${cfg.isCustom ? '<button type="button" class="btn-popover-reset">Đặt lại mặc định</button>' : ''}
            </div>
        `);

        $wrapper.append($popover);
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.line-dot-wrapper, .line-dot-popover').length) {
            $('.line-dot-popover').remove();
            $('.word').removeClass('is-dotting-open');
            $('p.line').removeClass('has-dot-popover');
        }
    });

    $container.on('click', '.popover-close', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $('.line-dot-popover').remove();
        $('.word').removeClass('is-dotting-open');
        $('p.line').removeClass('has-dot-popover');
    });

    $container.on('click', '.line-dot-popover .btn-step', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const action = $(this).attr('data-action');
        const $popover = $(this).closest('.line-dot-popover');
        const $wrapper = $popover.closest('.line-dot-wrapper');
        const $badge = $wrapper.children('.btn-line-dot-badge');
        const lineIdx = parseInt($badge.attr('data-line-idx'), 10);
        const cfg = view.getDottingConfig(lineIdx);
        let newSpaces = cfg.spaces + (action === 'inc' ? 1 : -1);
        newSpaces = Math.max(1, Math.min(10, newSpaces));

        if (!view.lineDotConfigs[lineIdx]) view.lineDotConfigs[lineIdx] = {};
        view.lineDotConfigs[lineIdx].spaces = newSpaces;
        view.lineDotConfigs[lineIdx].isCustom = true;

        const updatedCfg = view.getDottingConfig(lineIdx);
        $popover.find('.step-spaces-val').text(`${newSpaces} ô`);
        $popover.find('.step-reps-val').text(updatedCfg.repetitions);

        if (!$popover.find('.btn-popover-reset').length) {
            $popover.append('<button type="button" class="btn-popover-reset">Đặt lại mặc định</button>');
        }

        const $line = $(`#line-${lineIdx}`);
        $line.find('.btn-line-dot-badge').each(function () {
            $(this).addClass('is-custom')
                   .attr('title', `Dòng ${lineIdx + 1}: Cách ${newSpaces} ô (Nhấp để chỉnh riêng)`)
                   .html(`<i class="fa-solid fa-circle-dot"></i> Cách ${newSpaces} ô`);
        });

        view.renderDotsForLine($line, null, lineIdx);
        view.updateDottingLineSelect();

        if ($('#dotting-line-select').val() == lineIdx) {
            $('#dotting-spaces-input').val(newSpaces);
            $('#dotting-reps-input').val(updatedCfg.repetitions);
            $('#btn-reset-line-dotting').show();
        }
    });

    $container.on('change', '.line-dot-popover .popover-fulldot', function (e) {
        e.stopPropagation();
        const $popover = $(this).closest('.line-dot-popover');
        const $wrapper = $popover.closest('.line-dot-wrapper');
        const $badge = $wrapper.children('.btn-line-dot-badge');
        const lineIdx = parseInt($badge.attr('data-line-idx'), 10);

        if (!view.lineDotConfigs[lineIdx]) view.lineDotConfigs[lineIdx] = {};
        view.lineDotConfigs[lineIdx].fullDot = this.checked;
        view.lineDotConfigs[lineIdx].isCustom = true;

        if (!$popover.find('.btn-popover-reset').length) {
            $popover.append('<button type="button" class="btn-popover-reset">Đặt lại mặc định</button>');
        }

        const $line = $(`#line-${lineIdx}`);
        $line.find('.btn-line-dot-badge').addClass('is-custom');
        view.renderDotsForLine($line, null, lineIdx);
        view.updateDottingLineSelect();

        if ($('#dotting-line-select').val() == lineIdx) {
            $('#dotting-fulldot-checkbox').prop('checked', this.checked);
            $('#btn-reset-line-dotting').show();
        }
    });

    $container.on('click', '.line-dot-popover .btn-popover-reset', function (e) {
        e.stopPropagation();
        e.preventDefault();
        const $popover = $(this).closest('.line-dot-popover');
        const $wrapper = $popover.closest('.line-dot-wrapper');
        const $badge = $wrapper.children('.btn-line-dot-badge');
        const lineIdx = parseInt($badge.attr('data-line-idx'), 10);

        delete view.lineDotConfigs[lineIdx];
        const defaultCfg = view.getDottingConfig(lineIdx);

        const $line = $(`#line-${lineIdx}`);
        $line.find('.btn-line-dot-badge').each(function () {
            $(this).removeClass('is-custom')
                   .attr('title', `Dòng ${lineIdx + 1}: Cách ${defaultCfg.spaces} ô (Nhấp để chỉnh riêng)`)
                   .html(`<i class="fa-solid fa-circle-dot"></i> Cách ${defaultCfg.spaces} ô`);
        });

        view.renderDotsForLine($line, null, lineIdx);
        view.updateDottingLineSelect();

        if ($('#dotting-line-select').val() == lineIdx) {
            $('#dotting-spaces-input').val(defaultCfg.spaces);
            $('#dotting-reps-input').val(defaultCfg.repetitions);
            $('#dotting-fulldot-checkbox').prop('checked', defaultCfg.fullDot);
            $('#btn-reset-line-dotting').hide();
        }

        $('.line-dot-popover').remove();
        $('.word').removeClass('is-dotting-open');
        $('p.line').removeClass('has-dot-popover');
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
    const isBlackboard = (layout === 'blackboard');
    const isWhite11x14 = (layout === 'white_11x14' || layout === 'white_10x14');

    if (isBlackboard) {
        view.adjustBlackboardFontSize();
    } else if (isWhite11x14) {
        view.render();
    } else {
        $results.css({ 'font-size': '', 'top': '' });
    }
    if (view.isDottingActive()) {
        view.render();
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
        $board.removeClass('blackboard black white_11x14 white_10x14').addClass('white');
        const paperInk = "#2b1055";
        $colorInput.val(paperInk);
        $('.result-text, #result').css({ 'color': paperInk, 'font-size': '', 'top': '', 'left': '', 'position': '', 'width': '', 'min-width': '', 'white-space': '' });
    } else if (boardColor === "white_11x14" || boardColor === "white_10x14") {
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
        $board.removeClass('blackboard white white_11x14 white_10x14').addClass('black');
        const chalkWhite = "#ffffff";
        $colorInput.val(chalkWhite);
        $('.result-text, #result').css({ 'color': chalkWhite, 'font-size': '', 'top': '', 'left': '', 'position': '', 'width': '', 'min-width': '', 'white-space': '' });
    }
    view.updateDottingControlsState();
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
        view.resetLineDotConfigs();
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

view.downloadCanvasAsPng = function (canvas, fileName) {
    return new Promise((resolve) => {
        const triggerDownload = (url, isBlob) => {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
                resolve();
            }, 300);
            if (isBlob) {
                setTimeout(() => {
                    try {
                        URL.revokeObjectURL(url);
                    } catch (e) {}
                }, 60000);
            }
        };

        if (canvas.toBlob) {
            canvas.toBlob(function (blob) {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    triggerDownload(url, true);
                } else {
                    try {
                        const dataUrl = canvas.toDataURL('image/png');
                        triggerDownload(dataUrl, false);
                    } catch (e) {
                        console.error('Canvas export error:', e);
                        resolve();
                    }
                }
            }, 'image/png');
        } else {
            try {
                const dataUrl = canvas.toDataURL('image/png');
                triggerDownload(dataUrl, false);
            } catch (e) {
                console.error('Canvas export error:', e);
                resolve();
            }
        }
    });
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
                const rawWord = $(wordEl).attr('data-raw') || '';
                const stretch = parseFloat($(wordEl).attr('data-stretch')) || 1.0;
                words.push({
                    text: wordText,
                    raw: rawWord,
                    offsetLeft: wordEl.offsetLeft,
                    offsetWidth: wordEl.offsetWidth,
                    stretch: stretch
                });
            });

            // Original line text for filename
            const rawLineText = rawInputLines[bIdx] || words.map(w => w.raw || w.text).join(' ');

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
                    ctx.fillStyle = textColor;
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

            const lineDotConfig = view.getDottingConfig(bIdx);
            const hasText = words.length > 0;
            const hasAnyText = ($('#input').val() || '').trim().length > 0;
            if (lineDotConfig && lineDotConfig.enabled && hasAnyText && (hasText || bIdx < lineDotConfig.linesCount)) {
                let rawLine = words.length > 0 ? (words[0].raw || rawInputLines[bIdx] || words[0].text) : (rawInputLines[bIdx] || rawInputLines[0] || 'a');
                const charUnit = model.getFirstCharUnit(rawLine);
                const startPoint = model.getGlyphStartPoint(charUnit);

                const olyUnitPx = (isSmall ? 28.15 : 56.3) * S;
                const blockWidth = 225.2 * S;
                const dotRadius = (isSmall ? 4 : 7) * S;

                const dotY = baselineY - (startPoint.y * olyUnitPx);
                const wordOffset = words.length > 0 ? (words[0].offsetLeft * S) : 0;
                const firstStretch = words.length > 0 && words[0].stretch ? words[0].stretch : 1.0;
                const startX0 = startX + wordOffset + (startPoint.x * olyUnitPx * firstStretch);

                ctx.save();
                if (isItalics) {
                    ctx.translate(0, baselineY);
                    ctx.transform(1, 0, -Math.tan(17 * Math.PI / 180), 1, 0, 0);
                    ctx.translate(0, -baselineY);
                }

                for (let j = 0; j < lineDotConfig.repetitions; j++) {
                    if (hasText || lineDotConfig.fullDot || j === 0) {
                        const dotX = startX0 + (j * blockWidth * lineDotConfig.spaces);
                        ctx.beginPath();
                        ctx.fillStyle = lineDotConfig.color;
                        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                        ctx.lineWidth = 1 * S;
                        ctx.stroke();
                    }
                }
                ctx.restore();
            }

            const fileName = view.generateFileName('blackboard', rawLineText);

            view.downloadCanvasAsPng(canvas, fileName).then(resolve);
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

view.exportWhite11x14ToPng = async function () {
    const $boards = $('.board.white_11x14, .board.white_10x14');
    if (!$boards.length) return;

    const isSmall = $('#font-size-select').val() === '36' || $('.board.white_11x14 .result-text, .board.white_10x14 .result-text, #result').hasClass('small');
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

    // Dimensions: 46 cells wide (1 + 44 + 1), 60 cells tall (2 + 56 + 2)
    const widthPx = 883.2;
    const heightPx = 1152;
    const canvasWidth = Math.round(widthPx * scale); // 3533px
    const canvasHeight = Math.round(heightPx * scale); // 4608px

    const gridOriginX = subGridPx; // 19.2px (1 cell buffer left)
    const gridOriginY = subGridPx * 2; // 38.4px (2 cells buffer top)

    const fontSizePx = (isSmall ? 37 : 72) * ptToPx;
    const lineHeightPx = (isSmall ? (subGridPx * 4) : (subGridPx * 8)); // 76.8px or 153.6px
    const firstBaselineY = gridOriginY + 4 * subGridPx; // Line 1 baseline at y = 6 cells (115.2px) matching on-screen Major Line 1

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

            const linesPerPage = isSmall ? 14 : 7;
            const dotConfig = view.getDottingConfig();
            const $lines = $(boardEl).find('p.line');
            const pageTexts = [];

            $lines.each(function (lIdx) {
                const globalLineIdx = (pIdx * linesPerPage) + lIdx;
                const yPos = firstBaselineY + (lIdx * lineHeightPx);
                const $line = $(this);
                const words = [];
                $line.children('.word').each(function () {
                    const wordEl = this;
                    const wordText = $(wordEl).find('.word-text').text() || $(wordEl).text();
                    const rawWord = $(wordEl).attr('data-raw') || '';
                    const stretch = parseFloat($(wordEl).attr('data-stretch')) || 1.0;
                    words.push({
                        text: wordText,
                        raw: rawWord,
                        offsetLeft: wordEl.offsetLeft,
                        offsetWidth: wordEl.offsetWidth,
                        stretch: stretch
                    });
                });

                if (words.length > 0) {
                    pageTexts.push(words.map(w => w.raw || w.text).join(' '));
                }

                ctx.fillStyle = textColor;
                words.forEach(word => {
                    const xPos = gridOriginX + word.offsetLeft;
                    if (word.stretch && word.stretch !== 1.0) {
                        ctx.save();
                        ctx.translate(xPos, yPos);
                        ctx.scale(word.stretch, 1.0);
                        ctx.fillStyle = textColor;
                        ctx.fillText(word.text, 0, 0);
                        ctx.restore();
                    } else {
                        ctx.fillStyle = textColor;
                        ctx.fillText(word.text, xPos, yPos);
                    }
                });

                const hasText = words.length > 0;
                const hasAnyText = ($('#input').val() || '').trim().length > 0;
                const lineDotConfig = view.getDottingConfig(globalLineIdx);
                if (lineDotConfig && lineDotConfig.enabled && hasAnyText && (hasText || globalLineIdx < lineDotConfig.linesCount)) {
                    let rawLineText = words.length > 0 ? (words[0].raw || words[0].text) : '';
                    if (!rawLineText) {
                        const rawLines = ($('#input').val() || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
                        const lineFromInput = rawLines[globalLineIdx] || rawLines[0] || 'a';
                        rawLineText = lineFromInput.split(/\s+/)[0] || 'a';
                    }
                    const charUnit = model.getFirstCharUnit(rawLineText);
                    const startPoint = model.getGlyphStartPoint(charUnit);

                    const olyUnitPx = isSmall ? 9.6 : 19.2;
                    const blockWidth = 76.8;
                    const dotRadius = isSmall ? 2.5 : 3.5;

                    const dotY = yPos - (startPoint.y * olyUnitPx);
                    const wordOffset = words.length > 0 ? words[0].offsetLeft : 0;
                    const firstStretch = words.length > 0 && words[0].stretch ? words[0].stretch : 1.0;
                    const startX0 = gridOriginX + wordOffset + (startPoint.x * olyUnitPx * firstStretch);

                    for (let j = 0; j < lineDotConfig.repetitions; j++) {
                        if (hasText || lineDotConfig.fullDot || j === 0) {
                            const dotX = startX0 + (j * blockWidth * lineDotConfig.spaces);
                            ctx.beginPath();
                            ctx.fillStyle = lineDotConfig.color;
                            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            });

            ctx.restore();

            const firstText = pageTexts[0] || 'chu_dep';
            const pageSuffix = $boards.length > 1 ? `_p${pIdx + 1}` : '';
            const fileName = view.generateFileName('white_11x14' + pageSuffix, firstText);

            view.downloadCanvasAsPng(canvas, fileName).then(resolve);
        });
    };

    for (let i = 0; i < $boards.length; i++) {
        await exportSinglePage($boards[i], i);
        if (i < $boards.length - 1) {
            await new Promise(r => setTimeout(r, 400));
        }
    }
};
view.exportWhite10x14ToPng = view.exportWhite11x14ToPng;

view.exportToPng = async function () {
    const layout = $('#board-color-select').val();
    if (layout === 'blackboard') {
        await view.exportBlackboardToPng();
        return;
    }
    if (layout === 'white_11x14' || layout === 'white_10x14') {
        await view.exportWhite11x14ToPng();
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
            const rawWord = $(wordEl).attr('data-raw') || '';
            const stretch = parseFloat($(wordEl).attr('data-stretch')) || 1.0;
            lineWords.push({
                text: wordText,
                raw: rawWord,
                offsetLeft: wordEl.offsetLeft,
                offsetWidth: wordEl.offsetWidth,
                stretch: stretch
            });
        });
        lines.push({
            words: lineWords
        });
    });

    const hasAnyText = ($('#input').val() || '').trim().length > 0;
    const dotConfig = hasAnyText ? view.getDottingConfig() : null;
    if (lines.length === 0 || !hasAnyText) {
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
    const lineHeightPx = (isSmall ? 4 : 8) * subGridPx; // 76.8px or 153.6px

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

    if (dotConfig && dotConfig.enabled) {
        const totalLinesCount = Math.max(lines.length, dotConfig.linesCount || 0);
        for (let idx = 0; idx < totalLinesCount; idx++) {
            const lineCfg = view.getDottingConfig(idx);
            const maxDotsRight = subGridPx + (lineCfg.repetitions * bigGridPx * lineCfg.spaces);
            if (maxDotsRight > maxLineRight) {
                maxLineRight = maxDotsRight;
            }
        }
    }

    // Grid origins matching CSS background-position: var(--grid-unit) calc(var(--grid-unit) * 2.5)
    const gridOriginX = subGridPx; // 19.2px
    const gridOriginY = subGridPx * 2.5; // 48px (shifted half cell lower)

    // Dynamic width so long text is NEVER cut off
    const minViewportWidth = Math.max(window.innerWidth || 1200, 1000);
    const slantExtra = isItalics ? 140 : 0;
    const neededWidth = Math.max(minViewportWidth, maxLineRight + bigGridPx * 2 + slantExtra);
    const widthPx = Math.ceil(neededWidth / bigGridPx) * bigGridPx;

    // First line baseline rests on major line 1 (124.8px) matching CSS on-screen display
    const firstBaselineY = gridOriginY + 4 * subGridPx;
    const totalLinesCount = Math.max(lines.length, (dotConfig && dotConfig.enabled) ? dotConfig.linesCount : 0);
    const lastBaselineY = firstBaselineY + Math.max(0, totalLinesCount - 1) * lineHeightPx;
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
        ctx.fillStyle = textColor;
        lineObj.words.forEach(word => {
            const xPos = gridOriginX + word.offsetLeft;
            if (word.stretch && word.stretch !== 1.0) {
                ctx.save();
                ctx.translate(xPos, yPos);
                ctx.scale(word.stretch, 1.0);
                ctx.fillStyle = textColor;
                ctx.fillText(word.text, 0, 0);
                ctx.restore();
            } else {
                ctx.fillStyle = textColor;
                ctx.fillText(word.text, xPos, yPos);
            }
        });
    });

    // Draw dots
    if (dotConfig && dotConfig.enabled) {
        const olyUnitPx = isSmall ? 9.6 : 19.2;
        const dotRadius = isSmall ? 2.5 : 3.5;
        const rawInputLines = ($('#input').val() || '').split('\n').map(l => l.trim());

        for (let idx = 0; idx < totalLinesCount; idx++) {
            const lineObj = lines[idx];
            const hasText = lineObj && lineObj.words.length > 0;
            const lineDotConfig = view.getDottingConfig(idx);
            if (!hasText && idx >= lineDotConfig.linesCount) break;

            const yPos = firstBaselineY + (idx * lineHeightPx);
            let rawLineText = hasText ? (lineObj.words[0].raw || lineObj.words[0].text) : '';
            if (!rawLineText) {
                const lineFromInput = rawInputLines[idx] || rawInputLines.find(l => l.length > 0) || 'a';
                rawLineText = lineFromInput.split(/\s+/)[0] || 'a';
            }
            const charUnit = model.getFirstCharUnit(rawLineText);
            const startPoint = model.getGlyphStartPoint(charUnit);

            const dotY = yPos - (startPoint.y * olyUnitPx);
            const wordOffset = hasText ? lineObj.words[0].offsetLeft : 0;
            const firstStretch = hasText && lineObj.words[0].stretch ? lineObj.words[0].stretch : 1.0;
            const startX0 = gridOriginX + wordOffset + (startPoint.x * olyUnitPx * firstStretch);

            for (let j = 0; j < lineDotConfig.repetitions; j++) {
                if (hasText || lineDotConfig.fullDot || j === 0) {
                    const dotX = startX0 + (j * bigGridPx * lineDotConfig.spaces);
                    ctx.beginPath();
                    ctx.fillStyle = lineDotConfig.color;
                    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    ctx.restore();

    // 5. Trigger Download
    const rawInputLines = $('#input').val().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const fileName = view.generateFileName(layout, rawInputLines[0] || 'chu_dep');

    await view.downloadCanvasAsPng(canvas, fileName);
};