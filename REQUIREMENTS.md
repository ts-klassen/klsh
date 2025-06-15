# Web Application Requirements Document

## Project Overview
We are building a web-based application that emulates the flexibility of Bash pipelines, allowing users to define modular components and connect them into complex data flows. The framework will handle standard input, output, and error streams, support file operations via the browser's File API, and enable both text-based and eventual GUI-driven interfaces using a consistent JSON structure.

## Core Features and Requirements
1. **Components and Pipelines**
   - Users can define reusable components, each performing a specific function (e.g., `cat`, `sort`, `head`, `tail`).
   - Components can be chained into pipelines where the output of one feeds into the next.
   - Piping is optional. When a component appears in a pipeline, it pipes its output directly to the next component; otherwise its output is returned as the final result.
2. **I/O Redirection and Appending**
   - Input redirection from files using shell-style syntax (`< file.txt`).
   - Output redirection to files with overwrite (`> file.txt`) or append (`>> file.txt`).
   - Standard error redirection (`2>error.log`), merging streams (`2>&1`), and append mode (`2>>error.log`).
3. **Command Substitution**
   - Support for command substitution (`$(…)`), allowing sub-commands to run and supply their output as parameters.
   - Parameters can be strings or nested command nodes in the JSON structure.
4. **File I/O**
   - Reading input from files via `< file.txt` and here-documents (`<<EOF … EOF`).
   - Writing output to files using the browser's File API for virtual file operations.


## Data Structure
Internally, the application uses a tree-like JSON representation. All string values are represented as arrays of segments, where each segment is an object with a `type` field. For simple literal strings without expansions or substitutions, use a single-element array containing an object of:

```json
[
  {
    "type": "text",
    "value": "<original string>"
  }
]
```

For strings with expansions or substitutions, represent each segment accordingly. For example, the string `"Hello, ${USER}, your current directory is $(pwd)."` becomes:

```json
[
  {
    "type": "text",
    "value": "Hello, "
  },
  {
    "type": "expansion",
    "value": "USER"
  },
  {
    "type": "text",
    "value": ", your current directory is "
  },
  {
    "type": "substitution",
    "value": [{"component": [[{"type": "text", "value": "pwd"}]], "params": []}]
  }
]
```

Here is the example JSON structure:

```json
[
  {
    "component": [
      { "type": "text", "value": "cat" }
    ],
    "params": [
      [
        { "type": "text", "value": "file.txt" }
      ]
    ],
    "redirect": [
      { "type": "overwrite", "fd": "1", "value": [{"type": "text", "value": "output.txt"}] },
      { "type": "append", "fd": "1", "value": [{"type": "text", "value": "output.txt"}] },
      { "type": "input", "fd": "0", "value": [{"type": "text", "value": "output.txt"}] },
      { "type": "heredoc", "fd": "0", "value": [{"type": "text", "value": "Line 1\nLine 2\n"}] }
    ],
    "pipe": {
      "component": [
        { "type": "text", "value": "sort" }
      ],
      "params": [],
      "pipe": {
        "component": [
          { "type": "text", "value": "head" }
        ],
        "params": [
          [
            { "type": "text", "value": "-n" }
          ],
          [
            { "type": "text", "value": "10" }
          ]
        ]
      }
    }
  }
]
```

## Streams and Redirection Handling
- Each component operates on three streams: stdin, stdout, stderr.
- The parser interprets redirection operators and maps them to stream connections or file nodes.
- Stream merging and splitting (e.g., `2>&1`) is represented in the JSON tree with dedicated flags or nodes.

## Parser and Execution Engine
- A parser transforms Bash-like text input into the JSON tree structure (e.g., using JISON or a similar tool).
- The execution engine processes nodes:
  1. Execute sub-commands for command substitution.
  2. Wire up streams according to the tree (including redirection and file I/O).

## User Interface
- **Text-Based Interface**: Initial interface accepts Bash-style syntax and displays plain-text output.
- **Future GUI**: A drag-and-drop visual builder can leverage the same JSON structure to construct pipelines interactively.

## Web UI

The web interface will provide users with a flexible and intuitive way to build and run their pipelines. The UI will support both a graphical drag-and-drop mode and a text-based mode that resembles Bash syntax. Users can easily toggle between these modes, and the system will synchronize the configuration between them.

### Core Features of the Web UI:

1. **Drag-and-Drop Visual Builder**:
   - Users can visually create pipelines by dragging components onto a canvas and connecting them.
   - Each component block will represent a command with its own configuration options.

2. **Text-Based Mode**:
   - Users can switch to a text editor to define pipelines using Bash-like syntax.
   - The system will parse the text input into the internal JSON structure and keep both views in sync.

3. **Responsive Design for Mobile**:
   - On narrow screens or smartphone devices, the UI will adapt by using modals or full-screen overlays for configuration, ensuring a touch-friendly experience.

4. **Component Configuration**:
   - Each component has a set of options such as flags, parameters, and file redirections.
   - These will be presented in the UI as checkboxes for flags, input fields for text or numeric values, and dropdowns where appropriate.
   - Each option will include a help tooltip that shows what the option does.

5. **Custom Configuration UI**:
   - Components can optionally provide a special function to override the default configuration panel with a custom UI.

6. **Execution Feedback**:
   - When a pipeline is executed, the standard output and standard error streams will be displayed after execution.
   - If no redirection is applied, any errors will be clearly shown in the output section to help users diagnose issues.

7. **Component Descriptions**:
   - Each component will provide a description function that returns a brief explanation of its purpose.
   - Users can view these descriptions either as tooltips or in a searchable component library for better usability.

## Component Interface Requirements

Each component in the system will adhere to a standardized interface defined as follows:

1. **Main Execution Function**:
   - `main({stdin, env}) => {stdout, stderr, env}`
   This is the primary function for the component’s execution. It takes standard input and environment variables, and returns standard output, standard error, and updated environment variables.

2. **Description Function**:
   - `getDescription() => string`
   This function returns a short text description explaining what the component does. This description will be used in the UI for tooltips and documentation views.

3. **Options Function**:
   - `getOptions() => Array<optionSpec>`
   This function returns an array of optionSpec objects, each representing a configurable option or flag for the component. Each `optionSpec` object will have the following keys:
   - `key`: A unique identifier for the option.
   - `short_tag`: The short form of the option, like `-h`.
   - `long_tag`: The long form of the option, like `--help`.
   - `spec`: Defines whether the option is a `flag` (no value, just a toggle) or a `string` (a value input).
   - `help`: A string explaining what the option does.

4. **Custom Configuration UI (Optional)**:
   - `getCustomUI() => UIComponent` (optional)
   This optional function returns a custom UI component or configuration panel if the component requires a specialized interface beyond the standard options. If not provided, the default UI will be used.

This consistent interface ensures that each component can be easily integrated into the graphical UI and text-based pipeline definitions, and that all components remain modular and consistent.

---
This document serves as the blueprint for implementing the core framework. Subsequent documentation will detail the parser grammar, component API, and engine architecture.
