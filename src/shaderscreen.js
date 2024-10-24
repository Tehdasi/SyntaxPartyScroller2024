const screenRatio = 2;

const vertexShaderText= 
"#version 300 es\n" +
"precision mediump float;\n" +
"in vec2 a_position;\n" +
"void main()\n" +
"{\n"  +
"    gl_Position = vec4(a_position, 0, 1);\n" +
"}\n";

class ShaderScreen
{
    Init( fragmentShaderText  )
    {
        this.fragmentShaderText= fragmentShaderText;
        this.canvas = document.createElement("canvas");
        this.shaderCanvas = document.createElement("canvas");
        
        if (!this.canvas)
            console.log("no canvas?");

        this.setupCanvas( this.canvas, 2 );
        this.setupCanvas( this.shaderCanvas, 1 );

        {
            var bd = document.querySelector("body");
            bd.style.margin= 0;
            bd.style.padding= 0;
            bd.style.backgroundColor= 'black';
        }

        this.offscreenCanvas= new OffscreenCanvas(this.canvas.width, this.canvas.height);
        this.windowWidth= 0;
        this.windowHeight= 0;
        this.width= 0;
        this.height= 0;
        this.scale= 1;

       document.body.appendChild(this.canvas);
       document.body.appendChild(this.shaderCanvas);

       this.gl = this.shaderCanvas.getContext("webgl2", { preserveDrawingBuffer: true });
       this.shaderProgram = new GLProgram(this.gl, vertexShaderText, this.fragmentShaderText);
       this.billboard = new GLRect(this.gl);

    }

    setupCanvas( canv, zIndex )
    {
        canv.style.top = '50%';
        canv.style.left = '50%';
        canv.style.width = "100%";
        canv.style.height = "100%";
        canv.style.transform = 'translate(-50%, -50%)';
        canv.style.display= 'block';
        canv.style.position = 'absolute';
        canv.style.zIndex = zIndex;
    }

    updateCanvasSizes( canv )
    {
        canv.style.width = `${this.width}px`;
        canv.style.height = `${this.height}px`;
        canv.width= this.width;
        canv.height= this.height;
    }

    Update()
    {
        var w = window.innerWidth;
        var h = window.innerHeight;
        
        if (w != this.windowWidth || h != this.windowHeight) 
        {
            this.windowWidth = w;
            this.windowHeight = h;

            if ((w / h) > screenRatio)
            {
                this.width= h*screenRatio;
                this.height= h;
            }
            else
            {
                this.width= w;
                this.height= w/screenRatio;
            }

    
            console.log(`${this.width} ${this.height}`);

            this.updateCanvasSizes( this.canvas );
            this.updateCanvasSizes( this.shaderCanvas );

            this.offscreenCanvas.width= this.width;
            this.offscreenCanvas.height= this.height;

            this.scale= this.width/2000;

     
            let positionLocation = this.gl.getAttribLocation(this.shaderProgram.prg, "a_position");
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

            console.log('resize');
        }
    }

    setBrown()
    {

    }

    GetContext()
    {
        return this.offscreenCanvas.getContext("2d");
    }

    Present( currentTime )
    {
        this.gl.viewport(0, 0, this.width, this.height);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);
    
        this.shaderProgram.updateRes(this.width, this.height);
        this.shaderProgram.use();
        this.shaderProgram.uTime.set(currentTime/1000.0);
        

        this.billboard.render();
    
        const bitmapOne = this.offscreenCanvas.transferToImageBitmap();
        var cctx= this.canvas.getContext("bitmaprenderer");
        cctx.transferFromImageBitmap(bitmapOne);
    }

    Clear(color) 
    {
        var ctx= this.GetContext();
        ctx.resetTransform();
        
        ctx.fillStyle= color;
        ctx.fillRect( 0,0, this.width, this.height );
    }
}