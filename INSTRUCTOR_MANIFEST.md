# Instructor Manifest

This repository contains intentional flaws designed for a 90-minute refactoring assessment.

## Intentional Issues
- **Backend/Auth:** Generic error messages, missing user existence check.
- **Backend/Projects:** IDOR in `getById`.
- **Backend/Projects:** Performance issue in `getStats` (calculated in JS).
- **Backend/Tasks:** Generic error handling.

## Files
- `apps/api`: Backend application.
- `apps/web`: Frontend application (scaffolded).
- `packages/shared`: Shared types.
