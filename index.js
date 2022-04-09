const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.5


const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc: './assets/background.png'
})

const shop = new Sprite({
	position: {
		x: 600,
		y: 160
	},
	imageSrc: './assets/shop.png',
	scale: 2.5,
	framesMax: 6
})

const player = new Fighter({
	position: {
		x: 100,
		y: 0
	},
	velocity: {
		x: 0,
		y: 0
	},
	offset: {
		x:0,
		y:0
	},
	imageSrc: './assets/player/Idle.png',
	framesMax: 8,
	scale: 2.5,
	offset: {
		x:215,
		y: 156
	},
	sprites: {
		idle: {
			imageSrc: './assets/player/Idle.png',
			framesMax: 8
		},
		run: {
			imageSrc: './assets/player/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './assets/player/Jump.png',
			framesMax: 2
		},
		fall:{
			imageSrc: './assets/player/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './assets/player/Attack1.png',
			framesMax: 6
		},
		takeHit: {
			imageSrc: './assets/player/Take Hit - white silhouette.png',
			framesMax: 4
		},
		death: {
			imageSrc: './assets/player/Death.png',
			framesMax: 6
		}
	},
	attackBox:{
		offset: {
			x: 100,
			y: 50
		},
		width: 150,
		height: 45
	}
})

const enemy = new Fighter({
	position: {
	  x: 800,
	  y: 100
	},
	velocity: {
	  x: 0,
	  y: 0
	},
	color: 'blue',
	offset: {
	  x: -50,
	  y: 0
	},
	imageSrc: './assets/kenji/Idle.png',
	framesMax: 4,
	scale: 2.5,
	offset: {
	  x: 215,
	  y: 167
	},
	sprites: {
	  idle: {
		imageSrc: './assets/kenji/Idle.png',
		framesMax: 4
	  },
	  run: {
		imageSrc: './assets/kenji/Run.png',
		framesMax: 8
	  },
	  jump: {
		imageSrc: './assets/kenji/Jump.png',
		framesMax: 2
	  },
	  fall: {
		imageSrc: './assets/kenji/Fall.png',
		framesMax: 2
	  },
	  attack1: {
		imageSrc: './assets/kenji/Attack1.png',
		framesMax: 4
	  },
	  takeHit: {
		imageSrc: './assets/kenji/Take hit.png',
		framesMax: 3
	},
	death: {
		imageSrc: './assets/kenji/Death.png',
		framesMax: 7
	}
	},
	attackBox:{
		offset: {
			x: -170,
			y: 50
		},
		width: 170,
		height: 45
	}
})

const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	w: {
		pressed: false
	},
	ArrowLeft: {
		pressed: false
	},
	ArrowRight: {
		pressed: false
	},
	ArrowUp: {
		pressed: false
	}
}

decreaseTimer()

function animate() {
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height)
	background.update()
	shop.update()
	c.fillStyle = 'rgba(255, 255, 255, 0.12)'
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.update()
	enemy.update()

	player.velocity.x = 0
	enemy.velocity.x = 0

	//player movement
	if(keys.a.pressed && player.lastKey === 'a' && player.position.x >= 0){
		player.velocity.x = -5
		player.switchSprite('run')
	}
	else if(keys.d.pressed && player.lastKey === 'd' && player.position.x + 50 <=1024){
		player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle')
	}
	
	//jumping
	if(player.velocity.y < 0) {
		player.switchSprite('jump')
	} else if (player.velocity.y > 0) {
		player.switchSprite('fall')
	}

	//enemy movement
	if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && enemy.position.x >= 0){
		enemy.velocity.x = -5
		enemy.switchSprite('run')
	}
	else if(keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && enemy.position.x + 50 <=1024){
		enemy.velocity.x = 5
		enemy.switchSprite('run')
	} else {
		enemy.switchSprite('idle')
	}
	
	//jumping
	if(enemy.velocity.y < 0) {
		enemy.switchSprite('jump')
	} else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}

	//collision detection
	if (rectangularCollision({
		rectangle1: player,
		rectangle2: enemy
	}) && player.isAttacking && player.framesCurrent === 4)
	{
		enemy.takeHit()
		player.isAttacking = false
		
		gsap.to('#enemyHealth',{
			width: enemy.health + '%'
		})	
	}

	//on miss
	if(player.isAttacking && player.framesCurrent === 4){
		player.isAttacking = false
	}
	
	if (rectangularCollision({
		rectangle1: enemy,
		rectangle2: player
	}) && enemy.isAttacking && enemy.framesCurrent === 2)
	{
		player.takeHit()
		enemy.isAttacking = false
		gsap.to('#playerHealth',{
			width: player.health + '%'
		})	
	}

	if(enemy.isAttacking && enemy.framesCurrent === 2){
		enemy.isAttacking = false
	}

	if(enemy.health <= 0 || player.health <=0){
		determineWinner({player,enemy,timerId})
	}
}

animate()

window.addEventListener('keydown', (event) => {
	if(!player.dead){
	switch(event.key){
		case 'd':
			keys.d.pressed = true
			player.lastKey = 'd'
			break
		case 'a':
			keys.a.pressed = true
			player.lastKey = 'a'
			break
		case 'w':
			if(player.velocity.y === 0)
			player.velocity.y = -15
			break
			case ' ':
			player.attack()
			break
	}
		//enemy stuff
		if(!enemy.dead){
		switch(event.key) {
			case 'ArrowRight':
			keys.ArrowRight.pressed = true
			enemy.lastKey = 'ArrowRight'
			break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = true
			enemy.lastKey = 'ArrowLeft'
			break
		case 'ArrowUp':
			if(enemy.velocity.y === 0)
			enemy.velocity.y = -15
			break
		case 'ArrowDown':
			enemy.attack()
			break
		}
	}
	}
	console.log(event.key)
})

window.addEventListener('keyup', (event) => {
	switch(event.key){
		case 'd':
			keys.d.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		case 'w':
			keys.w.pressed = false
			break
	}

	//enemy stuff
	switch(event.key){
		case 'ArrowRight':
			keys.ArrowRight.pressed = false
			break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false
			break
		case 'ArrowUp':
			keys.ArrowUp.pressed = false
			break
	}
	console.log(event.key)
})