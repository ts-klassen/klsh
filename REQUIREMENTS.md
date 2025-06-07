# Web Application Requirements Document

## Project Overview
We are building a web-based application that emulates the flexibility of Bash pipelines, allowing users to define modular components and connect them into complex data flows. The framework will handle standard input, output, and error streams, support file operations via the browser's File API, and enable both text-based and eventual GUI-driven interfaces using a consistent JSON structure.

## Core Features and Requirements
1. **Components and Pipelines**
   - Users can define reusable components, each performing a specific function (e.g., `cat`, `sort`, `head`, `tail`).
   - Components can be chained into pipelines where the output of one feeds into the next.
   - Branching pipelines are supported: a single component's output can connect to multiple downstream components.
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
5. **Background Execution**
   - Support background execution of components using symbols like `&`.
   - Track background processes and their states within the framework.

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
[{
  "component": [
    { "type": "text", "value": "cat" }
  ],
  "params": [
    [
      { "type": "text", "value": "file.txt" }
    ]
  ],
  "outputs": [
    {
      "component": [
        { "type": "text", "value": "sort" }
      ],
      "params": [],
      "outputs": [
        {
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
        },
        {
          "component": [
            { "type": "text", "value": "tail" }
          ],
          "params": [
            [
              { "type": "text", "value": "-n" }
            ],
            [
              { "type": "text", "value": "5" }
            ]
          ]
        }
      ]
    },
    {
      "component": [
        { "type": "text", "value": "tee" }
      ],
      "params": [
        [
          { "type": "text", "value": "error.log" }
        ]
      ],
      "append": false,
      "isError": true,
      "outputs": [
        {
          "component": [
            { "type": "text", "value": "error_handler" }
          ],
          "params": []
        }
      ]
    }
  ]
}]
```

## Streams and Redirection Handling
- Each component operates on three streams: stdin, stdout, stderr.
- The parser interprets redirection operators and maps them to stream connections or file nodes.
- Merging and splitting of streams is handled in the JSON tree via specific flags or branch nodes.

## Parser and Execution Engine
- A parser transforms Bash-like text input into the JSON tree structure (e.g., using JISON or a similar tool).
- The execution engine processes nodes:
  1. Execute sub-commands for command substitution.
  2. Wire up streams according to the tree (including branching, redirection, and file I/O).
  3. Handle background processes asynchronously when `&` is specified.

## User Interface
- **Text-Based Interface**: Initial interface accepts Bash-style syntax and displays plain-text output.
- **Future GUI**: A drag-and-drop visual builder can leverage the same JSON structure to construct pipelines interactively.

---
This document serves as the blueprint for implementing the core framework. Subsequent documentation will detail the parser grammar, component API, and engine architecture.
