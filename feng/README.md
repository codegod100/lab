# Orgmode LPeg HTML Converter

This project parses Org-mode documents using LPeg in Lua and converts them to HTML. It is designed to work in the browser using Fengari (a Lua VM for JavaScript).

## Features
- Parses Org-mode syntax using LPeg
- Converts Org-mode documents to HTML
- Runs in the browser via Fengari
- Includes test runner for debugging and validation

## Files
- `orgmode_lpeg.lua`: Main Lua parser and HTML converter
- `fengari-web.js`: Fengari Lua VM for running Lua in the browser
- `index.html`: Web interface to load an Org-mode file and view the HTML output
- `output.html`: Example/test output file

## Usage
1. Open `index.html` in your browser.
2. Paste or load your Org-mode content.
3. The Lua parser (via Fengari) will process the content and display the HTML output.

## Development
- Edit `orgmode_lpeg.lua` to improve parsing or HTML conversion.
- Use the test runner (embedded or via browser console) to debug output. Ensure the test runner prints the full HTML output for all matched blocks (including code blocks and lists).

## Requirements
- No installation needed for browser use (all dependencies included).
- To run Lua scripts directly, you need Lua 5.3+ and LPeg library.

## License
MIT License
