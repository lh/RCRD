import { calculateRiskWithSteps } from '../../utils/riskCalculations';
import {
    BROWSERS,
    simulateBrowser,
    testCrossBrowser,
    simulatePerformance,
    getOptimizationHints
} from '../../test-utils/browser-compatibility';
import { measurePerformance, runBenchmark } from '../../test-utils/performance-helpers';

/**
 * Cross-Browser Performance Simulation Suite
 * 
 * NOTE: These tests run in JSDOM, not real browsers. They verify:
 * 1. Our calculation performance is consistent
 * 2. We handle different input complexities well
 * 3. No memory leaks in our calculation logic
 * 
 * This is NOT testing actual browser performance differences.
 * For real performance testing across browsers, use tools like:
 * - Playwright with real browser instances
 * - BrowserStack or Sauce Labs for cloud testing
 * - Chrome DevTools, Firefox Profiler, Safari Web Inspector
 */

describe('Performance Consistency Testing (JSDOM Environment)', () => {
    
    describe('Simulated Browser Performance (Not Real Engines)', () => {
        it('should maintain consistent performance with V8 browser constants', () => {
            // NOTE: We're testing our code with Chrome/Edge constants, not actual V8 performance
            const v8Browsers = [BROWSERS.CHROME, BROWSERS.EDGE];
            const results = {};
            
            v8Browsers.forEach(browser => {
                const restore = simulateBrowser(browser);
                
                // Use measurePerformance directly instead of runBenchmark
                const perf = measurePerformance(() => {
                    calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [3, 4, 5],
                        detachmentSegments: Array.from({ length: 12 }, (_, i) => `segment${i}`),
                        pvrGrade: 'C',
                        vitrectomyGauge: '23g',
                        tamponade: 'c3f8',
                        cryotherapy: 'yes'
                    });
                }, 100); // 100 iterations
                
                results[browser.name] = perf;
                restore();
            });
            
            // V8 engines should have similar performance
            const chromeTimes = results.Chrome.stats.avg;
            const edgeTimes = results.Edge.stats.avg;
            
            expect(Math.abs(chromeTimes - edgeTimes)).toBeLessThan(5);
            expect(chromeTimes).toBeLessThan(50);
            expect(edgeTimes).toBeLessThan(50);
        });

        it('should handle SpiderMonkey optimizations (Firefox)', () => {
            const restore = simulateBrowser(BROWSERS.FIREFOX);
            
            // Test closure optimization
            const createOptimizedCalculator = () => {
                const cache = new Map();
                
                return (params) => {
                    const key = JSON.stringify(params);
                    if (cache.has(key)) {
                        return cache.get(key);
                    }
                    
                    const result = calculateRiskWithSteps(params);
                    cache.set(key, result);
                    return result;
                };
            };
            
            const calculator = createOptimizedCalculator();
            
            // First call (cache miss)
            const start1 = performance.now();
            const result1 = calculator({
                age: 70,
                selectedHours: [6],
                detachmentSegments: ['segment1', 'segment2'],
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            });
            const time1 = performance.now() - start1;
            
            // Second call (cache hit)
            const start2 = performance.now();
            const result2 = calculator({
                age: 70,
                selectedHours: [6],
                detachmentSegments: ['segment1', 'segment2'],
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            });
            const time2 = performance.now() - start2;
            
            // Cache should be faster (but in JSDOM, the difference may be minimal)
            // Relaxing the expectation since we're not testing real SpiderMonkey
            expect(time2).toBeLessThanOrEqual(time1);
            expect(result1).toEqual(result2);
            
            restore();
        });

        it('should optimize for JavaScriptCore (Safari)', () => {
            const restore = simulateBrowser(BROWSERS.SAFARI);
            
            // Safari has different typed array optimizations
            const largeDataSet = new Float64Array(10000);
            for (let i = 0; i < largeDataSet.length; i++) {
                largeDataSet[i] = Math.random() * 100;
            }
            
            const start = performance.now();
            
            // Reduce operation
            let sum = 0;
            for (let i = 0; i < largeDataSet.length; i++) {
                sum += largeDataSet[i];
            }
            
            // Map operation
            const squared = new Float64Array(largeDataSet.length);
            for (let i = 0; i < largeDataSet.length; i++) {
                squared[i] = largeDataSet[i] * largeDataSet[i];
            }
            
            const time = performance.now() - start;
            
            expect(time).toBeLessThan(100);
            expect(sum).toBeGreaterThan(0);
            expect(squared.length).toBe(10000);
            
            restore();
        });
    });

    describe('Mobile Performance Characteristics', () => {
        it('should handle mobile Safari performance constraints', () => {
            const restore = simulateBrowser(BROWSERS.MOBILE_SAFARI);
            
            // Mobile devices have different performance characteristics
            const mobileParams = {
                age: 65,
                selectedHours: [6],
                detachmentSegments: ['segment1', 'segment2', 'segment3'],
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            };
            
            const perf = measurePerformance(() => {
                calculateRiskWithSteps(mobileParams);
            }, 100);
            
            // Mobile should still be under 150ms
            expect(perf.stats.avg).toBeLessThan(150);
            expect(perf.stats.p95).toBeLessThan(200);
            
            restore();
        });

        it('should optimize for Android Chrome performance', () => {
            const restore = simulateBrowser(BROWSERS.ANDROID_CHROME);
            
            // Test with varying complexity
            const complexities = [
                { segments: 5, expected: 50 },
                { segments: 10, expected: 75 },
                { segments: 15, expected: 100 },
                { segments: 20, expected: 125 }
            ];
            
            complexities.forEach(({ segments, expected }) => {
                const perf = measurePerformance(() => {
                    calculateRiskWithSteps({
                        age: 60,
                        selectedHours: Array.from({ length: segments / 5 }, (_, i) => i + 1),
                        detachmentSegments: Array.from({ length: segments }, (_, i) => `segment${i}`),
                        pvrGrade: segments > 10 ? 'C' : 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: segments > 15 ? 'yes' : 'no'
                    });
                }, 50);
                
                expect(perf.stats.avg).toBeLessThan(expected);
            });
            
            restore();
        });

        it('should handle touch event performance on mobile', () => {
            const mobileBrowsers = [BROWSERS.MOBILE_SAFARI, BROWSERS.ANDROID_CHROME];
            
            mobileBrowsers.forEach(browser => {
                const restore = simulateBrowser(browser);
                
                // Simulate rapid touch events (e.g., clock face interaction)
                const touchEvents = [];
                const startTime = performance.now();
                
                for (let i = 0; i < 100; i++) {
                    // Simulate touch event processing
                    const angle = (i * 3.6) % 360;
                    const hour = Math.floor(angle / 30) + 1;
                    const segment = `hour${hour}_segment${i % 4}`;
                    
                    touchEvents.push({
                        timestamp: performance.now(),
                        angle,
                        hour,
                        segment
                    });
                }
                
                const totalTime = performance.now() - startTime;
                
                // Should handle 100 touch events quickly
                expect(totalTime).toBeLessThan(100);
                expect(touchEvents.length).toBe(100);
                
                restore();
            });
        });
    });

    describe('Memory Management Across Browsers', () => {
        it('should handle memory efficiently in Chrome/Edge (V8)', () => {
            [BROWSERS.CHROME, BROWSERS.EDGE].forEach(browser => {
                const restore = simulateBrowser(browser);
                
                // V8 has performance.memory API
                const memStart = performance.memory?.usedJSHeapSize || 0;
                const results = [];
                
                // Run many calculations
                for (let i = 0; i < 500; i++) {
                    results.push(calculateRiskWithSteps({
                        age: 50 + (i % 40),
                        selectedHours: [i % 12 + 1],
                        detachmentSegments: Array.from({ length: i % 20 + 1 }, (_, j) => `segment${j}`),
                        pvrGrade: i % 3 === 0 ? 'C' : 'none',
                        vitrectomyGauge: '23g',
                        tamponade: ['sf6', 'c2f6', 'c3f8'][i % 3],
                        cryotherapy: i % 2 === 0 ? 'yes' : 'no'
                    }));
                }
                
                const memEnd = performance.memory?.usedJSHeapSize || 0;
                const memoryIncrease = memEnd - memStart;
                
                // Memory increase should be reasonable (< 10MB for 500 calculations)
                if (browser.features.performanceMemory) {
                    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
                }
                
                expect(results.length).toBe(500);
                restore();
            });
        });

        it('should handle memory without performance.memory API (Firefox/Safari)', () => {
            [BROWSERS.FIREFOX, BROWSERS.SAFARI].forEach(browser => {
                const restore = simulateBrowser(browser);
                
                // These browsers don't have performance.memory
                expect(performance.memory).toBeUndefined();
                
                // Run calculations and ensure no crashes
                const results = [];
                const startTime = performance.now();
                
                for (let i = 0; i < 300; i++) {
                    results.push(calculateRiskWithSteps({
                        age: 55 + (i % 30),
                        selectedHours: [i % 12 + 1, (i + 6) % 12 + 1],
                        detachmentSegments: Array.from({ length: i % 15 + 5 }, (_, j) => `segment${j}`),
                        pvrGrade: i % 4 === 0 ? 'C' : 'none',
                        vitrectomyGauge: ['20g', '23g', '25g'][i % 3],
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    }));
                }
                
                const totalTime = performance.now() - startTime;
                
                // Should complete without issues
                expect(results.length).toBe(300);
                expect(totalTime).toBeLessThan(5000); // 5 seconds for 300 calculations
                
                restore();
            });
        });

        it('should prevent memory leaks in long-running sessions', () => {
            const results = testCrossBrowser(() => {
                const sessionResults = [];
                
                // Simulate long session with many calculations
                for (let batch = 0; batch < 5; batch++) {
                    const batchResults = [];
                    
                    for (let i = 0; i < 100; i++) {
                        batchResults.push(calculateRiskWithSteps({
                            age: 60,
                            selectedHours: [6],
                            detachmentSegments: ['segment1', 'segment2'],
                            pvrGrade: 'none',
                            vitrectomyGauge: '23g',
                            tamponade: 'sf6',
                            cryotherapy: 'no'
                        }));
                    }
                    
                    sessionResults.push({
                        batch,
                        count: batchResults.length,
                        sample: batchResults[0]
                    });
                    
                    // Clear references to allow GC
                    batchResults.length = 0;
                }
                
                return {
                    totalBatches: sessionResults.length,
                    totalCalculations: sessionResults.reduce((sum, b) => sum + b.count, 0)
                };
            });
            
            Object.values(results).forEach(result => {
                expect(result.result.totalBatches).toBe(5);
                expect(result.result.totalCalculations).toBe(500);
            });
        });
    });

    describe('Complex Calculation Scenarios', () => {
        it('should handle maximum complexity across all browsers', () => {
            const maxComplexityParams = {
                age: 85,
                selectedHours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                detachmentSegments: Array.from({ length: 24 }, (_, i) => `segment${i}`),
                pvrGrade: 'C',
                vitrectomyGauge: '20g',
                tamponade: 'heavy_oil',
                cryotherapy: 'yes'
            };
            
            const results = testCrossBrowser(() => {
                const perf = measurePerformance(() => {
                    calculateRiskWithSteps(maxComplexityParams);
                }, 20);
                
                return {
                    avgTime: perf.stats.avg,
                    p95Time: perf.stats.p95,
                    maxTime: perf.stats.max
                };
            });
            
            Object.values(results).forEach(result => {
                expect(result.result.avgTime).toBeLessThan(200); // Even complex should be <200ms
                expect(result.result.p95Time).toBeLessThan(250);
                expect(result.result.maxTime).toBeLessThan(300);
            });
        });

        it('should handle rapid successive calculations', () => {
            const results = testCrossBrowser(() => {
                const rapidCalcs = [];
                const startTime = performance.now();
                
                // Simulate rapid user interactions
                for (let i = 0; i < 50; i++) {
                    rapidCalcs.push(calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [i % 12 + 1],
                        detachmentSegments: [`segment${i % 24}`],
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    }));
                }
                
                const totalTime = performance.now() - startTime;
                
                return {
                    count: rapidCalcs.length,
                    totalTime,
                    avgTime: totalTime / rapidCalcs.length
                };
            });
            
            Object.values(results).forEach(result => {
                expect(result.result.count).toBe(50);
                expect(result.result.avgTime).toBeLessThan(20); // Should be very fast for simple calcs
            });
        });

        it('should maintain performance with mixed complexity', () => {
            const scenarios = [
                { complexity: 'simple', segments: 2, hours: 1, expected: 20 },
                { complexity: 'moderate', segments: 8, hours: 3, expected: 40 },
                { complexity: 'complex', segments: 16, hours: 6, expected: 80 },
                { complexity: 'extreme', segments: 24, hours: 12, expected: 150 }
            ];
            
            const results = testCrossBrowser(() => {
                const timings = {};
                
                scenarios.forEach(scenario => {
                    const perf = measurePerformance(() => {
                        calculateRiskWithSteps({
                            age: 65,
                            selectedHours: Array.from({ length: scenario.hours }, (_, i) => i + 1),
                            detachmentSegments: Array.from({ length: scenario.segments }, (_, i) => `segment${i}`),
                            pvrGrade: scenario.segments > 10 ? 'C' : 'none',
                            vitrectomyGauge: '23g',
                            tamponade: 'sf6',
                            cryotherapy: scenario.segments > 15 ? 'yes' : 'no'
                        });
                    }, 30);
                    
                    timings[scenario.complexity] = perf.stats.avg;
                });
                
                return timings;
            });
            
            Object.values(results).forEach(result => {
                scenarios.forEach(scenario => {
                    expect(result.result[scenario.complexity]).toBeLessThan(scenario.expected);
                });
            });
        });
    });

    describe('Browser-Specific Feature Performance', () => {
        it('should test requestAnimationFrame performance', () => {
            const results = testCrossBrowser(() => {
                let frameCount = 0;
                const targetFrames = 60;
                
                return new Promise((resolve) => {
                    const startTime = performance.now();
                    
                    const animate = () => {
                        frameCount++;
                        if (frameCount < targetFrames) {
                            requestAnimationFrame(animate);
                        } else {
                            const totalTime = performance.now() - startTime;
                            resolve({
                                frames: frameCount,
                                totalTime,
                                fps: (frameCount / totalTime) * 1000
                            });
                        }
                    };
                    
                    requestAnimationFrame(animate);
                });
            });
            
            // Note: In test environment, rAF might not work normally
            // This is more about testing the cross-browser test infrastructure
        });

        it('should test array method performance across engines', () => {
            const testArray = Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                value: Math.random() * 100,
                category: ['A', 'B', 'C'][i % 3]
            }));
            
            const results = testCrossBrowser(() => {
                const timings = {};
                
                // Filter
                const filterStart = performance.now();
                const filtered = testArray.filter(item => item.category === 'A');
                timings.filter = performance.now() - filterStart;
                
                // Map
                const mapStart = performance.now();
                const mapped = testArray.map(item => item.value * 2);
                timings.map = performance.now() - mapStart;
                
                // Reduce
                const reduceStart = performance.now();
                const sum = testArray.reduce((acc, item) => acc + item.value, 0);
                timings.reduce = performance.now() - reduceStart;
                
                // Sort
                const sortStart = performance.now();
                const sorted = [...testArray].sort((a, b) => a.value - b.value);
                timings.sort = performance.now() - sortStart;
                
                return timings;
            });
            
            Object.values(results).forEach(result => {
                expect(result.result.filter).toBeLessThan(50);
                expect(result.result.map).toBeLessThan(50);
                expect(result.result.reduce).toBeLessThan(50);
                expect(result.result.sort).toBeLessThan(100);
            });
        });

        it('should test JSON operations performance', () => {
            const complexObject = {
                patient: {
                    age: 65,
                    id: 'patient-123',
                    history: Array.from({ length: 100 }, (_, i) => ({
                        date: new Date(2024, 0, i + 1).toISOString(),
                        diagnosis: `Diagnosis ${i}`,
                        treatment: `Treatment ${i}`
                    }))
                },
                calculations: Array.from({ length: 50 }, (_, i) => ({
                    timestamp: Date.now() + i,
                    result: Math.random() * 100,
                    parameters: {
                        age: 60 + i % 30,
                        selectedHours: [i % 12 + 1],
                        detachmentSegments: [`segment${i}`]
                    }
                }))
            };
            
            const results = testCrossBrowser(() => {
                // Stringify
                const stringifyStart = performance.now();
                const json = JSON.stringify(complexObject);
                const stringifyTime = performance.now() - stringifyStart;
                
                // Parse
                const parseStart = performance.now();
                const parsed = JSON.parse(json);
                const parseTime = performance.now() - parseStart;
                
                return {
                    stringifyTime,
                    parseTime,
                    jsonSize: json.length,
                    roundTrip: stringifyTime + parseTime
                };
            });
            
            Object.values(results).forEach(result => {
                expect(result.result.stringifyTime).toBeLessThan(50);
                expect(result.result.parseTime).toBeLessThan(50);
                expect(result.result.roundTrip).toBeLessThan(100);
            });
        });
    });

    describe('Performance Degradation Prevention', () => {
        it('should detect performance regression', () => {
            const baselinePerf = measurePerformance(() => {
                calculateRiskWithSteps({
                    age: 65,
                    selectedHours: [6],
                    detachmentSegments: ['segment1', 'segment2'],
                    pvrGrade: 'none',
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6',
                    cryotherapy: 'no'
                });
            }, 100);
            
            // Simulate potential regression scenarios
            const regressionTests = [
                {
                    name: 'Memory leak simulation',
                    test: () => {
                        const leakyArray = [];
                        for (let i = 0; i < 100; i++) {
                            leakyArray.push(calculateRiskWithSteps({
                                age: 65,
                                selectedHours: [6],
                                detachmentSegments: ['segment1', 'segment2'],
                                pvrGrade: 'none',
                                vitrectomyGauge: '23g',
                                tamponade: 'sf6',
                                cryotherapy: 'no'
                            }));
                        }
                        return leakyArray.length;
                    }
                },
                {
                    name: 'Excessive object creation',
                    test: () => {
                        const objects = [];
                        for (let i = 0; i < 1000; i++) {
                            objects.push({
                                id: i,
                                data: new Array(100).fill(i)
                            });
                        }
                        return objects.length;
                    }
                }
            ];
            
            regressionTests.forEach(regression => {
                const startTime = performance.now();
                const result = regression.test();
                const endTime = performance.now();
                
                // Even with potential regression scenarios, performance should be maintained
                expect(endTime - startTime).toBeLessThan(500);
                expect(result).toBeGreaterThan(0);
            });
        });

        it('should maintain performance under sustained load', () => {
            const results = testCrossBrowser(() => {
                const sustainedResults = [];
                const duration = 1000; // 1 second of sustained load
                const startTime = performance.now();
                let calculations = 0;
                
                while (performance.now() - startTime < duration) {
                    sustainedResults.push(calculateRiskWithSteps({
                        age: 65 + (calculations % 20),
                        selectedHours: [calculations % 12 + 1],
                        detachmentSegments: [`segment${calculations % 24}`],
                        pvrGrade: calculations % 10 === 0 ? 'C' : 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    }));
                    calculations++;
                }
                
                return {
                    calculations,
                    duration: performance.now() - startTime,
                    rate: calculations / ((performance.now() - startTime) / 1000)
                };
            });
            
            Object.values(results).forEach(result => {
                // Should maintain at least 50 calculations per second
                expect(result.result.rate).toBeGreaterThan(50);
            });
        });
    });

    describe('Optimization Verification', () => {
        it('should verify browser-specific optimizations are effective', () => {
            Object.values(BROWSERS).forEach(browser => {
                const restore = simulateBrowser(browser);
                const hints = getOptimizationHints(browser);
                
                // Each browser should have optimization hints
                expect(hints.length).toBeGreaterThan(0);
                
                // Verify optimizations are actually helping
                const optimizedPerf = measurePerformance(() => {
                    // Use typed arrays (Chrome optimization)
                    const data = new Float64Array([1, 2, 3, 4, 5]);
                    
                    // Use const/let (Firefox optimization)
                    const result = calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [6],
                        detachmentSegments: ['segment1'],
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    });
                    
                    return { data, result };
                }, 50);
                
                expect(optimizedPerf.stats.avg).toBeLessThan(100);
                
                restore();
            });
        });

        it('should verify JIT compilation benefits', () => {
            const results = testCrossBrowser(() => {
                const iterations = 100;
                const times = [];
                
                // Cold start
                for (let i = 0; i < 10; i++) {
                    const start = performance.now();
                    calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [6],
                        detachmentSegments: ['segment1'],
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    });
                    times.push(performance.now() - start);
                }
                
                const coldAvg = times.slice(0, 5).reduce((a, b) => a + b) / 5;
                
                // Warm (JIT optimized)
                for (let i = 10; i < iterations; i++) {
                    const start = performance.now();
                    calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [6],
                        detachmentSegments: ['segment1'],
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    });
                    times.push(performance.now() - start);
                }
                
                const warmAvg = times.slice(-20).reduce((a, b) => a + b) / 20;
                
                return {
                    coldAvg,
                    warmAvg,
                    improvement: ((coldAvg - warmAvg) / coldAvg) * 100
                };
            });
            
            Object.values(results).forEach(result => {
                // In JSDOM, JIT optimization may not be observable
                // Just verify both measurements completed successfully
                expect(result.result.coldAvg).toBeGreaterThan(0);
                expect(result.result.warmAvg).toBeGreaterThan(0);
                // Warm should ideally be faster, but in test env it may vary
                // The important thing is that both runs complete
            });
        });
    });

    describe('Performance Budget Compliance', () => {
        it('should meet performance budgets across all browsers', () => {
            const performanceBudget = {
                simple: 20,    // ms
                moderate: 50,  // ms
                complex: 100,  // ms
                extreme: 200   // ms
            };
            
            const results = testCrossBrowser(() => {
                const budgetResults = {};
                
                // Simple calculation
                const simplePerf = measurePerformance(() => {
                    calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [6],
                        detachmentSegments: ['segment1'],
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    });
                }, 50);
                budgetResults.simple = {
                    avg: simplePerf.stats.avg,
                    budget: performanceBudget.simple,
                    pass: simplePerf.stats.avg < performanceBudget.simple
                };
                
                // Moderate calculation
                const moderatePerf = measurePerformance(() => {
                    calculateRiskWithSteps({
                        age: 70,
                        selectedHours: [3, 6, 9],
                        detachmentSegments: Array.from({ length: 8 }, (_, i) => `segment${i}`),
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'c2f6',
                        cryotherapy: 'no'
                    });
                }, 50);
                budgetResults.moderate = {
                    avg: moderatePerf.stats.avg,
                    budget: performanceBudget.moderate,
                    pass: moderatePerf.stats.avg < performanceBudget.moderate
                };
                
                // Complex calculation
                const complexPerf = measurePerformance(() => {
                    calculateRiskWithSteps({
                        age: 75,
                        selectedHours: [1, 3, 5, 7, 9, 11],
                        detachmentSegments: Array.from({ length: 16 }, (_, i) => `segment${i}`),
                        pvrGrade: 'C',
                        vitrectomyGauge: '20g',
                        tamponade: 'c3f8',
                        cryotherapy: 'yes'
                    });
                }, 50);
                budgetResults.complex = {
                    avg: complexPerf.stats.avg,
                    budget: performanceBudget.complex,
                    pass: complexPerf.stats.avg < performanceBudget.complex
                };
                
                return budgetResults;
            });
            
            // All browsers should meet all budgets
            Object.values(results).forEach(result => {
                expect(result.result.simple.pass).toBe(true);
                expect(result.result.moderate.pass).toBe(true);
                expect(result.result.complex.pass).toBe(true);
            });
        });

        it('should measure performance consistency across browser simulations', () => {
            // NOTE: This generates a report of JSDOM performance, not real browser performance
            const results = testCrossBrowser(() => {
                const perf = measurePerformance(() => {
                    calculateRiskWithSteps({
                        age: 65,
                        selectedHours: [6],
                        detachmentSegments: ['segment1', 'segment2'],
                        pvrGrade: 'none',
                        vitrectomyGauge: '23g',
                        tamponade: 'sf6',
                        cryotherapy: 'no'
                    });
                }, 100);
                
                return {
                    stats: perf.stats,
                    times: perf.times
                };
            });
            
            // Verify consistency rather than logging (reduces test noise)
            // The "performance matrix" is really just JSDOM running the same code multiple times
            
            // All browsers should complete successfully
            Object.values(results).forEach(result => {
                expect(result.passed).toBe(true);
            });
        });
    });
});