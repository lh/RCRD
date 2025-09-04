/**
 * Performance Testing Utilities
 * 
 * Provides comprehensive performance measurement and analysis tools
 * for ensuring all calculations complete within 100ms target.
 */

/**
 * Measure execution time with high precision
 * @param {Function} fn - Function to measure
 * @param {number} iterations - Number of iterations to run
 * @returns {Object} Performance metrics
 */
export const measurePerformance = (fn, iterations = 100) => {
    const times = [];
    const memoryUsage = [];
    
    // Warm up the function (JIT optimization)
    for (let i = 0; i < 10; i++) {
        fn();
    }
    
    // Actual measurements
    for (let i = 0; i < iterations; i++) {
        const memStart = performance.memory ? performance.memory.usedJSHeapSize : 0;
        const start = performance.now();
        
        fn();
        
        const end = performance.now();
        const memEnd = performance.memory ? performance.memory.usedJSHeapSize : 0;
        
        times.push(end - start);
        if (performance.memory) {
            memoryUsage.push((memEnd - memStart) / 1024 / 1024); // MB
        }
    }
    
    return {
        times,
        memoryUsage,
        stats: calculateStats(times),
        memory: memoryUsage.length > 0 ? calculateStats(memoryUsage) : null
    };
};

/**
 * Calculate statistical metrics from array of values
 * @param {Array<number>} values - Array of numeric values
 * @returns {Object} Statistical metrics
 */
export const calculateStats = (values) => {
    if (!values || values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    
    // Calculate standard deviation
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquaredDiff);
    
    return {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: avg,
        median: percentile(sorted, 50),
        p50: percentile(sorted, 50),
        p75: percentile(sorted, 75),
        p90: percentile(sorted, 90),
        p95: percentile(sorted, 95),
        p99: percentile(sorted, 99),
        stdDev: stdDev,
        sum: sum
    };
};

/**
 * Calculate percentile from sorted array
 * @param {Array<number>} sortedArray - Sorted array of numbers
 * @param {number} p - Percentile (0-100)
 * @returns {number} Percentile value
 */
export const percentile = (sortedArray, p) => {
    if (sortedArray.length === 0) return 0;
    if (p <= 0) return sortedArray[0];
    if (p >= 100) return sortedArray[sortedArray.length - 1];
    
    const index = (p / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (lower === upper) {
        return sortedArray[lower];
    }
    
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
};

/**
 * Measure async function performance
 * @param {Function} asyncFn - Async function to measure
 * @param {number} iterations - Number of iterations
 * @returns {Promise<Object>} Performance metrics
 */
export const measureAsyncPerformance = async (asyncFn, iterations = 100) => {
    const times = [];
    
    // Warm up
    for (let i = 0; i < 10; i++) {
        await asyncFn();
    }
    
    // Measurements
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await asyncFn();
        const end = performance.now();
        times.push(end - start);
    }
    
    return {
        times,
        stats: calculateStats(times)
    };
};

/**
 * Run performance benchmark with pass/fail criteria
 * @param {string} name - Test name
 * @param {Function} fn - Function to benchmark
 * @param {Object} criteria - Pass/fail criteria
 * @returns {Object} Benchmark results
 */
export const runBenchmark = (name, fn, criteria = {}) => {
    const defaultCriteria = {
        maxAvg: 100,      // Maximum average time in ms
        maxP95: 150,      // Maximum 95th percentile
        maxP99: 200,      // Maximum 99th percentile
        iterations: 100   // Number of iterations
    };
    
    const finalCriteria = { ...defaultCriteria, ...criteria };
    const results = measurePerformance(fn, finalCriteria.iterations);
    
    const passed = 
        results.stats.avg <= finalCriteria.maxAvg &&
        results.stats.p95 <= finalCriteria.maxP95 &&
        results.stats.p99 <= finalCriteria.maxP99;
    
    return {
        name,
        passed,
        results,
        criteria: finalCriteria,
        summary: {
            avgTime: `${results.stats.avg.toFixed(2)}ms`,
            p95Time: `${results.stats.p95.toFixed(2)}ms`,
            p99Time: `${results.stats.p99.toFixed(2)}ms`,
            status: passed ? '✅ PASS' : '❌ FAIL'
        }
    };
};

/**
 * Memory leak detector
 * @param {Function} fn - Function to test
 * @param {number} iterations - Number of iterations
 * @returns {Object} Memory analysis
 */
export const detectMemoryLeak = (fn, iterations = 1000) => {
    if (!performance.memory) {
        return {
            available: false,
            message: 'Memory profiling not available (Chrome with --enable-precise-memory-info flag required)'
        };
    }
    
    const memorySnapshots = [];
    
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    
    // Take initial snapshot
    const initialMemory = performance.memory.usedJSHeapSize / 1024 / 1024;
    
    // Run iterations and take snapshots
    for (let i = 0; i < iterations; i++) {
        if (i % 100 === 0) {
            memorySnapshots.push(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        fn();
    }
    
    // Final snapshot
    const finalMemory = performance.memory.usedJSHeapSize / 1024 / 1024;
    
    // Calculate memory growth
    const memoryGrowth = finalMemory - initialMemory;
    const growthPerIteration = memoryGrowth / iterations;
    
    // Analyze trend
    const trend = analyzeTrend(memorySnapshots);
    
    return {
        available: true,
        initialMemory: `${initialMemory.toFixed(2)} MB`,
        finalMemory: `${finalMemory.toFixed(2)} MB`,
        totalGrowth: `${memoryGrowth.toFixed(2)} MB`,
        growthPerIteration: `${(growthPerIteration * 1000).toFixed(4)} KB`,
        trend: trend,
        hasLeak: trend.slope > 0.01, // More than 10KB per 100 iterations
        snapshots: memorySnapshots
    };
};

/**
 * Analyze trend in data points
 * @param {Array<number>} data - Data points
 * @returns {Object} Trend analysis
 */
const analyzeTrend = (data) => {
    if (data.length < 2) return { slope: 0, increasing: false };
    
    // Simple linear regression
    const n = data.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return {
        slope: slope,
        increasing: slope > 0,
        stable: Math.abs(slope) < 0.001
    };
};

/**
 * Batch performance test
 * @param {Function} fn - Function to test
 * @param {Array<number>} batchSizes - Array of batch sizes to test
 * @returns {Object} Batch performance results
 */
export const testBatchPerformance = (fn, batchSizes = [1, 10, 100, 1000]) => {
    const results = {};
    
    batchSizes.forEach(size => {
        const batchFn = () => {
            for (let i = 0; i < size; i++) {
                fn();
            }
        };
        
        const perf = measurePerformance(batchFn, Math.max(10, Math.floor(100 / size)));
        results[`batch_${size}`] = {
            size: size,
            totalTime: perf.stats.avg,
            timePerItem: perf.stats.avg / size,
            throughput: 1000 / (perf.stats.avg / size) // items per second
        };
    });
    
    return results;
};

/**
 * Compare performance between two functions
 * @param {Function} fn1 - First function
 * @param {Function} fn2 - Second function
 * @param {number} iterations - Number of iterations
 * @returns {Object} Comparison results
 */
export const comparePerformance = (fn1, fn2, iterations = 100) => {
    const perf1 = measurePerformance(fn1, iterations);
    const perf2 = measurePerformance(fn2, iterations);
    
    const speedup = perf1.stats.avg / perf2.stats.avg;
    const winner = speedup > 1 ? 'Function 2' : 'Function 1';
    
    return {
        function1: perf1.stats,
        function2: perf2.stats,
        speedup: speedup,
        winner: winner,
        percentFaster: Math.abs((speedup - 1) * 100).toFixed(1) + '%'
    };
};

/**
 * Format performance results for display
 * @param {Object} results - Performance results
 * @returns {string} Formatted string
 */
export const formatResults = (results) => {
    const { stats } = results;
    return `
Performance Results:
━━━━━━━━━━━━━━━━━━━━
  Min:     ${stats.min.toFixed(2)}ms
  Avg:     ${stats.avg.toFixed(2)}ms
  Median:  ${stats.median.toFixed(2)}ms
  P95:     ${stats.p95.toFixed(2)}ms
  P99:     ${stats.p99.toFixed(2)}ms
  Max:     ${stats.max.toFixed(2)}ms
  StdDev:  ${stats.stdDev.toFixed(2)}ms
━━━━━━━━━━━━━━━━━━━━
`;
};

/**
 * Assert performance meets criteria
 * @param {Object} results - Performance results
 * @param {Object} criteria - Performance criteria
 */
export const assertPerformance = (results, criteria) => {
    const failures = [];
    
    if (criteria.maxAvg && results.stats.avg > criteria.maxAvg) {
        failures.push(`Average time ${results.stats.avg.toFixed(2)}ms exceeds limit ${criteria.maxAvg}ms`);
    }
    
    if (criteria.maxP95 && results.stats.p95 > criteria.maxP95) {
        failures.push(`P95 time ${results.stats.p95.toFixed(2)}ms exceeds limit ${criteria.maxP95}ms`);
    }
    
    if (criteria.maxP99 && results.stats.p99 > criteria.maxP99) {
        failures.push(`P99 time ${results.stats.p99.toFixed(2)}ms exceeds limit ${criteria.maxP99}ms`);
    }
    
    if (failures.length > 0) {
        throw new Error(`Performance criteria not met:\n${failures.join('\n')}`);
    }
    
    return true;
};

/**
 * Profile function execution
 * @param {Function} fn - Function to profile
 * @returns {Object} Profiling data
 */
export const profileFunction = (fn) => {
    const profile = {
        name: fn.name || 'anonymous',
        calls: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0
    };
    
    return new Proxy(fn, {
        apply(target, thisArg, args) {
            const start = performance.now();
            const result = target.apply(thisArg, args);
            const end = performance.now();
            const elapsed = end - start;
            
            profile.calls++;
            profile.totalTime += elapsed;
            profile.minTime = Math.min(profile.minTime, elapsed);
            profile.maxTime = Math.max(profile.maxTime, elapsed);
            profile.avgTime = profile.totalTime / profile.calls;
            
            return result;
        }
    });
};