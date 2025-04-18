/**
 * Enhanced Custom Cursor implementation for LUFS Audio Website
 * Creates an interactive cursor where the dot orbits around the ring
 */

class OrbitCursor {
  constructor() {
    // Initialize properties
    this.cursorDot = document.querySelector('.cursor-dot');
    this.cursorRing = document.querySelector('.cursor-ring');
    this.isVisible = true;
    this.position = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.isActive = false;
    this.isHovering = false;
    this.isTouchDevice = this.checkTouchDevice();
    this.isInViewport = true;
    
    // Orbit properties
    this.orbitDirection = 1; // Always clockwise
    this.orbitAngle = 0;
    this.orbitSpeed = 1.5;
    
    // Size and padding properties
    this.defaultRingSize = 40; // Default ring size in pixels
    this.hoverRingSize = 18; // Smaller size when hovering (previously 30)
    this.activeRingSize = 14; // Even smaller when clicking (previously 20)
    this.currentRingSize = this.defaultRingSize;
    this.orbitPadding = 10; // Increased padding between ring edge and orbit path
    
    // Audio controller reference
    this.audioController = window.LUFSAudioController ? new window.LUFSAudioController() : null;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleElementMouseEnter = this.handleElementMouseEnter.bind(this);
    this.handleElementMouseLeave = this.handleElementMouseLeave.bind(this);
    this.update = this.update.bind(this);
    this.updateOrbitPosition = this.updateOrbitPosition.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    
    // Initialize if not a touch device
    if (!this.isTouchDevice) {
      this.init();
    } else {
      this.hide();
    }
  }
  
  // Check if device is touch-enabled
  checkTouchDevice() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  }
  
  // Initialize cursor
  init() {
    // Set initial position off-screen to avoid initial flickering
    this.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.targetPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Set cursor style for body (explicitly hiding the native cursor)
    document.body.style.cursor = 'none';
    
    // Configure the ring sizes directly in CSS
    this.configureCursorSizes();
    
    // Add event listeners for mouse movement and clicks
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // Add event listeners for visibility and focus
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    
    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, .service-card, .portfolio-item, .process-step, .scroll-indicator'
    );
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', this.handleElementMouseEnter);
      element.addEventListener('mouseleave', this.handleElementMouseLeave);
      // Ensure all interactive elements have cursor: none
      element.style.cursor = 'none';
    });
    
    // Position cursor elements initially
    this.cursorRing.style.transform = `translate(-50%, -50%) translate(${this.position.x}px, ${this.position.y}px)`;
    
    // Start animation loop
    this.update();
  }
  
  // Configure cursor sizes directly with CSS variables
  configureCursorSizes() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --cursor-ring-size: ${this.defaultRingSize}px;
        --cursor-hover-size: ${this.hoverRingSize}px;
        --cursor-active-size: ${this.activeRingSize}px;
      }
      .cursor-ring {
        width: var(--cursor-ring-size);
        height: var(--cursor-ring-size);
      }
      .cursor-ring.hover {
        width: var(--cursor-hover-size);
        height: var(--cursor-hover-size);
      }
      .cursor-ring.active {
        width: var(--cursor-active-size);
        height: var(--cursor-active-size);
      }
    `;
    document.head.appendChild(style);
  }
  
  // Handle mouse movement
  handleMouseMove(event) {
    this.targetPosition = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Ensure cursor is visible when mouse moves
    if (!this.isVisible) {
      this.show();
    }
  }
  
  // Handle mouse down
  handleMouseDown() {
    this.isActive = true;
    this.cursorRing.classList.add('active');
    this.currentRingSize = this.activeRingSize;
    
    // Play click sound if audio controller exists
    if (this.audioController && typeof this.audioController.playSound === 'function') {
      this.audioController.playSound('click');
    }
  }
  
  // Handle mouse up
  handleMouseUp() {
    this.isActive = false;
    this.cursorRing.classList.remove('active');
    
    // Set the current ring size based on hover state
    this.currentRingSize = this.isHovering ? this.hoverRingSize : this.defaultRingSize;
  }
  
  // Handle visibility change (user switches tabs)
  handleVisibilityChange() {
    if (document.hidden) {
      this.hide();
    } else {
      // Only show if mouse is still in viewport
      if (this.isInViewport) {
        this.show();
      }
    }
  }
  
  // Handle window focus
  handleFocus() {
    if (this.isInViewport) {
      this.show();
    }
  }
  
  // Handle window blur
  handleBlur() {
    this.hide();
  }
  
  // Handle mouse enter interactive element
  handleElementMouseEnter(event) {
    this.isHovering = true;
    this.cursorRing.classList.add('hover');
    this.currentRingSize = this.isActive ? this.activeRingSize : this.hoverRingSize;
    
    // Play hover sound if audio controller exists and element has data-sound
    const soundId = event.currentTarget.getAttribute('data-sound');
    if (this.audioController && typeof this.audioController.playSound === 'function' && soundId) {
      this.audioController.playSound(soundId);
    }
  }
  
  // Handle mouse leave interactive element
  handleElementMouseLeave() {
    this.isHovering = false;
    this.cursorRing.classList.remove('hover');
    this.currentRingSize = this.isActive ? this.activeRingSize : this.defaultRingSize;
  }
  
  // Update cursor position
  update() {
    // Smoothly move cursor to target position
    this.position.x += (this.targetPosition.x - this.position.x) * 0.2;
    this.position.y += (this.targetPosition.y - this.position.y) * 0.2;
    
    // Update cursor ring position
    if (this.cursorRing) {
      this.cursorRing.style.transform = `translate(-50%, -50%) translate(${this.position.x}px, ${this.position.y}px)`;
    }
    
    // Update dot position in orbit
    this.updateOrbitPosition();
    
    // Continue animation loop
    requestAnimationFrame(this.update);
  }
  
  // Update dot position in orbit around the ring
  updateOrbitPosition() {
    if (!this.cursorDot || !this.isVisible) return;
    
    // Update orbit angle (always clockwise)
    this.orbitAngle += this.orbitSpeed * 0.02;
    
    // Calculate orbital radius with consistent padding
    // Division by 2 for radius, plus the padding
    const orbitRadius = (this.currentRingSize / 2) + this.orbitPadding;
    
    // Calculate orbital position
    const dotX = this.position.x + Math.cos(this.orbitAngle) * orbitRadius;
    const dotY = this.position.y + Math.sin(this.orbitAngle) * orbitRadius;
    
    // Apply position to dot with proper centering
    this.cursorDot.style.transform = `translate(-50%, -50%) translate(${dotX}px, ${dotY}px)`;
    
    // Add pulsing effect to dot based on audio if available
    if (this.audioController && typeof this.audioController.getBassVolume === 'function') {
      const bassVolume = this.audioController.getBassVolume();
      if (bassVolume > 0.6) {
        this.cursorDot.classList.add('pulse');
        setTimeout(() => {
          this.cursorDot.classList.remove('pulse');
        }, 200);
      }
    }
    // Add occasional pulse for visual interest if no audio controller
    else if (Math.random() < 0.005) {
      this.cursorDot.classList.add('pulse');
      setTimeout(() => {
        this.cursorDot.classList.remove('pulse');
      }, 200);
    }
  }
  
  // Show cursor
  show() {
    if (this.cursorDot && this.cursorRing) {
      this.cursorDot.style.opacity = '1';
      this.cursorRing.style.opacity = '1';
    }
    this.isVisible = true;
  }
  
  // Hide cursor
  hide() {
    if (this.cursorDot && this.cursorRing) {
      this.cursorDot.style.opacity = '0';
      this.cursorRing.style.opacity = '0';
    }
    this.isVisible = false;
  }
}

// Export cursor
window.LUFSCursor = OrbitCursor;