const BROWSER_CHROME = "chrome";
const BROWSER_FIREFOX = "firefox";

const detectedBrowser =
  typeof browser === "undefined" ? BROWSER_CHROME : BROWSER_FIREFOX;

async function buildCSS() {
  const storage = await chrome.storage.sync.get();
  const headerHeight = storage.compactHeader ? 120 : 167;

  let css = "";

  if (storage.stickyHeader) {
    css += `
/* Sticky header */
.above_body {
  position: sticky;
  top: 0;
  z-index: 1;
}

/* Fix for "Eloquent" styles */
html:has([href*="clientscript/vbulletin_css/style00045"]) .above_body,
html:has([href*="clientscript/vbulletin_css/style00046"]) .above_body,
html:has([href*="clientscript/vbulletin_css/style00047"]) .above_body,
html:has([href*="clientscript/vbulletin_css/style00048"]) .above_body {
  background-image: inherit !IMPORTANT;
  border-radius: 0 !IMPORTANT;
}
html:has([href*="clientscript/vbulletin_css/style00045"]) body,
html:has([href*="clientscript/vbulletin_css/style00046"]) body,
html:has([href*="clientscript/vbulletin_css/style00047"]) body,
html:has([href*="clientscript/vbulletin_css/style00048"]) body {
  background-image: inherit;
  background-size: 0;
}
html:has([href*="clientscript/vbulletin_css/style00045"]),
html:has([href*="clientscript/vbulletin_css/style00046"]),
html:has([href*="clientscript/vbulletin_css/style00047"]),
html:has([href*="clientscript/vbulletin_css/style00048"]) {
  background-attachment: fixed !IMPORTANT;
}

/* Scroll target fix when using sticky header */
:target::before {
  content: "";
  display: block;
  height: ${headerHeight}px;
  margin-top: -${headerHeight}px;
}`;
  }

  if (storage.compactHeader) {
    css += `
/* Compact header */
.logo-image > img {
  height: 47px;
}
.logo-image {
  padding: 0 !IMPORTANT;
}

/* Fix for most alternate styles */
#header {
  height: unset !IMPORTANT;
}`;
  } else {
    css += `
/* Alternate height for "Weihnachten 2022" style */
html:has([href*="clientscript/vbulletin_css/style00068"]) :target::before {
  height: ${headerHeight + 60}px;
  margin-top: -${headerHeight + 60}px;
}`;
  }

  if (storage.postImageHeightLimit) {
    css += `
/* Max height for images embedded in posts */
.postcontent img {
  max-height: ${storage.postImageHeightLimit};
  width: auto;
}`;
  }

  if (storage.limitPageWidth) {
    css += `
/* Max width */
#content_wrapper, .above_body, .body_wrapper {
  max-width: ${storage.limitPageWidth};
  margin: 0 auto !IMPORTANT;
  box-sizing: border-box;
}`;
  }

  if (storage.hideSignatureImages) {
    css += `
/* Hide signature images */
.signaturecontainer img {
  display: none;
}`;
  }

  if (storage.fixStyleBugs) {
    css += `
/* Fix for Retro style */
.toplinks, .toplinks ul.isuser li {
  background: unset !IMPORTANT;
}

/* Fix for snowflakes on the Weihnachten 2022 style */
html:has([href*="clientscript/vbulletin_css/style00068"]) .js-anim-snowflake {
  z-index: 20000;
}`;
  }

  if (storage.allowYouTubeFullscreen) {
    css += `
/* Override width/height of YouTube embeds to prevent scripts from changing it */
iframe[title="YouTube video player"] {
  width: 640px !IMPORTANT;
  height: 390px !IMPORTANT;
}`;
  }

  return css;
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get();
  const factory = {
    limitPageWidth: false,
    stickyHeader: false,
    compactHeader: false,
    relativeTimestamps: false,
    confirmSubscriptionDeletion: false,
    fixStyleBugs: false,
    postImageHeightLimit: false,
    hideSignatureImages: false,
    allowYouTubeFullscreen: false,
  };

  chrome.storage.sync.set({
    ...factory,
    ...existing,
  });

  // Remove existing keys that are no longer in use.
  const factoryKeys = Object.keys(factory);
  const obsoleteKeys = Object.keys(existing).filter(
    (x) => !factoryKeys.includes(x),
  );
  chrome.storage.sync.remove(obsoleteKeys);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url || changeInfo.status !== "loading") {
    return;
  }

  const url = new URL(tab.url);

  if (url.hostname !== "www.forumla.de") {
    return;
  }

  // Prevent duplicate injection.
  try {
    const alreadyInjected = await chrome.tabs.sendMessage(
      tabId,
      "FE_INJECTION_CHECK",
    );

    if (alreadyInjected) {
      return;
    }
  } catch (ex) {
    // No need to do anything here.
  }

  chrome.scripting.executeScript({
    target: { tabId },
    injectImmediately: true,
    world: "ISOLATED",
    func: function () {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request === "FE_INJECTION_CHECK") {
          sendResponse(true);
        }
      });
    },
  });

  chrome.scripting.insertCSS(
    {
      css: await buildCSS(),
      target: { tabId },
      origin: "AUTHOR",
    },
    () => {
      console.log(`Injected CSS into tab ${tabId}.`, changeInfo, tab);
    },
  );

  chrome.scripting.executeScript({
    args: [await chrome.storage.sync.get()],
    target: { tabId },
    injectImmediately: true,
    // Firefox doesn't support MAIN world.
    world: detectedBrowser === BROWSER_FIREFOX ? "ISOLATED" : "MAIN",
    func: function (storage) {
      (function () {
        function enhance() {
          // We want to prevent custom scroll logic to stop weird page jumping
          // behaviour with a fixed header (and otherwise).
          //
          // This doesn't work in the ISOLATED world.
          const ogScrollIntoView = HTMLElement.prototype.scrollIntoView;
          HTMLElement.prototype.scrollIntoView = function () {
            if (this.classList.contains("postcontainer")) {
              console.log("scrollIntoView prevented", this);
              return;
            }

            return ogScrollIntoView.apply(this, arguments);
          };

          if (storage.relativeTimestamps) {
            const TODAY_REGEXP = /Heute,\s(\d{2}):(\d{2})/;
            const YESTERDAY_REGEXP = /Gestern,\s(\d{2}):(\d{2})/;
            const DATE_REGEXP = /(\d{2})\.(\d{2})\.(\d{4}),\s(\d{2}):(\d{2})/;
            const NOW = Date.now();
            const DURATION_YEAR = 31536e6;
            const DURATION_MONTH = 2592e6;
            const DURATION_WEEK = 6048e5;
            const DURATION_DAY = 864e5;
            const DURATION_HOUR = 36e5;
            const DURATION_MINUTE = 6e4;

            const elements = document.querySelectorAll(".date");

            for (let element of elements) {
              const value = element.innerText;
              element.title = value;
              let ts = new Date();

              ts.setSeconds(0);
              ts.setMilliseconds(0);

              if (TODAY_REGEXP.test(value)) {
                const match = value.match(TODAY_REGEXP);

                ts.setHours(+match[1]);
                ts.setMinutes(+match[2]);
              } else if (YESTERDAY_REGEXP.test(value)) {
                const match = value.match(YESTERDAY_REGEXP);

                ts.setDate(ts.getDate() - 1);
                ts.setHours(+match[1]);
                ts.setMinutes(+match[2]);
              } else if (DATE_REGEXP.test(value)) {
                const match = value.match(DATE_REGEXP);

                ts.setFullYear(+match[3]);
                ts.setMonth(+match[2] - 1);
                ts.setDate(+match[1]);
                ts.setHours(+match[4]);
                ts.setMinutes(+match[5]);
              } else {
                console.log("wtf?!", value);
              }

              const difference = NOW - ts;

              if (difference >= DURATION_YEAR) {
                const years = Math.round(difference / DURATION_YEAR);

                if (years > 1) {
                  element.innerText = `Vor ${years} Jahren`;
                } else {
                  element.innerText = "Vor einem Jahr";
                }
              } else if (difference >= DURATION_MONTH) {
                const months = Math.round(difference / DURATION_MONTH);

                if (months > 1) {
                  element.innerText = `Vor ${months} Monaten`;
                } else {
                  element.innerText = "Vor einem Monat";
                }
              } else if (difference >= DURATION_WEEK) {
                const weeks = Math.round(difference / DURATION_WEEK);

                if (weeks > 1) {
                  element.innerText = `Vor ${weeks} Wochen`;
                } else {
                  element.innerText = "Vor einer Woche";
                }
              } else if (difference >= DURATION_DAY) {
                const days = Math.round(difference / DURATION_DAY);

                if (days > 1) {
                  element.innerText = `Vor ${days} Tagen`;
                } else {
                  element.innerText = "Vor einem Tag";
                }
              } else if (difference >= DURATION_HOUR) {
                const hours = Math.round(difference / DURATION_HOUR);

                if (hours > 1) {
                  element.innerText = `Vor ${hours} Stunden`;
                } else {
                  element.innerText = "Vor einer Stunde";
                }
              } else if (difference >= DURATION_MINUTE) {
                const minutes = Math.round(difference / DURATION_MINUTE);

                if (minutes > 1) {
                  element.innerText = `Vor ${minutes} Minuten`;
                } else {
                  element.innerText = "Vor einer Minute";
                }
              } else {
                element.innerText = "Gerade eben";
              }
            }
          }

          if (storage.confirmSubscriptionDeletion) {
            const unsubscribeLinks = document.querySelectorAll(
              "#new_subscribed_threads > ol > li .author a",
            );

            for (let link of unsubscribeLinks) {
              if (link.innerText === "Abonnement löschen") {
                link.addEventListener("click", (e) => {
                  const result = confirm(
                    "Soll das Abonnement zu diesem Thema wirklich gelöscht werden?",
                  );

                  if (!result) {
                    e.preventDefault();
                  }
                });
              }
            }
          }

          if (storage.allowYouTubeFullscreen) {
            // This only affects elements available on initial render. It does not
            // work on posts loaded afterwards, for example posts by blocked users
            // that are loaded later on.

            const iframes = document.querySelectorAll("iframe");

            for (const el of iframes) {
              if (
                !el.src.startsWith("https://www.youtube.com/") ||
                el.allowFullscreen
              ) {
                continue;
              }

              // We need to clone the node and re-add it to the DOM because
              // adding allowfullscreen has no effect retroactively.
              const clone = el.cloneNode();
              clone.allowFullscreen = true;
              el.parentNode.insertBefore(clone, el);
              el.remove();
            }

            if (window.vB_AJAX_PostLoader) {
              // This overrides the default AJAX postloader to add code that
              // replaces YouTube iframes with new iframes that have
              // allowfullscreen enabled.
              //
              // This doesn't work in the ISOLATED world.

              window.vB_AJAX_PostLoader.prototype.display = function (B) {
                if (B.responseXML) {
                  var C = B.responseXML.getElementsByTagName("postbit");
                  if (C.length) {
                    var A = string_to_node(C[0].firstChild.nodeValue);

                    for (const el of A.querySelectorAll("iframe")) {
                      if (!el.src.startsWith("https://www.youtube.com/")) {
                        continue;
                      }

                      el.allowFullscreen = true;
                    }

                    if (this.prefix) {
                      container = this.post.getElementsByTagName("ol");
                      container[0].innerHTML = "";
                      container[0].appendChild(A);
                    } else {
                      this.post.parentNode.replaceChild(A, this.post);
                    }
                    PostBit_Init(A, this.postid);
                  } else {
                    openWindow(
                      "showthread.php?" +
                        (SESSIONURL ? "s=" + SESSIONURL : "") +
                        (pc_obj != null
                          ? "&postcount=" + PHP.urlencode(pc_obj.name)
                          : "") +
                        "&p=" +
                        this.postid +
                        "#post" +
                        this.postid,
                    );
                  }
                }
              };
            }
          }
        }

        if (document.readyState === "loading") {
          document.addEventListener("readystatechange", (event) => {
            if (event.target.readyState === "interactive") {
              enhance();
            }
          });
        } else {
          enhance();
        }
      })();
    },
  });
});
