const screenRatio = 2;



class Screen
{
    Init()
    {
        this.canvas = document.createElement("canvas");
        
        if (!this.canvas)
            console.log("no canvas?");

        this.canvas.style.top = '50%';
        this.canvas.style.left = '50%';
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.display= 'block';
        this.canvas.style.position = 'absolute';

        this.canvas.style.zIndex= 5;

        {
            var bd = document.querySelector("body");
            bd.style.backgroundColor= 'black';
            bd.style.margin= 0;
            bd.style.padding= 0;
        }

        this.offscreenCanvas= new OffscreenCanvas(this.canvas.width, this.canvas.height);
        this.windowWidth= 0;
        this.windowHeight= 0;
        this.width= 0;
        this.height= 0;
        this.scale= 1;

       document.body.appendChild(this.canvas);
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

            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
    
            this.canvas.width= this.width;
            this.canvas.height= this.height;

            this.offscreenCanvas.width= this.width;
            this.offscreenCanvas.height= this.height;

            this.scale= this.width/2000;
        }
    }

    GetContext()
    {
        return this.offscreenCanvas.getContext("2d");
    }

    Present()
    {
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