# Generate a sprite from a folder of SVGs

**What are SVG sprites**

SVG sprites are reusable graphics defined as `<symbol id="gfx">` in an SVG and can be used in documents by id reference; `<svg><use xlink:href="#gfx" />`.

This script will parse a folder with SVGs, run them through SVGO (optimizer) and write them to an SVG sprite file.

**Installation**

Instructions are for Linux but should also work on Macs. NodeJS is required.

You need to configure a user writeable global npm directory (e.g. `node` inside your home) and a directory for executable scripts (e.g. `bin`). Those need to be in the `$PATH` so that the apps are usable from command line. Install SVGO globally, download this script and make it executable.
  ```
  mkdir ~/{node,bin}
  npm config set prefix ~/node
  echo "PATH=$HOME/bin:$HOME/node/bin:$PATH" >> .bashrc
  echo "export NODE_PATH=$HOME/node/lib/node_modules" >> .bashrc
  source .bashrc
  npm i -g svgo # release 0.7.2 is bugged, try npm i -g svg/svgo#master
  curl -O ~/bin/svg-sprite-gen.js https://raw.githubusercontent.com/andrejcremoznik/node-scripts/svg-sprite-gen/svg-sprite-gen.js
  chmod u+x ~/bin/svg-sprite-gen.js
  ```

**Input SVG requirements**

This has been tested with SVGs crafted in a certain way;

1. Created using Inkscape
2. 1 symbol per file
3. Shapes making up the symbol (paths, circles, rectangles...) have to be immediate root descendants (open XML editor and ungroup everything, including the layer group)
4. Documents should use pixel units
5. Canvas dimensions should be large (1000x1000px) even for simple shapes for better compression by avoiding long float precision
6. File name will be used as the ID for the `<symbol>`

If unsure, have a look at the included example input SVG.

**Usage**

```
svg-sprite-gen.js Input/SVG/Folder [Output/File.svg] [className]
```

* If output is omitted, the sprite will be saved as `symbols.svg` inside the input folder.
* className can be used to set a class on the symbols wrapping svg tag.
