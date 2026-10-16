const components = {

}

components.loading = `
<div class="loading-container">
    <img src="/static/img/loading.gif" alt="Đang tải...">
</div>
`

components.baseListPage = `
<div class="row">
    <div class="col">
        <nav class="navbar navbar-expand-md navbar-light bg-light fixed-top border-bottom shadow-sm">
            <div class="container-fluid">
                <a class="navbar-brand fw-bold text-primary" href="javascript:void(0)">
                    <i class="fa-solid fa-sliders me-1"></i> Glyph Editor
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#editorNavbar">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="editorNavbar">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="/"><i class="fa-solid fa-house me-1"></i> Trang chủ</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/getcode.html"><i class="fa-solid fa-code me-1"></i> Char to code</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="https://github.com/catmandx-llm-playground/VietnameseHandwritingGenerator" target="_blank" rel="noopener noreferrer">
                                <i class="fa-brands fa-github me-1"></i> GitHub
                            </a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <input type="file" id="importJsonFileInput" accept=".json,application/json" style="display:none;">
                        <button id="btnImportJson" class="btn btn-outline-primary" type="button" title="Nạp trực tiếp file all.json từ máy tính vào trình biên tập">
                            <i class="fa-solid fa-file-import me-1"></i> Nạp JSON
                        </button>
                        
                        <div class="btn-group">
                            <button id="downloadJsonTimestamped" type="button" class="btn btn-success" title="Tải JSON có kèm mốc thời gian để tránh trùng tên file">
                                <i class="fa-solid fa-download me-1"></i> Tải JSON
                            </button>
                            <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="visually-hidden">Tùy chọn tải JSON</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow">
                                <li>
                                    <button class="dropdown-item" id="downloadJsonTimestampedOption" type="button">
                                        <i class="fa-regular fa-clock me-2 text-primary"></i>Tải có mốc thời gian (all-YYYYMMDD-HHmmss.json)
                                    </button>
                                </li>
                                <li>
                                    <button class="dropdown-item" id="downloadJsonRawOption" type="button">
                                        <i class="fa-solid fa-file-code me-2 text-success"></i>Tải file gốc (all.json - để ghi đè)
                                    </button>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <button class="dropdown-item" id="copyJsonToClipboardOption" type="button">
                                        <i class="fa-regular fa-copy me-2 text-secondary"></i>Sao chép JSON vào Clipboard
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</div>

<div class="row" style="margin-top:80px">
    <div class="col-md-12 d-flex flex-wrap" id="baseList">
        <div class="card m-3 pt-2 baseCard" data-bs-toggle="modal" data-bs-target="#addNewBaseCardModal">
            <div class="card-header bg-white text-center" style="font-size:72pt;">+</div>
        </div>
    </div>
</div>

<div class="row mt-4 mb-3">
    <div class="col-12 text-center text-muted small border-top pt-3">
        Dự án nguồn mở phát triển bởi <strong><a href="https://github.com/catmandx" target="_blank" rel="noopener noreferrer" class="text-decoration-none">catmandx</a></strong> (<a href="https://github.com/catmandx-llm-playground/VietnameseHandwritingGenerator" target="_blank" rel="noopener noreferrer" class="text-decoration-none"><i class="fa-brands fa-github"></i> VietnameseHandwritingGenerator</a>) &bull; Phông chữ tập viết <strong>HP001</strong> thuộc bản quyền của <a href="http://nhainhp.com/?page=taive" target="_blank" rel="noopener noreferrer" class="text-decoration-none">Nhà in HP (nhainhp.com)</a>
    </div>
</div>

<div class="modal fade" id="addNewBaseCardModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">

        <!-- Modal Header -->
        <div class="modal-header">
            <h4 class="modal-title">Add new</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <!-- Modal body -->
        <div class="modal-body">
            <form id="newBaseCardForm" action="#">
                <input name="newBase" id="newBaseCardInput" maxlength=3 type="text" class="form-control glyph-input" placeholder="Character" aria-label="Character">
            </form>
        </div>

        <!-- Modal footer -->
        <div class="modal-footer">
            <button id="btnCloseNewBaseModal" type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        </div>

        </div>
    </div>
</div>
<div class="modal fade" id="editBaseModal" tabindex="-1">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">

        <!-- Modal Header -->
        <div class="modal-header">
            <h4 class="modal-title p-1">Change base </h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <!-- Modal body -->
        <div class="modal-body">
            change base
        </div>

        <!-- Modal footer -->
        <div class="modal-footer">
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
            <button type="submit" form="editBaseForm" class="btn btn-success" id="saveButton">Save</button>
            <button type="button" class="btn btn-warning" id="addNewTypeButton">Add new type</button>
        </div>

        </div>
    </div>
</div>
`

components.baseCard = `
<div class="card m-3 pt-2 baseCard position-relative" data-bs-toggle="modal" data-bs-target="#editBaseModal" data-base-name="{{name}}">
    {{dotBadge}}
    <div class="card-header bg-white text-center" style="font-size:72pt;">{{name}}</div>
</div>
`

components.baseEditForm = `
<form id="editBaseForm" action="#">
<div class="row bg-white p-2 rounded border mb-3">
    <div class="col-sm-2 d-flex align-items-center justify-content-center fw-bold text-secondary">Editing base</div>
    <div class="col-sm-10 d-flex align-items-center flex-wrap gap-2">
        <span class="fw-semibold">Unicode:</span>
        <input id="baseUnicode" name="baseUnicode" class="glyph-display text-center form-control-sm" value="" type="text" disabled=true size=4>
        <span class="fw-semibold ms-2">Glyph:</span>
        <input id="baseCharacter" name="baseCharacter" class="glyph glyph-display text-center" value="" size="1">
        <span class="fw-semibold ms-2">Number of types:</span>
        <input id="numberOfTypes" name="numberOfTypes" class="glyph-display text-center form-control-sm" value="0" size="3">
    </div>
</div>

<!-- Dotting Configurations (Cấu hình chấm ô ly) Editor Section -->
<div class="card start-point-card mb-4 border shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
        <span class="fw-bold text-primary">
            <i class="fa-solid fa-braille text-danger me-1"></i> Cấu hình chấm (Dotting Configurations)
        </span>
        <div class="form-check form-switch m-0">
            <input class="form-check-input" type="checkbox" id="hasStartPoint" name="hasStartPoint">
            <label class="form-check-label fw-semibold" for="hasStartPoint">Bật cấu hình chấm</label>
        </div>
    </div>
    <div class="card-body">
        <div class="row">
            <!-- Left Column: Interactive SVG Grid & Glyph Preview -->
            <div class="col-lg-6 col-md-12 d-flex flex-column align-items-center mb-3 mb-lg-0">
                <div id="startPointPreviewContainer" class="position-relative border rounded bg-white shadow-sm user-select-none" style="width: 448px; max-width: 100%; height: 504px; cursor: crosshair; touch-action: none; overflow: hidden;">
                    <!-- SVG Grid & Glyph preview rendered dynamically -->
                </div>
                <div id="startPointGlyphBadge" class="mt-2 text-center small text-muted"></div>
                <div class="mt-1 text-center small text-muted">
                    <i class="fa-solid fa-arrows-up-down-left-right text-primary me-1"></i><span>Click chấm để chọn / kéo để định vị</span>
                </div>
            </div>

            <!-- Right Column: Configurations & Dots Manager -->
            <div class="col-lg-6 col-md-12">
                <div class="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
                    <div>
                        <!-- Hidden field storing the full dotConfigs JSON for form submission -->
                        <input type="hidden" id="dotConfigsJson" name="dotConfigsJson" value="">
                        <!-- Hidden startPoint X/Y for backwards compatibility -->
                        <input type="hidden" id="startPointX" name="startPointX" value="">
                        <input type="hidden" id="startPointY" name="startPointY" value="">

                        <!-- Config Selector / Tabs -->
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <label class="form-label fw-bold small text-secondary text-uppercase mb-0">Cấu hình chấm của chữ:</label>
                                <button type="button" class="btn btn-xs btn-outline-primary py-0 px-2" id="btnAddNewConfig" style="font-size: 0.78rem;">
                                    <i class="fa-solid fa-plus"></i> Thêm cấu hình
                                </button>
                            </div>
                            <div id="dotConfigTabsContainer" class="d-flex gap-1 flex-wrap">
                                <!-- Dynamic config pills -->
                            </div>
                        </div>

                        <!-- Config Metadata Form -->
                        <div class="row g-2 mb-3 bg-white p-2 rounded border">
                            <div class="col-sm-6">
                                <label for="dotConfigName" class="form-label fw-semibold small mb-1">Tên cấu hình:</label>
                                <input type="text" class="form-control form-control-sm" id="dotConfigName" placeholder="vd: 1. Điểm đặt bút (Chuẩn)">
                            </div>
                            <div class="col-sm-6">
                                <label for="dotConfigDesc" class="form-label fw-semibold small mb-1">Mô tả / Giai đoạn:</label>
                                <input type="text" class="form-control form-control-sm" id="dotConfigDesc" placeholder="vd: 1 chấm, Nét 1...">
                            </div>
                        </div>

                        <!-- Active Dot Selection & Editing -->
                        <div class="p-2 bg-white rounded border mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-bold small text-primary" id="selectedDotHeading">
                                    <i class="fa-solid fa-circle-dot text-danger"></i> Chấm đang chọn: Chấm 1
                                </span>
                                <div class="d-flex gap-1">
                                    <button type="button" class="btn btn-xs btn-outline-success py-0 px-2" id="btnAddDot" style="font-size: 0.78rem;" title="Thêm chấm mới vào cấu hình này">
                                        <i class="fa-solid fa-plus"></i> Thêm chấm
                                    </button>
                                    <button type="button" class="btn btn-xs btn-outline-danger py-0 px-2" id="btnDeleteDot" style="font-size: 0.78rem;" title="Xóa chấm này">
                                        <i class="fa-solid fa-trash"></i> Xóa chấm
                                    </button>
                                </div>
                            </div>

                            <div class="row g-2 align-items-center mb-2">
                                <div class="col-4">
                                    <label for="dotInputX" class="form-label small fw-semibold mb-0">X (ngang):</label>
                                    <div class="input-group input-group-sm">
                                        <input type="number" step="0.05" class="form-control text-center px-1" id="dotInputX">
                                        <span class="input-group-text px-1 bg-light small">li</span>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <label for="dotInputY" class="form-label small fw-semibold mb-0">Y (cao):</label>
                                    <div class="input-group input-group-sm">
                                        <input type="number" step="0.05" class="form-control text-center px-1" id="dotInputY">
                                        <span class="input-group-text px-1 bg-light small">li</span>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <label for="dotInputLabel" class="form-label small fw-semibold mb-0">Nhãn/Tên nét:</label>
                                    <input type="text" class="form-control form-control-sm text-center px-1" id="dotInputLabel" placeholder="Nét 1">
                                </div>
                            </div>

                            <!-- List of dots in current config -->
                            <div id="configDotsListContainer" class="d-flex gap-1 flex-wrap pt-1 border-top">
                                <!-- Dynamic dots badges -->
                            </div>
                        </div>

                        <!-- Action Toolbar -->
                        <div class="d-flex gap-2 flex-wrap mb-2">
                            <button type="button" class="btn btn-sm btn-outline-primary" id="btnSnapOly">
                                Làm tròn 0.25 ô ly
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="btnDeleteCurrentConfig">
                                Xóa cấu hình này
                            </button>
                        </div>
                    </div>

                    <div class="alert alert-secondary py-2 px-3 mb-0 small" style="font-size: 0.8rem; line-height: 1.4;">
                        <div class="fw-bold mb-1">Quy chuẩn lưới ô ly tiểu học:</div>
                        <ul class="mb-0 ps-3">
                            <li><strong>Baseline kẻ 1 (Y = 0)</strong>: Đường màu xanh đậm.</li>
                            <li><strong>ĐK 3 (Y = 2.0)</strong>: Đỉnh chữ thấp <code>a, o, c</code>. <strong>ĐK 5 (Y = 5.0)</strong>: Đỉnh nét khuyết <code>b, l, h</code>.</li>
                            <li>Có thể lưu nhiều cấu hình cho từng giai đoạn tập viết hoặc nét chữ phức hợp (như chữ <code>B</code>, <code>H</code>).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</form>
`
components.singleTypeEditor = `
<div class="row base-type-editor border border-3 mb-3" id="typeNUM-PLACEHOLDER">
    <div class="col-sm-2 d-flex flex-column align-items-center justify-content-center p-2">
        <p class="type-num fw-bold mb-2">Type NUM-PLACEHOLDER</p>
        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-type" data-type-num="NUM-PLACEHOLDER" title="Xóa Type này">
            Xóa Type
        </button>
    </div>
    <div class="col-sm-10">
        <div class="row  d-flex align-items-center p-2">                                
            <label for="isCapNUM-PLACEHOLDER" class="col-4 col-sm-2">Capitalization</label>
            <div class="col-8 col-sm-10">
                <input type="checkbox" name="isCapNUM-PLACEHOLDER" id="isCapNUM-PLACEHOLDER">
            </div>
        </div>
        
        <div class="row">
            <div class="col-2 col-sm-2 text-center">
                <p>Level (Ngang)</p>
                <p><input id="levelNUM-PLACEHOLDER" name="levelNUM-PLACEHOLDER" class="text-center" value="" type="text" size=4></p>
                <input type="text" id="glyphinputlevelNUM-PLACEHOLDER" name="glyphinputlevelNUM-PLACEHOLDER" for="levelNUM-PLACEHOLDER" oninput="handleGlyphInput(this)" class="glyph text-center input-padding" value="" size="1" maxlength="5">
            </div>
            <div class="col-2 col-sm-2 text-center">
                <p>Acute (Sắc)</p>
                <p><input id="acuteNUM-PLACEHOLDER" name="acuteNUM-PLACEHOLDER" class="text-center" value="" type="text" size=4></p>
                <input type="text" id="glyphinputacuteNUM-PLACEHOLDER" name="glyphinputacuteNUM-PLACEHOLDER" for="acuteNUM-PLACEHOLDER" oninput="handleGlyphInput(this)" class="glyph text-center input-padding" value="" size="1" maxlength="5">
            </div><div class="col-2 col-sm-2 text-center">
                <p>Lower (Huyền)</p>
                <p><input id="lowerNUM-PLACEHOLDER" name="lowerNUM-PLACEHOLDER" class="text-center" value="" type="text" size=4></p>
                <input type="text" id="glyphinputlowerNUM-PLACEHOLDER" name="glyphinputlowerNUM-PLACEHOLDER" for="lowerNUM-PLACEHOLDER" oninput="handleGlyphInput(this)" class="glyph text-center input-padding" value="" size="1" maxlength="5">
            </div><div class="col-2 col-sm-2 text-center">
                <p>Rising (Hỏi)</p>
                <p><input id="risingNUM-PLACEHOLDER" name="risingNUM-PLACEHOLDER" class="text-center" value="" type="text" size=4></p>
                <input type="text" id="glyphinputrisingNUM-PLACEHOLDER" name="glyphinputrisingNUM-PLACEHOLDER" for="risingNUM-PLACEHOLDER" oninput="handleGlyphInput(this)" class="glyph text-center input-padding" value="" size="1" maxlength="5">
            </div><div class="col-2 col-sm-2 text-center">
                <p>Raised (Ngã)</p>
                <p><input id="raisedNUM-PLACEHOLDER" name="raisedNUM-PLACEHOLDER" class="text-center" value="" type="text" size=4></p>
                <input type="text" id="glyphinputraisedNUM-PLACEHOLDER" name="glyphinputraisedNUM-PLACEHOLDER" for="raisedNUM-PLACEHOLDER" oninput="handleGlyphInput(this)" class="glyph text-center input-padding" value="" size="1   " maxlength="5">
            </div><div class="col-2 col-sm-2 text-center">
                <p>Heavy (Nặng)</p>
                <p><input id="heavyNUM-PLACEHOLDER" name="heavyNUM-PLACEHOLDER" class="text-center" value="" type="text" size=4></p>
                <input type="text" id="glyphinputheavyNUM-PLACEHOLDER" name="glyphinputheavyNUM-PLACEHOLDER" for="heavyNUM-PLACEHOLDER" oninput="handleGlyphInput(this)" class="glyph text-center input-padding" value="" size="1" maxlength="5">
            </div>
        </div>
        <div class="row  d-flex align-items-center p-2">                                
            <div class="col-4 col-sm-2">Previous</div>
            <div class="col-6 col-sm-4 d-flex align-items-center">
                <textarea id="prevNUM-PLACEHOLDER" name="prevNUM-PLACEHOLDER" cols="30" rows="4" class="not-resizable"></textarea>
            </div>
            <label for="noNeedPrevNUM-PLACEHOLDER" class="col-4 col-sm-1">No need?</label>
            <div class="col-8 col-sm-2 d-flex align-items-center">
                <input type="checkbox" id="noNeedPrevNUM-PLACEHOLDER" name="noNeedPrevNUM-PLACEHOLDER">
            </div>
        </div>
        <div class="row  d-flex align-items-center p-2">                                
            <div class="col-4 col-sm-2">Next</div>
            <div class="col-6 col-sm-4 d-flex align-items-center">
                <textarea id="nextNUM-PLACEHOLDER" name="nextNUM-PLACEHOLDER" cols="30" rows="4" class="not-resizable"></textarea>
            </div>
            <label for="noNeedNextNUM-PLACEHOLDER" class="col-4 col-sm-1">No need?</label>
            <div class="col-8 col-sm-2 d-flex align-items-center">
                <input type="checkbox" id="noNeedNextNUM-PLACEHOLDER" name="noNeedNextNUM-PLACEHOLDER">
            </div>
        </div>
    </div>
</div>
`