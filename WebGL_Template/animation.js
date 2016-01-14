// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = true, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;

		
// *******************************************************	
// When the web page's window loads it creates an Animation object, which registers itself as a displayable object to our other class GL_Context -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( 85/255, 224/255, 252/255, 1 );   // Background color

		self.basis_stack = []; 	                        // Create stack to store basis
		
		// Initialize ground
		self.m_ground = new cube();
		
		// Initialize tree trunk
		self.num_cubes = 8;
		self.m_cube = [];
		for (var i = 0; i < self.num_cubes; i++) {		// Make cubes for tree trunk
			self.m_cube[i] = new cube();
		}
		
		// Initialize tree foliage
		self.m_foliage = new sphere(mat4(), 4);
		
	    // Initialize bee body 
		self.m_upperBody = new cube();
		self.m_lowerBody = new sphere(mat4(), 4);
		self.m_head = new sphere(mat4(), 4);
		
		// Initialize bee wings
		self.m_wingl = new cube();
		self.m_wingr = new cube();

		// Initialize bee legs
		self.m_legsl = new Array(3);
		self.m_legsr = new Array(3);
		for (var j = 0; j < 3; j++) {               // Index j == 0 is leg closest to head
		    self.m_legsl[j] = new Array(2);
		    self.m_legsr[j] = new Array(2);
		    for (var k = 0; k < 2; k++) {
		        self.m_legsl[j][k] = new cube();        // Index [j][0] is upper leg, [j][1] is lower leg
		        self.m_legsr[j][k] = new cube();
		    }
		}
				
		self.camera_transform = mult(rotate(10, 1, 0, 0), translate(0, -15, -50));            // Official start camera angle
		//self.camera_transform = mult(rotate(0, 0, 1, 0), translate(29.5, -16.5, -10));            // Debug camera angle
		//self.camera_transform = mult(rotate(10, 1, 0, 0), translate(0, -16, -40));            // Debug camera angle

		self.projection_transform = perspective(45, canvas.width / canvas.height, .1, 100);		// The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		
		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.animation_time = 0
		self.context.render();	
	} ) ( this );	
	
	//canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
 Animation.prototype.init_keys = function()
 {
	// shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	// shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	// shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	// shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	// shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	// shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	// shortcut.add( "f",     function() { looking = !looking; } );
	// shortcut.add( ",",     ( function(self) { return function() { self.camera_transform = mult( rotate( 3, 0, 0,  1 ), self.camera_transform ); }; } ) (this) ) ;
	// shortcut.add( ".",     ( function(self) { return function() { self.camera_transform = mult( rotate( 3, 0, 0, -1 ), self.camera_transform ); }; } ) (this) ) ;

	// shortcut.add( "r",     ( function(self) { return function() { self.camera_transform = mat4(); }; } ) (this) );
	// shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		// gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	// shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	// shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	// shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	// shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	// shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	
 }

function update_camera( self, animation_delta_time )
{
	// var leeway = 70, border = 50;
	// var degrees_per_frame = .0005 * animation_delta_time;
	// var meters_per_frame  = .03 * animation_delta_time;
																				//Determine camera rotation movement first
	// var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
	// var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
	// var outside_border = false;
	
	// for( var i = 0; i < 2; i++ )
		// if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

	// for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
	// {
		// var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
		// self.camera_transform = mult( rotate( velocity, i, 1-i, 0 ), self.camera_transform );			// On X step, rotate around Y axis, and vice versa.
	// }
	// self.camera_transform = mult( translate( scale_vec( meters_per_frame, thrust ) ), self.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		var animation_delta_time = time - prev_time;
		if(animate) this.animation_time += animation_delta_time;
		prev_time = time;
		
		//update_camera( this, animation_delta_time );
			
		//var basis_id = 0;
		
		var model_transform = mat4(1);                      // Identity matrix to start with
		
		/**********************************
		Start coding here!!!!
		**********************************/

		model_transform = this.drawGround(model_transform);
		model_transform = this.drawTree(model_transform);
		model_transform = this.drawBee(model_transform);

		model_transform = this.basis_stack.pop();           // Stack should be empty now and model_transform should be identity matrix		 		 		
	}	



Animation.prototype.update_strings = function( debug_screen_object )		// Strings this particular class contributes to the UI
{
	// debug_screen_object.string_map["time"] = "Time: " + this.animation_time/1000 + "s";
	// debug_screen_object.string_map["basis"] = "Showing basis: " + this.m_axis.basis_selection;
	// debug_screen_object.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	// debug_screen_object.string_map["thrust"] = "Thrust: " + thrust;
}

Animation.prototype.drawGround = function (model_transform)
{
    /* Basis ground
    Enters at origin (identity matrix)
    Returns at origin
    */

    gl.uniform4fv(g_addrs.color_loc, vec4(53 / 255, 67 / 255, 26 / 255, 1));        // Ground color
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, scale(150, 1, 150));

    this.m_ground.draw(model_transform, this.camera_transform, this.projection_transform);
	
    return this.basis_stack.pop();
}

Animation.prototype.drawTree = function(model_transform)
{
    /* Draw tree
    Enters at origin
    Returns at bottom of tree trunk (rotated origin)
    */

	// START tree trunk
	//var y = 1;
	//var s = 20;
	//var h = 10;
	//var neg = Math.sin(this.animation_time/1000);
	//var x = Math.pow(10,(y-h)/s)*neg;
	//var x_delta = 0;
	//var y_delta = .7;

	var stem_angle = 5*Math.sin(this.animation_time/1000);
	
	gl.uniform4fv(g_addrs.color_loc, vec4(140 / 255, 83 / 255, 29 / 255, 1));			// Tree trunk color		
	this.basis_stack.push(model_transform);
	model_transform = mult(model_transform, rotate(15, 0, -1, 0));                      // Origin of tree trunk
    //model_transform = mult(model_transform, rotate(90, 0, -1, 0));                     // Debug tree trunk rotations
	//model_transform = mult(model_transform, rotate(0, 0, -1, 0));                      // Debug tree trunk rotations
	 
	for (var i = 0; i < this.m_cube.length ; i++) {
        // Alternate method to sway tree involves sliding boxes according to a log function (harder to implement though)

	    //this.m_cube[i].draw( model_transform, this.camera_transform, this.projection_transform );
		//y++;
		//x_delta = Math.pow(10,(y-h)/s)*neg - x;
		//x = Math.pow(10,(y-h)/s)*neg;
		//this.basis_stack.push(model_transform);
	    //model_transform = mult(model_transform, translate(x_delta, y_delta, 0));

	    this.m_cube[i].draw(model_transform, this.camera_transform, this.projection_transform);
	    model_transform = mult(model_transform, translate(0,.5,0));
	    this.basis_stack.push(model_transform);
	    model_transform = mult(mult(model_transform, rotate(stem_angle, 0, 0, -1)), translate(0, .5, 0));
	}
    model_transform = this.basis_stack.pop()        // Go back one because we did not use the last transform in the for loop
    // END tree trunk
	
	// START tree foliage
	gl.uniform4fv( g_addrs.color_loc, vec4( 254/255, 0/255, 0/255, 1 ) );		        // Tree foliage color
	this.basis_stack.push(model_transform);
	model_transform = mult(mult(model_transform, translate(0, 2, 0)), scale(3, 3, 3));
	
	this.m_foliage.draw(model_transform, this.camera_transform, this.projection_transform);
    // END tree foliage
    
	return this.basis_stack.splice(-this.m_cube.length, this.m_cube.length)[0];		    // Go back to origin of trunk basis
}

Animation.prototype.drawBee = function(model_transform)
{
    /* Draw bee body
    Enters at bottom of tree trunk
    Returns at bottom of tree trunk
    */

    var ubody_scale = 2;
    var lbody_scale = 2;
    var lbody_trans = ubody_scale/2 + lbody_scale;
    var head_scale = .5;
    var head_trans = ubody_scale/2 + head_scale;
    var wing_scale = [1,.2,3];
    var wingl_trans = [[0, .5, .5],[0,.1,1.5]];
    var wingr_trans = [[0, .5, -.5], [0, .1, -1.5]];

    var body_rotation = (this.animation_time / 20) % 360;
    var body_height = 10 + 2 * Math.sin(this.animation_time / 200);
    var wing_angle = 15 * (Math.sin((this.animation_time / 50)) + 1);

    // START bee body
    // Upper body
    gl.uniform4fv(g_addrs.color_loc, vec4(85 / 255, 83 / 255, 86 / 255, 1));		    // Bee upper body color
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(body_rotation,0,-1,0)), translate(0, body_height, 20)), scale(ubody_scale, 1, 1));
    this.m_upperBody.draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = mult(model_transform, scale(1 / ubody_scale, 1, 1));              // Undo upper body scale

    // Lower body
    gl.uniform4fv(g_addrs.color_loc, vec4(233 / 255, 232 / 255, 0 / 255, 1));		    // Bee lower body color
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(model_transform, translate(lbody_trans, 0, 0)), scale(lbody_scale, 1, 1));
    this.m_lowerBody.draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = this.basis_stack.pop();                                         // Go back to upper body basis
    
    // Head
    gl.uniform4fv(g_addrs.color_loc, vec4(88 / 255, 57 / 255, 147 / 255, 1));		    // Bee head color
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(model_transform, translate(-head_trans, 0, 0)), scale(head_scale, head_scale, head_scale));
    this.m_head.draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = this.basis_stack.pop()                                            // Go back to upper body basis
    // END bee body


    // START bee wings
    // Left wing
    gl.uniform4fv(g_addrs.color_loc, vec4(134 / 255, 134 / 255, 134 / 255, 1));		    // Bee wing color
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(wingl_trans[0]));                 // Find basis of top left corner of upper body
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(wing_angle,-1,0,0)), translate(wingl_trans[1])), scale(wing_scale));
    this.m_wingl.draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = this.basis_stack.splice(-2,2)[0]                                  // Go back to upper body basis

    // Right wing
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(wingr_trans[0]));                 // Find basis of top right corner of upper body
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(wing_angle,1,0,0)), translate(wingr_trans[1])), scale(wing_scale));
    this.m_wingr.draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = this.basis_stack.splice(-2,2)[0]                                  // Go back to upper body basis
    // END bee wings


    // START bee legs
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(-.75, -.5, 0));                   // Translate along x-axis to position of front pair of legs
    model_transform = this.drawLegs(0, model_transform);
    model_transform = this.basis_stack.pop();

    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(0, -.5, 0));                      // Translate along x-axis to position of middle pair of legs
    model_transform = this.drawLegs(1, model_transform);
    model_transform = this.basis_stack.pop();

    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(.75, -.5, 0));                    // Translate along x-axis to position of back pair of legs
    model_transform = this.drawLegs(2, model_transform);
    model_transform = this.basis_stack.pop();
    // END bee legs

    return this.basis_stack.pop();
}

Animation.prototype.drawLegs = function(index, model_transform)
{
    /* Draw pair of legs
    Enter at center of bee body, on x-axis target position
    Exit at same position it came in with
    */
    
    var leg_angle = 15*(Math.sin(this.animation_time/1000)+1);

    // Upper left leg
    gl.uniform4fv(g_addrs.color_loc, vec4(233 / 255, 232 / 255, 0 / 255, 1));		                                        // Bee upper leg color
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(0, 0, .5));                                                           // Translate to origin of left side leg, the basis we will rotate around
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(leg_angle, 1, 0, 0)), translate(0,-.25,.1)), scale(.2, .5, .2));           // Do any scaling and rotation needed for leg shape/animation
    this.m_legsl[index][0].draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = mult(model_transform, scale(5, 2, 5));                                                                // Undo scale

    // Lower left leg
    gl.uniform4fv(g_addrs.color_loc, vec4(85 / 255, 83 / 255, 86 / 255, 1));		                                        // Bee lower leg color
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(0, -.25, -.1));                                                       // Translate to new basis (bottom inner point of upper leg)
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(leg_angle, 1, 0, 0)), translate(0, -.25, .1)), scale(.2, .5, .2));         // Do any scaling and rotation needed for leg shape/animation
    this.m_legsl[index][1].draw(model_transform, this.camera_transform, this.projection_transform);

    // Upper right leg
    gl.uniform4fv(g_addrs.color_loc, vec4(233 / 255, 232 / 255, 0 / 255, 1));		                                        // Bee lower leg color
    model_transform = this.basis_stack.splice(-4, 4)[0];
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(0, 0, -.5));                                                          // Translate to origin of left side leg, the basis we will rotate around
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(leg_angle, -1, 0, 0)), translate(0, -.25, -.1)), scale(.2, .5, .2));       // Do any scaling and rotation needed for leg shape/animation
    this.m_legsr[index][0].draw(model_transform, this.camera_transform, this.projection_transform);
    model_transform = mult(model_transform, scale(5, 2, 5));                                                                // Undo scale

    // Lower right leg
    gl.uniform4fv(g_addrs.color_loc, vec4(85 / 255, 83 / 255, 86 / 255, 1));		                                        // Bee upper leg color
    this.basis_stack.push(model_transform);
    model_transform = mult(model_transform, translate(0, -.25, .1));                                                       // Translate to new basis (bottom inner point of upper leg)
    this.basis_stack.push(model_transform);
    model_transform = mult(mult(mult(model_transform, rotate(leg_angle, -1, 0, 0)), translate(0, -.25, -.1)), scale(.2, .5, .2));         // Do any scaling and rotation needed for leg shape/animation
    this.m_legsl[index][1].draw(model_transform, this.camera_transform, this.projection_transform);

    return this.basis_stack.splice(-4, 4)[0];
}