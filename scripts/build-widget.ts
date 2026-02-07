import * as esbuild from 'esbuild'
import { resolve } from 'path'

async function buildWidget() {
  try {
    console.log('Building widget...')

    const result = await esbuild.build({
      entryPoints: [resolve(process.cwd(), 'src/widget/index.ts')],
      bundle: true,
      minify: true,
      outfile: resolve(process.cwd(), 'public/widget/muchlove-widget.js'),
      format: 'iife',
      target: ['es2020'],
      platform: 'browser',
      metafile: true,
    })

    // Calculate bundle size
    const bundleSize = Object.values(result.metafile?.outputs || {}).reduce(
      (acc, output) => acc + output.bytes,
      0
    )
    const sizeInKB = (bundleSize / 1024).toFixed(2)

    console.log(`✓ Widget built successfully!`)
    console.log(`  Bundle size: ${sizeInKB} KB`)

    if (bundleSize > 20 * 1024) {
      console.warn(`⚠ Warning: Bundle size (${sizeInKB} KB) exceeds 20 KB target`)
    }
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildWidget()
