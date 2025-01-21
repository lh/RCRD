import { 
    calculateRiskWithSteps,
    isTotalRD,
    getInferiorDetachment
} from '../riskCalculations.js';

describe('Total RD Detection', () => {
    // Test total RD detection
    test('correctly identifies total RD', () => {
        // Create segments 0-23 for total RD
        const totalRDSegments = Array.from({ length: 24 }, (_, i) => `segment${i}`);
        expect(isTotalRD(totalRDSegments)).toBe("yes");

        // Missing two segments should not be total RD
        const partialRDSegments = totalRDSegments.slice(0, -2);  // Remove last 2 segments
        expect(isTotalRD(partialRDSegments)).toBe("no");
    });

    // Test inferior detachment detection
    test('correctly identifies inferior hours', () => {
        // Create segments for hours 3-9 (5 segments per hour)
        const inferiorSegments = [
            10, 11, 12, 13, 14,  // Hour 3
            15, 16, 17, 18, 19,  // Hour 4
            20, 21, 22, 23, 24,  // Hour 5
            25, 26, 27, 28, 29,  // Hour 6
            30, 31, 32, 33, 34,  // Hour 7
            35, 36, 37, 38, 39,  // Hour 8
            40, 41, 42, 43, 44   // Hour 9
        ];
        expect(getInferiorDetachment(inferiorSegments)).toBe('6_hours');

        // Test partial inferior detachment (hours 3-5)
        const partialInferiorSegments = [
            10, 11, 12, 13, 14,  // Hour 3
            15, 16, 17, 18, 19,  // Hour 4
            20, 21, 22, 23, 24   // Hour 5
        ];
        expect(getInferiorDetachment(partialInferiorSegments)).toBe('3_to_5');
    });

    // Test complete risk calculation
    test('calculates correct risk for total RD case', () => {
        // Create segments for total RD including all inferior hours
        const totalRDSegments = [
            10, 11, 12, 13, 14,  // Hour 3
            15, 16, 17, 18, 19,  // Hour 4
            20, 21, 22, 23, 24,  // Hour 5
            25, 26, 27, 28, 29,  // Hour 6
            30, 31, 32, 33, 34,  // Hour 7
            35, 36, 37, 38, 39,  // Hour 8
            40, 41, 42, 43, 44   // Hour 9
        ];

        const result = calculateRiskWithSteps({
            age: '82',
            pvrGrade: 'C',
            vitrectomyGauge: '25g',
            selectedHours: [6], // Break at 6 o'clock
            detachmentSegments: totalRDSegments,
            cryotherapy: 'yes',
            tamponade: 'c2f6'
        });

        // Log calculation steps for debugging
        console.log('\nRisk calculation steps:');
        result.steps.forEach(step => {
            console.log(`${step.step}: ${step.value} (${step.category || ''})`);
        });

        // Verify total RD coefficient is applied
        const totalRDStep = result.steps.find(step => step.step === 'Total RD');
        expect(totalRDStep.value).toBe(0.663);
        expect(totalRDStep.category).toBe('yes');

        // Verify inferior detachment coefficient is also applied (total RD includes all inferior hours)
        const inferiorStep = result.steps.find(step => step.step === 'Inferior detachment');
        expect(inferiorStep.value).toBe(0.435);
        expect(inferiorStep.category).toBe('6_hours');
    });
});
