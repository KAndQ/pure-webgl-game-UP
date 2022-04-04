const GameSprite = {
    __vertexShaderSource__: `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat3 u_matrix;

out vec2 v_texcoord;

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position.xy, 1.0), 1.0);
  v_texcoord = a_texcoord;
}`,
    __fragmentShaderSource__: `#version 300 es
precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_texcoord);
}`,

    __textureLocation__: undefined,
    __matrixLocation__: undefined,

    __planeVAO__: undefined,
    __brickVAOs__: [],
    __backgroundVAO__: undefined,

    __PROJECTION_MATRIX__: undefined,
};

GameSprite.init = function () {
    const gl = GameGlobal.getGL();
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, GameSprite.__vertexShaderSource__);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, GameSprite.__fragmentShaderSource__);
    GameSprite.__program__ = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(GameSprite.__program__, "a_position");
    const texCoordAttributeLocation = gl.getAttribLocation(GameSprite.__program__, "a_texcoord");
    GameSprite.__textureLocation__ = gl.getUniformLocation(GameSprite.__program__, "u_texture");
    GameSprite.__matrixLocation__ = gl.getUniformLocation(GameSprite.__program__, "u_matrix");

    // planeVAO
    {
        GameSprite.__planeVAO__ = gl.createVertexArray();

        // set position
        gl.bindVertexArray(GameSprite.__planeVAO__);
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);

        // set texture
        gl.bindVertexArray(GameSprite.__planeVAO__);
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1.0, 1.0, 1.0, 0, 0, 0, 0, 1.0, 1.0, 1.0, 0.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
    }

    // brickVAO
    {
        const unitSize = 2.0;
        for (let i = 1; i <= 4; ++i) {
            const vao = gl.createVertexArray();

            // set position
            gl.bindVertexArray(vao);
            var positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);

            // set texture
            gl.bindVertexArray(vao);
            var texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([0, unitSize, unitSize * i, unitSize, 0, 0, 0, 0, unitSize * i, unitSize, unitSize * i, 0.0]),
                gl.STATIC_DRAW
            );
            gl.enableVertexAttribArray(texCoordAttributeLocation);
            gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);

            GameSprite.__brickVAOs__.push(vao);
        }
    }

    // backgroundVAO
    {
        GameSprite.__backgroundVAO__ = gl.createVertexArray();
        // set position
        gl.bindVertexArray(GameSprite.__backgroundVAO__);
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);

        // set texture
        gl.bindVertexArray(GameSprite.__backgroundVAO__);
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 4.0, 3.0, 4.0, 0, 0, 0, 0, 3.0, 4.0, 3.0, 0.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
    }

    GameSprite.__PROJECTION_MATRIX__ = Matrix.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
};

GameSprite.createSpaceshipSprite = function (imgId) {
    const image = GameRes.getImage(imgId);
    return {
        position: { x: 0, y: 0 },
        angle: 0,
        size: { w: image.width, h: image.height },
        imgId,
        program: undefined,
        vao: GameSprite.__planeVAO__,
    };
};

GameSprite.createBrickSprite = function (imgId, sizeType) {
    return {
        position: { x: 0, y: 0 },
        angle: 0,
        sizeType,
        size: { w: (sizeType + 1) * 64, h: 64 },
        imgId,
        program: undefined,
        vao: GameSprite.__brickVAOs__[sizeType],
    };
};

GameSprite.createBackground = function (imgId) {
    const image = GameRes.getImage(imgId);
    return {
        position: { x: 0, y: 0 },
        angle: 0,
        size: { w: image.width * 3, h: image.height * 4 },
        imgId,
        program: undefined,
        vao: GameSprite.__backgroundVAO__,
    };
};

GameSprite.draw = function (sprite) {
    if (sprite.isHide) {
        return;
    }

    const gl = GameGlobal.getGL();

    if (sprite.program === undefined) {
        gl.useProgram(GameSprite.__program__);

        gl.activeTexture(gl.TEXTURE0 + GameRes.__USE_TEX_INDEX__);
        gl.bindTexture(gl.TEXTURE_2D, GameRes.getTexture(sprite.imgId));
        gl.uniform1i(GameSprite.__textureLocation__, GameRes.__USE_TEX_INDEX__);

        gl.bindVertexArray(sprite.vao);
        let matrix = Matrix.translate(GameSprite.__PROJECTION_MATRIX__, sprite.position.x, sprite.position.y);
        switch (sprite.imgId) {
            case GameRes.IMG_SHUTTLE_1:
            case GameRes.IMG_SHUTTLE_2:
                {
                    matrix = Matrix.scale(matrix, sprite.size.w, sprite.size.h);
                }
                break;
            case GameRes.IMG_BRICK_1:
            case GameRes.IMG_BRICK_2:
            case GameRes.IMG_BRICK_3:
                {
                    matrix = Matrix.scale(matrix, sprite.size.w, sprite.size.h);
                }
                break;
            default:
                {
                    matrix = Matrix.scale(matrix, sprite.size.w, sprite.size.h);
                }
                break;
        }
        matrix = Matrix.rotate(matrix, (sprite.angle / 180) * Math.PI);
        gl.uniformMatrix3fv(GameSprite.__matrixLocation__, false, matrix);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
};
