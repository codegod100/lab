# Dioxus Notes App

A simple note-taking application built with Dioxus and Rust.

## Features

- Create, view, and delete notes
- Search functionality
- Local storage persistence
- Responsive design

## Prerequisites

- Rust and Cargo installed on your system

## Running the App

1. Clone the repository:
```
git clone <repository-url>
cd notes_app
```

2. Install the Dioxus CLI (if not already installed):
```
cargo install dioxus-cli
```

3. Run the development server:
```
dx serve
```

4. Open your browser and navigate to `http://localhost:8080`

## Building for Production

To build the application for production:

```
dx build --release
```

The build output will be in the `dist` directory.

## License

This project is licensed under the MIT License.