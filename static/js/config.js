/**
 * Application Configuration
 * Contains calibration parameters and thresholds for handwriting generator.
 */
window.APP_CONFIG = {
    wordStretch: {
        // Calculated threshold percentage that makes a small, non-bold 'o' character fit perfectly inside a square cell:
        // In HP001 (HP001N30.ttf), glyph 'o' (glyph00088) bounding box is 676 font units wide by 824 font units high.
        // In 1-cell mode, the height (824) touches the top and bottom edges of the square cell.
        // For the width to also touch the left and right cell edges (width = height = 824 font units),
        // the required horizontal stretch ratio is 824 / 676 = 1.218935 (~121.89%).
        stretchTargetPercent: 121.89,

        // Allowed horizontal stretch range (100% to 150%)
        minStretchPercent: 100,
        maxStretchPercent: 150,

        // Snapping tolerance: snaps to target threshold when within +/- this percentage
        snapTolerancePercent: 2.5
    }
};
