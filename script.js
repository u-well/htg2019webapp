// adapted from https://codepen.io/tholman/pen/lDLhk

function Banner(){
	
    var keyword1 = "UGLY";
    var keyword2 = "ASH";
    var keyword3 = "FEELINGS";
      var canvas;
      var context;
      
      var bgCanvas;
      var bgContext;
      
      var denseness = 10;
      
      //Each particle/icon
      var parts = [];
      
      var mouse = {x:-100,y:-100};
      var mouseOnScreen = false;
      
      var itercount = 0;
      var itertot = 40;
      
      this.initialize = function(canvas_id){
          canvas = document.getElementById(canvas_id);
          context = canvas.getContext('2d');
          
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          
          bgCanvas = document.createElement('canvas');
          bgContext = bgCanvas.getContext('2d');
          
          bgCanvas.width = window.innerWidth;
          bgCanvas.height = window.innerHeight;
      
          canvas.addEventListener('mousemove', MouseMove, false);
          canvas.addEventListener('mouseout', MouseOut, false);
              
          start();
          setTimeout(function(){ document.getElementById("canvas").classList.add("hideIt");
          var lava0;
          var ge1doot = {
            screen: {
              elem:     null,
              callback: null,
              ctx:      null,
              width:    0,
              height:   0,
              left:     0,
              top:      0,
              init: function (id, callback, initRes) {
                this.elem = document.getElementById(id);
                this.callback = callback || null;
                if (this.elem.tagName == "CANVAS") this.ctx = this.elem.getContext("2d");
                window.addEventListener('resize', function () {
                  this.resize();
                }.bind(this), false);
                this.elem.onselectstart = function () { return false; }
                this.elem.ondrag        = function () { return false; }
                initRes && this.resize();
                return this;
              },
              resize: function () {
                var o = this.elem;
                this.width  = o.offsetWidth;
                this.height = o.offsetHeight;
                for (this.left = 0, this.top = 0; o != null; o = o.offsetParent) {
                  this.left += o.offsetLeft;
                  this.top  += o.offsetTop;
                }
                if (this.ctx) {
                  this.elem.width  = this.width;
                  this.elem.height = this.height;
                }
                this.callback && this.callback();
              }
            }
          }
        
          // Point constructor
          var Point = function(x, y) {
            this.x = x;
            this.y = y;
            this.magnitude = x * x + y * y;
            this.computed = 0;
            this.force = 0;
          };
          Point.prototype.add = function(p) {
            return new Point(this.x + p.x, this.y + p.y);
          };
        
          // Ball constructor
          var Ball = function(parent) {
            var min = .1;
            var max = 1.5;
            this.vel = new Point(
              (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.25), (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random())
            );
            this.pos = new Point(
              parent.width * 0.2 + Math.random() * parent.width * 0.6,
              parent.height * 0.2 + Math.random() * parent.height * 0.6
            );
            this.size = (parent.wh / 15) + ( Math.random() * (max - min) + min ) * (parent.wh / 15);
            this.width = parent.width;
            this.height = parent.height;
          };
        
          // move balls
          Ball.prototype.move = function() {
        
            // bounce borders
            if (this.pos.x >= this.width - this.size) {
              if (this.vel.x > 0) this.vel.x = -this.vel.x;
              this.pos.x = this.width - this.size;
            } else if (this.pos.x <= this.size) {
              if (this.vel.x < 0) this.vel.x = -this.vel.x;
              this.pos.x = this.size;
            }
        
            if (this.pos.y >= this.height - this.size) {
              if (this.vel.y > 0) this.vel.y = -this.vel.y;
              this.pos.y = this.height - this.size;
            } else if (this.pos.y <= this.size) {
              if (this.vel.y < 0) this.vel.y = -this.vel.y;
              this.pos.y = this.size;
            }
        
            // velocity
            this.pos = this.pos.add(this.vel);
        
          };
        
          // lavalamp constructor
          var LavaLamp = function(width, height, numBalls, c0, c1) {
            this.step = 5;
            this.width = width;
            this.height = height;
            this.wh = Math.min(width, height);
            this.sx = Math.floor(this.width / this.step);
            this.sy = Math.floor(this.height / this.step);
            this.paint = false;
            this.metaFill = createRadialGradient(width, height, width, c0, c1);
            this.plx = [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0];
            this.ply = [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1];
            this.mscases = [0, 3, 0, 3, 1, 3, 0, 3, 2, 2, 0, 2, 1, 1, 0];
            this.ix = [1, 0, -1, 0, 0, 1, 0, -1, -1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1];
            this.grid = [];
            this.balls = [];
            this.iter = 0;
            this.sign = 1;
        
            // init grid
            for (var i = 0; i < (this.sx + 2) * (this.sy + 2); i++) {
              this.grid[i] = new Point(
                (i % (this.sx + 2)) * this.step, (Math.floor(i / (this.sx + 2))) * this.step
              )
            }
        
            // create metaballs
            for (var k = 0; k < numBalls; k++) {
              this.balls[k] = new Ball(this);
            }
          };
          // compute cell force
          LavaLamp.prototype.computeForce = function(x, y, idx) {
        
            var force;
            var id = idx || x + y * (this.sx + 2);
        
            if (x === 0 || y === 0 || x === this.sx || y === this.sy) {
              force = 0.6 * this.sign;
            } else {
              force = 0;
              var cell = this.grid[id];
              var i = 0;
              var ball;
              while (ball = this.balls[i++]) {
                force += ball.size * ball.size / (-2 * cell.x * ball.pos.x - 2 * cell.y * ball.pos.y + ball.pos.magnitude + cell.magnitude);
              }
              force *= this.sign
            }
            this.grid[id].force = force;
            return force;
          };
          // compute cell
          LavaLamp.prototype.marchingSquares = function(next) {
            var x = next[0];
            var y = next[1];
            var pdir = next[2];
            var id = x + y * (this.sx + 2);
            if (this.grid[id].computed === this.iter) {
              return false;
            }
            var dir, mscase = 0;
        
            // neighbors force
            for (var i = 0; i < 4; i++) {
              var idn = (x + this.ix[i + 12]) + (y + this.ix[i + 16]) * (this.sx + 2);
              var force = this.grid[idn].force;
              if ((force > 0 && this.sign < 0) || (force < 0 && this.sign > 0) || !force) {
                // compute force if not in buffer
                force = this.computeForce(
                  x + this.ix[i + 12],
                  y + this.ix[i + 16],
                  idn
                );
              }
              if (Math.abs(force) > 1) mscase += Math.pow(2, i);
            }
            if (mscase === 15) {
              // inside
              return [x, y - 1, false];
            } else {
              // ambiguous cases
              if (mscase === 5) dir = (pdir === 2) ? 3 : 1;
              else if (mscase === 10) dir = (pdir === 3) ? 0 : 2;
              else {
                // lookup
                dir = this.mscases[mscase];
                this.grid[id].computed = this.iter;
              }
              // draw line
              var ix = this.step / (
                  Math.abs(Math.abs(this.grid[(x + this.plx[4 * dir + 2]) + (y + this.ply[4 * dir + 2]) * (this.sx + 2)].force) - 1) /
                  Math.abs(Math.abs(this.grid[(x + this.plx[4 * dir + 3]) + (y + this.ply[4 * dir + 3]) * (this.sx + 2)].force) - 1) + 1
                );
              ctx.lineTo(
                this.grid[(x + this.plx[4 * dir]) + (y + this.ply[4 * dir]) * (this.sx + 2)].x + this.ix[dir] * ix,
                this.grid[(x + this.plx[4 * dir + 1]) + (y + this.ply[4 * dir + 1]) * (this.sx + 2)].y + this.ix[dir + 4] * ix
              );
              this.paint = true;
              // next
              return [
                x + this.ix[dir + 4],
                y + this.ix[dir + 8],
                dir
              ];
            }
          };
        
          LavaLamp.prototype.renderMetaballs = function() {
            var i = 0, ball;
            while (ball = this.balls[i++]) ball.move();
            // reset grid
            this.iter++;
            this.sign = -this.sign;
            this.paint = false;
            ctx.fillStyle = this.metaFill;
            ctx.beginPath();
            // compute metaballs
            i = 0;
            //ctx.shadowBlur = 50;
            //ctx.shadowColor = "green";
            while (ball = this.balls[i++]) {
              // first cell
              var next = [
                Math.round(ball.pos.x / this.step),
                Math.round(ball.pos.y / this.step), false
              ];
              // marching squares
              do {
                next = this.marchingSquares(next);
              } while (next);
              // fill and close path
              if (this.paint) {
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
                this.paint = false;
              }
            }
          };
        
          // gradients
          var createRadialGradient = function(w, h, r, c0, c1) {
            var gradient = ctx.createRadialGradient(
              w / 1, h / 1, 0,
              w / 1, h / 1, r
            );
            gradient.addColorStop(0, c0);
            gradient.addColorStop(1, c1);
            return gradient;
          };
        
          // main loop
          var run = function() {
            requestAnimationFrame(run);
            ctx.clearRect(0, 0, screen.width, screen.height);
            lava0.renderMetaballs();
          };
          // canvas
          var screen = ge1doot.screen.init("bubble", null, true),
              ctx = screen.ctx;
          screen.resize();
          // create LavaLamps
          lava0 = new LavaLamp(screen.width, screen.height, 6, "#FF9298", "#E4008E");
        
          run();
          setTimeout(function(){ document.getElementById("bubblewrap").classList.add("hideIt");     

            particlesJS("particles-js", 
                {"particles":{"number":{"value":202,"density":{"enable":true,"value_area":641.3648243462092}},"color":{"value":"#ffffff"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.5,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":3,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":150,"color":"#ffffff","opacity":0.4,"width":1},"move":{"enable":true,"speed":6,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"repulse"},"onclick":{"enable":true,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":105.57003759917487,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});
                // setTimeout(function(){ document.getElementById("particles-js").classList.add("hideIt");     
                

            }, 15000);
        }, 15000)
    }

      var start = function(){
              
          bgContext.fillStyle = "#000000";
          bgContext.font = '135px impact';
          bgContext.fillText(keyword1, 85, 125);
          bgContext.fillText(keyword2, 85, 240);
          bgContext.fillText(keyword3, 85, 355);
          
          clear();	
          getCoords();
      }
      
      var getCoords = function(){
          var imageData, pixel, height, width;
          
          imageData = bgContext.getImageData(0, 0, canvas.width, canvas.height);
          
          // quickly iterate over all pixels - leaving density gaps
          for(height = 0; height < bgCanvas.height; height += denseness){
              for(width = 0; width < bgCanvas.width; width += denseness){   
                 pixel = imageData.data[((width + (height * bgCanvas.width)) * 4) - 1];
                    //Pixel is black from being drawn on. 
                    if(pixel == 255) {
                      drawCircle(width, height);
                    }
              }
          }
          
          setInterval( update, 40 );
      }
      
      var drawCircle = function(x, y){
          
          var startx = (Math.random() * canvas.width);
          var starty = (Math.random() * canvas.height);
          
          var velx = (x - startx) / itertot;
          var vely = (y - starty) / itertot;	
          
          parts.push(
              {c: '#' + (Math.random() * 0x949494 + 0xaaaaaa | 0).toString(16),
               x: x, //goal position
               y: y,
               x2: startx, //start position
               y2: starty,
               r: true, //Released (to fly free!)
               v:{x:velx , y: vely}
              }
          )
      }
          
      var update = function(){
          var i, dx, dy, sqrDist, scale;
          itercount++;
          clear();
          for (i = 0; i < parts.length; i++){
                      
              //If the dot has been released
              if (parts[i].r == true){
                  //Fly into infinity!!
                  parts[i].x2 += parts[i].v.x;
                  parts[i].y2 += parts[i].v.y;
              //Perhaps I should check if they are out of screen... and kill them?
              }
              if (itercount == itertot){
                  parts[i].v = {x:(Math.random() * 6) * 2 - 6 , y:(Math.random() * 6) * 2 - 6};
                  parts[i].r = false;
              }
              
      
              //Look into using svg, so there is no mouse tracking.
              //Find distance from mouse/draw!
              dx = parts[i].x - mouse.x;
              dy = parts[i].y - mouse.y;
              sqrDist =  Math.sqrt(dx*dx + dy*dy);
              
              if (sqrDist < 20){
                  parts[i].r = true;
              } 			
  
              //Draw the circle
              context.fillStyle = parts[i].c;
              context.beginPath();
              context.arc(parts[i].x2, parts[i].y2, 4 ,0 , Math.PI*2, true);
              context.closePath();
              context.fill();	
                  
          }	
      }
      
      var MouseMove = function(e) {
          if (e.layerX || e.layerX == 0) {
              //Reset particle positions
              mouseOnScreen = true;
              
              
              mouse.x = e.layerX - canvas.offsetLeft;
              mouse.y = e.layerY - canvas.offsetTop;
          }
      }
      
      var MouseOut = function(e) {
          mouseOnScreen = false;
          mouse.x = -100;
          mouse.y = -100;	
      }
      
      //Clear the on screen canvas
      var clear = function(){
          context.fillStyle = '#333';
          context.beginPath();
            context.rect(0, 0, canvas.width, canvas.height);
           context.closePath();
           context.fill();
      }
  }
  var banner = new Banner();
  banner.initialize("canvas")

