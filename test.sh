#!/bin/bash

rm -rf tmp
mkdir tmp

# too few arguments
node index . example > /dev/null 2>&1
[[ $? = 0 ]] && exit 1
# unknown options
node index . example tmp/p --unknown > /dev/null 2>&1
[[ $? = 0 ]] && exit 1
# unknown protocol
node index . example tmp/p --protocol=unknown > /dev/null 2>&1
[[ $? = 0 ]] && exit 1
# template dir not found
node index . not_exist tmp/p > /dev/null 2>&1
[[ $? = 0 ]] && exit 1
# existing dir
node index . example tmp > /dev/null 2>&1
[[ $? = 0 ]] && exit 1

set -e

node index . example tmp/p1
node index . example/public tmp/p2
node index ./example . tmp/deeply/nested/p3
node index . example/public/index.html tmp/index.html