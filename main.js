const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// function to generate random number

function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

// function to generate random color

function randomRGB() {
  return `rgb(${random(40, 255)}, 20, 40)`;
}

class Ball 
{

    constructor(x, y, velX, velY, color, size, index) 
    {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.color = color;
        this.size = size;
        this.index = index;
        this.collisions = 0;
    }

    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    update()
    {
        // did this ball hit the right wall?
        if((this.x + this.size) >= width)
        {
            this.velX = -(this.velX);
        }

        // did this ball hit the left wall?
        if((this.x - this.size) <= 0)
        {
            this.velX = -(this.velX);
        }

        // did this ball hit the bottom wall?
        if((this.y + this.size) >= height)
        {
            this.velY = -(this.velY);
        }

        // did the ball hit the top wall?
        if((this.y - this.size) <= 0)
        {
            this.velY = -(this.velY);
        }

        // move the ball position via the velocity
        this.x += this.velX;
        this.y += this.velY;
    }

    collisionDetection()
    {
        for(const ball of ballCourt.balls)
        {
            if(!(this === ball))
            {
                const dx = this.x - ball.x;
                const dy = this.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if(distance < this.size + ball.size)
                {
                    ball.color = this.color = randomRGB();
                    // swap velocities
                    var origVel = [this.velX, this.velY];
                    this.velY = ball.velY;
                    this.velX = ball.velX;
                    ball.velX = origVel[0];
                    ball.velY = origVel[1];

                    this.collisions += 1;
                    ball.collisions += 1;

                    if(this.collisions >= ballCourt.maxCollisions) {
                        ballCourt.removeBall(this);
                    }

                    if(ball.collisions >= ballCourt.maxCollisions) {
                        ballCourt.removeBall(ball);
                    }

                    ballCourt.addSpark(this.x, this.y, this.size);
                    ballCourt.addSpark(ball.x, ball.y, ball.size);
                }
            }
        }
    }

}

class Spark
{
    isNew = true;

    constructor(x, y, size) 
    {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class BallCourt 
{
    balls = [];
    sparks = [];
    minSize = 10;
    maxSize = 20;
    maxCollisions = 1;

    constructor() 
    {
        this.minX = this.maxSize;
        this.maxX = width - this.maxSize;
        this.minY = this.maxSize;
        this.maxY = height - this.maxSize;
    }

    addBall(xLoc = null, yLoc = null)
    {
        const size = random(this.minSize, this.maxSize);

        var xLoc = xLoc ?? random(0 + size, width - size);
        var yLoc = yLoc ?? random(0 + size, height - size);

        const ball = new Ball(
            // ball position always drawn at least one ball width
            // away from the edge of the canvas, to avoid drawing errors
            xLoc,
            yLoc,
            random(-7, 7),
            random(-7, 7),
            randomRGB(),
            size,
            this.balls.length
         );
    
         this.balls.push(ball);

         return ball;
    }

    removeBall(ball)
    {
        var index = this.balls.indexOf(ball);
        this.balls.splice(index, 1);
    }

    addSpark(x, y, size)
    {
        const spark = new Spark(x, y, size);
        this.sparks.push(spark);
    }

    cleanUp()
    {
        this.sparks = [];
    }

}

var ballCourt = new BallCourt();

function printMousePos(event) {
    var clickX = event.clientX;
    var clickY = event.clientY;

    // make sure ball doesnt end up on the edge
    if(clickX < ballCourt.minX)
    {
        clickX = ballCourt.minX;
    } 
    else if(clickX > ballCourt.maxX) 
    {
        clickX = ballCourt.maxX;
    }

    if(clickY < ballCourt.minY)
    {
        clickY = ballCourt.minY;
    } 
    else if(clickY > ballCourt.maxY) 
    {
        clickY = ballCourt.maxY;
    }

    ballCourt.addBall(clickX , clickY);
}

document.addEventListener("click", printMousePos);


function loop() 
{
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    for (const ball of ballCourt.balls) 
    {
        ball.draw();
        ball.update();
        ball.collisionDetection();
    }

    for (const spark of ballCourt.sparks)
    {
        spark.draw();
    }

    ballCourt.cleanUp();

    requestAnimationFrame(loop);
}

loop();