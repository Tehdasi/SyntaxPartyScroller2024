class State 
{

    constructor()
    {
        this.curTime= performance.now();
        this.startTime= this.curTime;
        this.lastFrameTime= 0.1;
        this.nextState= null;
    }

    Render()
    {
    }

    OnClick()
    {
    }

    OnMouseDown(ev)
    {
    }

    OnMouseUp(ev)
    {
    }

    TotalStateTime()
    {
        return this.curTime - this.startTime;
    }
}