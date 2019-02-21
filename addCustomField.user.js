// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://tweetdeck.twitter.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function promiseSelect(sel, fn) {
        let result = document.querySelectorAll(sel);
        if (result[0]) {
            fn(result);
        }
        else {
            window.setTimeout(promiseSelect.bind(this, sel, fn), 200);
        }
    }

    promiseSelect('a[data-action=settings-menu]', (settingsMenuBtn) => {
        settingsMenuBtn[0].addEventListener('click', (evt) => {
            promiseSelect('a[data-action=globalSettings]', (globalSettingsBtn) => {
                globalSettingsBtn[0].addEventListener('click', (evt) => {
                    promiseSelect('#general_settings div.js-column-size', (colOpts) => {
                        let label = document.createElement('label');
                        let radioInput = document.createElement('input');
                        let textInput = document.createElement('input');

                        label.className = 'fixed-width-label radio';

                        radioInput.className = 'js-settings-radio js-column-size-radio touch-larger-label';
                        radioInput.setAttribute('type', 'radio');
                        radioInput.setAttribute('name', 'column-size');
                        radioInput.setAttribute('value', 'custom');

                        textInput.className = 'fixed-width-label';
                        textInput.setAttribute('type', 'text');

                        label.innerHTML = 'Custom';
                        label.appendChild(radioInput);
                        colOpts[0].appendChild(label);
                        colOpts[0].appendChild(textInput);
                    });
                });
            });
        });
    });
})();