# Basketball Contract Generator

A professional basketball player contract generator application built with React and Vite.

## Features

- Generate professional basketball player contracts
- Customizable player information
- Flexible payment schedule
- Optional team and player buyout clauses
- Export contracts as DOCX files

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd basketball-contract-generator
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

Fill in the form with player details, contract terms, and payment schedule, then click "Generate Contract" to download a professional contract document.

## Tech Stack

- React 19
- Vite
- Docxtemplater for document generation
- PizZip for handling .docx files
- file-saver for downloads
