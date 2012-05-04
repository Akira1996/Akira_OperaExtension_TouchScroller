var akiraTouch =
{
	enabled : false,
	friction : 0,
	timerH : 0,
	state : "noMove",
	oldPos : {x:0,y:0},
	newPos : {x:0,y:0},
	speed : {x:0,y:0},
	
	addEventListeners : function()
	{
		window.document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		window.document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
		window.document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.timerH = window.setInterval(this.onTimer.bind(this), 50);
	},
	
	decreaseInertiaSpeed : function()
	{
		var spd=
		{
			x:{sign:1, mag:Math.abs(this.speed.x)},
			y:{sign:1, mag:Math.abs(this.speed.y)}
		};
		spd.x.sign = this.speed.x/Math.max(1, spd.x.mag);
		spd.y.sign = this.speed.y/Math.max(1, spd.y.mag);
		
		spd.x.mag = Math.max(0, spd.x.mag-this.friction);
		spd.y.mag = Math.max(0, spd.y.mag-this.friction);
		
		this.speed.x = spd.x.sign*spd.x.mag;
		this.speed.y = spd.y.sign*spd.y.mag;
	},

	/**@brief Main loop, called periodicaly */
	onTimer : function()
	{
		if(this.state == "noMove")
		{
		}
		else if (this.state == "drag")
		{		
			/* Scroll equally to mouse moves */
			window.scrollBy(this.oldPos.x-this.newPos.x,this.oldPos.y-this.newPos.y);
			/* store speed for intertia mode */
			/** @todo introduce speed smoothing */
			this.speed.x=this.oldPos.x-this.newPos.x;
			this.speed.y=this.oldPos.y-this.newPos.y;
			/* reset movement */
			this.oldPos.x = this.newPos.x;
			this.oldPos.y = this.newPos.y;
		}
		else if (this.state == "inertia")
		{
			this.decreaseInertiaSpeed()
			/* Scroll equally to computed speed */
			window.scrollBy(this.speed.x,this.speed.y);
			if((this.speed.x==0)&&(this.speed.y==0))
			{
				this.state = "noMove";
			}
		}
	},

	/**@brief Engage drag mode upon button push */
	onMouseDown : function(e)
	{
		if(this.enabled != true) return;
		if(e.target.type != 'input' && e.target.type != 'text'  && e.target.type != 'textarea')
		{
			e.preventDefault();
			this.newPos.x = e.clientX;
			this.oldPos.x = this.newPos.x;
			this.newPos.y = e.clientY;
			this.oldPos.y = this.newPos.y;
			/* enter drag mode only if left button pushed */
			if(e.button == 0)
			{
				this.state = "drag";
			}
			else
			{
				this.state = "noMove";
			}
		}
	},

	/**@brief capture mouse new position */
	onMouseMove : function(e)
	{
		if(this.enabled != true) return;
		this.newPos.x = e.clientX;
		this.newPos.y = e.clientY;
	},

	/**@brief Engage inertia mode upon button release */
	onMouseUp : function(e)
	{
		if(this.enabled != true) return;
		this.state = "inertia";
	},
	
	/**@brief Called on extension load, retrieves options */
	onMessage : function(e)
	{
		var storage = JSON.parse(e.data);
		this.enabled = eval(storage["akiraTouchEnabled"]);
		this.friction = eval(storage["akiraTouchFriction"]);
	}
}

opera.extension.onmessage = function(e){akiraTouch.onMessage(e);};
akiraTouch.addEventListeners();

