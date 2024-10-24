// const glyphWidth= 12;
// const glyphHeight = 22;

const glyphWidth= 25;
const glyphHeight = 49;


var charBitmaps = [];
var charShadowBitmaps = [];


function LoadFont() 
{
    var d= fontImageData;
    var setPixel = (arr, x, y, stride,c,  a) => {
        var p= (x + y * stride)*4;

        arr[p+0] = c;
        arr[p+1] = c;
        arr[p+2] = c;
        arr[p+3] = a;
    };


    var totalChars= 16*6;

    charBitmaps= [];
    charShadowBitmaps= [];

    for (var c = 0; c < totalChars; c++) 
    {
        var cy= c%16;
        var cx= Math.floor(c/16);
        var yOff= cy*(glyphHeight + 1);
        var xOff= cx*(glyphWidth + 1);

        var char = new Uint8ClampedArray(glyphWidth * glyphHeight*4);
        var shadowChar = new Uint8ClampedArray((glyphWidth+3) * (glyphHeight+3)*4);

        for (var y = 0; y < glyphHeight; y++) {
            for (var x = 0; x < glyphWidth; x++) 
            {
                var col= d.data[((x + xOff) + (y + yOff)*d.width)*4];
                setPixel( char, x, y, glyphWidth, col,col );

                if( col > 0 )
                    for( var y2= 0; y2 <= 3; y2++ )
                        for( var x2= 0; x2 <= 3; x2++ )
                            setPixel( shadowChar, x+x2, y+y2, glyphWidth+3, 0, col );
            }
        }

        createImageBitmap( new ImageData( char, glyphWidth, glyphHeight ) )
           .then( (v)=> charBitmaps.push( v ));
        createImageBitmap( new ImageData( shadowChar, glyphWidth+3, glyphHeight+3 ) )
           .then( (v)=> charShadowBitmaps.push( v ) );
    }
}


function RemapChar( ch )
{
    return ch-32;
}

function RenderString(ctx, str, x, y) {
    for (var i = 0; i < str.length; i++)
        RenderShadowChar(ctx, RemapChar( str.charCodeAt(i)), x + i * (glyphWidth+1) - 1, y-1 );

    for (var i = 0; i < str.length; i++)
        RenderChar(ctx, RemapChar( str.charCodeAt(i)), x + i * (glyphWidth+1), y);
}


function RenderShadowChar(ctx, char, x, y) {
    if( charShadowBitmaps[char] == null )
        return;

    ctx.drawImage( charShadowBitmaps[char], x,y );
}

function RenderChar(ctx, char, x, y) 
{
    if( charBitmaps[char] == null )
        return;

    ctx.drawImage( charBitmaps[char], x,y );
}
