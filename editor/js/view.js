const view = {

}

view.showComponents = function(name){
    let app = $('#app');
    switch(name){
        case 'baseList':
            app.html(components.baseListPage);
            let baseList = $("#baseList");
            let baseListHtml = baseList.html();
            let sortedData = Object.fromEntries(Object.entries(model.glyphData).sort())
            for (const [base, data] of Object.entries(sortedData)) {
                let hasDot = data && data.startPoint && typeof data.startPoint.x === 'number';
                let dotBadge = hasDot ? `<span class="badge bg-danger rounded-pill position-absolute top-0 end-0 m-2 dot-badge" title="Điểm đặt bút: (${data.startPoint.x}, ${data.startPoint.y})">●</span>` : '';
                baseListHtml += `
                    ${components.baseCard.replaceAll("{{name}}", view.escapeXml(base)).replace("{{dotBadge}}", dotBadge)}
                `
            }
            baseList.html(baseListHtml)
            //new base card modal
            $('#addNewBaseCardModal').off('shown.bs.modal').on('shown.bs.modal', function () {
                $('#newBaseCardInput').trigger('focus')
            })
            let newBaseCardForm = $("#newBaseCardForm");
            newBaseCardForm.off('submit').on('submit', function(e){
                e.preventDefault();
                controller.addNewBase(newBaseCardForm.children('input').val())
            })

            //Download json button
            $('#downloadJson').off('click').on('click', function(e){
                model.download('all.json', JSON.stringify(model.glyphData, null, 2))
            })

            //edit base
            baseList.children('.baseCard:not(:first-child)')
                    .off('click').on('click', view.populateEditForm)
            
            this.setUpEditModal()
            $(document).off('submit','form#editBaseForm').on('submit','form#editBaseForm',function(e){
                e.preventDefault()
                model.saveBaseData($(e.target).serializeArray())
             });
            break;
        default:
            app.html(components.loading)
    }
}

view.populateEditForm = function (e){
    let baseCard = $(e.target).closest('.baseCard');
    let baseChar = baseCard.attr('data-base-name') || baseCard.find('.card-header').text().trim();
    if (!baseChar || baseChar === '+') return;
    let baseCardEditorModal = $('#editBaseModal').find('.modal-body');
    let editFormHtml = components.baseEditForm;
    //form header
    baseCardEditorModal.html(editFormHtml);
    baseCardEditorModal.find('#baseCharacter').val(baseChar);
    baseCardEditorModal.find('#baseUnicode').val(baseChar.charCodeAt(0));
    //list types
    let charData = model.glyphData[baseChar] || { types: [] };
    let types = charData.types || [];
    $('#numberOfTypes').val(types.length);
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        let numOfTypes = i + 1;
        view.addNewTypeEditor(numOfTypes);
        view.populateTypeEditor(type, numOfTypes);
    }
    const glyphInfo = view.getFirstStandaloneLevelGlyph(charData, baseChar);
    view.initStartPointEditor(baseChar, charData.startPoint, glyphInfo);
}

view.setUpEditModal = function (){
    let addNewTypeButton = $('#addNewTypeButton');
    addNewTypeButton.off('click').on('click', function(e){
        let numOfTypesDisplay = $('#numberOfTypes');
        let currentCount = $('#editBaseForm .base-type-editor').length;
        let nextIndex = currentCount + 1;
        numOfTypesDisplay.val(nextIndex);
        view.addNewTypeEditor(nextIndex);
    });

    $(document).off('click', '.btn-delete-type').on('click', '.btn-delete-type', function(e) {
        e.preventDefault();
        const $typeRow = $(this).closest('.base-type-editor');
        $typeRow.remove();
        view.reindexTypes();
    });
}

view.reindexTypes = function() {
    const listTones = ['level', 'acute', 'lower', 'rising', 'raised', 'heavy'];
    const $typeRows = $('#editBaseForm .base-type-editor');
    $typeRows.each(function(idx) {
        const num = idx + 1;
        const $row = $(this);
        $row.attr('id', `type${num}`);
        $row.find('.type-num').text(`Type ${num}`);
        $row.find('.btn-delete-type').attr('data-type-num', num);
        
        // Capitalization
        $row.find('label[for^="isCap"]').attr('for', `isCap${num}`);
        $row.find('input[type="checkbox"][name^="isCap"]').attr('id', `isCap${num}`).attr('name', `isCap${num}`);

        // Tones
        listTones.forEach(tone => {
            $row.find(`input[name^="${tone}"]`).not('[name^="glyphinput"]').attr('id', `${tone}${num}`).attr('name', `${tone}${num}`);
            $row.find(`input[name^="glyphinput${tone}"]`)
                .attr('id', `glyphinput${tone}${num}`)
                .attr('name', `glyphinput${tone}${num}`)
                .attr('for', `${tone}${num}`);
        });

        // Previous
        $row.find('textarea[name^="prev"]').attr('id', `prev${num}`).attr('name', `prev${num}`);
        $row.find('label[for^="noNeedPrev"]').attr('for', `noNeedPrev${num}`);
        $row.find('input[type="checkbox"][name^="noNeedPrev"]').attr('id', `noNeedPrev${num}`).attr('name', `noNeedPrev${num}`);

        // Next
        $row.find('textarea[name^="next"]').attr('id', `next${num}`).attr('name', `next${num}`);
        $row.find('label[for^="noNeedNext"]').attr('for', `noNeedNext${num}`);
        $row.find('input[type="checkbox"][name^="noNeedNext"]').attr('id', `noNeedNext${num}`).attr('name', `noNeedNext${num}`);
    });

    $('#numberOfTypes').val($typeRows.length);
}

view.addNewTypeEditor = function(numOfTypes){
    let editForm = $('#editBaseForm');
    let typeEditorHtml = components.singleTypeEditor.replaceAll('NUM-PLACEHOLDER', numOfTypes);
    editForm.append(typeEditorHtml)
    let glyphInputLevel = $('#glyphinputlevel'+numOfTypes).get(0);
    view.addPasteHandler(glyphInputLevel, numOfTypes)
}

view.addPasteHandler = function (glyphInputLevel, numOfTypes){
    if (!glyphInputLevel) return;
    glyphInputLevel.addEventListener('paste', (e) => {
        e.preventDefault();
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        let listAccent = paste.trim().split(' ').map(element => element.trim()).filter(element => element.length != 0);
        
        let listTones = ['level', 'acute', 'lower', 'rising', 'raised', 'heavy'];
        let container = $(e.currentTarget).closest('.base-type-editor');

        for (let j = 0; j < listAccent.length; j++) {
            const glyph = listAccent[j];
            const tone = listTones[j];
            container.find(`input[name^="glyphinput${tone}"]`).val(glyph);
            container.find(`input[name^="${tone}"]`).not('[name^="glyphinput"]').val(glyph.split('').map(char => char.charCodeAt(0)).join(','));
        }
    });
}

view.populateTypeEditor = function (typeData, numOfTypes){
    //populate with existing data
    let listTones = ['level', 'acute', 'lower', 'rising', 'raised', 'heavy'];
        
    for (let j = 0; j < listTones.length; j++) {
        const tone = listTones[j];
        const listGlyphPoint = typeData.accent[tone];
        if(!listGlyphPoint){continue;}
        let glyph = String.fromCharCode(...(listGlyphPoint.toString().split(',')))
        $('#glyphinput'+tone+numOfTypes).val(glyph);
        $('#'+tone+numOfTypes).val(listGlyphPoint);
    }
    if(typeData.isCap) 
        $("#isCap"+numOfTypes).prop('checked', typeData.isCap);
    if(typeData.prev){
        $("#prev"+numOfTypes).val(typeData.prev.filter(c=>c!=null).join(','))
        $("#noNeedPrev"+numOfTypes).prop('checked',typeData.prev.includes(null));
    }
    if(typeData.next){
        $("#next"+numOfTypes).val(typeData.next.filter(c=>c!=null).join(','))
        $("#noNeedNext"+numOfTypes).prop('checked',typeData.next.includes(null));
    }
}

view.updateBaseCardBadge = function(baseChar) {
    const $card = $('.baseCard').filter((_, el) => $(el).attr('data-base-name') === baseChar);
    if (!$card.length) return;
    $card.find('.dot-badge').remove();
    const data = model.glyphData[baseChar];
    if (data && data.startPoint && typeof data.startPoint.x === 'number') {
        $card.prepend(`<span class="badge bg-danger rounded-pill position-absolute top-0 end-0 m-2 dot-badge" title="Điểm đặt bút: (${data.startPoint.x}, ${data.startPoint.y})">●</span>`);
    }
};

view.escapeXml = function(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

view.glyphCodeToString = function(glyphCode) {
    if (!glyphCode) return '';
    try {
        const codes = glyphCode.toString().split(',').map(c => parseInt(c.trim(), 10)).filter(c => !isNaN(c));
        return String.fromCharCode(...codes);
    } catch(e) {
        return '';
    }
};

view.getFirstStandaloneLevelGlyph = function(charData, fallbackChar) {
    const types = (charData && charData.types) || [];
    // 1. Look for the first type that has "No need previous" (prev includes null or empty) and has an accent.level
    for (let i = 0; i < types.length; i++) {
        const t = types[i];
        const prev = t.prev || [];
        const isNoNeedPrev = !prev.length || prev.includes(null);
        if (isNoNeedPrev && t.accent && t.accent.level) {
            const glyphStr = view.glyphCodeToString(t.accent.level);
            if (glyphStr) {
                return {
                    glyph: glyphStr,
                    levelCode: t.accent.level,
                    typeIndex: i + 1,
                    desc: `Type ${i + 1} (Level: ${t.accent.level}, Không cần chữ trước)`
                };
            }
        }
    }

    // 2. Fallback: first type with accent.level
    for (let i = 0; i < types.length; i++) {
        const t = types[i];
        if (t.accent && t.accent.level) {
            const glyphStr = view.glyphCodeToString(t.accent.level);
            if (glyphStr) {
                return {
                    glyph: glyphStr,
                    levelCode: t.accent.level,
                    typeIndex: i + 1,
                    desc: `Type ${i + 1} (Level: ${t.accent.level})`
                };
            }
        }
    }

    // 3. Fallback: baseGlyph
    if (charData && charData.baseGlyph) {
        const glyphStr = view.glyphCodeToString(charData.baseGlyph);
        if (glyphStr) {
            return {
                glyph: glyphStr,
                levelCode: charData.baseGlyph,
                typeIndex: null,
                desc: `BaseGlyph: ${charData.baseGlyph}`
            };
        }
    }

    // 4. Fallback: baseChar
    return {
        glyph: fallbackChar,
        levelCode: null,
        typeIndex: null,
        desc: fallbackChar
    };
};

view.initStartPointEditor = function(baseChar, startPoint, glyphInfo) {
    const $container = $('#startPointPreviewContainer');
    if (!$container.length) return;

    if (!glyphInfo) {
        let charData = model.glyphData[baseChar] || { types: [] };
        glyphInfo = view.getFirstStandaloneLevelGlyph(charData, baseChar);
    }
    let displayGlyph = glyphInfo.glyph || baseChar;

    $('#startPointGlyphBadge').html(`
        <div class="d-inline-flex align-items-center gap-1">
            <span class="badge bg-primary text-white" style="font-family: HP001, serif; font-size: 1.15rem; line-height: 1.1;">${view.escapeXml(displayGlyph)}</span>
            <span class="badge bg-light text-secondary border">${view.escapeXml(glyphInfo.desc)}</span>
        </div>
    `);

    const CELL_PX = 36;
    const COLS = 8;
    const ROWS = 9;
    const WIDTH = COLS * CELL_PX; // 288px
    const HEIGHT = ROWS * CELL_PX; // 324px
    const ORIGIN_X = 36; // 1 ô ly margin on left (X = 0)
    const BASELINE_Y = 216; // 6 ô ly from top, leaving 3 ô ly for descenders (Y = 0)
    const FONT_SIZE = CELL_PX * (2048 / 412); // ~178.95px (so 2-li lowercase letters are exactly 72px high = 2 cells)

    // Build SVG Grid with ô ly lines
    let svgHtml = `
    <svg id="startPointSvg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" style="display: block; width: 100%; height: 100%;">
        <defs>
            <pattern id="subgrid" width="9" height="9" patternUnits="userSpaceOnUse">
                <path d="M 9 0 L 0 0 0 9" fill="none" stroke="#f1f5f9" stroke-width="0.75" />
            </pattern>
            <pattern id="grid" width="${CELL_PX}" height="${CELL_PX}" patternUnits="userSpaceOnUse">
                <rect width="${CELL_PX}" height="${CELL_PX}" fill="url(#subgrid)" />
                <path d="M ${CELL_PX} 0 L 0 0 0 ${CELL_PX}" fill="none" stroke="#cbd5e1" stroke-width="1" />
            </pattern>
        </defs>
        
        <!-- Base Grid -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />
        <rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#94a3b8" stroke-width="1" />

        <!-- Reference Lines & Labels -->
        <!-- Baseline (ĐK 1, y = 0) -->
        <line x1="0" y1="${BASELINE_Y}" x2="${WIDTH}" y2="${BASELINE_Y}" stroke="#2563eb" stroke-width="2.5" />
        <text x="${WIDTH - 4}" y="${BASELINE_Y - 4}" font-size="9" font-weight="bold" fill="#2563eb" text-anchor="end">ĐK 1 (0)</text>

        <!-- ĐK 3 (y = +2 ô ly = 144px) -->
        <line x1="0" y1="${BASELINE_Y - 2 * CELL_PX}" x2="${WIDTH}" y2="${BASELINE_Y - 2 * CELL_PX}" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="4,2" />
        <text x="${WIDTH - 4}" y="${BASELINE_Y - 2 * CELL_PX - 4}" font-size="9" fill="#3b82f6" text-anchor="end">ĐK 3 (+2)</text>

        <!-- ĐK 5 (y = +5 ô ly = 36px) -->
        <line x1="0" y1="${BASELINE_Y - 5 * CELL_PX}" x2="${WIDTH}" y2="${BASELINE_Y - 5 * CELL_PX}" stroke="#60a5fa" stroke-width="1.2" stroke-dasharray="4,2" />
        <text x="${WIDTH - 4}" y="${BASELINE_Y - 5 * CELL_PX - 4}" font-size="9" fill="#60a5fa" text-anchor="end">ĐK 5 (+5)</text>

        <!-- ĐK Dưới (y = -2 ô ly = 288px) -->
        <line x1="0" y1="${BASELINE_Y + 2 * CELL_PX}" x2="${WIDTH}" y2="${BASELINE_Y + 2 * CELL_PX}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2" />
        <text x="${WIDTH - 4}" y="${BASELINE_Y + 2 * CELL_PX - 4}" font-size="9" fill="#94a3b8" text-anchor="end">ĐK Dưới (-2)</text>

        <!-- Origin X = 0 (Left bearing line, x = 36px) -->
        <line x1="${ORIGIN_X}" y1="0" x2="${ORIGIN_X}" y2="${HEIGHT}" stroke="#2563eb" stroke-width="1.5" />
        <text x="${ORIGIN_X + 4}" y="${HEIGHT - 6}" font-size="9" font-weight="bold" fill="#2563eb">X=0</text>

        <!-- Render Glyph (First Level No-Need-Prev standalone glyph) -->
        <text id="previewGlyphText" x="${ORIGIN_X}" y="${BASELINE_Y}" font-family="HP001, serif" font-size="${FONT_SIZE}" fill="#1e293b" font-weight="bold" pointer-events="none" style="user-select: none;">${view.escapeXml(displayGlyph)}</text>

        <!-- Draggable Dot Handle -->
        <g id="svgDotGroup" style="display: none; cursor: grab;">
            <circle id="svgDotHalo" cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.25)"></circle>
            <circle id="svgDotCenter" cx="0" cy="0" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="2"></circle>
            <rect id="svgDotBadgeBg" x="-32" y="-25" width="64" height="16" rx="4" fill="rgba(15, 23, 42, 0.85)"></rect>
            <text id="svgDotCoords" x="0" y="-13" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">(0, 0)</text>
        </g>
    </svg>
    `;

    $container.html(svgHtml);

    const $svg = $('#startPointSvg');
    const $dotGroup = $('#svgDotGroup');
    const $dotCoords = $('#svgDotCoords');
    const $hasStartPoint = $('#hasStartPoint');
    const $inputX = $('#startPointX');
    const $inputY = $('#startPointY');
    const $btnSnap = $('#btnSnapOly');
    const $btnClear = $('#btnClearStartPoint');

    function updateDotPosition(xOly, yOly, active) {
        if (!active) {
            $dotGroup.hide();
            return;
        }
        const px = ORIGIN_X + xOly * CELL_PX;
        const py = BASELINE_Y - yOly * CELL_PX;
        $dotGroup.attr('transform', `translate(${px}, ${py})`);
        $dotCoords.text(`(${xOly.toFixed(2)}, ${yOly.toFixed(2)})`);
        $dotGroup.show();
    }

    function setCoordinates(xOly, yOly) {
        xOly = Math.max(-0.5, Math.min(6.5, xOly));
        yOly = Math.max(-3.0, Math.min(6.0, yOly));

        const rx = Math.round(xOly * 100) / 100;
        const ry = Math.round(yOly * 100) / 100;

        $inputX.val(rx.toFixed(2));
        $inputY.val(ry.toFixed(2));
        $hasStartPoint.prop('checked', true);

        updateDotPosition(rx, ry, true);
    }

    // Populate initial state
    if (startPoint && typeof startPoint.x === 'number' && typeof startPoint.y === 'number') {
        $hasStartPoint.prop('checked', true);
        $inputX.val(startPoint.x.toFixed(2));
        $inputY.val(startPoint.y.toFixed(2));
        updateDotPosition(startPoint.x, startPoint.y, true);
    } else {
        $hasStartPoint.prop('checked', false);
        $inputX.val('');
        $inputY.val('');
        updateDotPosition(0, 0, false);
    }

    // Interaction handling: Dragging and clicking on SVG
    let isDragging = false;

    function getOlyFromEvent(e) {
        const rect = $svg[0].getBoundingClientRect();
        const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
        const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
        const scaleX = WIDTH / rect.width;
        const scaleY = HEIGHT / rect.height;
        const px = (clientX - rect.left) * scaleX;
        const py = (clientY - rect.top) * scaleY;
        const xOly = (px - ORIGIN_X) / CELL_PX;
        const yOly = (BASELINE_Y - py) / CELL_PX;
        return { x: xOly, y: yOly };
    }

    $container.on('mousedown touchstart', function(e) {
        if (e.target.id === 'hasStartPoint') return;
        isDragging = true;
        $dotGroup.css('cursor', 'grabbing');
        const pos = getOlyFromEvent(e);
        setCoordinates(pos.x, pos.y);
        e.preventDefault();
    });

    $(window).off('.startPoint');
    $(window).on('mousemove.startPoint touchmove.startPoint', function(e) {
        if (!isDragging) return;
        const pos = getOlyFromEvent(e);
        setCoordinates(pos.x, pos.y);
    });

    $(window).on('mouseup.startPoint touchend.startPoint', function() {
        if (isDragging) {
            isDragging = false;
            $dotGroup.css('cursor', 'grab');
        }
    });

    // Cleanup window handlers when modal closes
    $('#editBaseModal').one('hidden.bs.modal', function() {
        $(window).off('.startPoint');
    });

    // Direct manual inputs
    function onManualInputChange() {
        const xVal = parseFloat($inputX.val());
        const yVal = parseFloat($inputY.val());
        if (!isNaN(xVal) && !isNaN(yVal)) {
            $hasStartPoint.prop('checked', true);
            updateDotPosition(xVal, yVal, true);
        } else if (isNaN(xVal) && isNaN(yVal)) {
            $hasStartPoint.prop('checked', false);
            updateDotPosition(0, 0, false);
        }
    }
    $inputX.on('input change', onManualInputChange);
    $inputY.on('input change', onManualInputChange);

    // Toggle switch
    $hasStartPoint.on('change', function() {
        if (this.checked) {
            let xVal = parseFloat($inputX.val());
            let yVal = parseFloat($inputY.val());
            if (isNaN(xVal) || isNaN(yVal)) {
                setCoordinates(0.5, 1.75);
            } else {
                updateDotPosition(xVal, yVal, true);
            }
        } else {
            $inputX.val('');
            $inputY.val('');
            updateDotPosition(0, 0, false);
        }
    });

    // Snap to 0.25 ô ly (1/4 block)
    $btnSnap.on('click', function() {
        let xVal = parseFloat($inputX.val());
        let yVal = parseFloat($inputY.val());
        if (!isNaN(xVal) && !isNaN(yVal)) {
            const snappedX = Math.round(xVal * 4) / 4;
            const snappedY = Math.round(yVal * 4) / 4;
            setCoordinates(snappedX, snappedY);
        }
    });

    // Clear start point
    $btnClear.on('click', function() {
        $hasStartPoint.prop('checked', false);
        $inputX.val('');
        $inputY.val('');
        updateDotPosition(0, 0, false);
    });
};


