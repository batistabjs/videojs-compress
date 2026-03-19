const ffmpeg = require('fluent-ffmpeg');
const args = process.argv.slice(2)

ffmpeg(args[0])
  .output(args[0]+'-compress.mp4')
  .videoCodec('libx264') // Standard high-efficiency codec
  .outputOptions([
    '-crf 28',         // Quality: 18-28 is a good range (higher = smaller file)
    '-preset fast'     // Speed: tradeoff between compression time and file size
  ])
  .on('end', () => console.log('Compression finished!'))
  .on('error', (err) => console.error('Error:', err))
  .run();

