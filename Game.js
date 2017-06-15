/*global Ball*/
/*global Particle*/
/*global Vector*/

var canvas;
var canvW, canvH;
var hdc;
var balls;
var particles;
var clickDownPoint;
var mousePos;
var buttonDown;
var lost;
var freezeFrame;
var score;
var ballBuild;
var availableBalls;
var collideSounds;

function init () {
    collideSounds = [new Audio("assets/bk3.mp3"), new Audio("assets/bk7.mp3")];
    canvas = document.getElementById("canv");
    var body = document.getElementById("bdy");
    body.addEventListener("mousedown", function(e) { 
        if(!lost) {
            buttonDown = 1;
            clickDownPoint = getMousePos(canvas, e);
            clickDownPoint.y = canvH;
        }
    }, false);
    body.addEventListener("touchstart", function(e) {
        if(!lost) {
            buttonDown = 1;
            clickDownPoint = new Vector(e.touches[0].clientX, e.touches[0].clientY);
            clickDownPoint.y = canvH;
        }
    }, false);
    body.addEventListener("mousemove", function(e) {
        mousePos = getMousePos(canvas, e);
    }, false);
    body.addEventListener("touchmove", function(e) {
        mousePos = new Vector(e.touches[0].clientX, e.touches[0].clientY);
    }, false);
    body.addEventListener("mouseup", function(e) {
        if(!lost) {
            buttonDown = 0;
            if(availableBalls > 0) {
                var travelVector = new Vector(mousePos.x - clickDownPoint.x, (mousePos.y - clickDownPoint.y))
                travelVector.setMagnitude(4);
                if(travelVector.getDirection() == 0 || travelVector.getDirection() == Math.PI)
                    travelVector.setDirection(3 * Math.PI/2);
                balls.push(new Ball(new Vector(clickDownPoint.x, canvH + 5), travelVector, 20, true));
                availableBalls--;
            }
        }
        else
            resetGame();
    }, false);
    body.addEventListener("touchend", function(e) {
        if(!lost) {
            buttonDown = 0;
            if(availableBalls > 0 &&  !lost) {
                var travelVector = new Vector(mousePos.x - clickDownPoint.x, (mousePos.y - clickDownPoint.y))
                travelVector.setMagnitude(4);
                if(travelVector.getDirection() == 0 || travelVector.getDirection() == Math.PI)
                    travelVector.setDirection(3 * Math.PI/2);
                balls.push(new Ball(new Vector(clickDownPoint.x, canvH + 5), travelVector, 20, true));
                availableBalls--;
            }
            else
                resetGame();
        }
    }, false);
    body.addEventListener("keypress", function(e) {
        if(lost && e.keyCode == 32)
            resetGame()
    }, false);
    canvW = canvas.width;
    canvH = canvas.height;
    hdc = canvas.getContext("2d");
    balls = [];
    particles = [];
    score = 0;
    freezeFrame = 0;
    ballBuild = 0;
    availableBalls = 3;
    buttonDown = 0;
    lost = false;
    setInterval(update, 10); // Time in milliseconds
}

function paint() {
//    if(freezeFrame > 0)
//        hdc.fillStyle = "#FFCCB8";
//    else
//        hdc.fillStyle = "#FFFFEA";
    hdc.fillStyle = "#FFFFEA";
    hdc.fillRect(0, 0, canvW,canvH);
    for(var i = 0; i < balls.length; i++) {
        if(balls[i].isFriendly)
            hdc.fillStyle = "#006699";
        else
            hdc.fillStyle = "#BA1901";
        hdc.beginPath();
        hdc.arc(balls[i].pos.x, balls[i].pos.y, balls[i].radius, 0, 2 * Math.PI);
        hdc.fill();
    }
    for(var i = 0; i < particles.length; i++) {
        hdc.fillStyle = "#BA0009";
        hdc.beginPath();
        hdc.arc(particles[i].pos.x, particles[i].pos.y, particles[i].radius, 0, 2 * Math.PI);
        hdc.fill();
    }
    if(buttonDown == 1) {
        if(availableBalls < 1)
            hdc.strokeStyle = "#BA1901";
        else
            hdc.strokeStyle = "#000000";
        hdc.beginPath();
        hdc.moveTo(clickDownPoint.x, clickDownPoint.y);
        hdc.lineTo(mousePos.x, mousePos.y);
        hdc.stroke();
    }
    hdc.fillStyle = "#4F677C"
    hdc.font = "10px Noto Sans";
    hdc.fillText("SCORE: " + score,canvW - 60, 15);
    hdc.fillText("x" + availableBalls, 45, 15);
    hdc.fillStyle = "#006699";
    hdc.beginPath();
    hdc.arc(35, 11, 5, 0, 2 * Math.PI);
    hdc.fill();
    hdc.fillRect(8, 8, 18, 6);
    hdc.fillStyle = "#66BB66";
    hdc.fillRect(9, 9, 15*ballBuild/5 + 1, 4);
    
    
    if(lost) {
        hdc.fillStyle = "rgba(128, 128, 128, 0.5)"
        hdc.fillRect(0, 0, canvW,canvH);
        hdc.fillStyle = "#CFFC8A"
        hdc.font = "30px Noto Sans";
        hdc.fillText("DEFEAT!",(canvW / 2) - 55, (canvH / 2) - 30);
    }
}

function update() {
    if(freezeFrame > 0) {
        freezeFrame--;
        return;
    }
    
    if(Math.random() < 0.005) {
        balls.push(new Ball(new Vector(Math.random()*(canvW+50)-25, -25), new Vector(Math.random()*5-2.5, (Math.random()+1)*(score/50+1)), 24, false));
    }
    
    for(var i = 0; i < balls.length; i++) {
        balls[i].update();
        for(var j = i + 1; j < balls.length; j++) {
            var x = balls[i].pos.x - balls[j].pos.x;
            var y = balls[i].pos.y - balls[j].pos.y;
            if(((x*x) + (y*y)) <= Math.pow(balls[i].radius + balls[j].radius, 2)) {
                if(balls[i].isFriendly != balls[j].isFriendly && balls[i].pos.y > -balls[i].radius && balls[j].pos.y > -balls[j].radius) {
                    collideSounds[parseInt(Math.random() * 2)].play();
                    if(balls[i].isFriendly){
                        balls[i].collide(balls[j]);
                    }
                    else{
                        balls[j].collide(balls[i]);
                    }
                    freezeFrame = (canvH - balls[i].pos.y) / canvH * 15 + 15;
                    score++;
                    for(var p = 0; p < 2+(Math.random()*3); p++) {
                        particles.push(new Particle(new Vector((balls[i].pos.x + balls[j].pos.x)/2, (balls[i].pos.y + balls[j].pos.y)/2),
                                new Vector(Math.random()*10-5, Math.random()*6-5), 3));
                    }
                }
            }
        }
        if(balls[i].pos.x < balls[i].radius/2)
            balls[i].vel.x = Math.abs(balls[i].vel.x);
        else if(balls[i].pos.x > canvW - balls[i].radius/2)
            balls[i].vel.x = -Math.abs(balls[i].vel.x);
        if(balls[i].pos.y > canvH + (2 * balls[i].radius)) {
            if(!balls[i].isFriendly)
                lost = true;
            balls.splice(i, 1);
            i--;
        }
        if(balls[i].pos.y < -100) {
            balls.splice(i, 1);
            i--;
        }
    }
    for(var i = 0; i < particles.length; i++) {
        particles[i].update();
        if(particles[i].pos.y > canvH + particles[i].radius) {
            ballBuild++;
            if(ballBuild >= 5) {
                ballBuild -= 5;
                availableBalls++;
            }
            particles.splice(i, 1);
            i--;
        }
    }
    paint();
}

function getMousePos(canvas, e) {
    var posRect = canvas.getBoundingClientRect(), root = document.documentElement;

    var mouseX = e.clientX - posRect.left - root.scrollLeft;
    var mouseY = e.clientY - posRect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}
function resetGame() {
    lost = false;
    balls = [];
    particles = [];
    buttonDown = 0;
    score = 0;
    availableBalls = 3;
    ballBuild = 0;
}