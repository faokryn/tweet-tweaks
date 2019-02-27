// ==UserScript==
// @name         Tweet Tweaks
// @version      1.1.0
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

    const markIfRetweet = (tweet) => {
        if (tweet.querySelector('.nbfc').lastChild.wholeText === ' Retweeted  ') {
            tweet.classList.add('retweet');
        }
    }

    const addBookmark = (tweet) => {
        const timeElem = tweet.querySelector('time');
        const time = timeElem.getAttribute('data-time');
        const bookmarkBtn = document.createElement('i');
        const getCookie = () => document.cookie.split(';').filter(e => ~e.trim().indexOf('tweet-tweaks-bookmark='))[0];

        // insert bookmark button
        bookmarkBtn.className = 'icon icon-bookmark bookmark-btn';
        bookmarkBtn.addEventListener('click', (evt) => {
            evt.stopPropagation();
            if (getCookie() === undefined) {
                tweet.classList.add('bookmarked');
                document.cookie = 'tweet-tweaks-bookmark=' + tweet.getAttribute('data-tweet-id') +
                                  '; expires=Tue, 2 Feb 2222 22:22:22 GMT';
            }
            else if (
                getCookie().split('=')[1] === tweet.getAttribute('data-tweet-id') &&
                window.confirm('Are you sure you would like to remove your bookmark?')
            ) {
                tweet.classList.remove('bookmarked');
                document.cookie = 'tweet-tweaks-bookmark=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
            else if (window.confirm('Are you sure you would like to change your bookmark?')) {
                const t = document.querySelector('article[data-tweet-id="' + getCookie().split('=')[1] + '"');
                if (t) {
                    t.classList.remove('bookmarked');
                }
                tweet.classList.add('bookmarked');
                document.cookie = 'tweet-tweaks-bookmark=' + tweet.getAttribute('data-tweet-id') +
                                  '; expires=Tue, 2 Feb 2222 22:22:22 GMT';
            }
        });
        timeElem.insertBefore(bookmarkBtn, timeElem.querySelector('a'));

        // style bookmarked tweet
        if (getCookie() && getCookie().split('=')[1] === tweet.getAttribute('data-tweet-id')) {
            tweet.classList.add('bookmarked');
        }
    }

    const modifyTweet = (tweet) => {
        markIfRetweet(tweet);
        addBookmark(tweet);
    }

    const style = `

        /* column / media sizing */

        html.tweaked section.column {
            width: 600px;
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

        /* retweets */

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

        /* bookmark */

        html.tweaked article.stream-item.bookmarked {
            border-top: 5px solid #1da1f2;
        }

        html.tweaked i.bookmark-btn {
            height: auto;
            vertical-align: middle;
        }

        html.tweaked article.stream-item.bookmarked i.bookmark-btn {
            color: #1da1f2;
        }

        html.tweaked i.bookmark-btn:hover {
            color: #1da1f2;
        }

        html.tweaked article.stream-item.bookmarked i.bookmark-btn:hover {
            color: inherit;
        }
    `
    const styleElem = document.createElement('style');
    const tweetObserver = new MutationObserver((mutList) => {
        mutList.forEach((mut) => {
            mut.addedNodes.forEach((node) => {
                if (node.tagName === "ARTICLE") {
                    modifyTweet(node);
                }
            });
        });
    });
    const opt = {childList: true}; // remember, if more observations are added, it needs to be handled in callbacks

    styleElem.setAttribute('type', 'text/css');
    styleElem.innerHTML = style;

    document.querySelector('html').classList.add('tweaked');
    document.querySelector('head').appendChild(styleElem);

    document.awaitSelectorAll('.chirp-container').then((chirpContainers) => {
        chirpContainers.forEach((c) => {
            tweetObserver.observe(c, opt);
            c.querySelectorAll('article.stream-item').forEach((t) => modifyTweet(t));
        });
    });
})();
