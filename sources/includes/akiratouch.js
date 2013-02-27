(function(){
	
var akiraTouch =
{
    enabled : false,
    friction : 0,
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
    moveAmp :
    {
        x : 1,
        y : 1
    },

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

        spd.x.mag = Math.max(0, spd.x.mag - this.friction);
        spd.y.mag = Math.max(0, spd.y.mag - this.friction);

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
            this.speed.x = this.moveAmp.x * (this.oldPos.x - this.newPos.x);
            this.speed.y = this.moveAmp.y * (this.oldPos.y - this.newPos.y);
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
        if ((this.enabled !== true && !e[this.monostableKey]) || (this.enabled === true && e[this.monostableKey])) return;
		
		// If control type is not in the upcoming list & correct mouse button pushed:
        var excludedControls = ["input", "text", "textarea", "search", "select", "select-one", "select-multiple"];
        if (excludedControls.indexOf(e.target.type) === -1 && e.button === this.activeButton)
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
        if (this.enabled !== true && !e[this.monostableKey]) return;
		
        this.newPos.x = e.clientX;
        this.newPos.y = e.clientY;
    },

    /**@brief Engage inertia mode upon button release */
    onMouseUp : function(e)
    {
        if ((this.enabled !== true && !e[this.monostableKey]) || e.button !== this.activeButton) return;
		
		window.document.removeEventListener('mousemove', onMouseMove, false);
		window.document.removeEventListener('mouseup', onMouseUp, false);
        this.state = "inertia";
    },
	
	onKeyUp : function(e)
    {
        // missing: double press key to switch mode
    },

    /**@brief Called on extension load, retrieves options */
    onMessage : function(e) // unnecessary!
    {
		var storage = widget.preferences;
		
        this.enabled		= eval(storage["akiraTouchEnabled"]);
        this.friction		= eval(storage["akiraTouchFriction"]);
        this.moveAmp.x		= eval(storage["akiraTouchMoveAmpX"]);
        this.moveAmp.y		= eval(storage["akiraTouchMoveAmpY"]);
        this.activeButton	= eval(storage["akiraTouchMouseActiveButton"]);
		this.monostableKey	= storage["akiraTouchMonostableKey"];
    }
};

// wrap up functions so they can be removed again: 
function onMouseMove(){	akiraTouch.onMouseMove.bind(akiraTouch)(window.event);	}
function onMouseUp(){	akiraTouch.onMouseUp.bind(akiraTouch)(window.event);	}

opera.extension.onmessage = function(e){ akiraTouch.onMessage(e); };

akiraTouch.addEventListeners();

})();