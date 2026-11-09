const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const args = process.argv.slice(2)

const usage = 'Usage: node imagejs-compress.js <input> [--quality 1-100] [--format jpeg|png|webp|avif] [--width <px>] [--height <px>] [--output <path>]'

function parseArgs(args) {
  const options = {
    input: null,
    quality: 80,
    format: null,
    width: null,
    height: null,
    output: null
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--quality') {
      options.quality = Number(args[++i])
    } else if (arg === '--format') {
      options.format = args[++i]
    } else if (arg === '--width') {
      options.width = Number(args[++i])
    } else if (arg === '--height') {
      options.height = Number(args[++i])
    } else if (arg === '--output') {
      options.output = args[++i]
    } else if (!arg.startsWith('--') && !options.input) {
      options.input = arg
    }
  }

  return options
}

const options = parseArgs(args)

if (!options.input) {
  console.error(usage)
  process.exit(1)
}

if (!fs.existsSync(options.input)) {
  console.error(`File not found: ${options.input}`)
  process.exit(1)
}

if (options.quality < 1 || options.quality > 100) {
  console.error(`Invalid --quality: ${options.quality} (must be 1-100)`)
  process.exit(1)
}

const validFormats = ['jpeg', 'png', 'webp', 'avif']
if (options.format && !validFormats.includes(options.format)) {
  console.error(`Invalid --format: ${options.format} (must be one of: ${validFormats.join(', ')})`)
  process.exit(1)
}

function getOutputPath(input, format, explicitOutput) {
  if (explicitOutput) return explicitOutput
  const parsed = path.parse(input)
  const outExt = format ? '.' + format : parsed.ext
  return path.join(parsed.dir, parsed.name + '-compress' + outExt)
}

async function compressImage() {
  const outputPath = getOutputPath(options.input, options.format, options.output)
  const ext = path.extname(options.input).slice(1).toLowerCase()
  const targetFormat = options.format || (ext === 'jpg' ? 'jpeg' : ext)

  let pipeline = sharp(options.input)

  // Redimensiona preservando o aspect-ratio (fit: inside)
  if (options.width || options.height) {
    pipeline = pipeline.resize({
      width: options.width || undefined,
      height: options.height || undefined,
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  // Aplica compressão por formato
  switch (targetFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: options.quality, mozjpeg: true })
      break
    case 'png':
      pipeline = pipeline.png({ quality: options.quality, compressionLevel: 9 })
      break
    case 'webp':
      pipeline = pipeline.webp({ quality: options.quality })
      break
    case 'avif':
      pipeline = pipeline.avif({ quality: options.quality })
      break
    default:
      console.error(`Unsupported format: ${targetFormat}`)
      process.exit(1)
  }

  const info = await pipeline.toFile(outputPath)
  const inputSize = fs.statSync(options.input).size
  const outputSize = fs.statSync(outputPath).size
  const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1)

  console.log('Compression finished!')
  console.log(`  Input:  ${options.input} (${(inputSize / 1024).toFixed(1)} KB)`)
  console.log(`  Output: ${outputPath} (${(outputSize / 1024).toFixed(1)} KB)`)
  console.log(`  Size:   ${info.width}x${info.height}`)
  console.log(`  Saved:  ${reduction}%`)
}

compressImage().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
