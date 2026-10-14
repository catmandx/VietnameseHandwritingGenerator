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
                let hasDot = data && ((data.dotConfigs && data.dotConfigs.length) || (data.startPoint && typeof data.startPoint.x === 'number'));
                let dotCount = (data && data.dotConfigs && data.dotConfigs.length) ? `${data.dotConfigs.length} cấu hình` : (hasDot ? '1 điểm' : '');
                let dotBadge = hasDot ? `<span class="badge bg-danger rounded-pill position-absolute top-0 end-0 m-2 dot-badge" title="Cấu hình chấm: ${dotCount}">●</span>` : '';
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
    view.initStartPointEditor(baseChar, charData.startPoint, glyphInfo, charData.dotConfigs);
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
    let hasDot = data && ((data.dotConfigs && data.dotConfigs.length) || (data.startPoint && typeof data.startPoint.x === 'number'));
    if (hasDot) {
        let count = (data.dotConfigs && data.dotConfigs.length) ? `${data.dotConfigs.length} cấu hình` : '1 điểm';
        $card.prepend(`<span class="badge bg-danger rounded-pill position-absolute top-0 end-0 m-2 dot-badge" title="Cấu hình chấm: ${count}">●</span>`);
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

view.initStartPointEditor = function(baseChar, startPoint, glyphInfo, dotConfigs) {
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
    const FONT_SIZE = CELL_PX * (2048 / 412); // ~178.95px

    // 1. Initialize configurations
    let configs = [];
    let isInitiallyEnabled = false;

    if (dotConfigs && Array.isArray(dotConfigs) && dotConfigs.length > 0) {
        configs = JSON.parse(JSON.stringify(dotConfigs));
        isInitiallyEnabled = true;
    } else if (startPoint && typeof startPoint.x === 'number' && typeof startPoint.y === 'number') {
        configs = [{
            id: 'start',
            name: '1. Điểm đặt bút (Chuẩn)',
            desc: '1 chấm chuẩn',
            dots: [{ x: startPoint.x, y: startPoint.y, label: 'Nét 1' }]
        }];
        isInitiallyEnabled = true;
    } else if (window.model && window.model.defaultDotConfigs && window.model.defaultDotConfigs[baseChar]) {
        configs = JSON.parse(JSON.stringify(window.model.defaultDotConfigs[baseChar]));
        isInitiallyEnabled = false;
    } else {
        let defaultX = 0.50;
        let defaultY = 1.75;
        if (window.model && window.model.defaultStartPoints && window.model.defaultStartPoints[baseChar]) {
            defaultX = window.model.defaultStartPoints[baseChar].x;
            defaultY = window.model.defaultStartPoints[baseChar].y;
        }
        configs = [{
            id: 'start',
            name: '1. Điểm đặt bút (Chuẩn)',
            desc: '1 chấm chuẩn',
            dots: [{ x: defaultX, y: defaultY, label: 'Nét 1' }]
        }];
        isInitiallyEnabled = false;
    }

    let activeConfigIdx = 0;
    let activeDotIdx = 0;
    let isEnabled = isInitiallyEnabled;

    // 2. Build SVG Grid
    let svgHtml = `
    <svg id="startPointSvg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" style="display: block; width: 100%; height: 100%; cursor: crosshair;">
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

        <!-- Render Glyph -->
        <text id="previewGlyphText" x="${ORIGIN_X}" y="${BASELINE_Y}" font-family="HP001, serif" font-size="${FONT_SIZE}" fill="#1e293b" font-weight="bold" pointer-events="none" style="user-select: none;">${view.escapeXml(displayGlyph)}</text>

        <!-- SVG Dots Layer -->
        <g id="svgDotsLayer"></g>
    </svg>
    `;

    $container.html(svgHtml);

    const $svg = $('#startPointSvg');
    const $dotsLayer = $('#svgDotsLayer');
    const $hasStartPoint = $('#hasStartPoint');
    const $inputX = $('#dotInputX');
    const $inputY = $('#dotInputY');
    const $inputLabel = $('#dotInputLabel');
    const $inputConfigName = $('#dotConfigName');
    const $inputConfigDesc = $('#dotConfigDesc');
    const $btnSnap = $('#btnSnapOly');
    const $btnAddDot = $('#btnAddDot');
    const $btnDeleteDot = $('#btnDeleteDot');
    const $btnAddNewConfig = $('#btnAddNewConfig');
    const $btnDeleteCurrentConfig = $('#btnDeleteCurrentConfig');
    const $tabsContainer = $('#dotConfigTabsContainer');
    const $dotsListContainer = $('#configDotsListContainer');
    const $dotConfigsJson = $('#dotConfigsJson');
    const $hiddenX = $('#startPointX');
    const $hiddenY = $('#startPointY');

    function getCurrentConfig() {
        if (!configs[activeConfigIdx]) {
            activeConfigIdx = 0;
        }
        return configs[activeConfigIdx];
    }

    function getCurrentDot() {
        const cfg = getCurrentConfig();
        if (!cfg.dots || cfg.dots.length === 0) {
            cfg.dots = [{ x: 0.50, y: 1.75, label: 'Nét 1' }];
        }
        if (!cfg.dots[activeDotIdx]) {
            activeDotIdx = 0;
        }
        return cfg.dots[activeDotIdx];
    }

    function syncHiddenInputs() {
        $hasStartPoint.prop('checked', isEnabled);
        if (isEnabled && configs.length > 0) {
            $dotConfigsJson.val(JSON.stringify(configs));
            const firstDot = configs[0]?.dots?.[0];
            if (firstDot && typeof firstDot.x === 'number' && typeof firstDot.y === 'number') {
                $hiddenX.val(firstDot.x.toFixed(2));
                $hiddenY.val(firstDot.y.toFixed(2));
            } else {
                $hiddenX.val('');
                $hiddenY.val('');
            }
        } else {
            $dotConfigsJson.val('');
            $hiddenX.val('');
            $hiddenY.val('');
        }
    }

    function renderConfigTabs() {
        let html = '';
        configs.forEach((cfg, idx) => {
            const isActive = (idx === activeConfigIdx);
            const btnClass = isActive ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary bg-white';
            const dotCount = (cfg.dots && cfg.dots.length) || 0;
            html += `
                <button type="button" class="btn btn-sm ${btnClass} config-tab-pill py-1 px-2 d-inline-flex align-items-center gap-1" data-config-idx="${idx}" style="font-size: 0.8rem;">
                    <span>${view.escapeXml(cfg.name || ('Cấu hình ' + (idx + 1)))}</span>
                    <span class="badge ${isActive ? 'bg-white text-primary' : 'bg-secondary text-white'} rounded-pill" style="font-size: 0.68rem;">${dotCount} chấm</span>
                </button>
            `;
        });
        $tabsContainer.html(html);
    }

    function renderConfigMetadata() {
        const cfg = getCurrentConfig();
        $inputConfigName.val(cfg.name || '');
        $inputConfigDesc.val(cfg.desc || '');
    }

    function renderDotsList() {
        const cfg = getCurrentConfig();
        let html = '';
        cfg.dots.forEach((dot, idx) => {
            const isActive = (idx === activeDotIdx);
            const badgeClass = isActive ? 'bg-danger text-white shadow-sm' : 'bg-light text-dark border';
            const labelStr = dot.label ? `: ${view.escapeXml(dot.label)}` : '';
            html += `
                <button type="button" class="btn btn-xs ${badgeClass} dot-item-pill py-0 px-2" data-dot-idx="${idx}" style="font-size: 0.75rem; cursor: pointer;">
                    <strong>Chấm ${idx + 1}</strong>${labelStr} <span class="small text-muted ${isActive ? 'text-white-50' : ''}">(${dot.x.toFixed(2)}, ${dot.y.toFixed(2)})</span>
                </button>
            `;
        });
        $dotsListContainer.html(html);
    }

    function renderActiveDotInputs() {
        const dot = getCurrentDot();
        $('#selectedDotHeading').html(`
            <i class="fa-solid fa-circle-dot text-danger"></i> Chấm đang chọn: <strong>Chấm ${activeDotIdx + 1}</strong>
        `);
        $inputX.val(dot.x.toFixed(2));
        $inputY.val(dot.y.toFixed(2));
        $inputLabel.val(dot.label || '');
    }

    function renderSvgDots() {
        $dotsLayer.empty();
        if (!isEnabled) return;

        const cfg = getCurrentConfig();
        cfg.dots.forEach((dot, idx) => {
            const px = ORIGIN_X + dot.x * CELL_PX;
            const py = BASELINE_Y - dot.y * CELL_PX;
            const isActive = (idx === activeDotIdx);

            let $g = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
                .attr('class', `svg-dot-node ${isActive ? 'is-active' : ''}`)
                .attr('data-dot-idx', idx)
                .attr('transform', `translate(${px}, ${py})`)
                .css('cursor', isActive ? 'grab' : 'pointer');

            if (isActive) {
                // Active Halo
                let $halo = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
                    .attr('cx', 0).attr('cy', 0).attr('r', 15)
                    .attr('fill', 'rgba(239, 68, 68, 0.25)');
                // Active Center
                let $center = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
                    .attr('cx', 0).attr('cy', 0).attr('r', 7)
                    .attr('fill', '#ef4444')
                    .attr('stroke', '#ffffff').attr('stroke-width', 2);
                // Active Tooltip
                let tooltipText = `${dot.label || ('Chấm ' + (idx + 1))}: (${dot.x.toFixed(2)}, ${dot.y.toFixed(2)})`;
                let badgeWidth = Math.max(64, tooltipText.length * 6.5);
                let $badgeBg = $(document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
                    .attr('x', -badgeWidth / 2).attr('y', -26)
                    .attr('width', badgeWidth).attr('height', 16)
                    .attr('rx', 4).attr('fill', 'rgba(15, 23, 42, 0.88)');
                let $badgeText = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
                    .attr('x', 0).attr('y', -14)
                    .attr('font-size', '10').attr('font-weight', 'bold')
                    .attr('fill', '#ffffff').attr('text-anchor', 'middle')
                    .text(tooltipText);

                $g.append($halo).append($center).append($badgeBg).append($badgeText);
            } else {
                // Secondary Dot
                let $center = $(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
                    .attr('cx', 0).attr('cy', 0).attr('r', 6)
                    .attr('fill', '#3b82f6')
                    .attr('stroke', '#ffffff').attr('stroke-width', 1.5);
                let $numBadge = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'))
                    .attr('x', 8).attr('y', -6)
                    .attr('font-size', '9').attr('font-weight', 'bold')
                    .attr('fill', '#1e40af')
                    .text(`${idx + 1}`);

                $g.append($center).append($numBadge);
            }

            $dotsLayer.append($g);
        });
    }

    function renderAll() {
        renderConfigTabs();
        renderConfigMetadata();
        renderDotsList();
        renderActiveDotInputs();
        renderSvgDots();
        syncHiddenInputs();
    }

    // Initial render
    renderAll();

    // 3. User Interactions
    // Config Tab Selection
    $tabsContainer.on('click', '.config-tab-pill', function(e) {
        e.preventDefault();
        activeConfigIdx = parseInt($(this).attr('data-config-idx'), 10) || 0;
        activeDotIdx = 0;
        renderAll();
    });

    // Dot Pill Selection
    $dotsListContainer.on('click', '.dot-item-pill', function(e) {
        e.preventDefault();
        activeDotIdx = parseInt($(this).attr('data-dot-idx'), 10) || 0;
        renderDotsList();
        renderActiveDotInputs();
        renderSvgDots();
    });

    // SVG Dot Click / Selection
    $dotsLayer.on('mousedown touchstart', '.svg-dot-node', function(e) {
        e.stopPropagation();
        const clickedIdx = parseInt($(this).attr('data-dot-idx'), 10);
        if (!isNaN(clickedIdx)) {
            activeDotIdx = clickedIdx;
            renderDotsList();
            renderActiveDotInputs();
            renderSvgDots();
        }
    });

    // Metadata changes
    $inputConfigName.on('input change', function() {
        getCurrentConfig().name = $(this).val();
        renderConfigTabs();
        syncHiddenInputs();
    });

    $inputConfigDesc.on('input change', function() {
        getCurrentConfig().desc = $(this).val();
        syncHiddenInputs();
    });

    // Active Dot Coordinate Inputs
    function onDotInputChange() {
        const xVal = parseFloat($inputX.val());
        const yVal = parseFloat($inputY.val());
        const labelVal = $inputLabel.val().trim();
        const dot = getCurrentDot();
        if (!isNaN(xVal)) dot.x = Math.round(Math.max(-0.5, Math.min(6.5, xVal)) * 100) / 100;
        if (!isNaN(yVal)) dot.y = Math.round(Math.max(-3.0, Math.min(6.0, yVal)) * 100) / 100;
        dot.label = labelVal;
        renderDotsList();
        renderSvgDots();
        syncHiddenInputs();
    }
    $inputX.on('input change', onDotInputChange);
    $inputY.on('input change', onDotInputChange);
    $inputLabel.on('input change', onDotInputChange);

    // Toggle switch
    $hasStartPoint.on('change', function() {
        isEnabled = this.checked;
        renderAll();
    });

    // Add Dot
    $btnAddDot.on('click', function() {
        const cfg = getCurrentConfig();
        const curDot = getCurrentDot();
        const newX = Math.round(Math.min(6.0, curDot.x + 0.5) * 100) / 100;
        const newY = Math.round(curDot.y * 100) / 100;
        cfg.dots.push({
            x: newX,
            y: newY,
            label: `Nét ${cfg.dots.length + 1}`
        });
        activeDotIdx = cfg.dots.length - 1;
        isEnabled = true;
        renderAll();
    });

    // Delete Dot
    $btnDeleteDot.on('click', function() {
        const cfg = getCurrentConfig();
        if (cfg.dots.length <= 1) {
            toastr.info('Mỗi cấu hình cần ít nhất 1 điểm chấm.');
            return;
        }
        cfg.dots.splice(activeDotIdx, 1);
        activeDotIdx = Math.max(0, activeDotIdx - 1);
        renderAll();
    });

    // Add New Config
    $btnAddNewConfig.on('click', function() {
        const curDot = getCurrentDot();
        const newConfigNum = configs.length + 1;
        configs.push({
            id: 'cfg_' + Date.now(),
            name: `${newConfigNum}. Cấu hình mới`,
            desc: 'Giai đoạn tập viết',
            dots: [{ x: curDot.x, y: curDot.y, label: 'Nét 1' }]
        });
        activeConfigIdx = configs.length - 1;
        activeDotIdx = 0;
        isEnabled = true;
        renderAll();
    });

    // Delete Current Config
    $btnDeleteCurrentConfig.on('click', function() {
        if (configs.length <= 1) {
            toastr.warning('Chữ cần giữ lại ít nhất 1 cấu hình. Bạn có thể tắt "Bật cấu hình chấm" nếu không muốn hiển thị.');
            return;
        }
        configs.splice(activeConfigIdx, 1);
        activeConfigIdx = Math.max(0, activeConfigIdx - 1);
        activeDotIdx = 0;
        renderAll();
    });

    // Snap to 0.25 ô ly
    $btnSnap.on('click', function() {
        const dot = getCurrentDot();
        dot.x = Math.round(dot.x * 4) / 4;
        dot.y = Math.round(dot.y * 4) / 4;
        renderActiveDotInputs();
        renderDotsList();
        renderSvgDots();
        syncHiddenInputs();
    });

    // SVG Dragging & Clicking
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
        return {
            x: Math.round(Math.max(-0.5, Math.min(6.5, xOly)) * 100) / 100,
            y: Math.round(Math.max(-3.0, Math.min(6.0, yOly)) * 100) / 100
        };
    }

    $container.on('mousedown touchstart', function(e) {
        if (!isEnabled) {
            isEnabled = true;
            $hasStartPoint.prop('checked', true);
        }
        isDragging = true;
        const pos = getOlyFromEvent(e);
        const dot = getCurrentDot();
        dot.x = pos.x;
        dot.y = pos.y;
        renderActiveDotInputs();
        renderDotsList();
        renderSvgDots();
        syncHiddenInputs();
        e.preventDefault();
    });

    $(window).off('.startPoint');
    $(window).on('mousemove.startPoint touchmove.startPoint', function(e) {
        if (!isDragging || !isEnabled) return;
        const pos = getOlyFromEvent(e);
        const dot = getCurrentDot();
        dot.x = pos.x;
        dot.y = pos.y;
        renderActiveDotInputs();
        renderDotsList();
        renderSvgDots();
        syncHiddenInputs();
    });

    $(window).on('mouseup.startPoint touchend.startPoint', function() {
        if (isDragging) {
            isDragging = false;
        }
    });

    $('#editBaseModal').one('hidden.bs.modal', function() {
        $(window).off('.startPoint');
    });
};


