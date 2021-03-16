## se-reporting repo

## This application needs the stat-engine webapp in order to do its thing, since it hits the api

## To run locally
  - run `docker build -f Dockerfile --tag test-reporting:1.0 .`
  - run `docker run --name reportingTest test-reporting:1.0`

## When finished, make sure you shut down
  - in a second terminal, run `docker container stop reportingTest`
  - when the container stops, run `docker rm --force reportingTest` to clean up
