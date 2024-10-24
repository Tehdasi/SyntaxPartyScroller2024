
class GLUniform {

    constructor(gl, prg, name, suffix) {
        this.gl = gl;
        this.name = name;
        this.suffix = suffix;
        this.location = this.gl.getUniformLocation(prg, name);
    }

    set(...values) {
        let method = "uniform" + this.suffix;
        let args = [this.location].concat(values);
        this.gl[method].apply(this.gl, args);
    }
}

class GLProgram {
    constructor( gl, vertexShaderText,fragmentShaderText) {
        this.gl = gl;
        this.prg = this.gl.createProgram();
        this.addShader(vertexShaderText, this.gl.VERTEX_SHADER);
        this.addShader(fragmentShaderText, this.gl.FRAGMENT_SHADER);

        this.gl.linkProgram(this.prg);

        if (!this.gl.getProgramParameter(this.prg, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(this.prg);
            throw `Could not compile WebGL program. \n\n${info}`;
        }



        this.gl.useProgram(this.prg);

        this.gl.uniform1i(this.gl.getUniformLocation(this.prg, "u_texture"), 0);

        this.preDemo = new GLUniform(this.gl,this.prg, "preDemo", "1i");
        this.pulse = new GLUniform(this.gl,this.prg, "pulse", "1f");
        this.uTime = new GLUniform(this.gl,this.prg, "iTime", "1f");
        this.uResolution = new GLUniform(this.gl,this.prg, "iResolution", "2f");
        this.brown = new GLUniform(this.gl,this.prg, "brown", "1f");
        this.effect1 = new GLUniform(this.gl,this.prg, "effect1", "1i");
        this.effect2 = new GLUniform(this.gl,this.prg, "effect2", "1i");
        this.effectCrossfade = new GLUniform(this.gl,this.prg, "effectCrossfade", "1f");
        this.effectCrossfadeType = new GLUniform(this.gl,this.prg, "effectCrossfadeType", "1i");
    }

    updateRes( width, height )
    {
        this.uResolution.set(width, height);
    }

    addShader(source, type) {
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        let isCompiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!isCompiled) {
            throw new Error("Shader compile error: " + this.gl.getShaderInfoLog(shader));
        }
        this.gl.attachShader(this.prg, shader);
    }
    

    addTexture(width, height, pixels) {
        var texture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            width, height,
            0,
            this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array(pixels)
        );

    }

    use() {
        this.gl.useProgram(this.prg);
    }
}

class GLRect {
    constructor( gl ) {
        this.gl= gl;
        this.verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verts, this.gl.STATIC_DRAW);
    }

    render() {
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}

function isBuiltIn(info) {
    const name = info.name;
    return name.startsWith("gl_") || name.startsWith("webgl_");
}


function glEnumToString(gl, value) {
    const keys = [];
    for (const key in gl) {
        if (gl[key] === value) {
            keys.push(key);
        }
    }
    return keys.length ? keys.join(' | ') : `0x${value.toString(16)}`;
}

function dumpGLProgram(prg) {
    var output = '';
    var shaders = gl.getAttachedShaders(prg);

    output += `program
  #shaders: ${shaders.length}
`;

    {
        output += 'Uniforms:'
        const numUniforms = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS);
        const indices = [...Array(numUniforms).keys()];
        const blockIndices = gl.getActiveUniforms(prg, indices, gl.UNIFORM_BLOCK_INDEX);
        const offsets = gl.getActiveUniforms(prg, indices, gl.UNIFORM_OFFSET);

        for (let ii = 0; ii < numUniforms; ++ii) {
            const uniformInfo = gl.getActiveUniform(prg, ii);
            if (isBuiltIn(uniformInfo)) {
                continue;
            }
            const { name, type, size } = uniformInfo;
            const blockIndex = blockIndices[ii];
            const offset = offsets[ii];

            output += `${name} ${glEnumToString(gl, type)}\n`;
        }

    }

    return output;
}


function dumpGL() {
    var output = 'dumping OpenGL\n';
    var prg = gl.getParameter(gl.CURRENT_PROGRAM);


    if (prg == null)
        output += 'No active program\n';
    else
        output += dumpGLProgram(prg);

    console.log(output);
}
