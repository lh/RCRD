/**
 * Medical rules for categorizing retinal detachments.
 * This module contains the business logic for determining medical categories
 * based on affected clock hours.
 */

/**
 * Check if the detachment is considered total (all 12 hours affected)
 * @param {number[]} hours - Array of affected clock hours
 * @returns {boolean} True if detachment is total
 */
function isTotalDetachment(hours) {
    // Total detachment means exactly all 12 hours are affected
    const uniqueHours = new Set(hours);
    return uniqueHours.size === 12;
}

/**
 * Count how many inferior clock hours (3-9) are affected
 * @param {number[]} hours - Array of affected clock hours
 * @returns {number} Number of inferior hours affected
 */
function countInferiorHours(hours) {
    // Inferior hours are 3, 4, 5, 6, 7, 8, 9
    const inferiorHours = [3, 4, 5, 6, 7, 8, 9];
    return hours.filter(h => inferiorHours.includes(h)).length;
}

/**
 * Get the medical category for a detachment based on affected hours.
 * Categories are based on the BEAVRS database study coefficients.
 * 
 * For inferior detachment:
 * - less_than_3: 0-2 inferior hours affected (reference category)
 * - 3_to_5: 3-5 inferior hours affected (+0.441)
 * - 6_hours: 6 or more inferior hours affected (+0.435)
 * - total_detachment: all 12 hours affected (+0.663)
 * 
 * @param {number[]} hours - Array of affected clock hours
 * @returns {string} Medical category:
 *   - "total_detachment" if exactly 12 hours affected
 *   - "6_hours" if 6+ inferior hours affected
 *   - "3_to_5" if 3-5 inferior hours affected
 *   - "less_than_3" if 0-2 inferior hours affected
 */
export function getDetachmentCategory(hours) {
    if (!hours || hours.length === 0) return "less_than_3";

    // Check for total detachment first (highest risk)
    if (isTotalDetachment(hours)) return "total_detachment";

    // Count inferior hours affected
    const inferiorCount = countInferiorHours(hours);

    // Categorize based on count of inferior hours
    if (inferiorCount >= 6) return "6_hours";
    if (inferiorCount >= 3) return "3_to_5";
    return "less_than_3";
}
