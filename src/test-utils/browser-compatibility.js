/**
 * Browser Compatibility Testing Utilities
 * 
 * Simulates different browsers and their characteristics
 * for comprehensive cross-browser testing.
 */

/**
 * Browser definitions with their characteristics
 */
export const BROWSERS = {
    CHROME: {
        name: 'Chrome',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        engine: 'V8',
        vendor: 'Google Inc.',
        features: {
            performanceMemory: true,
            webkitRequestAnimationFrame: true,
            serviceWorker: true,
            indexedDB: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            webGL2: true,
            audioContext: true,
            webRTC: true
        },
        performance: {
            mathSpeed: 1.0,      // Baseline
            arraySpeed: 1.0,     // Excellent array optimizations
            objectSpeed: 1.0,    // Excellent object handling
            memoryEfficiency: 0.9 // Good but uses more memory
        }
    },
    
    FIREFOX: {
        name: 'Firefox',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        engine: 'SpiderMonkey',
        vendor: '',
        features: {
            performanceMemory: false,  // Not available in Firefox
            mozRequestAnimationFrame: true,
            serviceWorker: true,
            indexedDB: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            webGL2: true,
            audioContext: true,
            webRTC: true
        },
        performance: {
            mathSpeed: 1.05,     // Slightly slower math
            arraySpeed: 0.95,    // Very good array handling
            objectSpeed: 1.02,   // Slightly slower objects
            memoryEfficiency: 1.1 // More memory efficient
        }
    },
    
    SAFARI: {
        name: 'Safari',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        engine: 'JavaScriptCore',
        vendor: 'Apple Computer, Inc.',
        features: {
            performanceMemory: false,
            webkitRequestAnimationFrame: true,
            serviceWorker: true,
            indexedDB: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            webGL2: true,  // Limited support
            audioContext: 'webkitAudioContext',
            webRTC: true
        },
        performance: {
            mathSpeed: 0.98,     // Excellent math
            arraySpeed: 1.1,     // Slower arrays
            objectSpeed: 1.05,   // Slightly slower
            memoryEfficiency: 1.0 // Average
        }
    },
    
    EDGE: {
        name: 'Edge',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        engine: 'V8',  // Chromium-based
        vendor: 'Google Inc.',
        features: {
            performanceMemory: true,
            webkitRequestAnimationFrame: true,
            serviceWorker: true,
            indexedDB: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            webGL2: true,
            audioContext: true,
            webRTC: true
        },
        performance: {
            mathSpeed: 1.0,      // Same as Chrome
            arraySpeed: 1.0,     // Same as Chrome
            objectSpeed: 1.0,    // Same as Chrome
            memoryEfficiency: 0.95 // Slightly less efficient
        }
    },
    
    MOBILE_SAFARI: {
        name: 'Mobile Safari',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        engine: 'JavaScriptCore',
        vendor: 'Apple Computer, Inc.',
        platform: 'iPhone',
        features: {
            performanceMemory: false,
            webkitRequestAnimationFrame: true,
            serviceWorker: true,
            indexedDB: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            webGL2: false,  // Limited on mobile
            audioContext: 'webkitAudioContext',
            webRTC: true,
            touch: true,
            orientation: true
        },
        performance: {
            mathSpeed: 1.2,      // Slower on mobile
            arraySpeed: 1.3,     // Slower arrays
            objectSpeed: 1.2,    // Slower objects
            memoryEfficiency: 0.8 // Memory constrained
        }
    },
    
    ANDROID_CHROME: {
        name: 'Chrome Android',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
        engine: 'V8',
        vendor: 'Google Inc.',
        platform: 'Android',
        features: {
            performanceMemory: true,
            webkitRequestAnimationFrame: true,
            serviceWorker: true,
            indexedDB: true,
            localStorage: true,
            sessionStorage: true,
            webGL: true,
            webGL2: true,
            audioContext: true,
            webRTC: true,
            touch: true,
            orientation: true
        },
        performance: {
            mathSpeed: 1.15,     // Slower than desktop
            arraySpeed: 1.1,     // Slightly slower
            objectSpeed: 1.1,    // Slightly slower
            memoryEfficiency: 0.85 // Memory constrained
        }
    }
};

/**
 * Simulate browser environment
 */
export const simulateBrowser = (browser) => {
    const original = {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        platform: navigator.platform,
        performance: {
            memory: performance.memory
        }
    };
    
    // Mock navigator properties
    Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        get: () => browser.userAgent
    });
    
    Object.defineProperty(navigator, 'vendor', {
        configurable: true,
        get: () => browser.vendor
    });
    
    if (browser.platform) {
        Object.defineProperty(navigator, 'platform', {
            configurable: true,
            get: () => browser.platform
        });
    }
    
    // Mock performance.memory availability
    if (!browser.features.performanceMemory) {
        Object.defineProperty(performance, 'memory', {
            configurable: true,
            get: () => undefined
        });
    }
    
    // Return restore function
    return () => {
        Object.defineProperty(navigator, 'userAgent', {
            configurable: true,
            get: () => original.userAgent
        });
        Object.defineProperty(navigator, 'vendor', {
            configurable: true,
            get: () => original.vendor
        });
        Object.defineProperty(navigator, 'platform', {
            configurable: true,
            get: () => original.platform
        });
        if (original.performance.memory !== undefined) {
            Object.defineProperty(performance, 'memory', {
                configurable: true,
                get: () => original.performance.memory
            });
        }
    };
};

/**
 * Detect browser from user agent
 */
export const detectBrowser = (userAgent = navigator.userAgent) => {
    if (userAgent.includes('Edg/')) return 'EDGE';
    if (userAgent.includes('Chrome')) return 'CHROME';
    if (userAgent.includes('Firefox')) return 'FIREFOX';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        if (userAgent.includes('Mobile')) return 'MOBILE_SAFARI';
        return 'SAFARI';
    }
    if (userAgent.includes('Android')) return 'ANDROID_CHROME';
    return 'UNKNOWN';
};

/**
 * Check feature support
 */
export const checkFeatureSupport = (feature) => {
    const checks = {
        localStorage: () => {
            try {
                const test = '__localStorage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        sessionStorage: () => {
            try {
                const test = '__sessionStorage_test__';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        indexedDB: () => {
            return !!(window.indexedDB || window.mozIndexedDB || 
                     window.webkitIndexedDB || window.msIndexedDB);
        },
        serviceWorker: () => 'serviceWorker' in navigator,
        webGL: () => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && 
                         (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
            } catch (e) {
                return false;
            }
        },
        webGL2: () => {
            try {
                const canvas = document.createElement('canvas');
                return !!canvas.getContext('webgl2');
            } catch (e) {
                return false;
            }
        },
        audioContext: () => {
            return !!(window.AudioContext || window.webkitAudioContext);
        },
        webRTC: () => {
            return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        },
        touch: () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },
        performanceMemory: () => {
            return !!(performance && performance.memory);
        }
    };
    
    return checks[feature] ? checks[feature]() : false;
};

/**
 * Simulate performance characteristics
 */
export const simulatePerformance = (browser, operation, baseTime) => {
    const multiplier = browser.performance[operation + 'Speed'] || 1.0;
    return baseTime * multiplier;
};

/**
 * Test cross-browser compatibility
 */
export const testCrossBrowser = (testFn, browsers = Object.values(BROWSERS)) => {
    const results = {};
    
    browsers.forEach(browser => {
        const restore = simulateBrowser(browser);
        try {
            const startTime = performance.now();
            const result = testFn();
            const endTime = performance.now();
            
            results[browser.name] = {
                browser: browser.name,
                engine: browser.engine,
                result: result,
                time: endTime - startTime,
                passed: true
            };
        } catch (error) {
            results[browser.name] = {
                browser: browser.name,
                engine: browser.engine,
                error: error.message,
                passed: false
            };
        } finally {
            restore();
        }
    });
    
    return results;
};

/**
 * Get browser-specific optimization hints
 */
export const getOptimizationHints = (browser) => {
    const hints = {
        CHROME: [
            'Use typed arrays for numerical operations',
            'Leverage V8 inline caching',
            'Avoid delete operator for object properties',
            'Use Map/Set for collections'
        ],
        FIREFOX: [
            'Minimize closure usage',
            'Use const/let instead of var',
            'Avoid with statements',
            'Optimize for SpiderMonkey JIT'
        ],
        SAFARI: [
            'Minimize DOM manipulations',
            'Use CSS transforms for animations',
            'Avoid excessive object allocations',
            'Test on actual iOS devices'
        ],
        EDGE: [
            'Same optimizations as Chrome',
            'Test Windows-specific features',
            'Check touch support on Surface devices'
        ],
        MOBILE_SAFARI: [
            'Minimize memory usage',
            'Use passive event listeners',
            'Implement touch-specific optimizations',
            'Test viewport and orientation changes'
        ],
        ANDROID_CHROME: [
            'Optimize for varying device capabilities',
            'Implement touch gestures',
            'Test on low-end devices',
            'Handle memory constraints'
        ]
    };
    
    return hints[detectBrowser(browser.userAgent)] || [];
};

/**
 * Calculate browser compatibility score
 */
export const calculateCompatibilityScore = (results) => {
    const browsers = Object.keys(results);
    const passed = browsers.filter(browser => results[browser].passed).length;
    const score = (passed / browsers.length) * 100;
    
    return {
        score: score,
        passed: passed,
        total: browsers.length,
        grade: score >= 95 ? 'A+' :
               score >= 90 ? 'A' :
               score >= 85 ? 'B+' :
               score >= 80 ? 'B' :
               score >= 75 ? 'C+' :
               score >= 70 ? 'C' : 'F'
    };
};

/**
 * Generate compatibility report
 */
export const generateCompatibilityReport = (results) => {
    const score = calculateCompatibilityScore(results);
    const browsers = Object.keys(results);
    
    let report = '=== Browser Compatibility Report ===\n\n';
    report += `Overall Score: ${score.score.toFixed(1)}% (${score.grade})\n`;
    report += `Browsers Passed: ${score.passed}/${score.total}\n\n`;
    
    browsers.forEach(browser => {
        const result = results[browser];
        report += `${browser}: ${result.passed ? '✅' : '❌'}\n`;
        if (result.time) {
            report += `  Time: ${result.time.toFixed(2)}ms\n`;
        }
        if (result.error) {
            report += `  Error: ${result.error}\n`;
        }
    });
    
    return report;
};

/**
 * Mock touch events for testing
 */
export const mockTouchEvents = () => {
    if (!window.TouchEvent) {
        window.TouchEvent = MouseEvent;
    }
    
    if (!window.Touch) {
        window.Touch = function(touch) {
            this.identifier = touch.identifier || 0;
            this.target = touch.target || null;
            this.clientX = touch.clientX || 0;
            this.clientY = touch.clientY || 0;
            this.pageX = touch.pageX || 0;
            this.pageY = touch.pageY || 0;
            this.screenX = touch.screenX || 0;
            this.screenY = touch.screenY || 0;
        };
    }
};

/**
 * Test viewport and orientation
 */
export const testViewport = (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        get: () => width
    });
    
    Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        get: () => height
    });
    
    Object.defineProperty(window.screen, 'orientation', {
        configurable: true,
        get: () => ({
            angle: width > height ? 90 : 0,
            type: width > height ? 'landscape-primary' : 'portrait-primary'
        })
    });
};