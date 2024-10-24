import os
import re
import sys
import base64
from PIL import Image

inFilename= sys.argv[1]
outDir= sys.argv[2]
inlineScript= (sys.argv[3] != 'external' )
outFilename= f"{outDir}/index.html"
scriptFilename = f"{outDir}/script.js"


def inlineFile( name, file ):
    lns= []

    with open( file ) as f:
        rd= f.read()
        for ln in rd.splitlines():
            lv= ""
            if len( lns ) == 0:
                lv= f'const {name}=`'
            lns.append(lv+ln)
    lns.append( '`;' )
    return lns


def inlineBinaryFile( name, file ):
    lns= [ f'const {name}=' ]

    with open( file, mode='rb' ) as f:
        rd= f.read()
        be= base64.b64encode( rd )

        for a in range(0, len(be), 2000 ):
            lns.append( f'"{be[a: a+2000].decode()}" +'  )

    lns.append( '"";' )
    return lns


def inlineImageFile( name, file, imagedata ):
    im= Image.open(file)

    b= bytearray()

    im= im.convert( "RGBA", None, None, None, 0 )

    id= im.getdata()

    for i in id:
        b.append( i[0] )
        b.append( i[1] )
        b.append( i[2] )
        b.append( i[3] )

    be= base64.b64encode( b )

    if imagedata:
        lns = [ f'var {name}= BuildImageData(' ]
    else:
        lns= [ f'var  {name}= null;', 'BuildBitmap(' ]

    for a in range(0, len(be), 2000 ):
        lns.append( f'"{be[a: a+2000].decode()}" +'  )

    if imagedata:
        lns.append( f'"", {im.width}, {im.height} );' )
    else:
        lns.append( f'"", {im.width}, {im.height},(v)=> {name}= v );' )

    return lns


def inlineJavascriptFile( file ):
    lns= [f'// start of {file}']

    with open( file, mode='r' ) as f:
        lns.extend( [line.rstrip() for line in f] )

    lns.append( f'// end of {file}' )

    return lns



outFile= ""

with open( inFilename ) as f:
    outFile= f.read()

lns= outFile.splitlines()
newLns= []
scriptLns= []
htmlLns= []
addBuildImage= False
addBuildImageData= False


newLns.append( "<html><body>" )

if inlineScript:
    newLns.append( "<script>" )
else:
    newLns.append('<script src="script.js">')

for i in range(0,len(lns) ):
    ln= lns[i]
    if ln.startswith('//#includetext'):
        (_, name, fn)= ln.split(' ')
        for ln2 in inlineFile( name, f'res/{fn}' ):
            scriptLns.append(ln2 )
    elif ln.startswith('//#includebinary'):
        (_, name, fn)= ln.split(' ')
        for ln2 in inlineBinaryFile( name, f'res/{fn}'):
            scriptLns.append(ln2)
    elif ln.startswith('//#includeimagedata'):
        (_, name, fn)= ln.split(' ')
        for ln2 in inlineImageFile( name, f'res/{fn}', True):
            scriptLns.append(ln2)
        addBuildImageData= True
    elif ln.startswith('//#includeimage'):
        (_, name, fn)= ln.split(' ')
        for ln2 in inlineImageFile( name, f'res/{fn}', False):
            scriptLns.append(ln2)
        addBuildImage= True
    elif ln.startswith('//#includejs'):
        (_, fn)= ln.split(' ')
        scriptLns.extend(inlineJavascriptFile( f'src/{fn}'))
    elif ln.startswith('//#html'):
        htmlLns.append( ln[8:] )
    else:
        scriptLns.append(ln)



if addBuildImage:
    scriptLns.append( "function BuildBitmap( b64data, width, height, func )" )
    scriptLns.append( "{" )
    scriptLns.append( "    var ca= Uint8ClampedArray.from(window.atob( b64data ), c => c.charCodeAt(0));" )
    scriptLns.append( "    var id= new ImageData( ca, width, height );" )
    scriptLns.append( "    createImageBitmap( id ).then( func );" )
    scriptLns.append( "}" )

if addBuildImageData:
    scriptLns.append( "function BuildImageData( b64data, width, height )" )
    scriptLns.append( "{" )
    scriptLns.append( "    var ca= Uint8ClampedArray.from(window.atob( b64data ), c => c.charCodeAt(0));" )
    scriptLns.append( "    return new ImageData( ca, width, height );" )
    scriptLns.append( "}" )

if inlineScript:
    for ln in scriptLns:
        newLns.append( ln )
else:
    with open( scriptFilename, "w" ) as f:
        for ln in scriptLns:
            f.write( ln + '\n')


newLns.append("</script>")

for ln in htmlLns:
    newLns.append( ln )

newLns.append("</body></html>")

with open( outFilename, "w" ) as f:
    for ln in newLns:
        f.write( ln + '\n')