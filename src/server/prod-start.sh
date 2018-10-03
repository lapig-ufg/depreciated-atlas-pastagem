#!/bin/bash
export NODE_ENV=prod; nohup node app-atlas-cluster.js &> app.out &
