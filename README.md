# OpenText Parametric Refinement

Parametric refinement Backbone components

Documentation can be found [here](http://opentext-idol.github.io/js-parametric-refinement).

## Usage
    bower install hp-autonomy-js-parametric-refinement

This repo exposes two Backbone Collections. The selected values collection represents the parametric field values which
the user has selected, and the display collection takes this collection and combines it with a collection of values
available on the server in order to back a View.

## Is it any good?
Yes!

## Contributing
This repo uses git-flow: develop is the development branch, and master is the last known good branch.

Available grunt tasks:
* grunt test : Runs the Jasmine tests in Phantom JS
* grunt coverage : Generates code coverage statistics
* grunt doc : Generates project documentation
* grunt lint : Runs js-hint
* grunt watch-test : Watches for changes and runs the tests
* grunt server : Starts a server on localhost:8000 which can be used to view documentation and run Jasmine tests in the browser
* grunt watch-doc : Watches for changes and regenerates the documentation
* grunt watch-build-test : Watches for changes and regenerates the spec runner

## License

Copyright 2015-2017 OpenText or one of its affiliates.

Licensed under the MIT License (the "License"); you may not use this project except in compliance with the License.
