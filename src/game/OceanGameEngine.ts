import { AssetMap } from "./assetLoader";
import { CollisionRect, StageConfig, StageResult } from "./types";

type MoveKey = "ArrowUp" | "ArrowDown";
type EnemyType = "normal" | "lucky" | "hive" | "drone";

interface EngineCallbacks {
  onResult?: (result: StageResult) => void;
}

class InputHandler {
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !this.game.keys.includes(event.key)) {
      this.game.keys.push(event.key);
      return;
    }

    if (event.key === " ") {
      this.game.player.shootTop();
      return;
    }

    if (event.key === "d") {
      this.game.debug = !this.game.debug;
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const key = event.key;
    if (key === "ArrowUp" || key === "ArrowDown") {
      const index = this.game.keys.indexOf(key);
      if (index >= 0) {
        this.game.keys.splice(index, 1);
      }
    }
  };

  constructor(private readonly game: Game) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}

class Projectile implements CollisionRect {
  readonly width = 10;
  readonly height = 3;
  readonly speed = 3;
  markedForDeletion = false;

  constructor(
    private readonly game: Game,
    public x: number,
    public y: number
  ) {}

  update(): void {
    this.x += this.speed;
    if (this.x > this.game.width * 0.8) {
      this.markedForDeletion = true;
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    context.drawImage(this.game.assets.projectile, this.x, this.y);
  }
}

class Particle {
  readonly spriteSize = 50;
  readonly frameX = Math.floor(Math.random() * 3);
  readonly frameY = Math.floor(Math.random() * 3);
  readonly sizeModifier = Number((Math.random() * 0.5 + 0.5).toFixed(1));
  readonly size = this.spriteSize * this.sizeModifier;
  readonly speedX = Math.random() * 6 - 3;
  speedY = Math.random() * -15;
  readonly gravity = 0.5;
  readonly bottomBounceBoundary = Math.random() * 80 + 60;
  readonly va = Math.random() * 0.2 - 0.1;

  markedForDeletion = false;
  angle = 0;
  bounced = 0;

  constructor(
    private readonly game: Game,
    public x: number,
    public y: number
  ) {}

  update(): void {
    this.angle += this.va;
    this.speedY += this.gravity;
    this.x -= this.speedX + this.game.speed;
    this.y += this.speedY;

    if (this.y > this.game.height + this.size || this.x < -this.size) {
      this.markedForDeletion = true;
    }

    if (
      this.y > this.game.height - this.bottomBounceBoundary &&
      this.bounced < this.game.config.tuning.particleBounceLimit
    ) {
      this.bounced += 1;
      this.speedY *= this.game.config.tuning.particleBounceDamping;
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.drawImage(
      this.game.assets.gears,
      this.frameX * this.spriteSize,
      this.frameY * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      this.size * -0.5,
      this.size * -0.5,
      this.size,
      this.size
    );
    context.restore();
  }
}

class Player implements CollisionRect {
  readonly width = 120;
  readonly height = 190;

  x = 20;
  y = 100;
  frameX = 0;
  frameY = 0;
  readonly maxFrame = 37;
  speedY = 0;
  readonly maxSpeed = 3;
  readonly projectiles: Projectile[] = [];

  powerUp = false;
  powerUpTimer = 0;
  readonly powerUpLimit = 10000;

  constructor(private readonly game: Game) {}

  update(deltaTime: number): void {
    if (this.game.keys.includes("ArrowUp")) {
      this.speedY = -this.maxSpeed;
    } else if (this.game.keys.includes("ArrowDown")) {
      this.speedY = this.maxSpeed;
    } else {
      this.speedY = 0;
    }

    this.y += this.speedY;

    if (this.y > this.game.height - this.height * 0.5) {
      this.y = this.game.height - this.height * 0.5;
    } else if (this.y < -this.height * 0.5) {
      this.y = -this.height * 0.5;
    }

    this.projectiles.forEach((projectile) => projectile.update());
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      if (this.projectiles[i].markedForDeletion) {
        this.projectiles.splice(i, 1);
      }
    }

    this.frameX = this.frameX < this.maxFrame ? this.frameX + 1 : 0;

    if (this.powerUp) {
      if (this.powerUpTimer > this.powerUpLimit) {
        this.powerUpTimer = 0;
        this.powerUp = false;
        this.frameY = 0;
      } else {
        this.powerUpTimer += deltaTime;
        this.frameY = 1;
        this.game.ammo += 0.1;
      }
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    this.projectiles.forEach((projectile) => projectile.draw(context));

    context.drawImage(
      this.game.assets.player,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  shootTop(): void {
    if (this.game.ammo > 0) {
      this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
      this.game.ammo -= 1;
    }
    if (this.powerUp) {
      this.shootBottom();
    }
  }

  private shootBottom(): void {
    if (this.game.ammo > 0) {
      this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
    }
  }

  enterPowerUp(): void {
    this.powerUpTimer = 0;
    this.powerUp = true;
    if (this.game.ammo < this.game.maxAmmo) {
      this.game.ammo = this.game.maxAmmo;
    }
  }
}

abstract class Enemy implements CollisionRect {
  type: EnemyType = "normal";

  x: number;
  y = 0;
  width = 0;
  height = 0;

  speedX: number;
  markedForDeletion = false;

  frameX = 0;
  frameY = 0;
  readonly maxFrame = 37;

  lives = 1;
  score = 1;

  constructor(protected readonly game: Game, private readonly image: HTMLImageElement) {
    this.x = this.game.width;
    this.speedX = Math.random() * -1.5 - 0.5;
  }

  update(): void {
    this.x += this.speedX - this.game.speed;
    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
    this.frameX = this.frameX < this.maxFrame ? this.frameX + 1 : 0;
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );

    if (this.game.debug) {
      context.font = `20px ${this.game.config.ui.fontFamily}`;
      context.fillText(String(this.lives), this.x, this.y);
    }
  }
}

class Angler1 extends Enemy {
  constructor(game: Game) {
    super(game, game.assets.angler1);
    this.width = 228;
    this.height = 169;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.frameY = Math.floor(Math.random() * 3);
    this.lives = 5;
    this.score = this.lives;
  }
}

class Angler2 extends Enemy {
  constructor(game: Game) {
    super(game, game.assets.angler2);
    this.width = 213;
    this.height = 165;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.frameY = Math.floor(Math.random() * 2);
    this.lives = 6;
    this.score = this.lives;
  }
}

class LuckyFish extends Enemy {
  constructor(game: Game) {
    super(game, game.assets.lucky);
    this.type = "lucky";
    this.width = 99;
    this.height = 95;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.frameY = Math.floor(Math.random() * 2);
    this.lives = 5;
    this.score = 15;
  }
}

class HiveWhale extends Enemy {
  constructor(game: Game) {
    super(game, game.assets.hivewhale);
    this.type = "hive";
    this.width = 400;
    this.height = 227;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.frameY = 0;
    this.lives = 20;
    this.score = this.lives;
    this.speedX = Math.random() * -1.2 - 0.2;
  }
}

class Drone extends Enemy {
  constructor(game: Game, x: number, y: number) {
    super(game, game.assets.drone);
    this.type = "drone";
    this.width = 115;
    this.height = 95;
    this.x = x;
    this.y = y;
    this.frameY = Math.floor(Math.random() * 2);
    this.lives = 3;
    this.score = this.lives;
    this.speedX = Math.random() * -4.2 - 0.5;
  }
}

class Layer {
  readonly width = 1768;
  readonly height = 500;

  x = 0;
  y = 0;

  constructor(
    private readonly game: Game,
    private readonly image: HTMLImageElement,
    private readonly speedModifier: number
  ) {}

  update(): void {
    if (this.x <= -this.width) {
      this.x = 0;
    }
    this.x -= this.game.speed * this.speedModifier;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.drawImage(this.image, this.x, this.y);
    context.drawImage(this.image, this.x + this.width, this.y);
  }
}

class Background {
  readonly layer1: Layer;
  readonly layer2: Layer;
  readonly layer3: Layer;
  readonly layer4: Layer;
  private readonly parallaxLayers: Layer[];

  constructor(private readonly game: Game) {
    this.layer1 = new Layer(this.game, this.game.assets.layer1, 0.2);
    this.layer2 = new Layer(this.game, this.game.assets.layer2, 0.4);
    this.layer3 = new Layer(this.game, this.game.assets.layer3, 1);
    this.layer4 = new Layer(this.game, this.game.assets.layer4, 1.5);
    this.parallaxLayers = [this.layer1, this.layer2, this.layer3];
  }

  update(): void {
    this.parallaxLayers.forEach((layer) => layer.update());
  }

  draw(context: CanvasRenderingContext2D): void {
    this.parallaxLayers.forEach((layer) => layer.draw(context));
  }
}

class Explosion {
  readonly spriteWidth = 200;
  readonly spriteHeight = 200;

  readonly width = this.spriteWidth;
  readonly height = this.spriteHeight;

  frameX = 0;
  fps = 30;
  timer = 0;
  readonly interval = 1000 / this.fps;
  readonly maxFrame = 8;
  markedForDeletion = false;

  x: number;
  y: number;

  constructor(private readonly game: Game, x: number, y: number, protected readonly image: HTMLImageElement) {
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
  }

  update(deltaTime: number): void {
    this.x -= this.game.speed;
    if (this.timer > this.interval) {
      this.frameX += 1;
      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }

    if (this.frameX > this.maxFrame) {
      this.markedForDeletion = true;
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class SmokeExplosion extends Explosion {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, game.assets.smokeExplosion);
  }
}

class FireExplosion extends Explosion {
  constructor(game: Game, x: number, y: number) {
    super(game, x, y, game.assets.fireExplosion);
  }
}

class UI {
  constructor(private readonly game: Game) {}

  draw(context: CanvasRenderingContext2D): void {
    const { textColor, ammoBoostColor, fontFamily, hudFontSize, winTitle, winSubtitle, loseTitle, loseSubtitle } =
      this.game.config.ui;

    context.save();
    context.fillStyle = textColor;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "black";
    context.font = `${hudFontSize}px ${fontFamily}`;

    context.fillText(`Score: ${this.game.score}`, 20, 40);
    context.fillText(`Timer: ${(this.game.gameTime * 0.001).toFixed(1)}`, 20, 100);

    if (this.game.gameOver) {
      const didWin = this.game.score > this.game.winningScore;
      context.textAlign = "center";
      context.font = `70px ${fontFamily}`;
      context.fillText(didWin ? winTitle : loseTitle, this.game.width * 0.5, this.game.height * 0.5 - 20);
      context.font = `25px ${fontFamily}`;
      context.fillText(didWin ? winSubtitle : loseSubtitle, this.game.width * 0.5, this.game.height * 0.5 + 20);
      context.textAlign = "left";
    }

    if (this.game.player.powerUp) {
      context.fillStyle = ammoBoostColor;
    }

    for (let i = 0; i < this.game.ammo; i += 1) {
      context.fillRect(20 + 5 * i, 50, 3, 20);
    }

    context.restore();
  }
}

class Game {
  readonly width: number;
  readonly height: number;

  readonly background: Background;
  readonly player: Player;
  readonly input: InputHandler;
  readonly ui: UI;

  readonly keys: MoveKey[] = [];
  enemies: Enemy[] = [];
  particles: Particle[] = [];
  explosions: Explosion[] = [];

  enemyTimer = 0;
  ammo = 20;
  readonly maxAmmo = 50;
  ammoTimer = 0;
  readonly ammoInterval = 350;
  gameOver = false;
  score = 0;
  gameTime = 0;
  speed = 1;
  debug = false;

  private hasReportedResult = false;

  get winningScore(): number {
    return this.config.tuning.winningScore;
  }

  constructor(
    readonly config: StageConfig,
    readonly assets: AssetMap,
    private readonly callbacks: EngineCallbacks
  ) {
    this.width = config.canvasWidth;
    this.height = config.canvasHeight;
    this.background = new Background(this);
    this.player = new Player(this);
    this.input = new InputHandler(this);
    this.ui = new UI(this);
  }

  update(deltaTime: number): void {
    if (!this.gameOver) {
      this.gameTime += deltaTime;
    }

    if (this.gameTime > this.config.tuning.timeLimitMs) {
      this.gameOver = true;
    }

    this.background.update();
    this.background.layer4.update();
    this.player.update(deltaTime);

    if (this.ammoTimer > this.ammoInterval) {
      if (this.ammo < this.maxAmmo) {
        this.ammo += 1;
      }
      this.ammoTimer = 0;
    } else {
      this.ammoTimer += deltaTime;
    }

    this.particles.forEach((particle) => particle.update());
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);

    this.explosions.forEach((explosion) => explosion.update(deltaTime));
    this.explosions = this.explosions.filter((explosion) => !explosion.markedForDeletion);

    this.enemies.forEach((enemy) => {
      enemy.update();

      if (this.checkCollision(this.player, enemy)) {
        enemy.markedForDeletion = true;
        this.addExplosion(enemy);

        for (let i = 0; i < enemy.score; i += 1) {
          this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }

        if (enemy.type === "lucky") {
          this.player.enterPowerUp();
        } else if (!this.gameOver) {
          this.score -= this.config.tuning.collisionPenalty;
        }
      }

      this.player.projectiles.forEach((projectile) => {
        if (!this.checkCollision(projectile, enemy)) {
          return;
        }

        enemy.lives -= 1;
        projectile.markedForDeletion = true;
        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));

        if (enemy.lives > 0) {
          return;
        }

        for (let i = 0; i < enemy.score; i += 1) {
          this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }

        enemy.markedForDeletion = true;
        this.addExplosion(enemy);

        if (enemy.type === "hive") {
          for (let i = 0; i < 5; i += 1) {
            this.enemies.push(
              new Drone(
                this,
                enemy.x + Math.random() * enemy.width,
                enemy.y + Math.random() * enemy.height * 0.5
              )
            );
          }
        }

        if (!this.gameOver) {
          this.score += enemy.score;
        }
      });
    });

    this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

    if (this.enemyTimer > this.config.tuning.enemyIntervalMs && !this.gameOver) {
      this.addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer += deltaTime;
    }

    this.reportResultIfNeeded();
  }

  draw(context: CanvasRenderingContext2D): void {
    this.background.draw(context);
    this.ui.draw(context);
    this.player.draw(context);
    this.particles.forEach((particle) => particle.draw(context));
    this.enemies.forEach((enemy) => enemy.draw(context));
    this.explosions.forEach((explosion) => explosion.draw(context));
    this.background.layer4.draw(context);
  }

  destroy(): void {
    this.input.destroy();
  }

  private reportResultIfNeeded(): void {
    if (!this.gameOver || this.hasReportedResult) {
      return;
    }

    this.hasReportedResult = true;
    const result: StageResult = this.score > this.winningScore ? "win" : "lose";
    this.callbacks.onResult?.(result);
  }

  private addEnemy(): void {
    const randomizer = Math.random();

    if (randomizer < 0.3) {
      this.enemies.push(new Angler1(this));
      return;
    }

    if (randomizer < 0.6) {
      this.enemies.push(new Angler2(this));
      return;
    }

    if (randomizer < this.config.tuning.hiveThreshold) {
      this.enemies.push(new HiveWhale(this));
      return;
    }

    this.enemies.push(new LuckyFish(this));
  }

  private addExplosion(enemy: Enemy): void {
    const x = enemy.x + enemy.width * 0.5;
    const y = enemy.y + enemy.height * 0.5;

    if (Math.random() < 0.5) {
      this.explosions.push(new SmokeExplosion(this, x, y));
    } else {
      this.explosions.push(new FireExplosion(this, x, y));
    }
  }

  private checkCollision(first: CollisionRect, second: CollisionRect): boolean {
    return (
      first.x < second.x + second.width &&
      first.x + first.width > second.x &&
      first.y < second.y + second.height &&
      first.y + first.height > second.y
    );
  }
}

export class OceanGameEngine {
  private readonly game: Game;
  private frameRequest: number | null = null;
  private lastTime = 0;

  private readonly animate = (timeStamp: number): void => {
    const deltaTime = this.lastTime === 0 ? 0 : timeStamp - this.lastTime;
    this.lastTime = timeStamp;

    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.game.draw(this.context);
    this.game.update(deltaTime);

    this.frameRequest = window.requestAnimationFrame(this.animate);
  };

  constructor(
    private readonly context: CanvasRenderingContext2D,
    config: StageConfig,
    assets: AssetMap,
    callbacks: EngineCallbacks
  ) {
    this.context.canvas.width = config.canvasWidth;
    this.context.canvas.height = config.canvasHeight;
    this.game = new Game(config, assets, callbacks);
  }

  start(): void {
    if (this.frameRequest !== null) {
      return;
    }

    this.lastTime = 0;
    this.frameRequest = window.requestAnimationFrame(this.animate);
  }

  destroy(): void {
    if (this.frameRequest !== null) {
      window.cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
    this.game.destroy();
  }
}