/**
 * Main JavaScript for LUFS Audio Website
 * Initializes and coordinates all components
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  const audioController = new LUFSAudioController();
  const visualizer = new LUFSVisualizer();
  const waveform = new LUFSWaveform('waveform-canvas');
  const cursor = new LUFSCursor();
  
  // Connect audio controller to visualizations
  if (audioController && visualizer) {
    visualizer.setAudioData(audioController);
  }
  
  if (audioController && waveform) {
    waveform.setAudioData(audioController);
  }
  
  // Initialize loading screen
  initLoadingScreen();
  
  // Initialize navigation
  initNavigation();
  
  // Initialize scroll effects
  initScrollEffects();
  
  // Initialize form handling
  initFormHandling();
  
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
});

// Initialize loading screen
function initLoadingScreen() {
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingBar = document.querySelector('.loading-bar');
  const loadingText = document.querySelector('.loading-text');
  
  // Simulate loading progress
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 10;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      
      // Update loading text
      loadingText.textContent = 'Ready';
      
      // Hide loading screen after a short delay
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          
          // Trigger entrance animations
          document.querySelectorAll('.section').forEach((section, index) => {
            setTimeout(() => {
              section.classList.add('active');
            }, index * 200);
          });
        }, 500);
      }, 500);
    }
    
    // Update loading bar
    loadingBar.style.width = `${progress}%`;
  }, 200);
}

// Initialize navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  // Handle navigation clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get target section
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Scroll to section
        window.scrollTo({
          top: targetSection.offsetTop - 100,
          behavior: 'smooth'
        });
        
        // Update active link
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');
        
        // Close mobile menu if open
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          menuToggle.classList.remove('active');
        }
      }
    });
  });
  
  // Handle scroll to update active link
  window.addEventListener('scroll', () => {
    // Add scrolled class to header when scrolled
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Update active link based on scroll position
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === currentSection) {
        link.classList.add('active');
      }
    });
  });
  
  // Handle mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
  }
}

// Initialize scroll effects
function initScrollEffects() {
  // Get all sections
  const sections = document.querySelectorAll('.section');
  
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Optionally remove active class when section is not visible
        // entry.target.classList.remove('active');
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the section is visible
  });
  
  // Observe each section
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Handle scroll indicator
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      // Scroll to about section
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        window.scrollTo({
          top: aboutSection.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  }
}

// Initialize form handling
function initFormHandling() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const formValues = Object.fromEntries(formData.entries());
      
      // Validate form
      let isValid = true;
      const requiredFields = ['name', 'email', 'message'];
      
      requiredFields.forEach(field => {
        const input = contactForm.elements[field];
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
        } else {
          input.classList.remove('error');
        }
      });
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        isValid = false;
        contactForm.elements.email.classList.add('error');
      }
      
      if (isValid) {
        // In a real implementation, this would send the form data to a server
        // For now, just show a success message
        
        // Disable form
        Array.from(contactForm.elements).forEach(element => {
          element.disabled = true;
        });
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your message! I\'ll get back to you soon.';
        
        contactForm.parentNode.appendChild(successMessage);
        
        // Reset form after a delay
        setTimeout(() => {
          contactForm.reset();
          Array.from(contactForm.elements).forEach(element => {
            element.disabled = false;
          });
          successMessage.remove();
        }, 5000);
      }
    });
  }
}

// Helper function to check if an element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Helper function to generate sample audio files
function generateSampleAudio() {
  // This function would be used in development to generate sample audio files
  // It's not needed in the final production code
  console.log('Generating sample audio files...');
}
