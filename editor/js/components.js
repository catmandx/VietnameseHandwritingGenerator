const components = {

}

components.loading = `
<div class="loading-container">
    <img src="./img/loading.gif" >
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
                        <a class="nav-link" href="../">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="../getcode.html">Char to point</a>
                    </li>
                </ul>
                <form class="d-flex">
                    
                </form>
                <button id="downloadJson" class="btn btn-success">Download JSON</button>
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
                <input name="newBase" id="newBaseCardInput" name="newBaseCardInput" maxlength=3 type="text" class="form-control glyph-input" placeholder="Character" aria-label="Character">
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
<div class="card m-3 pt-2 baseCard" data-bs-toggle="modal" data-bs-target="#editBaseModal">
    <div class="card-header bg-white text-center" style="font-size:72pt;">{{name}}</div>
</div>
`

components.baseEditForm = `
<form id="editBaseForm" action="#">
<div class="row">
    <div class="col-2 d-flex align-items-center justify-content-center">Editing base</div>
    <div class="col-10 d-flex align-items-center ">
        <span>Unicode:</span>
        <input id="baseUnicode" name="baseUnicode" class="glyph-display text-center" value="" type="text" disabled=true size=4>
        <span>Glyph</span>
        <input id="baseCharacter" name="baseCharacter" class="glyph glyph-display text-center" value="" size="1">
        <span>Number of types:</span>
        <input id="numberOfTypes" name="numberOfTypes" class="glyph-display text-center" value="0" size="5">
    </div>
</div>
</form>
`
components.singleTypeEditor = `
<div class="row base-type-editor border border-3" id="typeNUM-PLACEHOLDER">
    <div class="col-sm-2 d-flex align-items-center justify-content-center">
        <p class="type-num">Type NUM-PLACEHOLDER</p>
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