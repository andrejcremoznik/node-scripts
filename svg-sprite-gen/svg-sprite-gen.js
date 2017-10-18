#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const SVGOLib = require('svgo')
const SVGO = new SVGOLib({
  floatPrecision: 2,
  multipass: true,
  plugins: [
    { cleanupIDs: true },
    { removeStyleElement: true },
    { removeScriptElement: true }
  ]
})

const inputDir = path.resolve(process.argv[2])
const outputFile = process.argv[3] ? path.resolve(process.argv[3]) : path.join(inputDir, 'symbols.svg')
const spritesClass = process.argv[4] ? process.argv[4] : 'symbols'

if (!fs.existsSync(inputDir)) {
  throw new Error(`==> Directory ${inputDir} doesn't exist`)
}

const readDirectory = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) throw err
      let svgs = files.filter(name => /\.svg$/.test(name))
      let includesOutput = svgs.indexOf(path.basename(outputFile))
      if (includesOutput > -1) {
        svgs.splice(includesOutput, 1)
      }
      if (svgs.length) resolve(svgs.map((svg) => path.join(dir, svg)))
      else reject(new Error(`==> No SVG files found in ${$dir}`))
    })
  })
}

const readFiles = (files) => {
  return Promise.all(files.map((file) => {
    return new Promise((resolve) => {
      fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
        if (err) throw err
        resolve({
          id: path.basename(file, '.svg'),
          data
        })
      })
    })
  }))
}

const optimizeSVGs = (input) => {
  return Promise.all(input.map((svg) => {
    return SVGO.optimize(svg.data).then((result) => {
      return {
        id: svg.id,
        svg: result.data
      }
    })
  }))
}

const parseSVGs = (input) => {
  return Promise.all(input.map((data) => {
    return new Promise((resolve, reject) => {
      xml2js.parseString(data.svg, (err, result) => {
        let {
          svg: {
            $: {
              width,
              height
            },
            ...elements
          }
        } = result
        resolve({ id: data.id, width, height, elements })
      })
    })
  }))
}

const buildSymbols = (symbolData) => {
  return Promise.all(symbolData.map((symbol) => {
    let svg = []
    let elements
    svg.push(`<symbol id="${symbol.id}" viewBox="0 0 ${symbol.width} ${symbol.height}">`)
    for (tag in symbol.elements) {
      symbol.elements[tag].forEach((el) => {
        let attrs = ''
        for (attr in el.$) {
          attrs += `${attr}="${el.$[attr]}" `
        }
        svg.push(`<${tag} ${attrs}/>`)
      })
    }
    svg.push(`</symbol>`)
    return Promise.resolve(svg.join(''))
  }))
}

const writeSymbolsFile = (symbols) => {
  symbols.splice(0, 0, `<svg xmlns="http://www.w3.org/2000/svg" class="${spritesClass}">`)
  symbols.push(`</svg>`)
  fs.writeFile(outputFile, symbols.join("\n"), (err) => {
    if (err) throw err
    console.log(`==> Sprite written to ${outputFile}`)
  })
}

readDirectory(inputDir)
  .then(readFiles)
  .then(optimizeSVGs)
  .then(parseSVGs)
  .then(buildSymbols)
  .then(writeSymbolsFile)
  .catch((err) => {
    throw err
  })
