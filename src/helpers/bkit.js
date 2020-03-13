// let wsList = {}
let [BASH, TERM] = ['bash', 'xterm']
let username = require('os').userInfo().username
const { spawn, execSync } = require('child_process')
const readline = require('readline')
const { ipcRenderer } = require('electron')
import queue from 'async/queue'

if (process.platform === 'win32') {
  try {
    execSync('NET SESSION')
    BASH = 'sbash.bat'
    username = 'SYSTEM'
  } catch {
    BASH = 'bash.bat'
  }
  TERM = BASH // for windows user bash as a terminal
}

const bKitPath = ipcRenderer.sendSync('getbKitPath')

import { Notify } from 'quasar'

export function user () {
  return username
}

function invoke ({ name, args, onreadline, onerror }, done) {
  const fd = spawn(
    BASH,
    [name, ...args],
    { cwd: bKitPath, windowsHide: true }
  )
  fd.on('close', (code) => {
    done(code)
  })
  const rl = readline.createInterface({
    input: fd.stdout,
    output: process.stdout
  })
  rl.on('line', onreadline)
  fd.stderr.on('data', onerror)
}

export function shell () {
  const fd = spawn(
    TERM,
    [],
    { cwd: bKitPath, windowsHide: false, detached: true, stdio: 'ignore' }
  )
  fd.unref()
}

const invokequeue = queue(invoke)

export function bash (scriptname, args, {
  onclose = () => console.log('Close', scriptname),
  onreadline = () => {},
  onerror = (err) => {
    console.error(`Error calling script ${scriptname}: ${err}`)
    Notify.create({
      message: `${scriptname}: ${err}`,
      multiline: true,
      icon: 'warning'
    })
  }
}, q = invokequeue) {
  // console.log('q=', q)
  q.push({ name: scriptname, args, onreadline, onerror }, onclose)
  return null
}

/* ------------------- */

// const terminate = require('terminate')

// export function stop (process) {
//   if (process && process.bkitclosed) {
//     console.log('Process already closed')
//     return
//   }
//   if (!process) {
//     console.error('Process cannot be null or undefined')
//     return
//   }
//   terminate(process.pid, (err) => {
//     if (err) {
//       console.error('Oopsy: ' + err)
//     } else {
//       console.log('Process stop done')
//     }
//   })
// }
// Windows workaroud to kill a process
// var spawn = require('child_process').spawn
// spawn("taskkill", ["/pid", child.pid, '/f', '/t']);
// export function remove (url) {
//   delete wsList[url]
// }
// export function get (url) {
//   return wsList[url]
// }

const path = require('path')
// <f+++++++++|2020/02/22-16:05:08|99|/home/jvv/projectos/bkit/apps/webapp.oldversion/.eslintignore
const regexpNewFile = /^[><]f[+]{9}[|]([^|]*)[|]([^|]*)[|]([^|]*)/
const regexpNewDir = /^cd[+]{9}[|]([^|]*)[|]([^|]*)[|]([^|]*)/
const regexpChgDir = /^[.]d.{9}[|]([^|]*)[|]([^|]*)[|]([^|]*)/
// <f.st......|2020/02/23-18:24:04|1652|/home/jvv/projectos/bkit/apps/client/package.json
// <f..t......
const regexpChgFile = /^[><]f.(?:s.|.t).{6}[|]([^|]*)[|]([^|]*)[|]([^|]*)/
const regexpDelete = /^[*]deleting\s*[|]([^|]*)[|]([^|]*)[|]([^|]*)/

const [isnew, wasmodified, wasdeleted] = [true, true, true]

export function onRsyncLine ({
  newFile = () => false,
  newDir = () => false,
  chgFile = () => false,
  chgDir = () => false,
  deleted = () => false,
  newLink = () => false,
  newHlink = () => false
}, done = () => false) {
  const match = (line, exp, dispatch) => {
    const isaMatch = line.match(exp)
    if (isaMatch) {
      dispatch(isaMatch[3])
      return true
    }
    return false
  }
  const isnewfile = (filename) => {
    newFile({ name: path.basename(filename), path: filename, isnew, isfile: true })
  }
  const isnewdir = (filename) => {
    newDir({ name: path.basename(filename), path: filename, isnew, isdir: true })
  }
  const filechanged = (filename) => {
    chgFile({ name: path.basename(filename), path: filename, wasmodified, isfile: true })
  }
  const dirchanged = (filename) => {
    chgDir({ name: path.basename(filename), path: filename, wasmodified, isdir: true })
  }
  const entrydeleted = (filename) => {
    deleted({ name: path.basename(filename), path: filename, wasdeleted })
  }
  const onreadline = (line) => {
    console.log('Read Line:', line)
    if (!match(line, regexpNewFile, isnewfile) &&
      !match(line, regexpChgFile, filechanged) &&
      !match(line, regexpNewDir, isnewdir) &&
      !match(line, regexpChgDir, dirchanged) &&
      !match(line, regexpDelete, entrydeleted)) {
      console.log('Is something else:', line)
    }
  }
  return {
    onclose: done,
    onreadline
  }
}

export function dkit (args, events, done = () => console.log('dkit done')) {
  // console.log('events', events)
  const actions = onRsyncLine(events, done)
  // const args = ['--no-recursive', '--delete', '--dirs', `${fullpath}`]
  const fullargs = ['--no-recursive', '--dirs', ...args]
  bash('./dkit.sh', fullargs, actions)
}

const regexpList = /([a-z-]+)\s+([0-9,]+)\s+([0-9/]+)\s+([0-9:]+)\s+(.+)/
const onbackup = true
export function listdirs (args, entry, done = () => console.log('List dirs done')) {
  console.log(`Invoke listdir for ${args[0]}`)
  bash('./listdirs.sh', args, {
    onclose: done,
    onreadline: (data) => {
      console.log('Listdir:', data)
      const match = data.match(regexpList)
      if (match && match[5] !== '.') { // only if not current directory
        const name = match[5]
        const fullname = path.join(args[0], name)
        const isdir = match[1].startsWith('d')
        const isregular = match[1].startsWith('-')
        const date = `${match[3]} ${match[4]}`
        const size = match[2]
        entry({ name, onbackup, path: fullname, isdir, isregular, date, size })
      }
    }
  })
}

const _dkit = ({ path, events, name }, done) => {
  console.log(name, path)
  dkit(path, events, done)
}

const _listdirs = ({ args, events, name }, done) => {
  console.log(name, args[0])
  listdirs(args, events, done)
}

function makeQueue (action, name) {
  const q = queue(action)
  return function (args, events,
    done = () => false,
    discard = () => console.log(`${name}: ${args[0]} already in queue`)
  ) {
    const items = [...q]
    if (items.some(item => item.path === args[0])) {
      discard(name, args[0])
    } else {
      q.push({ args, events, name }, done)
    }
  }
}

export function enqueuedkit (name = 'dKit') {
  return makeQueue(_dkit, name)
}

export function enqueueListdir (name = 'ListDir') {
  return makeQueue(_listdirs, name)
}
