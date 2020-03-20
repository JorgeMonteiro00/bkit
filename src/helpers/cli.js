const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'bKit> '
})

export default function () {
  rl.prompt()

  rl.on('line', (line) => {
    switch (line.trim()) {
      case 'hello':
        console.log('world!')
        break
      default:
        console.log(`Say what? I might have heard '${line.trim()}'`)
        break
    }
    rl.prompt()
  }).on('close', () => {
    console.log('Have a great day!')
  })
}