// let wsList = {}
'use strict'
let [BASH, TERM] = ['bash', 'xterm']
const { spawn, spawnSync } = require('child_process')
const readline = require('readline')
import { ipcRenderer } from 'electron'

const nill = () => null

import { warn } from './notify'

export const username = require('os').userInfo().username

if (process.platform === 'win32') {
  BASH = 'bash.bat'
  TERM = BASH // for windows user bash as a terminal
}

const getbkitlocation = () => ipcRenderer.sendSync('getbkitPath')

export function winInstall (events = {}) {
  if (process.platform !== 'win32') return
  try {
    const {
      onclose = nill,
      onerror = nill,
      onexit = nill,
      onreaddata = nill,
      onreaderror = nill
    } = events
    const bKitPath = getbkitlocation()
    const fd = spawn(
      'CMD',
      ['/C', 'setup.bat'],
      { cwd: bKitPath, windowsHide: false }
    )
    fd.on('close', onclose)
    fd.on('error', onerror)
    fd.on('exit', onexit)
    fd.stdout.on('data', onreaddata)
    fd.stderr.on('data', onreaderror)
  } catch (err) {
    console.error(err)
  }
}

export function bkitping (msg) {
  try {
    const bKitPath = getbkitlocation()
    // if (!isBkitClintInstalled(bKitPath)) return undefined
    console.log('bkitping on', bKitPath)
    const result = spawnSync(BASH, ['./bash.sh', 'echo', msg], { cwd: bKitPath, windowsHide: true })
    return result.stdout.toString().replace(/(\r|\n|\s)*$/, '')
  } catch (err) {
    console.warn('bKitping fail:', err)
    return undefined
  }
}

export function shell () {
  const bKitPath = getbkitlocation()
  const fd = spawn(
    TERM,
    [],
    { cwd: bKitPath, windowsHide: false, detached: true, stdio: 'ignore' }
  )
  fd.unref()
}

// Spawn a bash script
function _bash (name, args, events = {}, done = nill) {
  const warn = (err) => console.warn(`Received on stderr from bash script ${name}: ${err}`)

  const { onreadline = nill, onerror = nill, stderr = warn, oncespawn = nill } = events

  console.log(`Spawn ${name} with args`, args)
  const bKitPath = getbkitlocation()
  const fd = spawn(
    BASH,
    ['./run.sh', name, ...args],
    { cwd: bKitPath, windowsHide: true, windowsVerbatimArguments: false }
  )

  fd.on('close', (code) => {
    console.log(`Done spawn ${name} with args`, args)
    if (code) console.log(`Return code ${code} is NOT ok`)
    done(code)
  })

  fd.on('error', onerror)

  fd.on('exit', err => {
    err = 0 | err
    if (err !== 0) {
      const params = args.join(' ')
      onerror(`Call to '${name} ${params}' exit with code ${err}`)
      rl.close()
    }
  })

  fd.on('disconnect', err => {
    console.log('Disconnect', err)
  })
  const rl = readline.createInterface({
    input: fd.stdout,
    output: fd.stdin
  })
  rl.on('line', onreadline)

  fd.stderr.on('data', err => {
    const error = `${err}`
    const result = stderr(error)
    if (result === 'stop') { // if receive a stop from upper layers
      done() // send a empty done
      done = nill // and disable aditional dones
      fd.kill() // also kill the process
    }
  })
  oncespawn(fd)
}

export function bash (scriptname, args = [], events = {}) {
  const {
    onclose = () => console.log('Close', scriptname),
    onreadline = () => false,
    onerror = (err) => warn(`Error calling script ${scriptname}: ${err}`, true)
  } = events
  return _bash(scriptname, args, { ...events, onreadline, onerror }, onclose)
}

// Provide a promise to invoke bash
export function asyncBash (name, args = [], events = {}) {
  const lines = []
  const { onreadline = line => lines.push(line) } = events
  return new Promise((resolve, reject) => {
    const done = () => resolve(lines)
    const onerror = reject
    _bash(name, args, { ...events, onreadline, onerror }, done)
  })
}

export function killtree (pid) {
  return new Promise((resolve, reject) => {
    _bash('./killtree.sh', [pid], { onerror: reject }, resolve)
  })
}
