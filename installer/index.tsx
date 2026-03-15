import React from 'react'
import { render } from 'ink'
import App from './App.js'

const rootDir = process.argv[2]
if (!rootDir) {
  console.error('Usage: tsx index.tsx <root-dir>')
  process.exit(1)
}

const { waitUntilExit } = render(<App rootDir={rootDir} />)
await waitUntilExit()
