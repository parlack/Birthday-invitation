/**
 * Juego Galáctico - Minijuego interactivo para la invitación
 * Este juego permite a los invitados competir por puntuación en un ranking
 */

// Configuración inicial del juego
const gameConfig = {
    speed: 1.5,
    difficulty: 1,
    maxEnemies: 8,
    maxLasers: 3,         // Máximo de rayos láser
    spawnRate: 1500,      // Velocidad inicial de aparición de enemigos
    laserSpawnRate: 2500, // Velocidad inicial de aparición de rayos láser (más tiempo entre ellos)
    playerSize: 40,
    enemySize: 30,
    laserWidth: 10,       // Ancho de los rayos láser
    laserHeight: 100,     // Altura de los rayos láser
    laserSpeed: 5,        // Velocidad reducida de los rayos láser
    collectibleSize: 25,
    scorePerCollectible: 10,
    playerMaxHealth: 100, // Salud máxima del jugador
    difficultyIncreaseRate: 0.08, // Incremento más lento de dificultad
    healthBarWidth: 200,  // Ancho de la barra de vida
    healthBarHeight: 15   // Alto de la barra de vida
};

// Variables globales del juego
let gameCanvas, gameCtx;
let player;
let enemies = [];
let lasers = [];     // Array para almacenar los rayos láser
let collectibles = [];
let score = 0;
let isGameActive = false;
let animationFrame;
let difficultyTimer; // Timer para aumentar la dificultad
let playerHealth;    // Salud actual del jugador
let currentDifficulty = 1.0; // Dificultad actual del juego
let enemySpawnInterval; // Intervalo para generar enemigos
let laserSpawnInterval; // Intervalo para generar rayos láser
let collectibleSpawnInterval; // Intervalo para generar coleccionables
let mouseX = 0; // Posición X del mouse/touch
let mouseY = 0; // Posición Y del mouse/touch
let guestName = '';
let guestId = '';
let gameResetCount = 0;  // Contador de reinicios para evitar acumulación de dificultad

// Función para obtener información del invitado
function getGuestInfo() {
    console.log('=== OBTENIENDO INFORMACIÓN DEL INVITADO ===');
    console.log('Variables globales disponibles:', { 
        'window.guestName': window.guestName, 
        'window.guestId': window.guestId,
        'window.invitationCode': window.invitationCode
    });
    
    // Usar las variables globales definidas en index.php
    if (window.guestName && window.guestId && window.guestId !== '0') {
        guestName = window.guestName;
        guestId = window.guestId;
        console.log('✅ Información del invitado obtenida de variables globales:', { guestName, guestId });
    } else if (window.guestName && window.guestName !== 'Invitado') {
        // Si tenemos un nombre pero no ID válido, usar el nombre y ID 0
        guestName = window.guestName;
        guestId = '0';
        console.log('⚠️ Usando nombre del invitado pero ID genérico:', { guestName, guestId });
    } else {
        // Respaldo: intentar obtener de la URL
        const urlParams = new URLSearchParams(window.location.search);
        guestName = urlParams.get('nombre') || 'Invitado';
        guestId = urlParams.get('id') || '0';
        console.log('⚠️ Información del invitado obtenida de URL (respaldo):', { guestName, guestId });
    }
    
    console.log('=== INFORMACIÓN FINAL DEL INVITADO ===');
    console.log('Nombre:', guestName);
    console.log('ID:', guestId);
}

// Clase Jugador
class Player {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = '#4facfe';
        this.speed = 5;
        this.invincible = false;
        this.invincibleTimer = 0;
    }

    draw() {
        gameCtx.save();
        if (this.invincible && Math.floor(Date.now() / 100) % 2) {
            gameCtx.globalAlpha = 0.5;
        }
        gameCtx.beginPath();
        gameCtx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        gameCtx.fillStyle = this.color;
        gameCtx.shadowColor = '#00f2fe';
        gameCtx.shadowBlur = 15;
        gameCtx.fill();
        
        // Dibujar nave espacial estilizada
        gameCtx.beginPath();
        gameCtx.moveTo(this.x, this.y - this.size / 2);
        gameCtx.lineTo(this.x - this.size / 3, this.y + this.size / 3);
        gameCtx.lineTo(this.x, this.y + this.size / 4);
        gameCtx.lineTo(this.x + this.size / 3, this.y + this.size / 3);
        gameCtx.fillStyle = '#fff';
        gameCtx.fill();
        gameCtx.restore();
    }

    update(mouseX, mouseY) {
        // Mover hacia la posición del mouse/toque
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Actualizar temporizador de invencibilidad
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
    }

    makeInvincible(duration) {
        this.invincible = true;
        this.invincibleTimer = duration;
    }
}

// Clase Enemigo
class Enemy {
    constructor(size) {
        this.size = size;
        // Generar posición aleatoria fuera del canvas
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch (side) {
            case 0: // top
                this.x = Math.random() * gameCanvas.width;
                this.y = -size;
                break;
            case 1: // right
                this.x = gameCanvas.width + size;
                this.y = Math.random() * gameCanvas.height;
                break;
            case 2: // bottom
                this.x = Math.random() * gameCanvas.width;
                this.y = gameCanvas.height + size;
                break;
            case 3: // left
                this.x = -size;
                this.y = Math.random() * gameCanvas.height;
                break;
        }
        
        // Calcular dirección hacia el centro
        const centerX = gameCanvas.width / 2;
        const centerY = gameCanvas.height / 2;
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.speedX = (dx / distance) * gameConfig.speed;
        this.speedY = (dy / distance) * gameConfig.speed;
        
        this.color = '#ff6b6b';
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    draw() {
        gameCtx.save();
        gameCtx.translate(this.x, this.y);
        gameCtx.rotate(this.rotation);
        
        // Dibujar asteroide
        gameCtx.beginPath();
        gameCtx.moveTo(-this.size/2, -this.size/3);
        gameCtx.lineTo(-this.size/3, -this.size/2);
        gameCtx.lineTo(this.size/3, -this.size/2);
        gameCtx.lineTo(this.size/2, -this.size/4);
        gameCtx.lineTo(this.size/2, this.size/4);
        gameCtx.lineTo(this.size/3, this.size/2);
        gameCtx.lineTo(-this.size/3, this.size/2);
        gameCtx.lineTo(-this.size/2, this.size/3);
        gameCtx.closePath();
        
        gameCtx.fillStyle = this.color;
        gameCtx.shadowColor = '#ff0000';
        gameCtx.shadowBlur = 10;
        gameCtx.fill();
        gameCtx.restore();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Verificar si el enemigo está fuera del canvas (en todos los lados)
        return this.x < -this.size || 
               this.x > gameCanvas.width + this.size || 
               this.y < -this.size || 
               this.y > gameCanvas.height + this.size;
    }
}

// Clase Rayo Láser
class Laser {
    constructor() {
        this.width = gameConfig.laserWidth;
        this.height = gameConfig.laserHeight;
        
        // Posición aleatoria en uno de los bordes del canvas
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch (side) {
            case 0: // top
                this.x = Math.random() * gameCanvas.width;
                this.y = -this.height;
                this.rotation = Math.PI / 2; // 90 grados
                this.speedX = 0;
                this.speedY = gameConfig.laserSpeed;
                break;
            case 1: // right
                this.x = gameCanvas.width + this.width;
                this.y = Math.random() * gameCanvas.height;
                this.rotation = Math.PI; // 180 grados
                this.speedX = -gameConfig.laserSpeed;
                this.speedY = 0;
                break;
            case 2: // bottom
                this.x = Math.random() * gameCanvas.width;
                this.y = gameCanvas.height + this.height;
                this.rotation = -Math.PI / 2; // -90 grados
                this.speedX = 0;
                this.speedY = -gameConfig.laserSpeed;
                break;
            case 3: // left
                this.x = -this.width;
                this.y = Math.random() * gameCanvas.height;
                this.rotation = 0;
                this.speedX = gameConfig.laserSpeed;
                this.speedY = 0;
                break;
        }
        
        this.color = '#ff00ff';
        this.glowColor = '#ff66ff';
        this.alpha = 0.7;
        this.pulseRate = 0.05;
        this.pulseDirection = 1;
    }
    
    draw() {
        gameCtx.save();
        
        // Aplicar rotación
        gameCtx.translate(this.x + this.width / 2, this.y + this.height / 2);
        gameCtx.rotate(this.rotation);
        
        // Efecto de pulso en la opacidad
        this.alpha += this.pulseRate * this.pulseDirection;
        if (this.alpha >= 0.9) {
            this.alpha = 0.9;
            this.pulseDirection = -1;
        } else if (this.alpha <= 0.5) {
            this.alpha = 0.5;
            this.pulseDirection = 1;
        }
        
        // Dibujar el rayo láser con efecto brillante
        gameCtx.shadowBlur = 20;
        gameCtx.shadowColor = this.glowColor;
        
        // Núcleo del láser
        gameCtx.fillStyle = this.color;
        gameCtx.globalAlpha = this.alpha;
        gameCtx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Halo exterior
        gameCtx.fillStyle = this.glowColor;
        gameCtx.globalAlpha = this.alpha * 0.5;
        gameCtx.fillRect(-this.width / 2 - 3, -this.height / 2 - 3, this.width + 6, this.height + 6);
        
        gameCtx.restore();
    }
    
    update() {
        // Mover láser
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Verificar si está fuera de la pantalla
        return !(this.x > -100 && 
                this.x < gameCanvas.width + 100 && 
                this.y > -100 && 
                this.y < gameCanvas.height + 100);
    }
    
    isCollidingWith(player) {
        // Calculamos el punto más cercano del láser al centro del jugador
        let closestX = Math.max(this.x - this.width / 2, Math.min(player.x, this.x + this.width / 2));
        let closestY = Math.max(this.y - this.height / 2, Math.min(player.y, this.y + this.height / 2));
        
        // Calculamos la distancia entre ese punto y el centro del jugador
        let distanceX = player.x - closestX;
        let distanceY = player.y - closestY;
        let distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        // Verificamos si la distancia es menor que el radio del jugador
        return distanceSquared < (player.size / 2) * (player.size / 2);
    }
}

// Clase Coleccionable
class Collectible {
    constructor(size) {
        this.size = size;
        this.x = Math.random() * (gameCanvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (gameCanvas.height - this.size * 2) + this.size;
        this.color = '#ffd700'; // dorado
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.rotation = 0;
    }

    draw() {
        gameCtx.save();
        gameCtx.translate(this.x, this.y);
        gameCtx.rotate(this.rotation);
        
        // Dibujar estrella
        gameCtx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const outerX = Math.cos(angle) * this.size / 2;
            const outerY = Math.sin(angle) * this.size / 2;
            
            if (i === 0) {
                gameCtx.moveTo(outerX, outerY);
            } else {
                gameCtx.lineTo(outerX, outerY);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = Math.cos(innerAngle) * this.size / 4;
            const innerY = Math.sin(innerAngle) * this.size / 4;
            gameCtx.lineTo(innerX, innerY);
        }
        gameCtx.closePath();
        
        gameCtx.fillStyle = this.color;
        gameCtx.shadowColor = '#ffd700';
        gameCtx.shadowBlur = 10 + this.glowIntensity;
        gameCtx.fill();
        gameCtx.restore();
    }

    update() {
        this.rotation += 0.02;
        this.glowIntensity += 0.1 * this.glowDirection;
        if (this.glowIntensity > 10 || this.glowIntensity < 0) {
            this.glowDirection *= -1;
        }
    }
}

// Inicializar el juego
function initGame() {
    console.log('Inicializando juego galáctico...');
    
    // Obtener información del invitado
    getGuestInfo();
    
    // Configurar el canvas
    gameCanvas = document.getElementById('gameCanvas');
    
    if (!gameCanvas) {
        console.error('Error: No se encontró el elemento canvas del juego');
        return;
    }
    
    gameCtx = gameCanvas.getContext('2d');
    
    if (!gameCtx) {
        console.error('Error: No se pudo obtener el contexto 2D del canvas');
        return;
    }
    
    // Ajustar tamaño del canvas
    resizeGameCanvas();
    window.addEventListener('resize', resizeGameCanvas);
    
    // Reiniciar variables del juego
    enemies = [];
    collectibles = [];
    score = 0;
    isGameActive = false;
    
    // Crear el jugador en el centro
    resetPlayer();
    
    // Configurar controles de mouse/táctiles
    setupControls();
    
    console.log('Juego inicializado correctamente');
    
    // Mostrar menú de inicio después de un breve retraso para asegurar carga completa
    setTimeout(function() {
        showStartMenu();
    }, 100);
}

// Ajustar el tamaño del canvas al tamaño de la ventana
function resizeGameCanvas() {
    const container = document.querySelector('.game-container');
    if (container) {
        gameCanvas.width = container.clientWidth;
        gameCanvas.height = container.clientHeight;
        
        // Si el juego está activo, reposicionar al jugador
        if (player && isGameActive) {
            player.x = Math.min(player.x, gameCanvas.width - player.size/2);
            player.y = Math.min(player.y, gameCanvas.height - player.size/2);
        }
    }
}

// Reiniciar posición del jugador
function resetPlayer() {
    player = new Player(
        gameCanvas.width / 2, 
        gameCanvas.height / 2, 
        gameConfig.playerSize
    );
}

// Configurar controles de mouse/táctiles
function setupControls() {
    // Mouse
    gameCanvas.addEventListener('mousemove', function(e) {
        if (isGameActive) {
            const rect = gameCanvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            handlePointerMove(mouseX, mouseY);
        }
    });
    
    // Touch
    gameCanvas.addEventListener('touchmove', function(e) {
        if (isGameActive) {
            e.preventDefault();
            const rect = gameCanvas.getBoundingClientRect();
            mouseX = e.touches[0].clientX - rect.left;
            mouseY = e.touches[0].clientY - rect.top;
            handlePointerMove(mouseX, mouseY);
        }
    }, { passive: false });
}

// Manejar movimiento del puntero (mouse o táctil)
function handlePointerMove(x, y) {
    // Actualizar destino del jugador
    player.update(x, y);
}

// Mostrar menú de inicio
function showStartMenu() {
    // Limpiar canvas
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Fondo
    drawGameBackground();
    
    // Título
    gameCtx.fillStyle = '#ffffff';
    gameCtx.textAlign = 'center';
    gameCtx.font = 'bold 24px Orbitron';
    gameCtx.fillText('MISIÓN GALÁCTICA', gameCanvas.width / 2, gameCanvas.height / 3);
    
    // Instrucciones
    gameCtx.font = '16px Quicksand';
    gameCtx.fillText('Recoge estrellas y evita los asteroides', gameCanvas.width / 2, gameCanvas.height / 2);
    gameCtx.fillText('Mueve tu nave espacial con el mouse o táctil', gameCanvas.width / 2, gameCanvas.height / 2 + 30);
    
    // Botón de inicio
    drawButton(
        gameCanvas.width / 2 - 75,
        gameCanvas.height * 2/3,
        150,
        50,
        '¡INICIAR!',
        '#4facfe',
        function() {
            // Evitar inicios múltiples
            if (!isGameActive) {
                startGame();
            } else {
                console.log('El juego ya está activo, no se inicia nuevamente.');
            }
        }
    );
}

// Dibujar botón interactivo
function drawButton(x, y, width, height, text, color, callback) {
    // Dibujar botón
    gameCtx.fillStyle = color;
    gameCtx.shadowColor = color;
    gameCtx.shadowBlur = 10;
    
    // Forma redondeada
    gameCtx.beginPath();
    gameCtx.roundRect(x, y, width, height, 10);
    gameCtx.fill();
    
    // Texto del botón
    gameCtx.fillStyle = '#ffffff';
    gameCtx.textAlign = 'center';
    gameCtx.textBaseline = 'middle';
    gameCtx.font = 'bold 18px Orbitron';
    gameCtx.fillText(text, x + width / 2, y + height / 2);
    
    // Manejar clic/toque en el botón
    gameCanvas.addEventListener('click', function handleClick(e) {
        const rect = gameCanvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (clickX >= x && clickX <= x + width && 
            clickY >= y && clickY <= y + height) {
            callback();
            gameCanvas.removeEventListener('click', handleClick);
        }
    });
    
    // Soporte táctil
    gameCanvas.addEventListener('touchend', function handleTouch(e) {
        const rect = gameCanvas.getBoundingClientRect();
        const touchX = e.changedTouches[0].clientX - rect.left;
        const touchY = e.changedTouches[0].clientY - rect.top;
        
        if (touchX >= x && touchX <= x + width && 
            touchY >= y && touchY <= y + height) {
            callback();
            gameCanvas.removeEventListener('touchend', handleTouch);
        }
    });
}

// Dibujar fondo del juego
function drawGameBackground() {
    // Fondo negro con degradado
    const gradient = gameCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
    gradient.addColorStop(0, '#090422');
    gradient.addColorStop(1, '#170b47');
    gameCtx.fillStyle = gradient;
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Dibujar estrellas de fondo
    gameCtx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * gameCanvas.width;
        const y = Math.random() * gameCanvas.height;
        const size = Math.random() * 2;
        gameCtx.beginPath();
        gameCtx.arc(x, y, size, 0, Math.PI * 2);
        gameCtx.fill();
    }
}

// Iniciar el juego
function startGame() {
    console.log('Iniciando juego...');
    
    // Verificar si ya hay un juego en curso
    if (isGameActive) {
        console.log('El juego ya está activo, evitando inicialización redundante');
        return;
    }
    
    // Ocultar menú de inicio si está visible
    hideGameMenus();
    
    // Cancelar cualquier bucle de juego previo
    if (window.animationFrame) {
        cancelAnimationFrame(window.animationFrame);
        window.animationFrame = null;
    }
    
    // Limpiar cualquier timer anterior
    clearInterval(difficultyTimer);
    clearInterval(enemySpawnInterval);
    clearInterval(laserSpawnInterval);
    clearInterval(collectibleSpawnInterval);
    
    // Incrementar contador de reinicios para depuración
    gameResetCount++;
    console.log('Juego reiniciado ' + gameResetCount + ' veces');
    
    // Reiniciar variables de juego
    score = 0;
    enemies = [];
    lasers = [];
    collectibles = [];
    playerHealth = gameConfig.playerMaxHealth; // Inicializar salud del jugador
    
    // IMPORTANTE: Siempre reiniciar la dificultad al valor inicial
    currentDifficulty = 1.0;
    
    // Reiniciar posición del jugador
    resetPlayer();
    
    // Configurar controles
    setupControls();
    
    // Inicializar timer de dificultad progresiva
    difficultyTimer = setInterval(function() {
        // Aumentar dificultad gradualmente (más lentamente)
        currentDifficulty += gameConfig.difficultyIncreaseRate;
        console.log('Dificultad aumentada a:', currentDifficulty.toFixed(2));
        
        // Ajustar velocidad de spawn de enemigos y láseres según la dificultad
        // Más dificultad = aparecen más rápido, pero con un límite más razonable
        let newEnemySpawnRate = Math.max(500, gameConfig.spawnRate / Math.sqrt(currentDifficulty));
        let newLaserSpawnRate = Math.max(800, gameConfig.laserSpawnRate / Math.sqrt(currentDifficulty));
        
        // Reiniciar intervalos con nuevas velocidades
        clearInterval(enemySpawnInterval);
        clearInterval(laserSpawnInterval);
        
        // Crear nuevos intervalos
        setupEnemySpawning(newEnemySpawnRate);
        setupLaserSpawning(newLaserSpawnRate);
        
    }, 8000); // Aumentar dificultad cada 8 segundos (más lentamente)
    
    // Generar coleccionables iniciales
    for (let i = 0; i < 5; i++) {
        collectibles.push(new Collectible(gameConfig.collectibleSize));
    }
    
    // Configurar spawn de enemigos inicial
    setupEnemySpawning(gameConfig.spawnRate);
    
    // Configurar spawn de láseres inicial
    setupLaserSpawning(gameConfig.laserSpawnRate);
    
    // Configurar spawn de coleccionables
    collectibleSpawnInterval = setInterval(function() {
        if (collectibles.length < 5 && isGameActive) {
            collectibles.push(new Collectible(gameConfig.collectibleSize));
        }
    }, 3000);
    
    // Iniciar bucle principal del juego
    isGameActive = true;
    gameLoop();
    
    // Limpiar intervalos cuando el juego termine
    document.addEventListener('gameEnded', function() {
        clearInterval(difficultyTimer);
        clearInterval(enemySpawnInterval);
        clearInterval(laserSpawnInterval);
        clearInterval(collectibleSpawnInterval);
        console.log('Juego terminado, intervalos limpiados.');
    }, { once: true });
}

// Configurar la generación de enemigos
function setupEnemySpawning(spawnRate) {
    enemySpawnInterval = setInterval(function() {
        if (enemies.length < gameConfig.maxEnemies && isGameActive) {
            enemies.push(new Enemy(gameConfig.enemySize));
        }
    }, spawnRate);
    
    // Generar coleccionable inicial
    collectibles.push(new Collectible(gameConfig.collectibleSize));
}

// Configurar la generación de rayos láser
function setupLaserSpawning(spawnRate) {
    laserSpawnInterval = setInterval(function() {
        if (lasers.length < gameConfig.maxLasers && isGameActive && currentDifficulty > 1.5) {
            lasers.push(new Laser());
            playSound('laser');
        }
    }, spawnRate);
}

// Bucle principal del juego
function gameLoop() {
    if (!isGameActive) {
        console.log('Juego no activo, deteniendo bucle');
        return;
    }
    
    // Limpiar canvas
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Dibujar fondo
    drawGameBackground();
    
    // Actualizar y dibujar jugador
    if (player) {
        player.update(mouseX, mouseY);
        player.draw();
    }
    
    // Actualizar y dibujar rayos láser
    for (let i = lasers.length - 1; i >= 0; i--) {
        const isOutOfBounds = lasers[i].update();
        
        if (isOutOfBounds) {
            // Eliminar láser si está fuera de la pantalla
            lasers.splice(i, 1);
            continue;
        }
        
        lasers[i].draw();
        
        // Comprobar colisión con jugador
        if (player && lasers[i].isCollidingWith(player) && !player.invincible) {
            // Restar salud por impacto de láser
            playerHealth -= 20;
            playSound('hit');
            
            // Hacer jugador invencible brevemente
            player.makeInvincible(60);
            
            // Eliminar láser que ha impactado
            lasers.splice(i, 1);
            
            // Fin del juego si no queda salud
            if (playerHealth <= 0) {
                endGame();
                return;
            }
            
            continue;
        }
    }
    
    // Actualizar y dibujar enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        const isOutOfBounds = enemies[i].update();
        enemies[i].draw();
        
        // Eliminar enemigos fuera de pantalla
        if (isOutOfBounds) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Colisiones entre enemigos y jugador
        if (player && isColliding(player, enemies[i]) && !player.invincible) {
            // Restar salud por impacto de enemigo
            playerHealth -= 15;
            playSound('hit');
            
            // Hacer jugador invencible brevemente
            player.makeInvincible(60);
            
            // Fin del juego si no queda salud
            if (playerHealth <= 0) {
                endGame();
                return;
            }
        }
    }
    
    // Actualizar y dibujar coleccionables
    for (let i = collectibles.length - 1; i >= 0; i--) {
        collectibles[i].update();
        collectibles[i].draw();
        
        // Colisiones entre coleccionables y jugador
        if (player && isColliding(player, collectibles[i])) {
            // Coleccionable recogido
            score += gameConfig.scorePerCollectible;
            
            // Recuperar un poco de salud al recoger coleccionables
            playerHealth = Math.min(gameConfig.playerMaxHealth, playerHealth + 10);
            
            collectibles.splice(i, 1);
            playSound('collect');
        }
    }
    
    // Dibujar UI (puntuación y barra de vida)
    
    // Dibujar jugador
    player.draw();
    
    // Dibujar UI
    drawUI();
    
    // Continuar el bucle
    animationFrame = requestAnimationFrame(gameLoop);
}

// Verificar colisión entre dos objetos
function isColliding(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size / 2 + obj2.size / 2);
}

// Dibujar interfaz de usuario
function drawUI() {
    // Mostrar puntuación
    gameCtx.fillStyle = '#ffffff';
    gameCtx.font = '20px Orbitron';
    gameCtx.textAlign = 'left';
    gameCtx.fillText(`Puntos: ${score}`, 20, 40);
    
    // Mostrar barra de vida
    const healthBarX = 20;
    const healthBarY = 60;
    
    // Borde de la barra de vida
    gameCtx.fillStyle = '#333333';
    gameCtx.fillRect(healthBarX - 2, healthBarY - 2, gameConfig.healthBarWidth + 4, gameConfig.healthBarHeight + 4);
    
    // Fondo de la barra de vida (rojo)
    gameCtx.fillStyle = '#ff0000';
    gameCtx.fillRect(healthBarX, healthBarY, gameConfig.healthBarWidth, gameConfig.healthBarHeight);
    
    // Vida actual (verde)
    const healthPercentage = playerHealth / gameConfig.playerMaxHealth;
    const currentHealthWidth = gameConfig.healthBarWidth * healthPercentage;
    
    // Gradiente para la barra de salud
    const gradient = gameCtx.createLinearGradient(healthBarX, healthBarY, healthBarX + currentHealthWidth, healthBarY);
    gradient.addColorStop(0, '#00ff00'); // Verde
    gradient.addColorStop(0.7, '#88ff00'); // Verde amarillento
    gradient.addColorStop(1, '#ffff00'); // Amarillo
    
    gameCtx.fillStyle = gradient;
    gameCtx.fillRect(healthBarX, healthBarY, currentHealthWidth, gameConfig.healthBarHeight);
    
    // Texto de vida
    gameCtx.fillStyle = '#ffffff';
    gameCtx.font = '14px Orbitron';
    gameCtx.fillText(`VIDA: ${Math.floor(playerHealth)}/${gameConfig.playerMaxHealth}`, healthBarX + gameConfig.healthBarWidth / 2, healthBarY + gameConfig.healthBarHeight + 15);
    
    // Mostrar dificultad actual
    gameCtx.textAlign = 'right';
    gameCtx.fillText(`Dificultad: ${currentDifficulty.toFixed(1)}`, gameCanvas.width - 20, 40);
}

// Finalizar juego
function endGame() {
    console.log('Juego terminado, puntuación final:', score);
    
    if (!isGameActive) {
        console.log('El juego ya está inactivo, evitando finalización redundante');
        return;
    }
    
    // Detener bucle de juego
    isGameActive = false;
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    // Limpiar intervalos
    clearInterval(difficultyTimer);
    difficultyTimer = null;
    clearInterval(enemySpawnInterval);
    enemySpawnInterval = null;
    clearInterval(laserSpawnInterval);
    laserSpawnInterval = null;
    clearInterval(collectibleSpawnInterval);
    collectibleSpawnInterval = null;
    
    // Limpiar arrays de juego
    enemies = [];
    lasers = [];
    collectibles = [];
    
    // Disparar evento de fin de juego
    const gameEndedEvent = new Event('gameEnded');
    document.dispatchEvent(gameEndedEvent);
    
    // Guardar puntuación
    saveScore(score, guestName, guestId);
    
    // Mostrar pantalla de game over
    setTimeout(showGameOver, 1000);
}

// Ocultar todos los menús del juego
function hideGameMenus() {
    console.log('Ocultando menús del juego...');
    // Limpiar el canvas para eliminar cualquier menú
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawGameBackground(); // Dibujar solo el fondo
}

// Mostrar pantalla de fin de juego
function showGameOver() {
    // Limpiar canvas
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Fondo
    drawGameBackground();
    
    // Título
    gameCtx.fillStyle = '#ffffff';
    gameCtx.textAlign = 'center';
    gameCtx.font = 'bold 28px Orbitron';
    gameCtx.fillText('MISIÓN COMPLETADA', gameCanvas.width / 2, gameCanvas.height / 3);
    
    // Puntuación
    gameCtx.font = 'bold 22px Orbitron';
    gameCtx.fillText(`Tu puntaje: ${score}`, gameCanvas.width / 2, gameCanvas.height / 2);
    
    // Mensaje
    gameCtx.font = '16px Quicksand';
    gameCtx.fillText('¡Tu puntaje ha sido registrado!', gameCanvas.width / 2, gameCanvas.height / 2 + 40);
    
    // Botones
    drawButton(
        gameCanvas.width / 2 - 160,
        gameCanvas.height * 2/3,
        150,
        50,
        'Jugar de nuevo',
        '#4facfe',
        function() { startGame(); }
    );
    
    drawButton(
        gameCanvas.width / 2 + 10,
        gameCanvas.height * 2/3,
        150,
        50,
        'Ver ranking',
        '#9d4edd',
        function() { showLeaderboard(); }
    );
}

// Mostrar menú de inicio
function showStartMenu() {
    // Cancelar cualquier juego en curso
    if (isGameActive) {
        endGame();
    }
    
    // Cancelar cualquier bucle de animación anterior
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    // Restablecer velocidad del juego a su valor inicial
    gameConfig.speed = 1.5;
    
    // Limpiar canvas
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Dibujar fondo
    drawGameBackground();
    
    // Título
    gameCtx.fillStyle = '#fff';
    gameCtx.font = 'bold 24px Orbitron';
    gameCtx.textAlign = 'center';
    gameCtx.fillText('MINIJUEGO GALÁCTICO', gameCanvas.width / 2, gameCanvas.height / 3 - 40);
    
    // Descripción
    gameCtx.font = '16px Quicksand';
    gameCtx.fillText('¡Recoge estrellas y evita asteroides!', gameCanvas.width / 2, gameCanvas.height / 3);
    
    // Instrucciones claras de control
    gameCtx.fillStyle = '#4facfe';
    gameCtx.font = 'bold 16px Quicksand';
    gameCtx.fillText('Arrastra con tu dedo para moverte', gameCanvas.width / 2, gameCanvas.height / 3 + 30);
    
    // Asegurar que tenemos la información del invitado actualizada
    getGuestInfo();
    
    // Botones
    drawButton(
        gameCanvas.width / 2 - 75,
        gameCanvas.height / 2 - 5,
        150,
        50,
        'Jugar',
        '#4facfe',
        function() { startGame(); }
    );
    
    drawButton(
        gameCanvas.width / 2 - 75,
        gameCanvas.height / 2 + 60,
        150,
        50,
        'Ranking',
        '#9d4edd',
        function() { showLeaderboard(); }
    );
}

// Función para truncar texto si excede cierta longitud
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

// Mostrar ranking de puntuaciones
function showLeaderboard() {
    // Añadir mensaje de depuración
    console.log('Obteniendo ranking de puntuaciones...');
    
    // Obtener puntuaciones del servidor
    fetch('../api/get_leaderboard.php')
    .then(response => {
        console.log('Respuesta recibida:', response);
        return response.json();
    })
    .then(data => {
        console.log('Datos de ranking recibidos:', data);
        
        // Limpiar canvas
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // Fondo
        drawGameBackground();
        
        // Título
        gameCtx.fillStyle = '#ffffff';
        gameCtx.textAlign = 'center';
        gameCtx.font = 'bold 24px Orbitron';
        gameCtx.fillText('RANKING GALÁCTICO', gameCanvas.width / 2, gameCanvas.height / 5);
        
        // Verificar si hay datos y si son válidos
        if (!data || !data.success || !data.leaderboard || data.leaderboard.length === 0) {
            gameCtx.font = 'bold 16px Orbitron';
            gameCtx.fillText('Aún no hay puntuaciones registradas', gameCanvas.width / 2, gameCanvas.height / 3);
        } else {
            const leaderboardData = data.leaderboard;
            
            // Dibujar tabla de puntuaciones
            const startY = gameCanvas.height / 3;
            const rowHeight = 30;
            
            // Encabezado
            gameCtx.textAlign = 'left';
            gameCtx.font = 'bold 16px Orbitron';
            gameCtx.fillText('Pos', gameCanvas.width / 4 - 40, startY);
            gameCtx.fillText('Invitado', gameCanvas.width / 4, startY);
            gameCtx.textAlign = 'right';
            gameCtx.fillText('Puntos', gameCanvas.width * 3/4, startY);
            
            // Línea divisoria
            gameCtx.beginPath();
            gameCtx.moveTo(gameCanvas.width / 4 - 60, startY + 10);
            gameCtx.lineTo(gameCanvas.width * 3/4 + 20, startY + 10);
            gameCtx.strokeStyle = '#4facfe';
            gameCtx.stroke();
            
            // Filas de puntuación (máximo 10)
            const maxScores = Math.min(10, leaderboardData.length);
            for (let i = 0; i < maxScores; i++) {
                const isCurrentPlayer = leaderboardData[i].guest_id == guestId;
                const y = startY + 40 + (i * rowHeight);
                
                // Posición
                gameCtx.textAlign = 'left';
                gameCtx.fillStyle = isCurrentPlayer ? '#4facfe' : '#ffffff';
                gameCtx.fillText(`${i+1}`, gameCanvas.width / 4 - 40, y);
                
                // Nombre (limitando el ancho para evitar superposición con puntuación)
                const nameWidth = gameCanvas.width * 0.4; // 40% del ancho del canvas para el nombre
                gameCtx.fillText(truncateText(leaderboardData[i].guest_name, 15), gameCanvas.width / 4, y - 5); // Nombre un poco más arriba
                
                // Puntuación
                gameCtx.textAlign = 'right';
                gameCtx.fillText(leaderboardData[i].score, gameCanvas.width * 3/4, y + 10); // Puntuación un poco más abajo
                
                // Línea de separación
                if (i < maxScores - 1) {
                    gameCtx.beginPath();
                    gameCtx.moveTo(gameCanvas.width / 4 - 60, y + 10);
                    gameCtx.lineTo(gameCanvas.width * 3/4 + 20, y + 10);
                    gameCtx.strokeStyle = 'rgba(79, 172, 254, 0.3)';
                    gameCtx.stroke();
                }
            }
        }
        
        // Botón para volver
        drawButton(
            gameCanvas.width / 2 - 75,
            gameCanvas.height - 60,
            150, 
            50,
            'Volver al juego',
            '#4facfe',
            function() { showStartMenu(); }
        );
    })
    .catch(error => {
        console.error('Error al obtener ranking:', error);
        
        // Mostrar mensaje de error
        gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawGameBackground();
        
        gameCtx.fillStyle = '#ffffff';
        gameCtx.textAlign = 'center';
        gameCtx.font = 'bold 24px Orbitron';
        gameCtx.fillText('ERROR AL CARGAR RANKING', gameCanvas.width / 2, gameCanvas.height / 3);
        gameCtx.font = 'bold 16px Orbitron';
        gameCtx.fillText('Revisa la consola para más detalles', gameCanvas.width / 2, gameCanvas.height / 3 + 40);
        
        // Botón para volver
        drawButton(
            gameCanvas.width / 2 - 75,
            gameCanvas.height - 60,
            150, 
            50,
            'Volver al juego',
            '#4facfe',
            function() { showStartMenu(); }
        );
    });
    
    // Ya no intentamos mostrar un menú que no existe en HTML
    // Simplemente mostramos la tabla en el canvas
    console.log('Tabla de clasificación mostrada en canvas');
}

// Ocultar el ranking y volver al menú inicial
function hideLeaderboard() {
    console.log('Ocultando tabla de clasificación...');
    showStartMenu();
}

// Guardar puntuación en el servidor
function saveScore(score, name = null, id = null) {
    // Utilizar parámetros proporcionados o variables locales del juego como respaldo
    const playerName = name || guestName || window.guestName || 'Invitado';
    const playerId = id || guestId || window.guestId || '1';
    
    console.log('=== GUARDANDO PUNTUACIÓN ===');
    console.log('Score:', score);
    console.log('Parámetros recibidos:', { name, id });
    console.log('Variables globales:', { 'window.guestName': window.guestName, 'window.guestId': window.guestId });
    console.log('Variables locales del juego:', { guestName, guestId });
    console.log('Valores finales a enviar:', { playerName, playerId });
    
    // Crear FormData para enviar al servidor
    const formData = new FormData();
    formData.append('score', score);
    formData.append('guest_name', playerName);
    formData.append('guest_id', playerId);
    
    // Enviar puntuación
    fetch('../api/save_score.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        // Mostrar posición en el ranking si es exitoso
        if (data.success && data.position) {
            showRankingPosition(data.position, score);
        }
    })
    .catch(error => {
        console.error('Error al guardar la puntuación:', error);
    });
}

// Mostrar la posición en el ranking
function showRankingPosition(position, score) {
    const gameOverText = document.getElementById('game-over-text');
    if (gameOverText) {
        gameOverText.innerHTML += `<div class="ranking-result">Tu puntuación: <strong>${score}</strong><br>Posición en el ranking: <strong>#${position}</strong></div>`;
    }
}

// Reproducir sonido (versión básica)
function playSound(type) {
    // En una implementación más completa, aquí se reproducirían sonidos
    console.log('Reproducir sonido:', type);
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el elemento de juego existe antes de inicializar
    if (document.getElementById('gameCanvas')) {
        initGame();
    }
});