kontra.init()

let sprites = []
let score = 0

function createAsteroid(x, y, radius) {
  let asteroid = kontra.Sprite({
    type: 'asteroid',
    x: x,
    y: y,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    radius: radius,
    render() {
      this.context.strokeStyle = 'white'
      this.context.beginPath()
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2)
      this.context.stroke()
    }
  })
  sprites.push(asteroid)
}

for (var i = 0; i < 4; i++) {
  createAsteroid(100, 100, 30)
}


kontra.initKeys()

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180
}

let ship = kontra.Sprite({
  type: 'ship',
  x: 300,
  y: 300,
  width: 6,  
  dt: 0,  
  render() {
    this.context.save()

    this.context.translate(this.x, this.y)
    this.context.rotate(degreesToRadians(this.rotation))
    
    this.context.beginPath()
    this.context.moveTo(-3, -5)
    this.context.lineTo(12, 0)
    this.context.lineTo(-3, 5)
    this.context.closePath()
    this.context.stroke()
    this.context.restore()
  },
  update() {
    
    if (kontra.keyPressed('left')) {
      this.rotation += -4
    }
    else if (kontra.keyPressed('right')) {
      this.rotation += 4
    }
    
    const cos = Math.cos(degreesToRadians(this.rotation));
    const sin = Math.sin(degreesToRadians(this.rotation));
    if (kontra.keyPressed('up')) {
      this.ddx = cos * 0.05
      this.ddy = sin * 0.05
    }
    else {
      this.ddx = this.ddy = 0
    }
    this.advance()
    
    const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
    if (magnitude > 5) {
      this.dx *= 0.95
      this.dy *= 0.95
    }
    
    this.dt += 1/60
    if (kontra.keyPressed('space') && this.dt > 0.25) {
      this.dt = 0
      let bullet = kontra.Sprite({
        type: 'bullet',
        
        x: this.x + cos * 12,
        y: this.y + sin * 12,
        
        dx: this.dx + cos * 5,
        dy: this.dy + sin * 5,
        
        ttl: 50,
        
        width: 2,
        height: 2,
        color: 'white'
      })
      sprites.push(bullet)
    }
  }
})

sprites.push(ship)


let loop = kontra.GameLoop({
  update() {
    let canvas = kontra.getCanvas()
    
    sprites.map(sprite => {
      sprite.update()
      
      if (sprite.x < 0) {
        sprite.x = canvas.width
      }
      
      else if (sprite.x > canvas.width) {
        sprite.x = 0
      }
      
      if (sprite.y < 0) {
        sprite.y = canvas.height
      }
      
      else if (sprite.y > canvas.height) {
        sprite.y = 0
      }
    })
    
    for (let i = 0; i < sprites.length; i++) {
      
      if (sprites[i].type === 'asteroid') {
        for (let j = 0; j < sprites.length; j++) {
          
          if (sprites[j].type !== 'asteroid') {
            let asteroid = sprites[i]
            let sprite = sprites[j]
            
            let dx = asteroid.x - sprite.x
            let dy = asteroid.y - sprite.y
            if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius + sprite.width) {
              asteroid.ttl = 0
              sprite.ttl = 0
              
              score += Math.floor(Math.random() * (100 - asteroid.radius))
              if (asteroid.radius > 10) {
                for (var x = 0; x < 3; x++) {
                  createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2.5)
                }
              }
              break
            }

            if(sprites[j].type === 'ship' && sprites[j].ttl === 0)  {
              console.log('Game Over')
              loop.stop()
              kontra.getCanvas().getContext("2d").fillStyle = "white"
              kontra.getCanvas().getContext("2d").fillText("Game Over", 250, 250)
            }
          }
        }
      }
    }
    sprites = sprites.filter(sprite => sprite.isAlive())
  },
  render() {
    sprites.map(sprite => sprite.render())
    kontra.getCanvas().getContext("2d").fillStyle = "white"
    kontra.getCanvas().getContext("2d").fillText(score, 10, 10)
  }
})


loop.start()