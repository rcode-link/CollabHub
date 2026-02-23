#!/usr/bin/env node
/**
 * Convert relative imports to @/ alias in all .vue, .js, .ts files under resources/js/.
 *
 * A relative import is converted only if it resolves to a path inside resources/js/.
 * Third-party bare imports (e.g. 'vue', 'axios', 'lodash') are never touched.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const JS_ROOT = path.join(ROOT, 'resources/js')

// Find all .vue, .js, .ts files under resources/js
const files = execSync(
  `find "${JS_ROOT}" -type f \\( -name "*.vue" -o -name "*.js" -o -name "*.ts" \\)`,
  { encoding: 'utf8' }
)
  .split('\n')
  .filter(Boolean)

let totalChanges = 0

for (const file of files) {
  const fileDir = path.dirname(file)
  const original = fs.readFileSync(file, 'utf8')

  const updated = original.replace(
    // Match: import ... from './...' or import('./...')
    /(['"])(\.\.?\/[^'"]+)(['"])/g,
    (match, q1, rel, q2) => {
      // Resolve absolute path relative to the current file
      const abs = path.resolve(fileDir, rel)

      // Only convert if it resolves inside resources/js
      if (!abs.startsWith(JS_ROOT + path.sep) && abs !== JS_ROOT) {
        return match
      }

      // Produce @/ alias
      const alias = '@/' + path.relative(JS_ROOT, abs).replace(/\\/g, '/')
      return `${q1}${alias}${q2}`
    }
  )

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8')
    const count = (original.match(/(['"])(\.\.?\/[^'"]+)(['"])/g) || []).length
    console.log(`✓ ${path.relative(ROOT, file)}  (${count} import(s))`)
    totalChanges++
  }
}

console.log(`\nDone. ${totalChanges} file(s) updated.`)
