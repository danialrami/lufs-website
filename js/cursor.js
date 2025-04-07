/**
 * Custom cursor implementation for LUFS Audio Website
 * Creates an interactive cursor that responds to user interactions
 */

class Cursor {
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
    
    // Bind methods
    this.init = this.init.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleElementMouseEnter = this.handleElementMouseEnter.bind(this);
    this.handleElementMouseLeave = this.handleElementMouseLeave.bind(this);
    this.update = this.update.bind(this);
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
    // Set initial position off-screen
    this.position = { x: -100, y: -100 };
    this.targetPosition = { x: -100, y: -100 };
    
    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mouseenter', this.handleMouseEnter);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .service-card, .portfolio-item, .process-step');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', this.handleElementMouseEnter);
      element.addEventListener('mouseleave', this.handleElementMouseLeave);
    });
    
    // Start animation loop
    this.update();
  }
  
  // Handle mouse movement
  handleMouseMove(event) {
    this.targetPosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
  
  // Handle mouse down
  handleMouseDown() {
    this.isActive = true;
    this.cursorRing.classList.add('active');
  }
  
  // Handle mouse up
  handleMouseUp() {
    this.isActive = false;
    this.cursorRing.classList.remove('active');
  }
  
  // Handle mouse enter window
  handleMouseEnter() {
    this.show();
  }
  
  // Handle mouse leave window
  handleMouseLeave() {
    this.hide();
  }
  
  // Handle mouse enter interactive element
  handleElementMouseEnter() {
    this.isHovering = true;
    this.cursorRing.classList.add('hover');
  }
  
  // Handle mouse leave interactive element
  handleElementMouseLeave() {
    this.isHovering = false;
    this.cursorRing.classList.remove('hover');
  }
  
  // Update cursor position
  update() {
    // Smoothly move cursor to target position
    this.position.x += (this.targetPosition.x - this.position.x) * 0.2;
    this.position.y += (this.targetPosition.y - this.position.y) * 0.2;
    
    // Update cursor position
    if (this.cursorDot && this.cursorRing) {
      this.cursorDot.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
      this.cursorRing.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }
    
    // Continue animation loop
    requestAnimationFrame(this.update);
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
window.LUFSCursor = Cursor;
