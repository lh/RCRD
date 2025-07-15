# MECC Model Testing Guide

## Overview
This guide explains how to set up and run the test suite for the MECC (Making Every Contact Count) model. The project uses a comprehensive testing strategy that includes unit tests, integration tests, property-based tests, and regression tests.

## Prerequisites

Before running the tests, ensure you have:

1. Python 3.8 or higher installed
2. pip (Python package manager)
3. Virtual environment tool (recommended)

## Setup Instructions

1. **Create and activate a virtual environment** (recommended):
   
   Key testing dependencies include:
   - pytest (8.0.0): Main testing framework
   - pytest-cov (4.1.0): Coverage reporting
   - hypothesis (6.98.0): Property-based testing
   - pytest-snapshot (0.9.0): Snapshot testing

## Test Structure


The tests are organized in a dedicated `tests/` directory at the project root, with subdirectories for different test categories:

```
tests/
├── conftest.py              # Shared pytest fixtures and configuration
├── unit/                    # Unit tests for individual components
│   ├── test_parameters.py   # Parameter validation tests
│   ├── test_model_behavior.py  # Core model behavior tests
│   ├── test_base_model.py     # Base functionality tests
│   ├── test_smoke_model_initialization.py
│   ├── test_smoke_model_quit_mechanics.py
│   └── test_smoke_model_relapse.py
├── integration/            # Integration tests for component interactions
│   ├── test_model_integration.py
│   ├── test_service_scaling.py
│   ├── test_data_consistency.py
│   └── test_interaction_chain.py
├── property/              # Property-based tests for invariants
│   └── test_model_properties.py
└── regression/            # Regression tests for specific scenarios
    ├── snapshots/        # Snapshot data for regression tests
    ├── test_known_scenarios.py
    ├── test_long_term_scenarios.py
    ├── test_edge_case_scenarios.py
    └── test_recovery_scenarios.py
```

The tests are organized into four main categories:

### 1. Unit Tests (`tests/unit/`)
- `test_parameters.py`: Parameter validation
- `test_model_behavior.py`: Core model behavior
- `test_base_model.py`: Base functionality
- `test_smoke_model_initialization.py`: Model setup
- `test_smoke_model_quit_mechanics.py`: Quit mechanics
- `test_smoke_model_relapse.py`: Relapse behavior

### 2. Integration Tests (`tests/integration/`)
- `test_model_integration.py`: Component interaction
- `test_service_scaling.py`: Service scaling
- `test_data_consistency.py`: Data integrity
- `test_interaction_chain.py`: Multi-step behaviors

### 3. Property Tests (`tests/property/`)
- `test_model_properties.py`: Invariant checking and randomized testing

### 4. Regression Tests (`tests/regression/`)
- `test_known_scenarios.py`: Previously identified issues
- `test_long_term_scenarios.py`: Extended simulation runs
- `test_edge_case_scenarios.py`: Boundary conditions
- `test_recovery_scenarios.py`: System recovery paths

## Running Tests

### Basic Test Execution
Run all tests:
```bash
pytest
```

### Common Test Commands

1. **Run tests with coverage report**:
   ```bash
   pytest --cov=streamlit_app
   ```

2. **Run specific test categories**:
   ```bash
   pytest tests/unit/  # Run unit tests only
   pytest tests/integration/  # Run integration tests only
   pytest tests/property/  # Run property tests only
   pytest tests/regression/  # Run regression tests only
   ```

3. **Run tests with detailed output**:
   ```bash
   pytest -v
   ```

4. **Run a specific test file**:
   ```bash
   pytest tests/unit/test_parameters.py
   ```

## Key Testing Considerations

### 1. Data Collection Timing
- Data is collected BEFORE step execution
- Effects of actions are visible in the next step
- Tests must account for this one-step delay

Example:
```python
# When testing intervention effects:
model.step()  # Apply intervention
# Check agent states directly after first step
model.step()  # Check collected data after second step
```

### 2. Randomness Management
- Tests use fixed seeds for reproducibility
- Statistical assertions use appropriate margins
- Multiple runs may be needed for probabilistic behaviors

### 3. State Management
- Tests should reset state between runs
- Consider accumulation effects
- Track intermediate states when needed

## Common Pitfalls to Avoid

1. **Timing Issues**:
   - Don't assume immediate visibility of effects in collected data
   - Account for the step delay in assertions
   - Verify data at correct simulation points

2. **Probability Testing**:
   - Avoid over-specific assertions about random outcomes
   - Account for valid random variation
   - Use sufficient samples for statistical validity

3. **State Management**:
   - Reset state between test runs
   - Control all relevant parameters
   - Consider accumulation effects

## Concrete Example: Testing Parameter Effects

Let's look at a real example from our codebase that tests how the visit probability parameter affects the model's behavior.

### The Model Code
From `model_two_types_mecc.py`, we have a PersonAgent that can visit services:

```python
class PersonAgent(Agent):
    def __init__(self, unique_id, model, visit_prob):
        super().__init__(unique_id, model)
        self.visit_prob = visit_prob  # Probability of visiting a service

    def move(self):
        if self.random.uniform(0,1) < self.visit_prob:
            # randomly selects a service agent
            ServiceAgent_list = [agent for agent in self.model.schedule.agents 
                               if isinstance(agent, ServiceAgent)]
            if ServiceAgent_list:
                visited_service = self.random.choice(ServiceAgent_list)
                visited_service.have_contact(self)
```

### The Test
From `test_parameters.py`, here's how we test this behavior:

```python
def test_parameter_effects():
    """Test that parameters have their intended effects"""
    base_params = {
        'N_people': 50,
        'N_service': 1,
        'visit_prob': 0.1,  # Base visit probability
        'mecc_effect': 0.9,
        'base_make_intervention_prob': 0.1,
        'initial_smoking_prob': 0.5,
        'quit_attempt_prob': 0.01,
        'base_smoke_relapse_prob': 0.01,
        'intervention_effect': 1.1,
        'seed': 42,
        'mecc_trained': False
    }
    
    # Create two models with different visit probabilities
    high_visit = SmokeModel_MECC_Model(**{**base_params, 'visit_prob': 1.0})
    low_visit = SmokeModel_MECC_Model(**{**base_params, 'visit_prob': 0.1})
    
    # Run both models for 3 steps
    for _ in range(3):
        high_visit.step()
        low_visit.step()
    
    # Get the data collected from both models
    high_data = high_visit.datacollector.get_model_vars_dataframe()
    low_data = low_visit.datacollector.get_model_vars_dataframe()
    
    # Assert that higher visit probability leads to more contacts
    assert high_data["Total Contacts"].iloc[-1] > low_data["Total Contacts"].iloc[-1], \
        f"Higher visit probability should lead to more contacts. Got {high_data['Total Contacts'].iloc[-1]} vs {low_data['Total Contacts'].iloc[-1]}"
```

### Running the Test

```bash
# Run just this test
pytest tests/unit/test_parameters.py -k test_parameter_effects -v

# Example output:
# tests/unit/test_parameters.py::test_parameter_effects PASSED
```

### Understanding the Test

1. **Setup**: 
   - Creates two models with identical parameters except for visit_prob
   - High probability (1.0) vs Low probability (0.1)

2. **Action**:
   - Runs both models for 3 steps
   - Each step, agents may visit services based on their visit_prob

3. **Assertion**:
   - Checks that the model with higher visit probability resulted in more total contacts
   - Uses the DataCollector to compare the accumulated contacts

4. **Why It Works**:
   - With visit_prob = 1.0, agents will visit every step
   - With visit_prob = 0.1, agents only visit 10% of the time
   - Over multiple steps, this should consistently result in more contacts for the high probability model

5. **Possible Failures**:
   - If the visit mechanism is broken
   - If the DataCollector isn't recording contacts properly
   - If the probability comparison isn't working as expected
   - If the random number generation isn't seeded properly

## Best Practices

1. **Test Setup**:
   - Use small populations for faster tests
   - Control randomness through seeds
   - Isolate specific behaviors being tested

2. **Assertions**:
   - Check intermediate states
   - Use appropriate tolerances for floating-point comparisons
   - Include descriptive error messages
   - Verify trends over time

3. **Documentation**:
   - Document timing assumptions
   - Explain test structure choices
   - Include failure case examples
   - Show expected value calculations

## Troubleshooting

1. **Test Failures**:
   - Check seed values for probabilistic tests
   - Verify timing assumptions
   - Ensure proper state initialization
   - Review data collection points

2. **Performance Issues**:
   - Reduce population size for faster tests
   - Use targeted test selection
   - Profile slow tests for optimization

3. **Coverage Gaps**:
   - Review uncovered code paths
   - Add edge case scenarios
   - Consider property-based tests
   - Implement missing test categories

## Continuous Testing

### Using pytest-watch

To continuously run tests while making changes:

1. **Install pytest-watch**:
   ```bash
   pip install pytest-watch
   ```

2. **Run continuous testing**:
   ```bash
   ptw  # Run all tests on file changes
   ```

   Options:
   - `ptw tests/unit/`  # Watch only unit tests
   - `ptw --onpass "echo 'Success!'" --onfail "echo 'Failed!'"` # Custom notifications
   - `ptw -- --cov=streamlit_app` # Run with coverage

### Using VSCode

1. Install the Python extension for VSCode
2. Configure test discovery in settings.json:
   ```json
   {
       "python.testing.pytestEnabled": true,
       "python.testing.unittestEnabled": false,
       "python.testing.nosetestsEnabled": false
   }
   ```
3. Use the Testing sidebar to:
   - Run/Debug individual tests
   - See test results in real-time
   - Set up auto-run on save

### Using Pre-commit Hooks

1. **Install pre-commit**:
   ```bash
   pip install pre-commit
   ```

2. **Create .pre-commit-config.yaml**:
   ```yaml
   repos:
   - repo: local
     hooks:
     - id: pytest
       name: pytest
       entry: pytest
       language: system
       pass_filenames: false
       always_run: true
   ```

3. **Install the hooks**:
   ```bash
   pre-commit install
   ```

This will run tests automatically before each commit, preventing commits if tests fail.

## Contributing New Tests

When adding new tests:

1. **Choose the Right Category**:
   - Unit tests for isolated functionality
   - Integration tests for component interaction
   - Property tests for invariants
   - Regression tests for specific scenarios

2. **Follow Naming Conventions**:
   - Use descriptive test names
   - Group related tests in classes
   - Match file naming patterns

3. **Document Test Purpose**:
   - Explain what is being tested
   - Document any assumptions
   - Include example scenarios
   - Provide expected outcomes
