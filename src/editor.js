//#html <p> Put your handle and the text that will be in the scroller below, then whack that  'Send Email' link</p>
//#html <p> All text will be centre justified and scrolled vertically. Each line should be a max of 50 chars and only ASCII.
//#html If there is some kind of problem I'll try to contact you, and if not possible, I'll try to edit the text to sort it out.</p>
//#html <p>Also remember to put your handle somewhere in the text so that the reader knows who wrote the text, 
//#html the handle textbox is just so I know who sent the text, it will not be shown in the scroller.
//#html </p>
//#html <div>
//#html <p style="font-size: 40px;">
//#html     Handle:
//#html <input id="handle" style="font-size: 40px;"></inpur>
//#html <a id="maillink" href="mailto:syntaxpartyscroller2024@proton.me?subject=stuff&body=body">Send Mail</a>
//#html </p>
//#html <p>Text:</p>
//#html <p>
//#html <textarea id="ta" rows="30" cols="50" style="width: 100%;"></textarea>
//#html </p>
//#html <p>
//#html     
//#html </p>
//#html </div>



function constructMailto()
{
    var textElem= document.getElementById("ta");
    var handleElem= document.getElementById("handle");
    var mailElem= document.getElementById("maillink");

    var bd= textElem.value;

    bd= bd.replace( '\\', '\\\\' );

    bd= bd.split("\n");

    bd= bd.map( (ln) => `%09'${ln}',%0A` );

    bd.splice(0,0,`// ${handleElem.value}%0A`);

    mailElem.href= `mailto:syntaxpartyscroller2024@proton.me?subject=text from ${handleElem.value}&body=${bd.join('')}`;
}

function setListener()
{
    var elem= document.getElementById("ta");

    if( elem!= null )
    {
        elem.addEventListener("input", constructMailto )
        elem= document.getElementById("handle");
        elem.addEventListener("input",constructMailto);
    }
    else
        setTimeout( setListener, 100 );
}

setListener();