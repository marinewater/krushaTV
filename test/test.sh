#!/bin/sh
SCRIPT_PATH=`pwd`/`dirname $0`
${SCRIPT_PATH}/../node_modules/karma/bin/karma start ${SCRIPT_PATH}/angular.test.js
mocha ${SCRIPT_PATH}/mocha/