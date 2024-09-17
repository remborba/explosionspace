// Obter o canvas e o contexto
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Definir o tamanho do canvas para o tamanho da janela
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configurações iniciais
let spaceship = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 7
};

let meteors = [];
let bullets = [];
let score = 0;
let level = 1;
let lives = 3;
let gameOver = false;
let gameWon = false; // Nova variável para verificar se o jogo foi vencido

// Novas variáveis para as armas
let meteorsDestroyed = 0; // Contador de meteoros destruídos
let weaponAvailable = {
  weapon1: false, // Disponibilidade da arma 1
  weapon2: false  // Disponibilidade da arma 2
};

// Carregar imagens
const spaceshipImg = new Image();
spaceshipImg.src = 'neve.png';

const meteorImg = new Image();
meteorImg.src = 'meteoro.png';

const backgroundImg = new Image();
backgroundImg.src = 'fundo2.png';

// Carregar os sons dos tiros
const shootSound = new Audio('Tiro.mp3');
const weapon1Sound = new Audio('Tiro2.mp3');
const weapon2Sound = new Audio('Tiro3.mp3');

// Ajustar o volume se necessário
shootSound.volume = 0.5;
weapon1Sound.volume = 0.5;
weapon2Sound.volume = 0.5;

// Garantir que as imagens sejam carregadas antes de iniciar o jogo
let imagesLoaded = 0;

function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    // Iniciar o loop do jogo
    gameLoop();
  }
}

spaceshipImg.onload = checkImagesLoaded;
meteorImg.onload = checkImagesLoaded;
backgroundImg.onload = checkImagesLoaded;

// Função para desenhar o fundo
function drawBackground() {
  context.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

// Função para desenhar a nave espacial
function drawSpaceship() {
  context.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

// Função para criar meteoros
function createMeteor() {
  let size = Math.random() * 30 + 20; // Tamanhos entre 20 e 50
  let meteor = {
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: level + 1
  };
  meteors.push(meteor);
}

// Função para desenhar os meteoros
function drawMeteors() {
  meteors.forEach(function(meteor) {
    context.drawImage(meteorImg, meteor.x, meteor.y, meteor.width, meteor.height);
  });
}

// Função para atualizar a posição dos meteoros
function updateMeteors() {
  meteors.forEach(function(meteor, index) {
    meteor.y += meteor.speed;

    // Verificar colisão com a nave
    if (detectCollision(meteor, spaceship)) {
      meteors.splice(index, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
    }

    // Remover meteoros que saem da tela
    if (meteor.y > canvas.height) {
      meteors.splice(index, 1);
    }
  });
}

// Função para atirar projéteis
function shootBullet() {
  let bullet = {
    x: spaceship.x + spaceship.width / 2 - 2.5,
    y: spaceship.y,
    width: 5,
    height: 10,
    speed: 10
  };
  bullets.push(bullet);

  // Reproduzir o som do tiro principal
  shootSound.currentTime = 0; // Reinicia o som se já estiver tocando
  shootSound.play();
}

// Função para atirar com a Arma 1 (projétil poderoso)
function shootWeapon1() {
  let bullet = {
    x: spaceship.x + spaceship.width / 2 - 5,
    y: spaceship.y,
    width: 10,
    height: 20,
    speed: 10,
    power: 'piercing' // Identifica que é um projétil especial
  };
  bullets.push(bullet);

  // Reproduzir o som da Arma 1
  weapon1Sound.currentTime = 0;
  weapon1Sound.play();
}

// Função para atirar com a Arma 2 (tiro espalhado)
function shootWeapon2() {
  let bulletMiddle = {
    x: spaceship.x + spaceship.width / 2 - 2.5,
    y: spaceship.y,
    width: 5,
    height: 10,
    speed: 10,
    angle: 0 // Trajetória reta
  };

  let bulletLeft = {
    x: spaceship.x + spaceship.width / 2 - 2.5,
    y: spaceship.y,
    width: 5,
    height: 10,
    speed: 10,
    angle: -0.1 // Leve desvio para a esquerda
  };

  let bulletRight = {
    x: spaceship.x + spaceship.width / 2 - 2.5,
    y: spaceship.y,
    width: 5,
    height: 10,
    speed: 10,
    angle: 0.1 // Leve desvio para a direita
  };

  bullets.push(bulletMiddle, bulletLeft, bulletRight);

  // Reproduzir o som da Arma 2
  weapon2Sound.currentTime = 0;
  weapon2Sound.play();
}

// Função para desenhar os projéteis
function drawBullets() {
  bullets.forEach(function(bullet) {
    if (bullet.power === 'piercing') {
      // Projétil poderoso (arma 1)
      context.fillStyle = 'yellow';
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    } else if (bullet.angle !== undefined) {
      // Projétil espalhado (arma 2)
      context.fillStyle = 'green';
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    } else {
      // Projétil normal
      context.fillStyle = 'red';
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });
}

// Função para atualizar a posição dos projéteis
function updateBullets() {
  bullets.forEach(function(bullet, bIndex) {
    // Atualizar a posição do projétil
    if (bullet.angle !== undefined) {
      // Se o projétil tiver um ângulo, ajustar a trajetória
      bullet.x += Math.sin(bullet.angle) * bullet.speed;
      bullet.y -= Math.cos(bullet.angle) * bullet.speed;
    } else {
      bullet.y -= bullet.speed;
    }

    // Remover projéteis que saem da tela
    if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
      bullets.splice(bIndex, 1);
      return; // Continua para o próximo projétil
    }

    // Verificar colisão com meteoros
    meteors.forEach(function(meteor, mIndex) {
      if (detectCollision(bullet, meteor)) {
        // Se o projétil for poderoso, não removê-lo imediatamente
        if (bullet.power === 'piercing') {
          meteors.splice(mIndex, 1);
          score += 10;
          meteorsDestroyed++;
          // Verificar se é hora de conceder uma nova arma
          if (meteorsDestroyed % 3 === 0) {
            grantWeapon();
          }
          // Aumentar nível a cada 100 pontos
          if (score % 100 === 0) {
            level++;
            checkVictory(); // Verificar se o jogador venceu
          }
        } else {
          bullets.splice(bIndex, 1);
          meteors.splice(mIndex, 1);
          score += 10;
          meteorsDestroyed++;
          // Verificar se é hora de conceder uma nova arma
          if (meteorsDestroyed % 3 === 0) {
            grantWeapon();
          }
          // Aumentar nível a cada 100 pontos
          if (score % 100 === 0) {
            level++;
            checkVictory(); // Verificar se o jogador venceu
          }
          return; // Sai do loop dos meteoros
        }
      }
    });
  });
}

// Função para detectar colisões
function detectCollision(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// Função para conceder novas armas
function grantWeapon() {
  if (!weaponAvailable.weapon1) {
    weaponAvailable.weapon1 = true;
    alert('Você ganhou a Arma 1! Pressione a seta para cima para usá-la.');
  } else if (!weaponAvailable.weapon2) {
    weaponAvailable.weapon2 = true;
    alert('Você ganhou a Arma 2! Pressione a seta para baixo para usá-la.');
  }
}

// Função para verificar se o jogador venceu o jogo
function checkVictory() {
  if (level > 5 && !gameWon) {
    gameWon = true;
    // Redirecionar para a página de vitória
    window.location.href = 'victory.html';
  }
}

// Função principal do jogo
function gameLoop() {
  if (gameOver) {
    alert('Game Over! Sua pontuação: ' + score);
    document.location.reload();
    return;
  }

  if (gameWon) {
    // Se o jogo foi vencido, não continua o loop
    return;
  }

  // Desenhar o fundo
  drawBackground();

  drawSpaceship();
  drawMeteors();
  drawBullets();

  updateMeteors();
  updateBullets();

  // Gerar meteoros aleatoriamente
  if (Math.random() < 0.02 * level) {
    createMeteor();
  }

  // Mostrar pontuação, nível e vidas
  context.fillStyle = 'white';
  context.font = '20px Arial';
  context.fillText('Pontuação: ' + score, 10, 30);
  context.fillText('Nível: ' + level, 10, 60);
  context.fillText('Vidas: ' + lives, 10, 90);

  requestAnimationFrame(gameLoop);
}

// Eventos de teclado para mover a nave e atirar
document.addEventListener('keydown', function(event) {
  // console.log('Tecla pressionada:', event.key);

  if ((event.key === 'ArrowLeft' || event.key === 'Left') && spaceship.x > 0) {
    spaceship.x -= spaceship.speed;
  } else if ((event.key === 'ArrowRight' || event.key === 'Right') && spaceship.x + spaceship.width < canvas.width) {
    spaceship.x += spaceship.speed;
  } else if (event.key === ' ' || event.key === 'Spacebar') {
    shootBullet();
  } else if ((event.key === 'ArrowUp' || event.key === 'Up') && weaponAvailable.weapon1) {
    shootWeapon1();
    weaponAvailable.weapon1 = false; // Consome a arma após o uso
  } else if ((event.key === 'ArrowDown' || event.key === 'Down') && weaponAvailable.weapon2) {
    shootWeapon2();
    weaponAvailable.weapon2 = false; // Consome a arma após o uso
  }
});

// Atualizar o tamanho do canvas e reposicionar elementos ao redimensionar a janela
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Reposicionar a nave
  spaceship.x = canvas.width / 2 - spaceship.width / 2;
  spaceship.y = canvas.height - 100;
});

// Iniciar o jogo após as imagens serem carregadas
// As imagens serão carregadas e o jogo iniciará automaticamente através da função checkImagesLoaded()
