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
        <nav class="navbar navbar-expand-sm navbar-light bg-light fixed-top">
            <div class="container-fluid">
                <a class="navbar-brand" href="javascript:void(0)">Glyph Editor</a>
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/getcode.html">Char to point</a>
                    </li>
                </ul>
                <button id="downloadJson" class="btn btn-success">Download JSON</button>
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

<!-- Start Point (Điểm đặt bút) Editor Section -->
<div class="card start-point-card mb-4 border shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
        <span class="fw-bold text-primary">
            <span style="color: #ef4444; font-size: 1.1rem;">●</span> Điểm đặt bút (Start Point)
        </span>
        <div class="form-check form-switch m-0">
            <input class="form-check-input" type="checkbox" id="hasStartPoint" name="hasStartPoint">
            <label class="form-check-label fw-semibold" for="hasStartPoint">Bật điểm đặt bút</label>
        </div>
    </div>
    <div class="card-body">
        <div class="row align-items-center">
            <div class="col-lg-5 col-md-6 d-flex flex-column align-items-center mb-3 mb-md-0">
                <div id="startPointPreviewContainer" class="position-relative border rounded bg-white shadow-sm user-select-none" style="width: 288px; height: 324px; cursor: crosshair; touch-action: none; overflow: hidden;">
                    <!-- SVG Grid & Glyph preview rendered dynamically -->
                </div>
                <div id="startPointGlyphBadge" class="mt-2 text-center small text-muted"></div>
                <small class="text-muted mt-1 text-center">Click hoặc kéo chấm đỏ trên lưới để chọn điểm đặt bút</small>
            </div>
            <div class="col-lg-7 col-md-6">
                <div class="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="row g-3 align-items-center mb-3">
                            <div class="col-sm-6">
                                <label for="startPointX" class="form-label fw-bold mb-1">Tọa độ X (ô ly ngang):</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text bg-white">X</span>
                                    <input type="number" step="0.05" class="form-control text-center" id="startPointX" name="startPointX" placeholder="Chưa đặt">
                                    <span class="input-group-text bg-white">ô ly</span>
                                </div>
                                <small class="text-muted">Khoảng cách từ mép trái (X = 0)</small>
                            </div>
                            <div class="col-sm-6">
                                <label for="startPointY" class="form-label fw-bold mb-1">Tọa độ Y (ô ly cao):</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text bg-white">Y</span>
                                    <input type="number" step="0.05" class="form-control text-center" id="startPointY" name="startPointY" placeholder="Chưa đặt">
                                    <span class="input-group-text bg-white">ô ly</span>
                                </div>
                                <small class="text-muted">Tính từ Baseline kẻ 1 (Y = 0)</small>
                            </div>
                        </div>
                        <div class="d-flex gap-2 flex-wrap mb-3">
                            <button type="button" class="btn btn-sm btn-outline-primary" id="btnSnapOly">
                                Làm tròn 0.25 ô ly (1/4 ô)
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger" id="btnClearStartPoint">
                                Xóa điểm đặt bút
                            </button>
                        </div>
                    </div>
                    <div class="alert alert-secondary py-2 px-3 mb-0 small" style="font-size: 0.85rem; line-height: 1.45;">
                        <div class="fw-bold mb-1">Quy chuẩn lưới ô ly tiểu học:</div>
                        <ul class="mb-0 ps-3">
                            <li><span class="badge bg-primary">Đường xanh đậm</span>: Baseline (Y = 0, Đường kẻ 1).</li>
                            <li><span class="badge bg-info text-dark">Nét đứt nhạt</span>: Đường kẻ 3 (Y = 2.0 - đỉnh chữ <code>a, o, c</code>).</li>
                            <li><span class="badge bg-info text-dark">Nét đứt cao</span>: Đường kẻ 5 (Y = 5.0 - đỉnh chữ <code>b, l, h</code>).</li>
                            <li>Tọa độ lưu theo tỷ lệ ô ly, <strong>tự động co giãn chính xác 100%</strong> cho cả cỡ to (72pt) và cỡ nhỏ (37pt).</li>
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