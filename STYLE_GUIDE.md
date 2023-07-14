# TypeScript Style Guide

This style guide is designed specifically for the `BlocZone` and `EventEmitterZone` project. Please adhere to these guidelines while contributing to this project.

1. **Type Annotation**: Always use explicit types for function parameters and return values, and for constants and variables when their type is not obvious from the value it's being assigned.

    ```typescript
    // Good
    const on = (event: string, handler: EventReceiver): void => {
      ...
    }

    // Bad
    const on = (event, handler) => {
      ...
    }
    ```

2. **Interface Naming**: Interfaces should always be pascal case and not have an 'I' prefix.

    ```typescript
    // Good
    interface EventEmitterProps {
      ...
    }

    // Bad
    interface iEventEmitterProps {
      ...
    }
    ```

3. **Type Aliases**: Type aliases should be used for complex types that are used in multiple places. They should also be in PascalCase.

    ```typescript
    // Good
    type EventReceiver = (event: string, payload: unknown) => void;

    // Bad
    type eventReceiver = (event: string, payload: any) => void;
    ```

4. **Optional Types**: Always use the optional (`?`) operator instead of using `| undefined` or `| null` for optional properties.

    ```typescript
    // Good
    let eventEmitter: EventEmitterProps | null = null;

    // Bad
    let eventEmitter?: EventEmitterProps = null;
    ```

5. **Error Handling**: Always throw an `Error` instead of returning `null` or `undefined` in case of an exception.

    ```typescript
    // Good
    const handler = _listeners.get(obj)
    if (!handler) {
      throw new Error('Object is not subscribed to this Bloc')
    }

    // Bad
    const handler = _listeners.get(obj)
    if (!handler) {
      return null
    }
    ```

6. **Async/await**: When working with Promises, always use async/await for better readability and error handling.

7. **Use `const` for Constants**: When the value is not going to change after assignment, use `const`. If it may change, use `let`. Never use `var`.

    ```typescript
    // Good
    const handlers: Map<string, EventReceiver[]> = new Map();

    // Bad
    var handlers = new Map<string, EventReceiver[]>();
    ```

8. **Use arrow functions**: Prefer arrow functions over the function keyword, unless defining a method or a class constructor.

    ```typescript
    // Good
    const on = (event: string, handler: EventReceiver): void => {
      ...
    }

    // Bad
    function on(event: string, handler: EventReceiver): void {
      ...
    }
    ```

9. **Descriptive Names**: Always use descriptive and meaningful variable, function, and class names. Avoid abbreviations and single-letter names.

    ```typescript
    // Good
    const currentHandlers = handlers.get(event) || [];

    // Bad
    const currHandlers = handlers.get(event) || [];
    ```

10. **Exporting**: Always prefer default exports over named exports for simplicity and consistency.

    ```typescript
    // Good
    export default function createEventEmitter(): EventEmitterProps {...}

    // Bad
    export function createEventEmitter(): EventEmitterProps {...}
    ```

These guidelines are meant to improve the consistency and readability of the codebase. Make sure to apply them while contributing.
