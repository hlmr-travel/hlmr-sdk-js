#!/bin/bash
# Add .js extensions to relative imports in ESM dist files
# Required for Node.js ESM resolution (strict mode)
find dist/esm -name '*.js' -exec sed -i '' \
  -e "s/from '\.\(\.\/[^']*\)'/from '.\1.js'/g" \
  -e "s/from '\.\(\/[^']*\)'/from '.\1.js'/g" \
  {} +

echo "Fixed ESM imports in dist/esm/"
