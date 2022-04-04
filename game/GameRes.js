const GameRes = {
    __images__: [],
    __audios__: [],
    __textures__: [],
    __USE_TEX_INDEX__: 0,

    IMG_BRICK_1: 0,
    IMG_BRICK_2: 1,
    IMG_BRICK_3: 2,
    IMG_SHUTTLE_1: 3,
    IMG_SHUTTLE_2: 4,
    IMG_TILE_BACKGROUND: 5,

    load: function (callback) {
        let count = 0;
        const imgs = ["img_brick1.png", "img_brick2.png", "img_brick3.png", "img_shuttle1.png", "img_shuttle2.png", "img_tile-background.png"];
        imgs.forEach(function (v, index) {
            const img = new Image();
            img.src = "game/res/" + v;
            img.onload = function () {
                GameRes.__images__[index] = img;

                ++count;
                if (count === imgs.length) {
                    GameRes.__images__.forEach((_, index) => {
                        const gl = GameGlobal.getGL();
                        const texture = gl.createTexture();
                        gl.activeTexture(gl.TEXTURE0 + GameRes.__USE_TEX_INDEX__);
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        switch (index) {
                            case GameRes.IMG_SHUTTLE_1:
                            case GameRes.IMG_SHUTTLE_2:
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                break;
                            default:
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                                break;
                        }
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, GameRes.__images__[index]);
                        GameRes.__textures__[index] = texture;
                    });

                    callback();
                }
            };
        });

        const audios = ["audio_bgm.mp3", "audio_click.mp3", "audio_fail.mp3"];
        audios.forEach(function (v) {
            const audio = new Audio();
            audio.src = "game/res/" + v;
            audio.onload = function () {
                GameRes.__audios__.push(audio);
            };
        });
    },

    getTexture: function (imgId) {
        return GameRes.__textures__[imgId];
    },

    getImage: function (imgId) {
        return GameRes.__images__[imgId];
    },
};
