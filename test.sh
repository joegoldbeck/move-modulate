#!/bin/bash

# Runs the mocha tests

mocha --check-leaks --reporter spec $(find test -name "*.js")
