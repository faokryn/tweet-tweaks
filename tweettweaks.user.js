// ==UserScript==
// @name         Tweet Tweaks
// @version      1.0.1
// @namespace    https://gitlab.com/faokryn/tweet-tweaks
// @description  Some opinionated tweaks for TweetDeck
// @author       Colin O'Neill <colin@faokryn.com>
// @match        https://tweetdeck.twitter.com/
// @grant        none
// ==/UserScript==

function awaitSelector(selector) {
    return new Promise((resolve, reject) => {
        try {
            const results = this.querySelector(selector);
            let observer;

            if (results) {
                resolve(results);
            }

            observer = new MutationObserver((mutations) => {
                const results = this.querySelector(selector);

                if (results) {
                    observer.disconnect();
                    resolve(results);
                }
            });
            observer.observe(this, {childList: true, subtree: true});
        }
        catch (exception) {
            reject(exception);
        }
    });
}

function awaitSelectorAll(selector) {
    return new Promise((resolve, reject) => {
        try {
            const results = this.querySelector(selector);
            let observer;

            if (results && results.length) {
                resolve(results);
            }

            observer = new MutationObserver((mutations) => {
                const results = this.querySelectorAll(selector);

                if (results && results.length) {
                    observer.disconnect();
                    resolve(results);
                }
            });
            observer.observe(this, {childList: true, subtree: true});
        }
        catch (exception) {
            reject(exception);
        }
    });
}

Document.prototype.awaitSelector = awaitSelector;
Document.prototype.awaitSelectorAll = awaitSelectorAll;
Element.prototype.awaitSelector = awaitSelector;
Element.prototype.awaitSelectorAll = awaitSelectorAll;

(function() {
    'use strict';

    const style = `
        html.tweaked section.column {
            width: 600px;
        }

        html.tweaked article.stream-item.retweet {
            background: repeating-linear-gradient(
                315deg,
                rgba(0,0,0,0),
                rgba(0,0,0,0) 10px,
                #e1e8ed 10px,
                #e1e8ed 20px
            );
        }

        html.dark.tweaked article.stream-item.retweet {
            background: repeating-linear-gradient(
                315deg,
                rgba(0,0,0,0),
                rgba(0,0,0,0) 10px,
                #1c2938 10px,
                #1c2938 20px
            );
        }


        html.tweaked .media-size-large,
        html.tweaked .media-size-large-height {
            height: 560px;
        }

        html.tweaked .js-media {
            padding: 0 20px 20px 20px;
        }

        html.tweaked .js-media.detail-preview {
            padding: 0;
        }

        html.tweaked div.media-caret {
            display: none;
        }

        html.tweaked .media-item.media-size-large:after,
        html.tweaked .media-size-large-height:after {
            background-image: none;
        }
    `
    const styleElem = document.createElement('style');
    const tweetObserver = new MutationObserver((mutList) => {
        mutList.forEach((mut) => {
            mut.addedNodes.forEach((node) => {
                if (node.tagName === "ARTICLE") {
                    markIfRetweet(node);
                }
            });
        });
    });
    const opt = {childList: true}; // remember, if more observations are added, it needs to be handled in callbacks

    const markIfRetweet = (tweet) => {
        if (tweet.querySelector('.nbfc').lastChild.wholeText === ' Retweeted  ') {
            tweet.classList.add('retweet');
        }
    }

    styleElem.setAttribute('type', 'text/css');
    styleElem.innerHTML = style;

    document.querySelector('html').classList.add('tweaked');
    document.querySelector('head').appendChild(styleElem);

    document.awaitSelectorAll('.chirp-container').then((chirpContainers) => {
        chirpContainers.forEach((c) => {
            tweetObserver.observe(c, opt);
            c.querySelectorAll('article.stream-item').forEach((t) => markIfRetweet(t));
        });
    });
})();
