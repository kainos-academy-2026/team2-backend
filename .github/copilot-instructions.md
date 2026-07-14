# Team2 Backend Copilot Instructions

## Core Expectations

- Keep code simple, readable, and easy to maintain.
- Follow SOLID principles, especially single responsibility and dependency inversion.
- Prefer small, focused changes over broad refactors.
- Match the existing project structure and naming conventions.
- Do not add unnecessary abstractions, layers, or helpers unless they clearly improve the design.
- Use classes for services and controllers and mappers

## Testing Expectations

- For every code change, create or update unit tests when appropriate. 
- Tests should cover both:
	- the happy path
	- the unhappy path or error path
- Keep tests focused on behavior and expected outcomes.
- Prefer narrow, targeted tests for the code that changed instead of widening scope unnecessarily.
- Testing files should follow the same naming and folder structure as the src folder.
  - For example, if the file is `src/services/userService.ts`, the test file should be `tests/services/userService.test.ts`.
- Unit tests should reflect the code's behavior; do not change the code to make a test pass

## Validation Workflow

- After each completed code change, run:
	- `npm run lint:fix`
	- `npm run lint`
	- `npm run test`
- Do not consider the task complete until both commands pass, unless the user asks otherwise.
- If either command fails, fix the issue if it is caused by the current change.
- If a failure is unrelated to the current change, clearly report it to the user.

## Implementation Guidance

- Favor dependency injection and small composable units where it improves testability.
- Validate inputs at boundaries and keep business logic out of routing and wiring code.
- Preserve existing behavior unless the task requires a behavior change.
- Update only the files necessary to solve the task.

## Output Expectations

- Summarize what changed in a concise way.
- Report the result of `npm run lint:fix`, `npm run lint`, and `npm run test` after making changes.
- Call out any remaining risks, gaps, or blockers.
