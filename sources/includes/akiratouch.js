(function(){

var w = widget.preferences;

var akiraTouch =
{
    timerH : 0,
    state : "noMove",
    oldPos :
    {
        x : 0,
        y : 0
    },
    newPos :
    {
        x : 0,
        y : 0
    },
    speed :
    {
        x : 0,
        y : 0
    },
	bistableKey : 0,

    addEventListeners : function()
    {
        window.document.addEventListener('mousedown', this.onMouseDown.bind(this), false);		
		window.document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    },

    decreaseInertiaSpeed : function()
    {
        var spd =
        {
            x :
            {
                sign : 1,
                mag : Math.abs(this.speed.x)
            },
            y :
            {
                sign : 1,
                mag : Math.abs(this.speed.y)
            }
        };
        spd.x.sign = this.speed.x / Math.max(1, spd.x.mag);
        spd.y.sign = this.speed.y / Math.max(1, spd.y.mag);

        spd.x.mag = Math.max(0, spd.x.mag - w.akiraTouchFriction);
        spd.y.mag = Math.max(0, spd.y.mag - w.akiraTouchFriction);

        this.speed.x = spd.x.sign * spd.x.mag;
        this.speed.y = spd.y.sign * spd.y.mag;
    },

    /**@brief Main loop, called periodically */
    onTimer : function()
    {
        //if (this.state === "noMove") don't do anything
        if (this.state === "drag")
        {
            /* store speed for intertia mode */
            this.speed.x = parseInt(w.akiraTouchMoveAmpX) * (this.oldPos.x - this.newPos.x);
            this.speed.y = parseInt(w.akiraTouchMoveAmpY) * (this.oldPos.y - this.newPos.y);
            /* Scroll equally to mouse moves */
            window.scrollBy(this.speed.x, this.speed.y);
            /* reset movement */
            this.oldPos.x = this.newPos.x;
            this.oldPos.y = this.newPos.y;
        }
        else if (this.state === "inertia")
        {
            this.decreaseInertiaSpeed();
            /* Scroll equally to computed speed */
            window.scrollBy(this.speed.x, this.speed.y);
			
            if (this.speed.x === 0 && this.speed.y === 0)
            {
                this.state = "noMove";
				
				window.clearInterval(this.timerH);
				this.timerH = 0;
            }
        }
    },

    /**@brief Engage drag mode upon button push */
    onMouseDown : function(e)
    {
        if ((w.akiraTouchEnabled !== "true" && !e[w.akiraTouchMonostableKey]) || (w.akiraTouchEnabled === "true" && e[w.akiraTouchMonostableKey])) return;
		
		// If control type is not in the upcoming list & correct mouse button is pushed:
        var excludedControls = ["input", "text", "textarea", "search", "select", "select-one", "select-multiple"];
        if (excludedControls.indexOf(e.target.type) === -1 && e.button === eval(w.akiraTouchMouseActiveButton))
        {
			e.preventDefault();
			window.document.addEventListener('mousemove', onMouseMove, false);
			window.document.addEventListener('mouseup', onMouseUp, false);
			
			this.timerH = window.setInterval(this.onTimer.bind(this), 50);
			
			this.state = "drag";
			this.newPos.x = e.clientX;
			this.oldPos.x = this.newPos.x;
			this.newPos.y = e.clientY;
			this.oldPos.y = this.newPos.y;
        }
    },

    /**@brief capture mouse new position */
    onMouseMove : function(e)
    {
        if (w.akiraTouchEnabled !== "true" && !e[w.akiraTouchMonostableKey]) return;
		
        this.newPos.x = e.clientX;
        this.newPos.y = e.clientY;
    },

    /**@brief Engage inertia mode upon button release */
    onMouseUp : function(e)
    {
        if ((w.akiraTouchEnabled !== "true" && !e[w.akiraTouchMonostableKey]) || e.button !== eval(w.akiraTouchMouseActiveButton)) return;
		
		window.document.removeEventListener('mousemove', onMouseMove, false);
		window.document.removeEventListener('mouseup', onMouseUp, false);
        this.state = "inertia";
    },
	
	onKeyUp : function(e)
    {
		if	   (w.akiraTouchMonostableKey === "shiftKey")	var monostableKeyCode = 16;
		else if(w.akiraTouchMonostableKey === "ctrlKey")	var monostableKeyCode = 17;
		else if(w.akiraTouchMonostableKey === "altKey")		var monostableKeyCode = 18;
		else /* metaKey (= Cmd on Mac) */					var monostableKeyCode = 17; // will probably change with move to WebKit!
		
		if(e.which !== monostableKeyCode) return;
		
		this.bistableKey++;
		
		if(this.bistableKey === 1) window.setTimeout(function(){ akiraTouch.bistableKey = 0; }, 500);
		else //if(this.bistableKey === 2)
		{
			opera.extension.postMessage("toggleMode");
			this.bistableKey = 0;
		}
    }
};

// wrap up functions so they can be removed again: 
function onMouseMove(){	akiraTouch.onMouseMove.bind(akiraTouch)(window.event);	}
function onMouseUp(){	akiraTouch.onMouseUp.bind(akiraTouch)(window.event);	}

akiraTouch.addEventListeners();

})();