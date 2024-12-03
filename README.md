# ST-Prime: Streamlit PrimeVue Components

A modern Streamlit Components library that brings PrimeVue components to Streamlit. Built with Vue 3, Vite, and TypeScript, it offers a rich set of UI components for building beautiful Streamlit applications.

## Features

- 🎨 PrimeVue Components integration
- ⚡️ Vue 3 + Vite + TypeScript
- 🧪 End-to-end tests with Playwright
- 📦 Modern dependency management with uv
- 🚀 GitHub Actions CI/CD
- 🎯 Type-safe development

## Prerequisites

- Python 3.9+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) for Python dependency management

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/choinhet/st-prime/
cd st-prime
```

2. Install Python dependencies with uv:
```bash
uv sync
```

3. Install frontend dependencies:
```bash
cd st_prime/frontend
npm install
```

4. Start the development servers:

In one terminal (frontend):
```bash
cd st_prime/frontend
npm run dev
```

In another terminal (Streamlit):
```bash
cd st_prime
uv run streamlit run example.py
```

## Testing

The project includes end-to-end tests (Playwright).

### E2E Tests

```bash
cd st_prime/frontend
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run tests with Playwright UI
npm run test:e2e:debug    # Run tests in debug mode
npm run test:codegen      # Generate tests with Playwright Codegen
```

## CI/CD

The project uses GitHub Actions for continuous integration. On each push and pull request to the main branch, it:
- Installs dependencies
- Runs E2E tests
- Generates and uploads test reports

## Project Structure

```
st_prime/
├── frontend/              # Vue frontend
│   ├── src/               # Source files
│   ├── tests/             # Test files
│   │   └── e2e/           # Playwright tests
│   └── package.json       # Frontend dependencies
├── pyproject.toml         # Python project configuration
└── example.py             # Example Streamlit app
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE) - See LICENSE file for detailsVitest and 
