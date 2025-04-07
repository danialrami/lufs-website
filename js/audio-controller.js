/**
 * Audio Controller for LUFS Audio Website
 * Handles audio playback, analysis, and integration with visualizations
 */

class AudioController {
  constructor() {
    // Initialize properties
    this.context = null;
    this.analyser = null;
    this.gainNode = null;
    this.sources = {};
    this.buffers = {};
    this.frequencyData = null;
    this.timeData = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.volume = 0.75;
    this.currentTrack = null;
    
    // Audio file paths
    this.audioFiles = {
      hover: 'audio/hover.mp3',
      click: 'audio/click.mp3',
      nav: 'audio/nav.mp3',
      cta: 'audio/cta.mp3',
      input: 'audio/input.mp3',
      submit: 'audio/submit.mp3',
      ambient: 'audio/ambient.mp3',
      sample1: 'audio/sample1.mp3',
      sample2: 'audio/sample2.mp3',
      sample3: 'audio/sample3.mp3',
      sample4: 'audio/sample4.mp3'
    };
    
    // Bind methods
    this.init = this.init.bind(this);
    this.loadAudioFiles = this.loadAudioFiles.bind(this);
    this.loadAudioFile = this.loadAudioFile.bind(this);
    this.playSound = this.playSound.bind(this);
    this.stopSound = this.stopSound.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.setupAnalyser = this.setupAnalyser.bind(this);
    this.getFrequencyData = this.getFrequencyData.bind(this);
    this.getTimeData = this.getTimeData.bind(this);
    this.getAverageVolume = this.getAverageVolume.bind(this);
    this.getBassVolume = this.getBassVolume.bind(this);
    this.getMidVolume = this.getMidVolume.bind(this);
    this.getHighVolume = this.getHighVolume.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
    this.handleUserInteraction = this.handleUserInteraction.bind(this);
    this.generateFallbackData = this.generateFallbackData.bind(this);
    
    // Check for Web Audio API support
    this.hasAudioSupport = this.checkAudioSupport();
    
    // Initialize if audio is supported
    if (this.hasAudioSupport) {
      // Wait for user interaction to initialize audio
      this.setupEventListeners();
    } else {
      console.warn('Web Audio API not supported, using fallback data');
      this.generateFallbackData();
    }
  }
  
  // Check if Web Audio API is supported
  checkAudioSupport() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }
  
  // Initialize audio context and load audio files
  init() {
    if (this.isInitialized) return Promise.resolve();
    
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      
      // Create gain node
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.context.destination);
      
      // Setup analyser
      this.setupAnalyser();
      
      // Load audio files
      return this.loadAudioFiles().then(() => {
        this.isInitialized = true;
        console.log('Audio controller initialized');
        
        // Play ambient sound
        this.playSound('ambient', true);
        
        return Promise.resolve();
      });
    } catch (error) {
      console.error('Error initializing audio controller:', error);
      this.generateFallbackData();
      return Promise.reject(error);
    }
  }
  
  // Load all audio files
  loadAudioFiles() {
    const promises = Object.entries(this.audioFiles).map(([id, path]) => {
      return this.loadAudioFile(id, path);
    });
    
    return Promise.all(promises);
  }
  
  // Load a single audio file
  loadAudioFile(id, path) {
    return fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load audio file: ${path}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.buffers[id] = audioBuffer;
        console.log(`Loaded audio file: ${id}`);
      })
      .catch(error => {
        console.error(`Error loading audio file ${id}:`, error);
      });
  }
  
  // Play a sound
  playSound(id, loop = false, volume = 1) {
    if (!this.isInitialized || this.isMuted) return;
    
    // Check if buffer exists
    const buffer = this.buffers[id];
    if (!buffer) {
      console.warn(`Audio buffer not found: ${id}`);
      return;
    }
    
    // Stop previous instance of this sound
    this.stopSound(id);
    
    // Create source
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    
    // Create gain node for this source
    const gainNode = this.context.createGain();
    gainNode.gain.value = volume * this.volume;
    
    // Connect source to gain node, then to main gain node
    source.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    // Connect to analyser if this is a sample or ambient track
    if (id.startsWith('sample') || id === 'ambient') {
      gainNode.connect(this.analyser);
      this.currentTrack = id;
    }
    
    // Start playback
    source.start(0);
    
    // Store source
    this.sources[id] = {
      source,
      gainNode
    };
    
    // Return source for further manipulation
    return source;
  }
  
  // Stop a sound
  stopSound(id) {
    if (!this.isInitialized) return;
    
    // Check if source exists
    const sourceData = this.sources[id];
    if (!sourceData) return;
    
    try {
      // Stop source
      sourceData.source.stop();
    } catch (error) {
      // Ignore errors when stopping already stopped sources
    }
    
    // Remove source
    delete this.sources[id];
    
    // Clear current track if this was it
    if (this.currentTrack === id) {
      this.currentTrack = null;
    }
  }
  
  // Set volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.isInitialized) {
      // Update main gain node
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
      
      // Update individual source gain nodes
      Object.values(this.sources).forEach(sourceData => {
        sourceData.gainNode.gain.value = this.isMuted ? 0 : this.volume;
      });
    }
  }
  
  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }
  
  // Setup analyser
  setupAnalyser() {
    // Create analyser
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;
    
    // Connect analyser to gain node
    this.analyser.connect(this.gainNode);
    
    // Create data arrays
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
  }
  
  // Get frequency data
  getFrequencyData() {
    if (!this.isInitialized || !this.analyser) {
      return this.fallbackFrequencyData || new Uint8Array(128).fill(0);
    }
    
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }
  
  // Get time domain data
  getTimeData() {
    if (!this.isInitialized || !this.analyser) {
      return this.fallbackTimeData || new Uint8Array(128).fill(128);
    }
    
    this.analyser.getByteTimeDomainData(this.timeData);
    return this.timeData;
  }
  
  // Get average volume (0-1)
  getAverageVolume() {
    const frequencyData = this.getFrequencyData();
    let sum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    
    return sum / (frequencyData.length * 255);
  }
  
  // Get bass volume (0-1)
  getBassVolume() {
    const frequencyData = this.getFrequencyData();
    let sum = 0;
    const bassRange = Math.floor(frequencyData.length * 0.2); // First 20% of frequencies
    
    for (let i = 0; i < bassRange; i++) {
      sum += frequencyData[i];
    }
    
    return sum / (bassRange * 255);
  }
  
  // Get mid volume (0-1)
  getMidVolume() {
    const frequencyData = this.getFrequencyData();
    let sum = 0;
    const midStart = Math.floor(frequencyData.length * 0.2);
    const midEnd = Math.floor(frequencyData.length * 0.6);
    
    for (let i = midStart; i < midEnd; i++) {
      sum += frequencyData[i];
    }
    
    return sum / ((midEnd - midStart) * 255);
  }
  
  // Get high volume (0-1)
  getHighVolume() {
    const frequencyData = this.getFrequencyData();
    let sum = 0;
    const highStart = Math.floor(frequencyData.length * 0.6);
    
    for (let i = highStart; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    
    return sum / ((frequencyData.length - highStart) * 255);
  }
  
  // Setup event listeners for user interaction
  setupEventListeners() {
    const handleInteraction = () => {
      this.handleUserInteraction();
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
  }
  
  // Handle user interaction
  handleUserInteraction() {
    if (!this.isInitialized) {
      this.init().then(() => {
        // Setup UI event listeners after initialization
        this.setupUIEventListeners();
      });
    }
  }
  
  // Setup UI event listeners
  setupUIEventListeners() {
    // Audio toggle button
    const audioToggle = document.querySelector('.audio-toggle');
    if (audioToggle) {
      audioToggle.addEventListener('click', () => {
        const isMuted = this.toggleMute();
        audioToggle.classList.toggle('muted', isMuted);
        this.playSound('click');
      });
    }
    
    // Volume slider
    const volumeSlider = document.querySelector('.volume-range');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        const volume = parseFloat(volumeSlider.value) / 100;
        this.setVolume(volume);
      });
    }
    
    // Sound elements
    document.querySelectorAll('[data-sound]').forEach(element => {
      const soundId = element.getAttribute('data-sound');
      
      element.addEventListener('mouseenter', () => {
        this.playSound(soundId);
      });
      
      if (element.tagName === 'A' || element.tagName === 'BUTTON') {
        element.addEventListener('click', () => {
          this.playSound('click');
        });
      }
    });
    
    // Portfolio sample players
    document.querySelectorAll('.play-sample').forEach(button => {
      const trackId = button.getAttribute('data-track');
      
      button.addEventListener('click', () => {
        // Check if this track is already playing
        if (this.currentTrack === trackId) {
          // Stop it
          this.stopSound(trackId);
          button.innerHTML = '<span class="play-icon"></span> Play Sample';
        } else {
          // Stop any currently playing track
          if (this.currentTrack && this.currentTrack.startsWith('sample')) {
            const currentButton = document.querySelector(`[data-track="${this.currentTrack}"]`);
            if (currentButton) {
              currentButton.innerHTML = '<span class="play-icon"></span> Play Sample';
            }
            this.stopSound(this.currentTrack);
          }
          
          // Play the new track
          this.playSound(trackId);
          button.innerHTML = '<span class="play-icon"></span> Stop Sample';
        }
      });
    });
  }
  
  // Generate fallback data for when Web Audio API is not supported
  generateFallbackData() {
    // Create fallback frequency data
    this.fallbackFrequencyData = new Uint8Array(128);
    this.fallbackTimeData = new Uint8Array(128);
    
    // Fill with random values
    for (let i = 0; i < 128; i++) {
      this.fallbackFrequencyData[i] = Math.random() * 255;
      this.fallbackTimeData[i] = 128 + Math.random() * 128 - 64;
    }
    
    // Animate fallback data
    const animateFallbackData = () => {
      if (!this.hasAudioSupport) {
        // Update frequency data
        for (let i = 0; i < this.fallbackFrequencyData.length; i++) {
          // Create a wave pattern
          const time = Date.now() / 1000;
          const value = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
          this.fallbackFrequencyData[i] = value * 255;
        }
        
        // Update time data
        for (let i = 0; i < this.fallbackTimeData.length; i++) {
          const time = Date.now() / 1000;
          const value = Math.sin(time * 4 + i * 0.2);
          this.fallbackTimeData[i] = 128 + value * 64;
        }
        
        requestAnimationFrame(animateFallbackData);
      }
    };
    
    animateFallbackData();
  }
}

// Export audio controller
window.LUFSAudioController = AudioController;
