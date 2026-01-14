import React, { useEffect } from 'react';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.score = 0;
    this.timeLeft = 45;
    this.gameStarted = false;
    this.crystalsCollected = 0;
    this.maxCrystals = 12;
    this.asteroidsHit = 0;
    this.difficultyLevel = 1;
    this.difficultyTimerEvent = null;
    this.backgroundMusic = null;
    this.soundEnabled = true;
    this.audioContext = null;
  }

  preload() {
    // 🪐 Imágenes
    this.load.image('coin', 'https://cdn-icons-png.flaticon.com/512/2583/2583314.png');
    this.load.image('fire', 'https://cdn-icons-png.flaticon.com/512/599/599516.png');
    this.load.image('warning', 'https://cdn-icons-png.flaticon.com/512/3525/3525884.png');
    this.load.image('toxic', 'https://cdn-icons-png.flaticon.com/512/2733/2733066.png');
    this.load.image('lightning', 'https://cdn-icons-png.flaticon.com/512/740/740922.png');
    this.load.image('radiation', 'https://cdn-icons-png.flaticon.com/512/684/684809.png');
    this.load.image('cactus', 'https://cdn-icons-png.flaticon.com/512/3047/3047933.png');
    this.load.image('spark', 'https://cdn-icons-png.flaticon.com/512/1829/1829589.png');

    // 🎧 Sonidos arcade (manteniendo los originales)
    this.load.audio('launch', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_6f95f36b67.mp3?filename=rocket-launch-70348.mp3');
    this.load.audio('coin', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_cfae9c58f2.mp3?filename=coin-collect-70347.mp3');
    this.load.audio('explosion', 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_70e38f6f16.mp3?filename=explosion-6086.mp3');
    this.load.audio('victory', 'https://cdn.pixabay.com/download/audio/2021/11/09/audio_4c3a45d6cb.mp3?filename=success-1-6297.mp3');
    this.load.audio('space_ambience', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_5b46c087f5.mp3?filename=space-ambience-70346.mp3');
  }

  create() {
    this.physics.world.setBounds(0, 80, 800, 520);
    this.createBackground();
    this.createStars();
    this.createInfoPanel();
    this.createNebulaParticles();
    this.showStartMessage();
    this.createSoundControl();

    // Activar audio después de interacción del usuario
    this.input.once('pointerdown', () => {
      this.unlockAudio();
      this.startMission();
    });
  }

  createBackground() {
    const bg = this.add.rectangle(400, 300, 800, 600, 0x0a0a2a);
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x1a237e, 0x0d47a1, 0x0d47a1, 0x1a237e, 1);
    gradient.fillRect(0, 0, 800, 600);
    gradient.setAlpha(0.5);
  }

  createStars() {
    this.stars = this.add.group();
    for (let i = 0; i < 120; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        Phaser.Math.Between(1, 2),
        0xFFFFFF
      );
      star.scrollFactorX = Phaser.Math.FloatBetween(0.1, 0.5);
      star.alpha = Phaser.Math.FloatBetween(0.4, 0.9);
      this.stars.add(star);
    }
  }

  createNebulaParticles() {
    this.add.particles(0, 0, 'coin', {
      x: { min: -100, max: 900 },
      y: { min: -100, max: 700 },
      speed: { min: 5, max: 15 },
      scale: { start: 0.03, end: 0 },
      lifespan: { min: 4000, max: 8000 },
      quantity: 2,
      frequency: 300,
      tint: [0x4FC3F7, 0x29B6F6, 0x7C4DFF],
      blendMode: 'ADD'
    });
  }

  createInfoPanel() {
    const info = this.add.graphics();
    info.fillStyle(0x0d47a1, 0.9);
    info.fillRoundedRect(10, 10, 780, 70, 15);
    info.lineStyle(3, 0x4fc3f7, 1);
    info.strokeRoundedRect(10, 10, 780, 70, 15);
    
    this.timerText = this.add.text(100, 40, `45s`, { fontSize: '20px', fill: '#FFD740' }).setOrigin(0.5);
    this.scoreText = this.add.text(300, 40, `0`, { fontSize: '20px', fill: '#00E676' }).setOrigin(0.5);
    this.crystalsText = this.add.text(500, 40, `0/12`, { fontSize: '20px', fill: '#4FC3F7' }).setOrigin(0.5);
    this.hitsText = this.add.text(700, 40, `0`, { fontSize: '20px', fill: '#FF5252' }).setOrigin(0.5);
  }

  createSoundControl() {
    this.soundButton = this.add.text(750, 40, '🔊', {
      fontSize: '18px',
      fill: '#4FC3F7'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundButton.on('pointerdown', (pointer) => {
      // CORRECCIÓN: Prevenir la propagación del evento
      pointer.event.stopPropagation();
      this.toggleSound();
    });

    // CORRECCIÓN: Hacer que el botón de sonido no sea parte de los grupos de juego
    this.soundButton.setDepth(1000); // Alta prioridad de renderizado
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundButton.setText(this.soundEnabled ? '🔊' : '🔇');
    this.soundButton.setFill(this.soundEnabled ? '#4FC3F7' : '#FF5252');
    
    if (this.backgroundMusic) {
      this.backgroundMusic.setVolume(this.soundEnabled ? 0.4 : 0);
    }
    
    // CORRECCIÓN: Actualizar volumen general de sonidos
    this.sound.setVolume(this.soundEnabled ? 0.6 : 0);
  }

  unlockAudio() {
    try {
      // Crear contexto de audio para sonidos generados
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Activar sonidos precargados
      if (this.soundEnabled) {
        this.sound.setVolume(0.6);
      }
    } catch (error) {
      console.log('Audio no disponible:', error);
      this.soundEnabled = false;
      this.soundButton.setText('🔇').setFill('#FF5252');
    }
  }

  showStartMessage() {
    this.startText = this.add.text(400, 300, '🚀 Toca para iniciar la misión', {
      fontSize: '28px',
      fill: '#E3F2FD',
      fontWeight: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.startText,
      alpha: { from: 1, to: 0.4 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  startMission() {
    // 🚀 SONIDO DE LANZAMIENTO MEJORADO
    this.playEnhancedLaunchSound();
    
    if (this.startText) this.startText.destroy();
    this.score = 0;
    this.timeLeft = 45;
    this.crystalsCollected = 0;
    this.asteroidsHit = 0;
    this.gameStarted = true;

    // 🎵 Música de fondo
    if (this.sound.get('space_ambience') && this.soundEnabled) {
      this.backgroundMusic = this.sound.add('space_ambience', { volume: 0.4, loop: true });
      this.backgroundMusic.play();
    }

    this.coins = this.physics.add.group();
    this.obstacles = this.physics.add.group();
    this.createCrystals();
    this.createAsteroids();
    
    // CORRECCIÓN: Configurar eventos de click solo para objetos de juego
    this.setupGameObjectClicks();
    this.startTimer();

    this.difficultyTimerEvent = this.time.addEvent({
      delay: 5000,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true
    });
  }

  // CORRECCIÓN: Configurar eventos de click solo para objetos de juego
  setupGameObjectClicks() {
    // Remover cualquier listener previo
    this.input.off('gameobjectdown');
    
    // Agregar listeners específicos para monedas y obstáculos
    this.coins.children.entries.forEach(coin => {
      coin.off('pointerdown');
      coin.on('pointerdown', (pointer) => {
        this.handleCoinClick(pointer, coin);
      });
    });

    this.obstacles.children.entries.forEach(obstacle => {
      obstacle.off('pointerdown');
      obstacle.on('pointerdown', (pointer) => {
        this.handleObstacleClick(pointer, obstacle);
      });
    });
  }

  // 🚀 SONIDO DE LANZAMIENTO MEJORADO
  playEnhancedLaunchSound() {
    if (!this.soundEnabled) return;

    try {
      // Usar sonido precargado si está disponible
      if (this.sound.get('launch')) {
        this.sound.play('launch', { volume: 0.7 });
      } else {
        // Fallback a sonido generado
        this.playGeneratedLaunchSound();
      }
    } catch (error) {
      console.log('Error en sonido de lanzamiento:', error);
    }
  }

  playGeneratedLaunchSound() {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Motor principal
    const engineOsc = this.audioContext.createOscillator();
    const engineGain = this.audioContext.createGain();
    
    engineOsc.frequency.setValueAtTime(80, now);
    engineOsc.frequency.exponentialRampToValueAtTime(400, now + 1.2);
    engineOsc.type = 'sawtooth';
    
    engineGain.gain.setValueAtTime(0, now);
    engineGain.gain.linearRampToValueAtTime(0.5, now + 0.3);
    engineGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    
    // Explosión de impulso
    const explosionBuffer = this.createExplosionBuffer(this.audioContext, 1.5);
    const explosionSource = this.audioContext.createBufferSource();
    const explosionGain = this.audioContext.createGain();
    
    explosionSource.buffer = explosionBuffer;
    explosionGain.gain.setValueAtTime(0.6, now);
    explosionGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    
    engineOsc.connect(engineGain);
    explosionSource.connect(explosionGain);
    engineGain.connect(this.audioContext.destination);
    explosionGain.connect(this.audioContext.destination);
    
    engineOsc.start(now);
    explosionSource.start(now);
    engineOsc.stop(now + 1.5);
  }

  createExplosionBuffer(audioContext, duration) {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const attack = Math.min(progress * 10, 1);
      const decay = Math.max(1 - (progress - 0.1) * 3, 0);
      const intensity = attack * decay;
      const noise = (Math.random() * 2 - 1) * intensity;
      const filteredNoise = noise * (1 - progress * 0.8);
      data[i] = filteredNoise * 0.7;
    }
    
    return buffer;
  }

  createCrystals() {
    for (let i = 0; i < this.maxCrystals; i++) {
      const coin = this.coins.create(
        Phaser.Math.Between(30, 770),
        Phaser.Math.Between(110, 570),
        'coin'
      );
      coin.setScale(0.12);
      coin.setInteractive({ useHandCursor: true });
      coin.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
      
      // Animación de brillo
      this.tweens.add({
        targets: coin,
        alpha: { from: 0.7, to: 1 },
        duration: 800 + i * 100,
        yoyo: true,
        repeat: -1
      });
    }
  }

  createAsteroids() {
    const types = ['fire', 'warning', 'toxic', 'lightning', 'radiation', 'cactus'];
    for (let i = 0; i < 18; i++) {
      const type = Phaser.Math.RND.pick(types);
      const obs = this.obstacles.create(
        Phaser.Math.Between(30, 770),
        Phaser.Math.Between(110, 570),
        type
      );
      obs.setScale(0.13);
      obs.setInteractive({ useHandCursor: true });
      obs.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
      
      // Animación de pulsación
      this.tweens.add({
        targets: obs,
        scale: { from: 0.11, to: 0.15 },
        duration: 1500 + i * 50,
        yoyo: true,
        repeat: -1
      });
    }
  }

  // CORRECCIÓN: Métodos separados para manejar clicks
  handleCoinClick(pointer, coin) {
    if (!this.gameStarted) return;

    // 💎 SONIDO DE CRISTAL MEJORADO
    this.playEnhancedCrystalSound();
    this.createSparkEffect(coin.x, coin.y);
    
    // CORREGIDO: Usar destroy en lugar de disableBody
    coin.destroy();
    this.score += 15;
    this.crystalsCollected++;
    
    if (this.crystalsCollected >= this.maxCrystals) {
      this.playVictorySound();
    }
    
    this.updateUI();
  }

  handleObstacleClick(pointer, obstacle) {
    if (!this.gameStarted) return;

    // ☄️ SONIDO DE IMPACTO MEJORADO
    this.playEnhancedImpactSound();
    
    // CORREGIDO: Usar destroy en lugar de disableBody
    obstacle.destroy();
    this.score = Math.max(0, this.score - 10);
    this.asteroidsHit++;
    
    this.updateUI();
  }

  playEnhancedCrystalSound() {
    if (!this.soundEnabled) return;

    try {
      if (this.sound.get('coin')) {
        this.sound.play('coin', { volume: 0.5 });
      } else if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
      }
    } catch (error) {
      console.log('Error en sonido de cristal:', error);
    }
  }

  playEnhancedImpactSound() {
    if (!this.soundEnabled) return;

    try {
      if (this.sound.get('explosion')) {
        this.sound.play('explosion', { volume: 0.5 });
      } else if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const buffer = this.createImpactBuffer(this.audioContext, 1.0);
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        gainNode.gain.setValueAtTime(0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(now);
      }
    } catch (error) {
      console.log('Error en sonido de impacto:', error);
    }
  }

  createImpactBuffer(audioContext, duration) {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const attack = Math.min(progress * 15, 1);
      const decay = Math.pow(Math.max(1 - (progress - 0.05) * 2, 0), 1.5);
      const intensity = attack * decay;
      const baseNoise = (Math.random() * 2 - 1);
      const lowFreqNoise = Math.sin(progress * 50) * 0.3;
      const combinedNoise = (baseNoise + lowFreqNoise) * intensity;
      const filterEffect = 1 - progress * 0.9;
      data[i] = combinedNoise * filterEffect * 0.6;
    }
    
    return buffer;
  }

  playVictorySound() {
    if (!this.soundEnabled) return;

    try {
      if (this.sound.get('victory')) {
        this.sound.play('victory', { volume: 0.6 });
      } else if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        
        frequencies.forEach((freq, index) => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          const delay = index * 0.15;
          oscillator.frequency.setValueAtTime(freq, now + delay);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, now + delay);
          gainNode.gain.linearRampToValueAtTime(0.3, now + delay + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.start(now + delay);
          oscillator.stop(now + delay + 0.5);
        });
      }
    } catch (error) {
      console.log('Error en sonido de victoria:', error);
    }
  }

  // ✨ Efecto de chispas cósmicas al recoger cristal
  createSparkEffect(x, y) {
    const sparks = this.add.particles(x, y, 'spark', {
      speed: { min: 50, max: 200 },
      scale: { start: 0.15, end: 0 },
      lifespan: 500,
      quantity: 8,
      tint: [0x4FC3F7, 0x29B6F6, 0x81D4FA],
      blendMode: 'ADD'
    });
    this.time.delayedCall(300, () => sparks.destroy());
  }

  updateUI() {
    this.timerText.setText(`${this.timeLeft}s`);
    this.scoreText.setText(`${this.score}`);
    this.crystalsText.setText(`${this.crystalsCollected}/${this.maxCrystals}`);
    this.hitsText.setText(`${this.asteroidsHit}`);
  }

  startTimer() {
    this.timeEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tick,
      callbackScope: this,
      loop: true
    });
  }

  tick() {
    if (!this.gameStarted) return;
    this.timeLeft--;
    this.updateUI();
    
    // ⚠️ SONIDO DE ADVERTENCIA cuando quedan 5 segundos
    if (this.timeLeft === 5) {
      this.playWarningSound();
    }
    
    if (this.timeLeft <= 0) this.endMission();
  }

  playWarningSound() {
    if (!this.soundEnabled) return;

    try {
      if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
      }
    } catch (error) {
      console.log('Error en sonido de advertencia:', error);
    }
  }

  increaseDifficulty() {
    if (!this.gameStarted) return;
    
    // CORREGIDO: Usar los grupos de física correctamente
    for (let i = 0; i < 3; i++) {
      const obs = this.obstacles.create(
        Phaser.Math.Between(30, 770),
        Phaser.Math.Between(110, 570),
        Phaser.Math.RND.pick(['fire', 'warning', 'toxic', 'lightning', 'radiation', 'cactus'])
      );
      obs.setScale(0.13);
      obs.setInteractive({ useHandCursor: true });
      obs.setVelocity(Phaser.Math.Between(-150, 150), Phaser.Math.Between(-150, 150));
      
      // CORRECCIÓN: Agregar listener específico para nuevos obstáculos
      obs.on('pointerdown', (pointer) => {
        this.handleObstacleClick(pointer, obs);
      });
    }
    
    for (let i = 0; i < 2; i++) {
      const coin = this.coins.create(
        Phaser.Math.Between(30, 770),
        Phaser.Math.Between(110, 570),
        'coin'
      );
      coin.setScale(0.12);
      coin.setInteractive({ useHandCursor: true });
      coin.setVelocity(Phaser.Math.Between(-120, 120), Phaser.Math.Between(-120, 120));
      
      // CORRECCIÓN: Agregar listener específico para nuevas monedas
      coin.on('pointerdown', (pointer) => {
        this.handleCoinClick(pointer, coin);
      });
    }
  }

  endMission() {
    this.gameStarted = false;
    if (this.backgroundMusic) this.backgroundMusic.stop();
    
    // 🎉 SONIDO DE FIN DE MISIÓN según puntaje
    this.playMissionEndSound();

    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.physics.pause();
      if (this.timeEvent) this.timeEvent.remove();
      if (this.difficultyTimerEvent) this.difficultyTimerEvent.remove();
      this.showResults();
      this.cameras.main.fadeIn(800, 0, 0, 0);
    });
  }

  playMissionEndSound() {
    if (!this.soundEnabled) return;

    try {
      if (this.score >= 250) {
        this.playLegendarySound();
      } else if (this.score >= 180) {
        this.playAmazingSound();
      } else if (this.score >= 120) {
        this.playExcellentSound();
      } else if (this.score >= 60) {
        this.playGoodSound();
      } else {
        this.playTryAgainSound();
      }
    } catch (error) {
      console.log('Error en sonido de fin de misión:', error);
    }
  }

  playLegendarySound() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      const delay = index * 0.1;
      oscillator.frequency.setValueAtTime(freq, now + delay);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 0.5);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.4, now + delay + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.0);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + 1.0);
    });
  }

  playAmazingSound() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 1.0);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  }

  playExcellentSound() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const arpeggio = [400, 500, 600, 500, 400];
    
    arpeggio.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      const delay = index * 0.15;
      oscillator.frequency.setValueAtTime(freq, now + delay);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + delay);
      gainNode.gain.linearRampToValueAtTime(0.3, now + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(now + delay);
      oscillator.stop(now + delay + 0.3);
    });
  }

  playGoodSound() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 1.0);
  }

  playTryAgainSound() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.frequency.setValueAtTime(500, now);
    oscillator.frequency.exponentialRampToValueAtTime(300, now + 1.0);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 1.2);
  }

  showResults() {
    const title = this.add.text(400, 200, '🏁 MISIÓN COMPLETADA 🏁', {
      fontSize: '34px',
      fill: '#4FC3F7',
      fontWeight: 'bold',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    const summary = this.add.text(400, 300,
      `⚡ Energía: ${this.score}\n💎 Cristales: ${this.crystalsCollected}/${this.maxCrystals}\n☄️ Impactos: ${this.asteroidsHit}`,
      { fontSize: '22px', fill: '#E3F2FD', align: 'center' }).setOrigin(0.5);

    const restart = this.add.text(400, 420, '🔄 Nueva misión', {
      fontSize: '24px',
      fill: '#FFFFFF',
      backgroundColor: '#0D47A1',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restart.on('pointerdown', () => this.scene.restart());

    [title, summary, restart].forEach((el, i) => {
      el.setAlpha(0);
      this.tweens.add({ targets: el, alpha: 1, y: el.y - 10, duration: 800, delay: i * 300 });
    });
  }

  update() {
    if (this.gameStarted) {
      this.stars.getChildren().forEach(star => {
        star.x -= star.scrollFactorX;
        if (star.x < -5) star.x = 805;
      });
    }
  }
}

const Juego = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: GameScene
    };
    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #0a0a2a, #000)'
    }}>
      <div id="game-container" style={{
        width: '800px',
        height: '600px',
        border: '3px solid #4FC3F7',
        borderRadius: '12px',
        boxShadow: '0 0 20px #4FC3F7'
      }}></div>
    </div>
  );
};

export default Juego;