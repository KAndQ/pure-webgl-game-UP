this.createShader = function (gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.error(type === gl.VERTEX_SHADER ? "VertexShader" : "FragmentShader\n", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

this.createProgram = function (gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // 在链接到着色程序之前, 可以手动设置属性的 location
    // gl.bindAttribLocation(program, location, nameOfAttribute)

    // 将顶点着色器和片段着色器链接在一起
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
};
