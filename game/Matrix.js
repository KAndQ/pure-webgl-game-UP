this.Matrix = {};

function getNumWithMatrix(m, row, col) {
    return m[row * 3 + col];
}

/**
 * 注意这里的计算顺序, 是: MatrixB(m x p) * MatrixA(p x n)
 */
this.Matrix.multiply = function (a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];

    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];

    return [
        b00 * a00 + b01 * a10 + b02 * a20,
        b00 * a01 + b01 * a11 + b02 * a21,
        b00 * a02 + b01 * a12 + b02 * a22,

        b10 * a00 + b11 * a10 + b12 * a20,
        b10 * a01 + b11 * a11 + b12 * a21,
        b10 * a02 + b11 * a12 + b12 * a22,

        b20 * a00 + b21 * a10 + b22 * a20,
        b20 * a01 + b21 * a11 + b22 * a21,
        b20 * a02 + b21 * a12 + b22 * a22,
    ];
};

this.Matrix.print = function (m) {
    var s = "== matrix ==\n";
    for (var row = 0; row < 3; ++row) {
        for (var col = 0; col < 3; ++col) {
            s += getNumWithMatrix(m, row, col);
            if (col !== 2) {
                s += ", ";
            }
        }
        s += "\n";
    }
    s += "===========";
    console.log(s);
};

this.Matrix.translation = function (tx, ty) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
};

this.Matrix.rotation = function (radian) {
    var c = Math.cos(radian);
    var s = Math.sin(radian);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
};

this.Matrix.scaling = function (sx, sy) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
};

this.Matrix.identity = function () {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
};

this.Matrix.projection = function (width, height) {
    // 注意：这个矩阵翻转了 Y 轴，所以 0 在上方
    return [2 / width, 0, 0, 0, 2 / height, 0, -1, -1, 1];
};

this.Matrix.translate = function (m, tx, ty) {
    return Matrix.multiply(m, Matrix.translation(tx, ty));
};

this.Matrix.rotate = function (m, radian) {
    return Matrix.multiply(m, Matrix.rotation(radian));
};

this.Matrix.scale = function (m, sx, sy) {
    return Matrix.multiply(m, Matrix.scaling(sx, sy));
};
