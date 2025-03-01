# Contributing to Event Sourcing Core

Thank you for your interest in contributing to **Event Sourcing Core**!
This document provides guidelines on how to effectively contribute to the project.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Table of Contents

1. [How to Report a Bug](#how-to-report-a-bug)
2. [How to Propose a New Feature](#how-to-propose-a-new-feature)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Guidelines](#code-guidelines)
6. [Testing and Coverage](#testing-and-coverage)
7. [Versioning](#versioning)
8. [Community and Support](#community-and-support)

---

## How to Report a Bug

If you find a bug:

1. Ensure you are using the latest version.
2. Check if the issue is already reported in [GitHub Issues](../../issues).
3. If not, open a new issue and include:
   - A clear title and description.
   - Steps to reproduce the issue.
   - Expected behavior vs. actual behavior.
   - Logs or error messages (if applicable).

---

## How to Propose a New Feature

1. Open a [GitHub Issue](../../issues) with the `enhancement` label.
2. Clearly describe the feature, its use case, and how it aligns with the project's goals.
3. Discuss feasibility with maintainers before implementation.

---

## Project Structure
Below is the general structure of the **event-sourcing-core** project:

### **Folder & File Descriptions**
- **`src/`**: Contains the core logic of the CQRS + Event Sourcing framework.
  - **`domain/`**: Houses Domain models such as Aggregates, Events, and Event Context.
  - **`store/`**: Contains implementations for storing and retrieving events and snapshots.
  - **`saga/`**: Handles process management using the Saga pattern.
  - **`concurrency/`**: Contains mechanisms to handle concurrency control (e.g., `ConcurrencySafeExecutor`).
  - **`index.ts`**: The main entry point that exports all modules.

- **`test/`**: Contains unit and integration tests to ensure the correctness of the library.

- **`examples/`**: (Optional) Real-world usage examples for reference.

- **`package.json`**: Defines the package dependencies, scripts, and metadata.

- **`tsconfig.json` / `tsconfig.build.json`**: TypeScript configurations for development and build.

- **`jest.config.ts`**: Configuration file for running tests with Jest.

- **`CODE_OF_CONDUCT.md`**: Defines the code of conduct for contributors.

- **`CONTRIBUTING.md`**: Provides guidelines for contributing to the project.

- **`README.md`**: The main documentation file, describing how to install and use the library.

---

## Development Workflow

1. **Fork** the repository.
2. **Clone** your fork locally.
3. **Create** a branch: `git checkout -b feature/your-feature`.
4. **Implement** your changes, ensuring all tests pass.
5. **Commit** and push to your branch.
6. **Open a Pull Request** against the `main` branch.

---

## Code Guidelines

- **Style Guide**: We use [Google TypeScript Style](https://github.com/google/gts).
- **Naming**: Use clear, descriptive names for variables, functions, and classes.
- **Comments**: Document complex logic where necessary.
- **Avoid breaking changes** unless it's a major release.

---

## Testing and Coverage

- Run tests using `npm test` or `yarn test`.
- Ensure **100% test coverage** for unit tests.
- Tests must cover core classes like `AggregateRoot`, `BaseDomainEvent`, and `EventSourcedRepository`.

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes.
- **MINOR**: Backward-compatible feature additions.
- **PATCH**: Backward-compatible bug fixes.

---

## Community and Support

For questions, issues, or suggestions:

- Open an [Issue](../../issues).
- Contact the maintainers if necessary.

By contributing, you help improve **Event Sourcing Core** for everyone! 🚀
