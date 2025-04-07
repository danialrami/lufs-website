/**
 * Browser Testing and Compatibility Module for LUFS Audio Website
 * Detects browser capabilities and provides fallbacks for unsupported features
 */

class BrowserTester {
  constructor() {
    // Initialize properties
    this.testResults = {
      webgl: false,
      webAudio: false,
      es6: false,
      touchSupport: false,
      highPerformance: false,
      browser: 'unknown',
      browserVersion: 'unknown',
      os: 'unknown',
      mobile: false,
      tablet: false,
      desktop: false
    };
    
    // Run tests
    this.runTests();
    
    // Log results
    this.logResults();
    
    // Apply optimizations based on test results
    this.applyOptimizations();
  }
  
  // Run all browser tests
  runTests() {
    this.detectBrowser();
    this.testWebGL();
    this.testWebAudio();
    this.testES6Support();
    this.testTouchSupport();
    this.testPerformance();
    this.detectDeviceType();
  }
  
  // Detect browser and version
  detectBrowser() {
    const userAgent = navigator.userAgent;
    
    // Detect browser
    if (userAgent.indexOf('Firefox') > -1) {
      this.testResults.browser = 'Firefox';
    } else if (userAgent.indexOf('SamsungBrowser') > -1) {
      this.testResults.browser = 'Samsung Browser';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      this.testResults.browser = 'Opera';
    } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
      this.testResults.browser = 'Edge';
    } else if (userAgent.indexOf('Chrome') > -1) {
      this.testResults.browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      this.testResults.browser = 'Safari';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
      this.testResults.browser = 'Internet Explorer';
    }
    
    // Detect OS
    if (userAgent.indexOf('Windows') > -1) {
      this.testResults.os = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
      this.testResults.os = 'MacOS';
    } else if (userAgent.indexOf('Linux') > -1) {
      this.testResults.os = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
      this.testResults.os = 'Android';
    } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
      this.testResults.os = 'iOS';
    }
    
    // Extract version (simplified)
    const versionRegex = new RegExp(`${this.testResults.browser}\\/([\\d.]+)`, 'i');
    const versionMatch = userAgent.match(versionRegex);
    
    if (versionMatch && versionMatch[1]) {
      this.testResults.browserVersion = versionMatch[1];
    }
  }
  
  // Test WebGL support
  testWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      this.testResults.webgl = !!gl;
      
      if (gl) {
        // Check for advanced WebGL features
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          // Check if using software renderer
          this.testResults.webglHardwareAccelerated = !renderer.includes('SwiftShader') && 
                                                     !renderer.includes('Software') && 
                                                     !renderer.includes('llvmpipe');
        }
      }
    } catch (e) {
      this.testResults.webgl = false;
      this.testResults.webglHardwareAccelerated = false;
    }
  }
  
  // Test Web Audio API support
  testWebAudio() {
    this.testResults.webAudio = !!(window.AudioContext || window.webkitAudioContext);
  }
  
  // Test ES6 support
  testES6Support() {
    try {
      // Test arrow functions
      eval('() => {}');
      
      // Test classes
      eval('class TestClass {}');
      
      // Test promises
      if (typeof Promise !== 'undefined') {
        this.testResults.es6 = true;
      } else {
        this.testResults.es6 = false;
      }
    } catch (e) {
      this.testResults.es6 = false;
    }
  }
  
  // Test touch support
  testTouchSupport() {
    this.testResults.touchSupport = (('ontouchstart' in window) || 
                                    (navigator.maxTouchPoints > 0) || 
                                    (navigator.msMaxTouchPoints > 0));
  }
  
  // Test performance capabilities
  testPerformance() {
    // Simple performance test
    const startTime = performance.now();
    let counter = 0;
    
    for (let i = 0; i < 1000000; i++) {
      counter++;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // If the loop took less than 20ms, consider it high performance
    this.testResults.highPerformance = duration < 20;
    this.testResults.performanceScore = Math.min(100, Math.max(0, 100 - duration));
  }
  
  // Detect device type
  detectDeviceType() {
    const userAgent = navigator.userAgent;
    
    // Check for mobile
    this.testResults.mobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Check for tablet
    this.testResults.tablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    // If not mobile or tablet, must be desktop
    this.testResults.desktop = !this.testResults.mobile && !this.testResults.tablet;
  }
  
  // Log test results to console
  logResults() {
    console.log('Browser Compatibility Test Results:', this.testResults);
  }
  
  // Apply optimizations based on test results
  applyOptimizations() {
    // Add classes to body based on test results
    const body = document.body;
    
    if (!this.testResults.webgl) {
      body.classList.add('no-webgl');
    }
    
    if (!this.testResults.webAudio) {
      body.classList.add('no-webaudio');
    }
    
    if (!this.testResults.es6) {
      body.classList.add('no-es6');
    }
    
    if (this.testResults.touchSupport) {
      body.classList.add('touch-device');
    }
    
    if (!this.testResults.highPerformance) {
      body.classList.add('low-performance');
    }
    
    if (this.testResults.mobile) {
      body.classList.add('mobile-device');
    } else if (this.testResults.tablet) {
      body.classList.add('tablet-device');
    } else {
      body.classList.add('desktop-device');
    }
    
    // Apply browser-specific classes
    body.classList.add(`browser-${this.testResults.browser.toLowerCase().replace(' ', '-')}`);
    body.classList.add(`os-${this.testResults.os.toLowerCase().replace(' ', '-')}`);
    
    // Create debug panel if URL has ?test=true
    if (window.location.search.includes('test=true')) {
      this.createDebugPanel();
    }
  }
  
  // Create debug panel for testing
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.className = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
      max-height: 400px;
      overflow: auto;
    `;
    
    // Create panel content
    let content = '<h3>Browser Test Results</h3>';
    content += '<ul style="list-style: none; padding: 0; margin: 0;">';
    
    for (const [key, value] of Object.entries(this.testResults)) {
      const status = typeof value === 'boolean' ? (value ? '✅' : '❌') : value;
      content += `<li><strong>${key}:</strong> ${status}</li>`;
    }
    
    content += '</ul>';
    
    // Add controls
    content += '<h3>Debug Controls</h3>';
    content += '<button id="debug-toggle-webgl">Toggle WebGL</button> ';
    content += '<button id="debug-toggle-audio">Toggle Audio</button> ';
    content += '<button id="debug-force-fallback">Force Fallback</button>';
    
    panel.innerHTML = content;
    document.body.appendChild(panel);
    
    // Add event listeners to debug buttons
    document.getElementById('debug-toggle-webgl').addEventListener('click', () => {
      document.body.classList.toggle('no-webgl');
      // Reload page to apply changes
      window.location.reload();
    });
    
    document.getElementById('debug-toggle-audio').addEventListener('click', () => {
      document.body.classList.toggle('no-webaudio');
      // Reload page to apply changes
      window.location.reload();
    });
    
    document.getElementById('debug-force-fallback').addEventListener('click', () => {
      document.body.classList.add('no-webgl', 'no-webaudio', 'low-performance');
      // Reload page to apply changes
      window.location.reload();
    });
  }
  
  // Get test results
  getResults() {
    return this.testResults;
  }
}

// Export browser tester
window.LUFSBrowserTester = BrowserTester;
