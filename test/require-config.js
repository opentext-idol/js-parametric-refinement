/*
 * Copyright 2015-2017 Open Text.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Open Text and its affiliates
 * and licensors ("Open Text") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Open Text shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

require.config({
    baseUrl: '.',
    paths: {
        backbone: 'node_modules/backbone/backbone',
        fieldtext: 'node_modules/hp-autonomy-fieldtext-js/src',
        jquery: 'node_modules/jquery/dist/jquery',
        moment: 'node_modules/moment/moment',
        peg: 'node_modules/pegjs/peg-0.10.0',
        text: 'node_modules/requirejs-text/text',
        underscore: 'node_modules/underscore/underscore'
    },
    shim: {
        peg: {
            exports: 'PEG'
        }
    }
});
