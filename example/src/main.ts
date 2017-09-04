/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 Anton Kosiakov (https://twitter.com/akosyakov). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
window.onload = () => {
    const w = <any>window;
    // load Monaco code
    w.require(['vs/editor/editor.main'], () => {
        // load css Monaco contribution
        w.require([
            'vs/basic-languages/src/monaco.contribution',
            'vs/language/css/monaco.contribution',
            'vs/language/typescript/src/monaco.contribution'
        ], () => {
            // load client code
            require('./client');
        })
    });
};