/**
 * Waveform visualization for LUFS Audio Website
 * Creates an audio waveform visualization on a canvas element
 */

class Waveform {
  constructor(canvasId) {
    // Initialize properties
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.audioData = null;
    this.isActive = true;
    this.colors = {
      background: '#111111',
      teal: '#78BEBA',
      red: '#D35233',
      yellow: '#E7B225',
      blue: '#2C5AA0',
      white: '#fbf9e2'
    };
    
    // Configuration
    this.config = {
      barWidth: 4,
      barSpacing: 2,
      barMinHeight: 5,
      barMaxHeight: 150,
      smoothingFactor: 0.3,
      gradientColors: [this.colors.teal, this.colors.red]
    };
    
    // Bind methods
    this.init = this.init.bind(this);
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    this.setAudioData = this.setAudioData.bind(this);
    this.createDefaultData = this.createDefaultData.bind(this);
    this.destroy = this.destroy.bind(this);
    
    // Initialize
    this.init();
  }
  
  // Initialize the waveform
  init() {
    // Set canvas dimensions
    this.resize();
    
    // Create default data
    this.createDefaultData();
    
    // Add resize listener
    window.addEventListener('resize', this.resize);
    
    // Start animation
    this.draw();
  }
  
  // Resize canvas
  resize() {
    // Get container dimensions
    const container = this.canvas.parentElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Set high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
    
    // Create gradient
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    this.gradient.addColorStop(0, this.config.gradientColors[0]);
    this.gradient.addColorStop(1, this.config.gradientColors[1]);
  }
  
  // Create default waveform data
  createDefaultData() {
    const barCount = Math.floor(this.canvas.width / (this.config.barWidth + this.config.barSpacing));
    const defaultData = new Array(barCount).fill(0).map(() => Math.random());
    
    this.defaultData = defaultData;
    this.currentData = [...defaultData];
  }
  
  // Draw waveform
  draw() {
    if (!this.isActive) return;
    
    requestAnimationFrame(this.draw);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get data
    let data;
    if (this.audioData) {
      data = this.audioData.getFrequencyData();
      
      // Normalize data to 0-1 range
      data = data.map(value => value / 255);
    } else {
      // Use default data with some animation
      const time = Date.now() / 1000;
      data = this.defaultData.map((value, index) => {
        const offset = Math.sin(time + index * 0.1) * 0.3;
        return Math.max(0, Math.min(1, value + offset));
      });
    }
    
    // Smooth transition between current and new data
    this.currentData = this.currentData.map((current, index) => {
      const target = data[index] || 0;
      return current + (target - current) * this.config.smoothingFactor;
    });
    
    // Draw bars
    const barCount = this.currentData.length;
    const canvasWidth = this.canvas.width / window.devicePixelRatio;
    const canvasHeight = this.canvas.height / window.devicePixelRatio;
    const centerY = canvasHeight / 2;
    
    // Draw mirrored bars
    this.ctx.fillStyle = this.gradient;
    
    for (let i = 0; i < barCount; i++) {
      const value = this.currentData[i];
      const barHeight = this.config.barMinHeight + value * (this.config.barMaxHeight - this.config.barMinHeight);
      const x = i * (this.config.barWidth + this.config.barSpacing);
      
      // Draw top bar
      this.ctx.fillRect(
        x,
        centerY - barHeight,
        this.config.barWidth,
        barHeight
      );
      
      // Draw bottom bar (mirrored)
      this.ctx.fillRect(
        x,
        centerY,
        this.config.barWidth,
        barHeight
      );
    }
    
    // Draw center line
    this.ctx.strokeStyle = this.colors.white;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(canvasWidth, centerY);
    this.ctx.stroke();
    
    // Draw wave line
    this.ctx.strokeStyle = this.colors.yellow;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    for (let i = 0; i < barCount; i++) {
      const value = this.currentData[i];
      const x = i * (this.config.barWidth + this.config.barSpacing) + this.config.barWidth / 2;
      const y = centerY - value * this.config.barMaxHeight;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
  }
  
  // Set audio data
  setAudioData(audioData) {
    this.audioData = audioData;
  }
  
  // Clean up resources
  destroy() {
    this.isActive = false;
    window.removeEventListener('resize', this.resize);
  }
}

// Export waveform
window.LUFSWaveform = Waveform;
