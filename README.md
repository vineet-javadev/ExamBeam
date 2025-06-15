# ExamBeam

ExamBeam is an AI-powered web application designed to help students prepare for exams at the last moment. Instantly generate MCQs, short answer, and long answer questions on any topic or chapter, get instant feedback, and review your recent searches—all in a fast, distraction-free interface.

## Features

- **AI-Generated Questions:** Instantly generate multiple-choice, short, or long-answer questions for any topic.
- **Exam Modes:** Switch between MCQ, short answer, and long answer modes.
- **Instant Feedback:** Submit your answers and receive instant evaluation and marks powered by AI.
- **Score Tracking:** Track your marks for each session.
- **Recent Topics:** Quickly revisit your recent searches and clear history when needed.
- **Motivational Taglines:** Stay motivated with rotating taglines while you study.
- **Responsive UI:** Clean, modern, and mobile-friendly design.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or above recommended)
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/vineet-javadev/ExamBeam.git
    cd exambeam
    ```
2. Install dependencies:
    ```bash
    npm install
    ```

### Development Server

Start the local development server:

```bash
ng serve
```

Open your browser and navigate to [http://localhost:4200/](http://localhost:4200/). The app will reload automatically if you change any source files.

### Building

To build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Configuration

- **API Key:** The app uses the Mistral AI API ( Free for Everyone ). You can set your API key in `src/key.ts`.
- **Environment:** All configuration files are in the `src/` directory.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## Acknowledgements

- [Angular](https://angular.dev/)
- [Mistral AI](https://mistral.ai/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ngx-markdown](https://github.com/jfcere/ngx-markdown)

---
Happy last-minute studying!
