import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = dirname(fileURLToPath(import.meta.url))
const sourcePath = resolve(rootDirectory, 'Docs', 'CONTEXT.md')
const outputDirectory = resolve(rootDirectory, 'public', 'contexto')

await mkdir(outputDirectory, { recursive: true })
await Promise.all([
  copyFile(sourcePath, resolve(outputDirectory, 'context.md')),
  copyFile(sourcePath, resolve(outputDirectory, 'context.txt')),
])