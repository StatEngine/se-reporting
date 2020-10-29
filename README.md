## To play with later.js
  - run `docker build -f Dockerfile.test --tag test-later:1.0 .`
  - run `docker run --name emailTest test-later:1.0`

## When finished laterjs testing
  - in a second terminal, run `docker container stop emailTest`
  - when the container stops, run `docker rm --force emailTest` to clean up