# BlocZone Core Library

:warning: **IMPORTANT!!!!**

🚧 This project is still under heavy development, which means it is not ready for production environment, as the idea is still in the proof of concept stage.

BlocZone Core is a state management library built for JavaScript and TypeScript developers. This library provides the foundation for building reactive applications with an emphasis on maintainability and clear separation of concerns.

## Motivation

- **Reactive State Management**: BlocZone provides a reactive state object that allows tracking and responding to real-time changes. By subscribing to the state object, developers can receive updates whenever the state changes, allowing them to keep the user interface synchronized with the latest data.

- **Event-driven**: Developers can send events to the BlocZone Core instance, triggering specific handlers to handle those events. This allows for decoupling event handling from UI components and easily managing state flows.

- **Extensibility**: BlocZone offers the ability to add custom handlers, create middleware to handle side effects, and it is designed to be framework-agnostic, enabling its integration with any JavaScript or TypeScript project regardless of the framework used.

## Installation

Ensure you have the latest version of Node.js, npm, and pnpm installed on your system. We also recommend using Visual Studio Code as your IDE.

1. Clone the repository to your local system.
   ```
   git clone https://github.com/<your-github-username>/BlocZone.git
   ```

2. Change to the repository directory.
   ```
   cd BlocZone
   ```

3. Install the dependencies.
   ```
   pnpm install
   ```

4. Start the development server.
   ```
   pnpm start
   ```

Your local copy of the BlocZone Core library is now running and ready for development!

## API Reference
Please refer to the [API_REFERENCE.md](./API_REFERENCE.md) for detailed information on how to use BlocZone Core and EventEmitterZone.

## Features

The BlocZone Core library, once fully developed, will potentially have the following features:

1. **Reactive State Management**: BlocZone will provide a reactive state object to track and respond to real-time changes. This will help to synchronize the user interface with the latest data.

2. **Event-Driven Architecture**: The library will allow sending events to the BlocZone Core instance, triggering specific handlers to manage these events. It will work in combination with EventEmitterZone to provide flexible and decoupled event handling.

3. **Extensibility and Compatibility**: BlocZone will offer extensibility by allowing the addition of custom handlers and middleware for managing side effects. It is also framework-agnostic, which means it can be integrated into any JavaScript or TypeScript project, regardless of the framework being used.

4. **Scalability**: Designed with scalability in mind, BlocZone will be suitable for both small-scale and large-scale applications.

5. **Efficient Error Handling**: The library will provide a robust error handling mechanism, reducing the possibility of unhandled exceptions and improving overall application stability.

6. **Debugging and Devtools Support**: The library will come with built-in support for debugging, making it easier for developers to identify and resolve issues. It will also potentially support integration with popular devtools.

> Please note, these are the proposed features and their implementation and availability may vary in the actual library as per the development progress and design decisions.

## Contributing

We highly value your contributions! For guidelines on how to contribute to the project, please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## Code of Conduct

We are committed to fostering an open and welcoming environment. Please see our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for more details.
