const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('ffmpeg-static'));
const args = process.argv.slice(2)

const usage = 'Usage: node videojs-compress.js <input> [--mute] [--aspect-ratio 43|16:9]'

// Aceita "4:3"/"16:9" ou dígitos concatenados: 43 -> 4:3, 169 -> 16:9, 916 -> 9:16
function parseAspectRatio(value) {
  if (!value) return null

  let w = 0
  let h = 0

  if (/^\d+:\d+$/.test(value)) {
    ;[w, h] = value.split(':').map(Number)
  } else if (/^\d{2}$/.test(value)) {
    ;[w, h] = [...value].map(Number)
  } else if (/^\d{3}$/.test(value)) {
    // Larguras com 2 dígitos só chegam a 32 (ex.: 32:9); acima disso o formato é 9:16
    if (Number(value.slice(0, 2)) <= 32) {
      w = Number(value.slice(0, 2))
      h = Number(value[2])
    } else {
      w = Number(value[0])
      h = Number(value.slice(1))
    }
  } else if (/^\d{4}$/.test(value)) {
    w = Number(value.slice(0, 2))
    h = Number(value.slice(2))
  }

  return w > 0 && h > 0 ? [w, h] : null
}

let input = null
let mute = false
let aspectRatio = null

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--mute') {
    mute = true
  } else if (arg === '--aspect-ratio') {
    aspectRatio = args[++i]
  } else if (!arg.startsWith('--') && !input) {
    input = arg
  }
}

if (!input) {
  console.error(usage)
  process.exit(1)
}

const aspect = aspectRatio === null ? null : parseAspectRatio(aspectRatio)
if (aspectRatio !== null && !aspect) {
  if (aspectRatio === undefined) {
    console.error('Missing value for --aspect-ratio')
  } else {
    console.error(`Invalid --aspect-ratio: ${aspectRatio}`)
  }
  console.error(usage)
  process.exit(1)
}

const command = ffmpeg(input)
  .output(input + '-compress.mp4')
  .videoCodec('libx264') // Standard high-efficiency codec
  .outputOptions([
    '-crf 28',         // Quality: 18-28 is a good range (higher = smaller file)
    '-preset fast'     // Speed: tradeoff between compression time and file size
  ])

if (mute) command.noAudio()

if (aspect) {
  const [aw, ah] = aspect
  command.videoFilters([
    'scale=iw*sar:ih', // Normaliza pixels anamórficos antes do corte
    'setsar=1',
    {
      filter: 'crop',
      options: {
        w: `trunc(min(iw,ih*${aw}/${ah})/2)*2`,
        h: `trunc(min(ih,iw*${ah}/${aw})/2)*2`
      }
    }
  ])
}

command
  .on('end', () => console.log('Compression finished!'))
  .on('error', (err) => console.error('Error:', err))
  .run();
