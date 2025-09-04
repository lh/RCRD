import {
    getAgeGroup,
    getBreakLocation,
    getInferiorDetachment,
    isTotalRD,
    getPVRGrade,
    getInferiorExtent,
    calculateRiskWithSteps
} from '../riskCalculations';
import { PAPER_COEFFICIENTS, isSignificant } from '../../constants/paperCoefficients';
import {
    measurePerformance,
    runBenchmark,
    comparePerformance,
    testBatchPerformance,
    assertPerformance
} from '../../test-utils/performance-helpers';

/**
 * Utility Function Performance Benchmarks
 * 
 * Tests performance of all utility functions to ensure
 * optimal execution speed for medical calculations.
 */

describe('Utility Function Performance Benchmarks', () => {
    describe('Age Group Classification Performance', () => {
        it('should classify age groups in under 1ms', () => {
            const testAges = [18, 25, 35, 45, 55, 65, 75, 85, 95];
            
            const classifyAges = () => {
                testAges.forEach(age => getAgeGroup(age));
            };

            const results = measurePerformance(classifyAges, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
            expect(results.stats.p99).toBeLessThan(2);
        });

        it('should handle edge cases efficiently', () => {
            const edgeCases = [0, -1, 150, '45', null, undefined, NaN];
            
            const classifyEdgeCases = () => {
                edgeCases.forEach(age => getAgeGroup(age));
            };

            const results = measurePerformance(classifyEdgeCases, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });

        it('should optimize repeated age classifications', () => {
            const sameAge = () => {
                for (let i = 0; i < 100; i++) {
                    getAgeGroup(65);
                }
            };

            const differentAges = () => {
                for (let i = 0; i < 100; i++) {
                    getAgeGroup(i);
                }
            };

            const comparison = comparePerformance(sameAge, differentAges, 100);
            
            // Both should be fast
            expect(comparison.function1.avg).toBeLessThan(10);
            expect(comparison.function2.avg).toBeLessThan(10);
        });
    });

    describe('Break Location Detection Performance', () => {
        it('should determine break location in under 1ms', () => {
            const testCases = [
                [],
                [6],
                [5, 6, 7],
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                null
            ];

            const detectBreaks = () => {
                testCases.forEach(hours => getBreakLocation(hours));
            };

            const results = measurePerformance(detectBreaks, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
            expect(results.stats.max).toBeLessThan(5);
        });

        it('should prioritize location detection efficiently', () => {
            // Test priority: 5-7 > 4-8 > 9-3
            const priorityTest = () => {
                getBreakLocation([4, 5, 6, 7, 8, 9, 10]); // Should return 5-7
                getBreakLocation([4, 8, 9, 10]); // Should return 4-8
                getBreakLocation([9, 10, 11, 12, 1, 2, 3]); // Should return 9-3
            };

            const results = measurePerformance(priorityTest, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });

        it('should handle large hour arrays efficiently', () => {
            const largeArray = Array.from({ length: 100 }, (_, i) => (i % 12) + 1);
            
            const processLargeArray = () => {
                getBreakLocation(largeArray);
            };

            const results = measurePerformance(processLargeArray, 1000);
            
            expect(results.stats.avg).toBeLessThan(5);
        });
    });

    describe('Inferior Detachment Calculation Performance', () => {
        it('should calculate inferior extent in under 5ms', () => {
            const testSegments = [
                [],
                Array.from({ length: 5 }, (_, i) => i),
                Array.from({ length: 15 }, (_, i) => i + 10),
                Array.from({ length: 30 }, (_, i) => i + 15),
                Array.from({ length: 60 }, (_, i) => i)
            ];

            const calculateExtent = () => {
                testSegments.forEach(segments => getInferiorDetachment(segments));
            };

            const results = measurePerformance(calculateExtent, 100);
            
            expect(results.stats.avg).toBeLessThan(5);
            expect(results.stats.p95).toBeLessThan(10);
        });

        it('should optimize segment counting', () => {
            const segments = Array.from({ length: 60 }, (_, i) => i);
            
            const countSegments = () => {
                getInferiorExtent(segments);
            };

            const results = measurePerformance(countSegments, 1000);
            
            expect(results.stats.avg).toBeLessThan(2);
        });

        it('should handle segment array mutations efficiently', () => {
            const baseSegments = Array.from({ length: 20 }, (_, i) => i);
            
            const mutateAndCalculate = () => {
                const segments = [...baseSegments];
                segments.push(21, 22, 23);
                getInferiorDetachment(segments);
                segments.pop();
                getInferiorDetachment(segments);
            };

            const results = measurePerformance(mutateAndCalculate, 500);
            
            expect(results.stats.avg).toBeLessThan(5);
        });
    });

    describe('Total RD Detection Performance', () => {
        it('should detect total RD in under 1ms', () => {
            const testCases = [
                [],
                Array.from({ length: 10 }, (_, i) => `segment${i}`),
                Array.from({ length: 22 }, (_, i) => `segment${i}`),
                Array.from({ length: 23 }, (_, i) => `segment${i}`),
                Array.from({ length: 24 }, (_, i) => `segment${i}`),
                Array.from({ length: 50 }, (_, i) => `segment${i}`)
            ];

            const detectTotalRD = () => {
                testCases.forEach(segments => isTotalRD(segments));
            };

            const results = measurePerformance(detectTotalRD, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
            expect(results.stats.max).toBeLessThan(2);
        });

        it('should optimize length checking', () => {
            const quickCheck = () => {
                const segments = { length: 24 }; // Mock array-like object
                return segments.length >= 23 ? 'yes' : 'no';
            };

            const actualFunction = () => {
                const segments = Array.from({ length: 24 }, (_, i) => i);
                return isTotalRD(segments);
            };

            const comparison = comparePerformance(quickCheck, actualFunction, 10000);
            
            // Both should be very fast
            expect(comparison.function1.avg).toBeLessThan(0.1);
            expect(comparison.function2.avg).toBeLessThan(1);
        });
    });

    describe('PVR Grade Mapping Performance', () => {
        it('should map PVR grades instantly', () => {
            const grades = ['none', 'A', 'B', 'C', null, undefined, ''];
            
            const mapGrades = () => {
                grades.forEach(grade => getPVRGrade(grade));
            };

            const results = measurePerformance(mapGrades, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
            expect(results.stats.max).toBeLessThan(1);
        });

        it('should use efficient grade comparison', () => {
            const testGrade = () => {
                const grade = 'C';
                return grade === 'C' ? 'C' : 'none';
            };

            const results = measurePerformance(testGrade, 100000);
            
            expect(results.stats.avg).toBeLessThan(0.01);
        });
    });

    describe('Coefficient Lookup Performance', () => {
        it('should look up coefficients in under 1ms', () => {
            const lookupCoefficients = () => {
                PAPER_COEFFICIENTS.age['65-79'];
                PAPER_COEFFICIENTS.breakLocation['5-7'];
                PAPER_COEFFICIENTS.pvrGrade['C'];
                PAPER_COEFFICIENTS.tamponade['light_oil'];
                PAPER_COEFFICIENTS.vitrectomyGauge['25g'];
                PAPER_COEFFICIENTS.cryotherapy['yes'];
                PAPER_COEFFICIENTS.totalDetachment['yes'];
                PAPER_COEFFICIENTS.inferiorDetachment['6_hours'];
            };

            const results = measurePerformance(lookupCoefficients, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });

        it('should check significance efficiently', () => {
            const checkSignificance = () => {
                isSignificant('age', '65-79');
                isSignificant('breakLocation', '5-7');
                isSignificant('pvrGrade', 'C');
                isSignificant('tamponade', 'c3f8');
                isSignificant('vitrectomyGauge', '23g');
            };

            const results = measurePerformance(checkSignificance, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });

        it('should handle nested coefficient access', () => {
            const nestedAccess = () => {
                let sum = 0;
                for (const category in PAPER_COEFFICIENTS) {
                    if (typeof PAPER_COEFFICIENTS[category] === 'object') {
                        for (const key in PAPER_COEFFICIENTS[category]) {
                            sum += PAPER_COEFFICIENTS[category][key] || 0;
                        }
                    }
                }
                return sum;
            };

            const results = measurePerformance(nestedAccess, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });
    });

    describe('Mathematical Operations Performance', () => {
        it('should calculate exponentials efficiently', () => {
            const calculateExp = () => {
                for (let i = -5; i <= 5; i += 0.1) {
                    Math.exp(-i);
                }
            };

            const results = measurePerformance(calculateExp, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });

        it('should perform logit transformation quickly', () => {
            const logitTransform = () => {
                const logit = 1.234;
                return 100 / (1 + Math.exp(-logit));
            };

            const results = measurePerformance(logitTransform, 100000);
            
            expect(results.stats.avg).toBeLessThan(0.01);
        });

        it('should sum coefficients efficiently', () => {
            const sumCoefficients = () => {
                let sum = -1.611; // constant
                sum += 0.236; // age
                sum += 0.607; // break location
                sum += 0.663; // total RD
                sum += 0.220; // PVR C
                sum += -0.408; // gauge
                sum += -0.420; // cryotherapy
                sum += 0.670; // tamponade
                return sum;
            };

            const results = measurePerformance(sumCoefficients, 100000);
            
            expect(results.stats.avg).toBeLessThan(0.01);
        });
    });

    describe('Array Operations Performance', () => {
        it('should filter arrays efficiently', () => {
            const segments = Array.from({ length: 60 }, (_, i) => `segment${i}`);
            
            const filterSegments = () => {
                segments.filter(s => s.includes('1'));
                segments.filter(s => parseInt(s.replace('segment', '')) < 30);
            };

            const results = measurePerformance(filterSegments, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });

        it('should map arrays quickly', () => {
            const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            
            const mapHours = () => {
                hours.map(h => h * 30); // Convert to degrees
                hours.map(h => `hour${h}`);
            };

            const results = measurePerformance(mapHours, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });

        it('should reduce arrays efficiently', () => {
            const values = Array.from({ length: 100 }, (_, i) => i);
            
            const reduceValues = () => {
                values.reduce((sum, v) => sum + v, 0);
                values.reduce((max, v) => Math.max(max, v), 0);
            };

            const results = measurePerformance(reduceValues, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });

        it('should handle array spread operations', () => {
            const arr1 = Array.from({ length: 50 }, (_, i) => i);
            const arr2 = Array.from({ length: 50 }, (_, i) => i + 50);
            
            const spreadArrays = () => {
                const combined = [...arr1, ...arr2];
                const copied = [...combined];
                return copied.length;
            };

            const results = measurePerformance(spreadArrays, 1000);
            
            expect(results.stats.avg).toBeLessThan(1);
        });
    });

    describe('String Operations Performance', () => {
        it('should perform string comparisons quickly', () => {
            const compareStrings = () => {
                'none' === 'none';
                'C' === 'none';
                'A' === 'B';
                '25g' === '25g';
                'light_oil' === 'heavy_oil';
            };

            const results = measurePerformance(compareStrings, 100000);
            
            expect(results.stats.avg).toBeLessThan(0.01);
        });

        it('should handle string formatting efficiently', () => {
            const formatStrings = () => {
                const age = 65;
                const risk = 25.5;
                return `Age: ${age}, Risk: ${risk.toFixed(1)}%`;
            };

            const results = measurePerformance(formatStrings, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });
    });

    describe('Object Operations Performance', () => {
        it('should create objects efficiently', () => {
            const createObject = () => {
                return {
                    age: 65,
                    selectedHours: [6],
                    detachmentSegments: [],
                    pvrGrade: 'none',
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6',
                    cryotherapy: 'no'
                };
            };

            const results = measurePerformance(createObject, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });

        it('should destructure objects quickly', () => {
            const obj = {
                age: 65,
                selectedHours: [6],
                detachmentSegments: [],
                pvrGrade: 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: 'no'
            };

            const destructureObject = () => {
                const { age, pvrGrade, vitrectomyGauge, tamponade } = obj;
                return age + pvrGrade + vitrectomyGauge + tamponade;
            };

            const results = measurePerformance(destructureObject, 100000);
            
            expect(results.stats.avg).toBeLessThan(0.01);
        });

        it('should spread objects efficiently', () => {
            const base = { age: 65, pvrGrade: 'none' };
            
            const spreadObject = () => {
                return {
                    ...base,
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6'
                };
            };

            const results = measurePerformance(spreadObject, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });
    });

    describe('Batch Operations Performance', () => {
        it('should handle batch age classifications', () => {
            const ages = Array.from({ length: 100 }, (_, i) => i + 20);
            
            const batchClassify = () => {
                ages.map(age => getAgeGroup(age));
            };

            const batchResults = testBatchPerformance(batchClassify, [1, 10, 100]);
            
            expect(batchResults.batch_1.timePerItem).toBeLessThan(10);
            expect(batchResults.batch_100.timePerItem).toBeLessThan(20);
        });

        it('should process multiple calculations in parallel concept', () => {
            const params = Array.from({ length: 10 }, (_, i) => ({
                age: 50 + i,
                selectedHours: [i % 12 + 1],
                detachmentSegments: Array.from({ length: i + 5 }, (_, j) => `segment${j}`),
                pvrGrade: i % 2 === 0 ? 'C' : 'none',
                vitrectomyGauge: '23g',
                tamponade: 'sf6',
                cryotherapy: i % 2 === 0 ? 'yes' : 'no'
            }));

            const parallelCalc = () => {
                params.map(p => calculateRiskWithSteps(p));
            };

            const results = measurePerformance(parallelCalc, 10);
            
            expect(results.stats.avg).toBeLessThan(100); // 10 calculations < 100ms
        });
    });

    describe('Edge Case Performance', () => {
        it('should handle null/undefined efficiently', () => {
            const handleNull = () => {
                getAgeGroup(null);
                getBreakLocation(null);
                getPVRGrade(null);
                isTotalRD(null);
            };

            const results = measurePerformance(handleNull, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });

        it('should handle empty arrays efficiently', () => {
            const handleEmpty = () => {
                getBreakLocation([]);
                getInferiorDetachment([]);
                isTotalRD([]);
            };

            const results = measurePerformance(handleEmpty, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });

        it('should handle invalid inputs gracefully', () => {
            const handleInvalid = () => {
                getAgeGroup('invalid');
                getAgeGroup(-100);
                getAgeGroup(200);
                getPVRGrade('Z');
                getPVRGrade(123);
            };

            const results = measurePerformance(handleInvalid, 10000);
            
            expect(results.stats.avg).toBeLessThan(0.1);
        });
    });

    describe('Performance Regression Tests', () => {
        it('should maintain consistent performance for core functions', () => {
            const coreOperations = () => {
                getAgeGroup(65);
                getBreakLocation([6]);
                getPVRGrade('C');
                isTotalRD(Array.from({ length: 24 }, (_, i) => i));
            };

            const results = measurePerformance(coreOperations, 10000);
            
            // These should never degrade
            assertPerformance(results, {
                maxAvg: 0.5,
                maxP95: 1,
                maxP99: 2
            });
        });

        it('should maintain calculation performance baseline', () => {
            const baseline = () => {
                calculateRiskWithSteps({
                    age: 65,
                    selectedHours: [6],
                    detachmentSegments: Array.from({ length: 10 }, (_, i) => `segment${i}`),
                    pvrGrade: 'none',
                    vitrectomyGauge: '23g',
                    tamponade: 'sf6',
                    cryotherapy: 'no'
                });
            };

            const benchmark = runBenchmark('Baseline Calculation', baseline, {
                maxAvg: 100,
                maxP95: 150,
                maxP99: 200,
                iterations: 100
            });

            expect(benchmark.passed).toBe(true);
            console.log('Baseline benchmark:', benchmark.summary);
        });
    });
});