/**
 * Helper functions for RetinalCalculator tests
 */

/**
 * Gets the mobile view container and elements
 * @param {HTMLElement} container - The main container from render()
 * @returns {Object} Object containing mobile view elements
 */
export const getMobileView = (container) => {
  const mobileContainer = container.querySelector('.md\\:hidden');
  const mobileView = mobileContainer?.querySelector('[data-testid="clock-face"]');
  const mobileForm = mobileContainer?.querySelector('[data-testid="risk-form-mobile"]');
  return { mobileContainer, mobileView, mobileForm };
};

/**
 * Gets the desktop view container and elements
 * @param {HTMLElement} container - The main container from render()
 * @returns {Object} Object containing desktop view elements
 */
export const getDesktopView = (container) => {
  const desktopContainer = container.querySelector('.md\\:flex');
  const desktopView = desktopContainer?.querySelector('[data-testid="clock-face"]');
  const leftForm = desktopContainer?.querySelector('[data-testid="risk-form-left"]');
  const rightForm = desktopContainer?.querySelector('[data-testid="risk-form-right"]');
  return { desktopContainer, desktopView, leftForm, rightForm };
};

/**
 * Gets the results section elements
 * @param {HTMLElement} container - The main container from render()
 * @returns {Object} Object containing results elements
 */
export const getResultsSection = (container) => {
  const resultsContainer = container.querySelector('[data-testid="risk-results"]');
  if (!resultsContainer) return { resultsContainer: null, summarySection: null };
  
  const summarySection = resultsContainer.querySelector('[data-testid="input-summary"]');
  return { resultsContainer, summarySection };
};

/**
 * Fills out the form with test data
 * @param {Object} params - The parameters object
 * @param {Object} params.screen - The screen object from render()
 * @param {Function} params.fireEvent - The fireEvent function from testing-library
 * @param {Function} params.within - The within function from testing-library
 * @param {HTMLElement} params.mobileView - The mobile view container
 * @param {Object} params.data - The test data to fill in
 */
export const fillForm = ({ screen, fireEvent, within, mobileView, data = {} }) => {
  const {
    age = '65',
    pvrGrade = 'none',
    vitrectomyGauge = '25g'
  } = data;

  // Get form inputs
  const ageInput = screen.getByTestId('age-input-mobile');
  const pvrSelect = screen.getByTestId('pvr-grade-mobile');
  const gaugeSelect = screen.getByTestId('gauge-mobile');

  // Fill form inputs
  if (age) {
    fireEvent.change(ageInput, { target: { value: age } });
  }
  if (pvrGrade) {
    fireEvent.change(pvrSelect, { target: { value: pvrGrade } });
  }
  if (vitrectomyGauge) {
    fireEvent.change(gaugeSelect, { target: { value: vitrectomyGauge } });
  }

  // Get the first segment-toggle button (mobile or desktop)
  const clockFace = screen.getAllByTestId('clock-face')[0];
  const segmentButton = within(clockFace).getByTestId('segment-toggle');
  fireEvent.click(segmentButton);
};
