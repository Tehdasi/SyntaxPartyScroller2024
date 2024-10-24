//#includeimage syntaxLogo syntax.png
//#includeimage patternImage pat.png
//#includeimagedata fontImageData mklarge.png
//#includetext fragmentShaderText shader.frag



//#includejs state.js
//#includejs banger.js
//#includejs font.js
//#includejs shaderscreen.js
//#includejs gl.js
//#includejs scrolltext.js


const backgroundColor= "#7f6050";
const showFps= false;

var screen= new ShaderScreen();

var bodyWidth = 0, bodyHeight = 0;
var frame = 0;
var runTimeStart = performance.now();

var 
    midScreenX, midScreenY, 
    midScreenWidth, midScreenHeight;
var midscreenCentreX, midscreenCentreY;
var textScale;

var lastFrameTime = "";


var body = document.querySelector('body');


var curState = null;




class RunningState extends State 
{
    constructor()
    {
        super();
        this.sp= 0;
        this.cl= 0;
        this.md= false;
        this.backgroundOffset= 0;
        this.effectTime= 0;

        this.curEffect= 0;
        this.oldEffect= 0;
        this.crossfade= 0;
        this.reverseCrossfade= false;
        this.crossfadeType= 0;
    }


    render(ctx) 
    {
        screen.shaderProgram.brown.set(0);
        var ft= this.md ? this.lastFrameTime*6 : this.lastFrameTime;


        this.effectTime+= this.lastFrameTime;
        if( this.effectTime > 30 )
        {
            this.oldEffect= this.curEffect;
            this.curEffect= Math.floor(Math.random() * 7); 
            //this.reverse= Math.random() > 0.5;
            this.reverse= false;
            this.crossfadeType= Math.floor(Math.random() * 7); 
            this.effectTime= 0;
        }


        if( this.effectTime < 10 )
            this.crossfade= (this.effectTime/10);
        else
            this.crossfade= 1;


        if( this.reverseCrossfade )
        {
            screen.shaderProgram.effect1.set( this.oldEffect+1 );
            screen.shaderProgram.effect2.set( this.curEffect+1 );
            screen.shaderProgram.effectCrossfade.set( 1-this.crossfade );
        }
        else
        {
            screen.shaderProgram.effect1.set( this.curEffect+1 );
            screen.shaderProgram.effect2.set( this.oldEffect+1 );
            screen.shaderProgram.effectCrossfade.set( this.crossfade );
        }

        screen.shaderProgram.effectCrossfadeType.set( this.crossfadeType+1 );

        this.backgroundOffset+= ft;



        var lineHeight= glyphHeight + 5;



        let cenX= 5000;

        let lineAng= 0.01;

        for( var i= 0; i< 20; i++ )
            {
                let st= scrollText[(this.cl+i)%scrollText.length];
    
                ctx.resetTransform();
                ctx.scale(screen.scale,screen.scale);

                    if( st.length > 0 && st[0]=='*' )
                    {
                        ctx.translate(-cenX,500);
                        ctx.rotate((lineAng*i)+this.sp  - Math.PI*0.03);
                        ctx.translate(cenX+ 40,0);
                        RenderString(ctx, st.substring(1), 200, 0 );
                    }
                    else
                    {
                        ctx.translate(-cenX,500);
                        ctx.rotate((lineAng*i)+this.sp  - Math.PI*0.03);
                        ctx.translate(cenX+ 40,0);
                        RenderString(ctx, st,  (50-(st.length/2))*(glyphWidth+1) - 50, 0 );
                    }
            }


        this.sp-= ft*0.002;

        if( this.sp < 0 )
        {
            this.sp+= lineAng;
            this.cl++;

            if( this.cl == scrollText.length )
            {
                this.cl= 0;
            }
        }

//        RenderString( ctx, this.effectTime.toString(), 60,60  );
    }


    OnMouseDown(ev)
    {
        this.md= true;
    }

    OnMouseUp(ev)
    {
        this.md= false;
    }
}


function RenderCircleString( ctx, curTime, rotationSpeed, radius, txtSize, txt )
{
    for( var i= txt.length-1; i>= 0; i-- )
        {
            var oo= (i/txt.length);
            var step= oo*2.0*Math.PI;
    
            ctx.resetTransform();
    
            ctx.scale(screen.scale, screen.scale);
    
            let ang= curTime*rotationSpeed+ step;
    
            ctx.translate(
                1000+  Math.cos(ang)*radius,
                500+ Math.sin(ang)*radius );
    
                ctx.rotate( ang + Math.PI/2 );
    
    //            ctx.scale( 1+Math.sin(oo-this.curTime*0.001)*0.4, 1+Math.sin(oo-this.curTime*0.001)*0.4  );
    
            ctx.scale(txtSize,txtSize);
    //        ctx.scale( iii,iii );
    
            RenderString(ctx, txt.substring(i,i+1),  0, 0 );
        }
    
}


function RenderClickToStart(ctx, curTime, radius)
{
    RenderCircleString(ctx, curTime, 1, radius, 1, 'Click to Start - ');
    RenderCircleString(ctx, curTime, -0.5, radius*2, 0.5, 'When in the scroller, press mouse to speed up scrolling.    Uses a modified Endless Acid Banger by Vitling.    ');

    ctx.resetTransform();

}


class StartState extends State {
    render(ctx) {
        screen.shaderProgram.brown.set(1);
        screen.shaderProgram.effect1.set(0);
        screen.shaderProgram.effect2.set(0);
        RenderClickToStart(ctx, this.curTime/1000.0, 200);
    }

    OnClick() {
        this.nextState= new FadingInState();
    }
}

class FadingInState extends State {
    render(ctx) 
    {
        if (this.TotalStateTime() < 1000) 
        {
            screen.shaderProgram.brown.set(1-(this.TotalStateTime()/1000.0));
            RenderClickToStart(ctx, this.curTime/1000.0, 200 + this.TotalStateTime() );
        }
        else
        {
            startMusic();

            this.nextState= new RunningState();
        }
    }
}


function startMusic()
{
    bangerStart();
}


curState = new StartState();

screen.Init( fragmentShaderText );




screen.canvas.onclick = () => curState.OnClick();
screen.canvas.onmousedown = (ev) => curState.OnMouseDown(ev);
screen.canvas.onmouseup = (ev) => curState.OnMouseUp(ev);


LoadFont();

animate();



function animate() {
    let ts = performance.now();

    const ct = performance.now() - runTimeStart;

    screen.Update();


    var ctx = screen.GetContext();

    curState.curTime = ts;
    curState.render(ctx);

    if( curState.nextState!= null )
        curState= curState.nextState;

    var ft = performance.now() - ts;

    lastFrameTime = ft.toString();



    if( showFps )
    {
        ctx.resetTransform();
        ctx.scale( screen.scale, screen.scale );

        RenderString( ctx,lastFrameTime, 1, 1 );
    }

    screen.Present(ts);

    frame++;
    requestAnimationFrame(animate);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}