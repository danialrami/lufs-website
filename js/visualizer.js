/**
 * Three.js Visualization for LUFS Audio Website
 * Inspired by quantumstretch.com and resume.danialrami.com
 */

// Main visualization class
class Visualizer {
  constructor() {
    // Initialize properties
    this.container = document.getElementById('visualization-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleSystem = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.audioData = null;
    this.isInitialized = false;
    this.isActive = true;
    this.mousePosition = { x: 0, y: 0 };
    this.targetMousePosition = { x: 0, y: 0 };
    this.colors = {
      background: new THREE.Color('#111111'),
      teal: new THREE.Color('#78BEBA'),
      red: new THREE.Color('#D35233'),
      yellow: new THREE.Color('#E7B225'),
      blue: new THREE.Color('#2C5AA0'),
      white: new THREE.Color('#fbf9e2')
    };
    
    // Bind methods
    this.init = this.init.bind(this);
    this.createScene = this.createScene.bind(this);
    this.createParticles = this.createParticles.bind(this);
    this.createLights = this.createLights.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.animate = this.animate.bind(this);
    this.updateParticles = this.updateParticles.bind(this);
    this.updateWithAudio = this.updateWithAudio.bind(this);
    this.setAudioData = this.setAudioData.bind(this);
    this.destroy = this.destroy.bind(this);
    
    // Check for WebGL support
    this.hasWebGL = this.checkWebGLSupport();
    
    // Initialize if WebGL is supported
    if (this.hasWebGL) {
      this.init();
    } else {
      this.showFallback();
    }
  }
  
  // Check if WebGL is supported
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      console.warn('WebGL not supported, falling back to canvas visualization');
      return false;
    }
  }
  
  // Initialize the visualization
  init() {
    if (this.isInitialized) return;
    
    // Create the scene, camera, renderer
    this.createScene();
    
    // Add particles
    this.createParticles();
    
    // Add lights
    this.createLights();
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    
    // Start animation loop
    this.animate();
    
    this.isInitialized = true;
    console.log('Three.js visualization initialized');
  }
  
  // Create the scene, camera, and renderer
  createScene() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = this.colors.background;
    this.scene.fog = new THREE.FogExp2(this.colors.background, 0.001);
    
    // Create camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 5000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 1000;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
  }
  
  // Create particle system
  createParticles() {
    const particleCount = this.getParticleCount();
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Create particles with random positions
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color - randomly choose from brand colors
      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        color.copy(this.colors.teal);
      } else if (colorChoice < 0.5) {
        color.copy(this.colors.red);
      } else if (colorChoice < 0.75) {
        color.copy(this.colors.yellow);
      } else {
        color.copy(this.colors.blue);
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size - vary based on distance from center
      const distance = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = Math.min(distance / 1000, 1);
      sizes[i] = Math.max(2, 10 * (1 - normalizedDistance));
    }
    
    // Add attributes to geometry
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const particleMaterial = new THREE.PointsMaterial({
      size: 5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Create particle system
    this.particles = particles;
    this.particleSystem = new THREE.Points(particles, particleMaterial);
    this.scene.add(this.particleSystem);
    
    // Create central sphere
    const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: this.colors.white,
      emissive: this.colors.teal,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    this.centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene.add(this.centralSphere);
    
    // Create connecting lines
    this.createConnectingLines();
  }
  
  // Create connecting lines between particles
  createConnectingLines() {
    const lineCount = 50;
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.colors.teal,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    // Create lines
    const positions = this.particles.attributes.position.array;
    const linePositions = new Float32Array(lineCount * 6); // 2 points per line, 3 values per point
    
    for (let i = 0; i < lineCount; i++) {
      // Select two random particles
      const index1 = Math.floor(Math.random() * (positions.length / 3)) * 3;
      const index2 = Math.floor(Math.random() * (positions.length / 3)) * 3;
      
      // Set line positions
      linePositions[i * 6] = positions[index1];
      linePositions[i * 6 + 1] = positions[index1 + 1];
      linePositions[i * 6 + 2] = positions[index1 + 2];
      
      linePositions[i * 6 + 3] = positions[index2];
      linePositions[i * 6 + 4] = positions[index2 + 1];
      linePositions[i * 6 + 5] = positions[index2 + 2];
    }
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lines);
  }
  
  // Create lights
  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
    
    // Point light at camera position
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.copy(this.camera.position);
    this.scene.add(pointLight);
    
    // Colored point lights
    const colors = [
      this.colors.teal,
      this.colors.red,
      this.colors.yellow,
      this.colors.blue
    ];
    
    this.coloredLights = [];
    
    colors.forEach((color, index) => {
      const light = new THREE.PointLight(color, 0.5);
      const angle = (index / colors.length) * Math.PI * 2;
      const radius = 300;
      
      light.position.x = Math.cos(angle) * radius;
      light.position.y = Math.sin(angle) * radius;
      light.position.z = 100;
      
      this.scene.add(light);
      this.coloredLights.push(light);
    });
  }
  
  // Handle window resize
  handleResize() {
    if (!this.camera || !this.renderer) return;
    
    // Update camera
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  // Handle mouse movement
  handleMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Store target mouse position for smooth movement
    this.targetMousePosition.x = this.mouse.x;
    this.targetMousePosition.y = this.mouse.y;
  }
  
  // Animation loop
  animate() {
    if (!this.isActive) return;
    
    requestAnimationFrame(this.animate);
    
    // Update particles
    this.updateParticles();
    
    // Update with audio data if available
    if (this.audioData) {
      this.updateWithAudio();
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  // Update particles
  updateParticles() {
    if (!this.particleSystem || !this.centralSphere) return;
    
    const time = this.clock.getElapsedTime();
    
    // Smoothly move to target mouse position
    this.mousePosition.x += (this.targetMousePosition.x - this.mousePosition.x) * 0.05;
    this.mousePosition.y += (this.targetMousePosition.y - this.mousePosition.y) * 0.05;
    
    // Rotate particle system based on mouse position
    this.particleSystem.rotation.x = this.mousePosition.y * 0.5;
    this.particleSystem.rotation.y = this.mousePosition.x * 0.5;
    
    // Pulse central sphere
    const scale = 1 + Math.sin(time * 2) * 0.25;
    this.centralSphere.scale.set(scale, scale, scale);
    
    // Update colored lights
    this.coloredLights.forEach((light, index) => {
      const angle = time * 0.5 + (index / this.coloredLights.length) * Math.PI * 2;
      const radius = 300;
      
      light.position.x = Math.cos(angle) * radius;
      light.position.y = Math.sin(angle) * radius;
    });
    
    // Update connecting lines
    if (this.lines && Math.random() < 0.02) {
      this.scene.remove(this.lines);
      this.createConnectingLines();
    }
  }
  
  // Update visualization with audio data
  updateWithAudio() {
    if (!this.particleSystem || !this.audioData) return;
    
    const positions = this.particles.attributes.position.array;
    const sizes = this.particles.attributes.size.array;
    
    // Get frequency data
    const frequencyData = this.audioData.getFrequencyData();
    const timeData = this.audioData.getTimeData();
    
    // Calculate average volume
    const averageVolume = this.audioData.getAverageVolume();
    
    // Update central sphere based on bass frequencies
    const bassVolume = this.audioData.getBassVolume();
    const sphereScale = 1 + bassVolume * 0.5;
    this.centralSphere.scale.set(sphereScale, sphereScale, sphereScale);
    
    // Update emissive intensity based on mid frequencies
    const midVolume = this.audioData.getMidVolume();
    this.centralSphere.material.emissiveIntensity = 0.5 + midVolume;
    
    // Update particle sizes based on frequency data
    const particleCount = sizes.length;
    for (let i = 0; i < particleCount; i++) {
      // Get frequency bin for this particle
      const frequencyBin = Math.floor((i / particleCount) * frequencyData.length);
      const frequencyValue = frequencyData[frequencyBin] / 255;
      
      // Update size based on frequency value
      const baseSize = Math.max(2, 10 * (1 - Math.sqrt(
        positions[i * 3] * positions[i * 3] + 
        positions[i * 3 + 1] * positions[i * 3 + 1] + 
        positions[i * 3 + 2] * positions[i * 3 + 2]
      ) / 1000));
      
      sizes[i] = baseSize * (1 + frequencyValue * 2);
    }
    
    // Update size attribute
    this.particles.attributes.size.needsUpdate = true;
    
    // Update camera position slightly based on high frequencies
    const highVolume = this.audioData.getHighVolume();
    this.camera.position.z = 1000 + highVolume * 100;
    
    // Update colored lights intensity
    this.coloredLights.forEach((light, index) => {
      const frequencyBin = Math.floor((index / this.coloredLights.length) * frequencyData.length);
      const frequencyValue = frequencyData[frequencyBin] / 255;
      
      light.intensity = 0.5 + frequencyValue;
    });
  }
  
  // Set audio data
  setAudioData(audioData) {
    this.audioData = audioData;
  }
  
  // Determine particle count based on device performance
  getParticleCount() {
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for low-end device
    const isLowEnd = isMobile && (
      /Android [1-5]\./.test(navigator.userAgent) || 
      /iPhone [1-8]/.test(navigator.userAgent)
    );
    
    // Determine particle count
    if (isLowEnd) {
      return 500; // Low-end devices
    } else if (isMobile) {
      return 1000; // Mobile devices
    } else {
      return 2000; // Desktop devices
    }
  }
  
  // Show fallback visualization for browsers without WebGL
  showFallback() {
    console.log('Using fallback visualization');
    
    // Create canvas fallback
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Create simple particle system
    const particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: this.getRandomColor(),
        speed: Math.random() * 1 + 0.5
      });
    }
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Clear canvas
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Move particle
        particle.y += particle.speed;
        
        // Reset particle if it goes off screen
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      // Draw central circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#78BEBA';
      ctx.fill();
    };
    
    // Start animation
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
  
  // Get random color from brand colors
  getRandomColor() {
    const colors = ['#78BEBA', '#D35233', '#E7B225', '#2C5AA0'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Clean up resources
  destroy() {
    if (!this.isInitialized) return;
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    
    // Stop animation loop
    this.isActive = false;
    
    // Dispose of Three.js resources
    this.scene.remove(this.particleSystem);
    this.scene.remove(this.centralSphere);
    this.scene.remove(this.lines);
    
    this.particles.dispose();
    this.particleSystem.material.dispose();
    this.centralSphere.geometry.dispose();
    this.centralSphere.material.dispose();
    
    // Remove renderer
    this.renderer.dispose();
    
    this.isInitialized = false;
    console.log('Three.js visualization destroyed');
  }
}

// Export visualizer
window.LUFSVisualizer = Visualizer;
