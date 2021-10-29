import './AlphaDots.scss';

class Calcs {
  constructor() {
    // mouse relative movement
    this.distanceFromPointer = 140;
    this.maxParticleDistanceFromOrigin = 80;
  }

  getUCD = (pointer, particle) => {
    return Math.sqrt(
      (
        (particle.x - pointer.x) ** 2 + (particle.y - pointer.y) ** 2
      )
    );
  }

  calcVector = (pointer, particle) => {
    return {
      x: (particle.x - pointer.x),
      y: (particle.y - pointer.y),
    };
  }

  normaliseVector = (vector, UCD) => {
    return {
      x: vector.x / UCD,
      y: vector.y / UCD,
    };
  }

  getDistanceVectorFromPointer = (normalisedVector, distance) => {
    return {
      x: normalisedVector.x * distance,
      y: normalisedVector.y * distance,
    };
  }

  addVectors = (v1, v2) => {
    return {
      x: v1.x + v2.x,
      y: v1.y + v2.y,
    };
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  getRandomCoords() {
    return {
      x: this.getRandomInt(-this.distanceFromPointer, this.distanceFromPointer),
      y: this.getRandomInt(-this.distanceFromPointer, this.distanceFromPointer),
    }
  }

  getParticleEscapeCoords = (pointer, particle) => {
    const UCD = this.getUCD(pointer, particle);
    if (UCD > this.distanceFromPointer) {
      // Particle does not need to escape
      return false;
    }
    const
      vector = this.calcVector(pointer, particle),
      normalisedVector = this.normaliseVector(vector, UCD),
      // vector = this.getRandomCoords(), //RANDOM
      // normalisedVector = this.normaliseVector(vector, this.distanceFromPointer), //RANDOM
      // distanceAway = this.maxParticleDistanceFromOrigin, // Effect 1 globey ball to circle
      // distanceAway = ( (1/UCD) * this.maxParticleDistanceFromOrigin ) * 2, // Effect 2 gravity
      // distanceAway = UCD / this.distanceFromPointer * this.maxParticleDistanceFromOrigin, // Effect 3 magnification (does not work with both dist are the same)
      // distanceAway = this.distanceFromPointer / UCD * this.maxParticleDistanceFromOrigin, // Effect 4 huge globe
      // distanceAway = - UCD * this.maxParticleDistanceFromOrigin / this.distanceFromPointer, // Effect 5 upside down reverse
      // distanceAway = this.distanceFromPointer / UCD, // Effect 6 gravity #2
      distanceAway = this.maxParticleDistanceFromOrigin - UCD + 20, // Effect 7 actual globe
      distanceVector = this.getDistanceVectorFromPointer(normalisedVector, distanceAway),
      finalCoord = this.addVectors(pointer, distanceVector);

    // console.log('test');
    // console.log(UCD);
    // console.log(vector);
    // console.log(normalisedVector);
    // console.log(distanceAway);
    // console.log(distanceVector);
    // console.log(finalCoord);

    return finalCoord;
  }

}

const particleAlphabet = {
  Particle: function (x, y) {
    this.x = x;
    this.y = y;
    this.radius = 1;
    this.draw = function (ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = '#F5F5F5';
      // ctx.fillRect(0, 0, this.radius, this.radius);
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      // ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    };
  },
  init: function () {
    particleAlphabet.calcs = new Calcs();
    document.addEventListener("mousemove", particleAlphabet.mouseMoveHandler, false);
    var debouncedResize = particleAlphabet.debounce(particleAlphabet.onResizeHandler, 300);
    window.onresize = debouncedResize;
    particleAlphabet.mouse = {
      x: 0,
      y: 0,
      borderMargin: 15,
      onCanvas: false,
      drawBox: false, // Set to true for debugging
      drawBoxHeight: 5,
      drawBoxWidth: 5,
    };
    particleAlphabet.canvas = document.querySelector('canvas');
    particleAlphabet.ctx = particleAlphabet.canvas.getContext('2d');
    particleAlphabet.W = window.innerWidth;
    particleAlphabet.H = window.innerHeight;
    particleAlphabet.particlePositions = [];
    particleAlphabet.particles = [];
    particleAlphabet.tmpCanvas = document.createElement('canvas');
    particleAlphabet.tmpCtx = particleAlphabet.tmpCanvas.getContext('2d');

    particleAlphabet.canvas.width = particleAlphabet.W;
    particleAlphabet.canvas.height = particleAlphabet.H;

    particleAlphabet.changeText();
    particleAlphabet.getPixels(particleAlphabet.tmpCanvas, particleAlphabet.tmpCtx);

    setInterval(function () {
      particleAlphabet.changeText();
      particleAlphabet.getPixels(particleAlphabet.tmpCanvas, particleAlphabet.tmpCtx);
    }, 5000);

    particleAlphabet.makeParticles(4000);
    particleAlphabet.animate();
  },
  debounce: function(func, wait = 100) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  },
  onResizeHandler: function() {
    console.log('resize');
    var { canvas, ctx } = particleAlphabet;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particleAlphabet.init();
    // var { canvas } = particleAlphabet;
    // if (canvas.width  < window.innerWidth)
    // {
    //     canvas.width  = window.innerWidth;
    // }

    // if (canvas.height < window.innerHeight)
    // {
    //     canvas.height = window.innerHeight;
    // }
  },
  currentPos: 0,
  changeText: function () {
    var phrases = [
      // ".",
      "Under Construction",
      // "Come Back soon"
    ];
    particleAlphabet.text = phrases[particleAlphabet.currentPos];
    particleAlphabet.currentPos++;
    if (particleAlphabet.currentPos >= phrases.length) {
      particleAlphabet.currentPos = 0;
    }
  },
  makeParticles: function (num) {
    for (var i = 0; i <= num; i++) {
      particleAlphabet.particles.push(new particleAlphabet.Particle(particleAlphabet.W / 2 + Math.random() * 400 - 200, particleAlphabet.H / 2 + Math.random() * 400 - 200));
    }
  },
  getPixels: function (canvas, ctx) {
    var keyword = particleAlphabet.text,
      gridX = 3,
      gridY = 3;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'red';
    ctx.font = 'italic bold 80px Noto Serif';
    ctx.fillText(keyword, canvas.width / 2 - ctx.measureText(keyword).width / 2, canvas.height / 2);
    var idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var buffer32 = new Uint32Array(idata.data.buffer);
    if (particleAlphabet.particlePositions.length > 0) particleAlphabet.particlePositions = [];
    for (var y = 0; y < canvas.height; y += gridY) {
      for (var x = 0; x < canvas.width; x += gridX) {
        if (buffer32[y * canvas.width + x]) {
          particleAlphabet.particlePositions.push({ x: x, y: y });
        }
      }
    }
  },
  animateParticles: function () {
    var { mouse, calcs } = particleAlphabet,
      mouseCoord = {
        x: mouse.x,
        y: mouse.y,
      };
    var p, pPos;
    for (var i = 0, num = particleAlphabet.particles.length; i < num; i++) {
      p = particleAlphabet.particles[i];
      pPos = particleAlphabet.particlePositions[i];
      if (particleAlphabet.particles.indexOf(p) === particleAlphabet.particlePositions.indexOf(pPos)) {
        var escapeCoords = calcs.getParticleEscapeCoords(mouseCoord, pPos);
        if (mouse.onCanvas && escapeCoords !== false) {
          //particle is within certain distance from mouse pointer
          p.x += (escapeCoords.x - p.x) * 0.1;
          p.y += (escapeCoords.y - p.y) * 0.1;
          p.draw(particleAlphabet.ctx);
        } else {
          p.x += (pPos.x - p.x) * 0.1;
          p.y += (pPos.y - p.y) * 0.1;
          p.draw(particleAlphabet.ctx);
        }
      }
    }
  },
  animateMouse: function () {
    var { mouse, ctx } = particleAlphabet;
    if (mouse.drawBox && mouse.onCanvas) {
      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.arc(mouse.x, mouse.y, mouse.drawBoxHeight, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  },
  mouseMoveHandler: function (e) {
    var { mouse } = particleAlphabet;
    var relativeX = e.clientX;
    var relativeY = e.clientY;
    if (relativeX > mouse.borderMargin && relativeY > mouse.borderMargin) {
      mouse.onCanvas = true;
      mouse.x = relativeX;
      mouse.y = relativeY;
    } else {
      mouse.onCanvas = false;
    }
  },
  animate: function () {
    requestAnimationFrame(particleAlphabet.animate);
    particleAlphabet.ctx.fillStyle = '#5c6bc0';
    particleAlphabet.ctx.fillRect(0, 0, particleAlphabet.W, particleAlphabet.H);
    particleAlphabet.animateMouse();
    particleAlphabet.animateParticles();
  },
};

export default particleAlphabet;
