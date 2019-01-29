// ==UserScript==
// @name         Tweet Tweaks
// @version      1.0
// @namespace    https://gitlab.com/faokryn/tweet-tweaks
// @description  Some opinionated tweaks for TweetDeck
// @author       Colin O'Neill <colin@faokryn.com>
// @match        https://tweetdeck.twitter.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let style = `
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
    let styleElem = document.createElement('style');

    let tweetObserver = new MutationObserver((mutList) => {
        mutList.forEach((mut) => {
            mut.addedNodes.forEach((node) => {
                if (node.tagName === "ARTICLE") {
                    markIfRetweet(node);
                }
            });
        });
    });
    let opt = {childList: true}; // remember, if more observations are added, it needs to be handled in callbacks

    function markIfRetweet(tweet) {
        if (tweet.querySelector('.nbfc').lastChild.wholeText === ' Retweeted  ') {
            tweet.classList.add('retweet');
        }
    }

    function observeTweets() {
        let chirpContainers = document.querySelectorAll('.chirp-container');
        if (chirpContainers.length) {
            chirpContainers.forEach((e) => {
                tweetObserver.observe(e, opt);
            });
            document.querySelectorAll('article.stream-item').forEach((e) => {
                markIfRetweet(e);
            });
        }
        else {
            window.setTimeout(observeTweets, 500);
        }
    }

    styleElem.setAttribute('type', 'text/css');
    styleElem.innerHTML = style;

    document.querySelector('html').classList.add('tweaked');
    document.querySelector('head').appendChild(styleElem);

    observeTweets();
})();
