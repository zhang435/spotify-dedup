/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/scripts/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/favicon.ico":
/*!*************************!*\
  !*** ./app/favicon.ico ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "favicon.ico";

/***/ }),

/***/ "./app/scripts/custom-fetch.js":
/*!*************************************!*\
  !*** ./app/scripts/custom-fetch.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const timeoutBetweenFailingRequests = 2000;
const queue = [];
let isOngoingRequest = false;

async function execute({ promise, resolve, reject, url, options, retries }) {
  try {
    const response = await fetch(url, options);
    let success = response.status < 400;
    if (!success) {
      console.log(
        'got status ' + response.status + ' with retries ' + retries,
        url,
        options
      );
    }
    if (success) {
      resolve(response);
    } else if (--retries > 0) {
      setTimeout(() => {
        execute({ promise, resolve, reject, url, options, retries });
      }, timeoutBetweenFailingRequests + Math.random() * 5000);
    } else {
      reject(response);
    }
  } catch (e) {
    if (--retries > 0) {
      setTimeout(() => {
        execute({ promise, resolve, reject, url, options, retries });
      }, timeoutBetweenFailingRequests + Math.random() * 2000);
    } else {
      reject(e);
    }
  }
}

async function tryToExecute() {
  if (!isOngoingRequest && queue.length > 0) {
    isOngoingRequest = true;
    const next = queue.shift();
    execute({
      promise: next.promise,
      resolve: next.resolve,
      reject: next.reject,
      url: next.url,
      options: next.options,
      retries: next.retries,
    });
  }
}

async function customFetch(url, options) {
  let retries = 3;

  const promise = new Promise((resolve, reject) => {
    queue.push({ promise: null, resolve, reject, url, options, retries });
  });

  tryToExecute();

  promise.then(r => {
    isOngoingRequest = false;
    tryToExecute();
  });

  return promise;
}

/* harmony default export */ __webpack_exports__["default"] = (customFetch);


/***/ }),

/***/ "./app/scripts/deduplicator.js":
/*!*************************************!*\
  !*** ./app/scripts/deduplicator.js ***!
  \*************************************/
/*! exports provided: PlaylistDeduplicator, SavedTracksDeduplicator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlaylistDeduplicator", function() { return PlaylistDeduplicator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SavedTracksDeduplicator", function() { return SavedTracksDeduplicator; });
/* harmony import */ var _promiseForPages__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./promiseForPages */ "./app/scripts/promiseForPages.js");


class BaseDeduplicator {
  async removeDuplicates(model) {
    throw 'Not implemented';
  }

  async getTracks() {
    throw 'Not implemented';
  }

  static findDuplicatedTracks(tracks) {
    const seenIds = {};
    const seenNameAndArtist = {};
    const result = tracks.reduce((duplicates, track, index) => {
      if (track === null) return duplicates;
      if (track.id === null) return duplicates;
      let isDuplicate = false;
      const seenNameAndArtistKey = `${track.name}:${track.artists[0].name}`;
      if (track.id in seenIds) {
        // if the two tracks have the same Spotify ID, they are duplicates
        isDuplicate = true;
      } else {
        // if they have the same name, main artist, and roughly same duration
        // we consider tem duplicates too
        if (
          seenNameAndArtistKey in seenNameAndArtist &&
          Math.abs(
            seenNameAndArtist[seenNameAndArtistKey] - track.duration_ms
          ) < 2000
        ) {
          isDuplicate = true;
        }
      }
      if (isDuplicate) {
        duplicates.push({
          index: index,
          track: track,
          reason: track.id in seenIds ? 'same-id' : 'same-name-artist',
        });
      } else {
        seenIds[track.id] = true;
        seenNameAndArtist[seenNameAndArtistKey] = track.duration_ms;
      }
      return duplicates;
    }, []);
    return result;
  }
}

class PlaylistDeduplicator extends BaseDeduplicator {
  static async getTracks(api, playlist) {
    return new Promise((resolve, reject) => {
      const tracks = [];
      Object(_promiseForPages__WEBPACK_IMPORTED_MODULE_0__["default"])(
        api,
        api.getGeneric(playlist.tracks.href) // 'https://api.spotify.com/v1/users/11153223185/playlists/0yygtDHfwC7uITHxfrcQsF/tracks'
      )
        .then((
          pagePromises // todo: I'd love to replace this with
        ) =>
          // .then(Promise.all)
          // à la http://www.html5rocks.com/en/tutorials/es6/promises/#toc-transforming-values
          Promise.all(pagePromises)
        )
        .then(pages => {
          pages.forEach(page => {
            page.items.forEach(item => {
              tracks.push(item && item.track);
            });
          });
          resolve(tracks);
        })
        .catch(reject);
    });
  }

  static async removeDuplicates(api, playlistModel) {
    return new Promise((resolve, reject) => {
      if (playlistModel.playlist.id === 'starred') {
        reject(
          'It is not possible to delete duplicates from your Starred playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually.'
        );
      }
      if (playlistModel.playlist.collaborative) {
        reject(
          'It is not possible to delete duplicates from a collaborative playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually.'
        );
      } else {
        const tracksToRemove = playlistModel.duplicates
          .map(d => ({
            uri: d.track.linked_from ? d.track.linked_from.uri : d.track.uri,
            positions: [d.index],
          }))
          .reverse(); // reverse so we delete the last ones first
        const promises = [];
        do {
          const chunk = tracksToRemove.splice(0, 100);
          (function(playlistModel, chunk, api) {
            promises.push(() =>
              api.removeTracksFromPlaylist(
                playlistModel.playlist.owner.id,
                playlistModel.playlist.id,
                chunk
              )
            );
          })(playlistModel, chunk, api);
        } while (tracksToRemove.length > 0);

        promises
          .reduce(
            (promise, func) => promise.then(() => func()),
            Promise.resolve(null)
          )
          .then(() => {
            playlistModel.duplicates.duplicates = [];
            resolve();
          })
          .catch(e => {
            reject(e);
          });
      }
    });
  }
}

class SavedTracksDeduplicator extends BaseDeduplicator {
  static async getTracks(api, initialRequest) {
    return new Promise((resolve, reject) => {
      const tracks = [];
      Object(_promiseForPages__WEBPACK_IMPORTED_MODULE_0__["default"])(api, initialRequest)
        .then((
          pagePromises // todo: I'd love to replace this with
        ) =>
          // .then(Promise.all)
          // à la http://www.html5rocks.com/en/tutorials/es6/promises/#toc-transforming-values
          Promise.all(pagePromises)
        )
        .then(pages => {
          pages.forEach(page => {
            page.items.forEach((item, index) => {
              tracks.push(item.track);
            });
          });
          resolve(tracks);
        })
        .catch(e => {
          console.error(
            `There was an error fetching the tracks from playlist ${
              initialRequest.href
            }`,
            e
          );
          reject(e);
        });
    });
  }

  static async removeDuplicates(api, model) {
    return new Promise((resolve, reject) => {
      const tracksToRemove = model.duplicates.map(d =>
        d.track.linked_from ? d.track.linked_from.id : d.track.id
      );
      do {
        (async () => {
          const chunk = tracksToRemove.splice(0, 50);
          await api.removeFromMySavedTracks(chunk);
        })();
      } while (tracksToRemove.length > 0);
      model.duplicates = [];
      resolve();
    });
  }
}


/***/ }),

/***/ "./app/scripts/library.js":
/*!********************************!*\
  !*** ./app/scripts/library.js ***!
  \********************************/
/*! exports provided: fetchUserOwnedPlaylists */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fetchUserOwnedPlaylists", function() { return fetchUserOwnedPlaylists; });
/* harmony import */ var _promiseForPages__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./promiseForPages */ "./app/scripts/promiseForPages.js");


const fetchUserOwnedPlaylists = async (api, user) => {
  const pages = await Object(_promiseForPages__WEBPACK_IMPORTED_MODULE_0__["default"])(
    api,
    api.getUserPlaylists(user, { limit: 50 })
  );

  return pages.reduce(
    (array, currentPage) =>
      array.concat(
        currentPage.items.filter(
          playlist => playlist && playlist.owner.id === user
        )
      ),
    []
  );
};


/***/ }),

/***/ "./app/scripts/main.js":
/*!*****************************!*\
  !*** ./app/scripts/main.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var _oauth_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./oauth-manager */ "./app/scripts/oauth-manager.js");
/* harmony import */ var _deduplicator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./deduplicator */ "./app/scripts/deduplicator.js");
/* harmony import */ var _spotify_api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spotify-api */ "./app/scripts/spotify-api.js");
/* harmony import */ var _playlist_cache__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./playlist-cache */ "./app/scripts/playlist-cache.js");
/* harmony import */ var _styles_main_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../styles/main.css */ "./app/styles/main.css");
/* harmony import */ var _styles_main_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_styles_main_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _styles_custom_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../styles/custom.css */ "./app/styles/custom.css");
/* harmony import */ var _styles_custom_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_styles_custom_css__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _favicon_ico__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../favicon.ico */ "./app/favicon.ico");
/* harmony import */ var _favicon_ico__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_favicon_ico__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _library__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./library */ "./app/scripts/library.js");









const playlistCache = new _playlist_cache__WEBPACK_IMPORTED_MODULE_3__["default"]();

let api;

const init = function() {
  let app = new Vue({
    el: '#app',
    data: {
      isLoggedIn: false,
      toProcess: 100,
      playlists: [],
      savedTracks: {
        duplicates: [],
        status: '',
      },
    },
    methods: {
      removeDuplicates: playlistModel =>
        (async () => {
          if (playlistModel.playlist.id === 'starred') {
            global.alert(
              'It is not possible to delete duplicates from your Starred playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually.'
            );
          }
          if (playlistModel.playlist.collaborative) {
            global.alert(
              'It is not possible to delete duplicates from a collaborative playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually.'
            );
          } else {
            try {
              const duplicates = await _deduplicator__WEBPACK_IMPORTED_MODULE_1__["PlaylistDeduplicator"].removeDuplicates(
                api,
                playlistModel
              );
              playlistModel.duplicates = [];
              playlistModel.status = 'Duplicates removed';
              if (global.ga) {
                ga(
                  'send',
                  'event',
                  'spotify-dedup',
                  'playlist-removed-duplicates'
                );
              }
            } catch (e) {
              global.Raven &&
                Raven.captureMessage(
                  `Exception trying to remove duplicates from playlist`,
                  {
                    extra: {
                      duplicates: playlistModel.duplicates,
                    },
                  }
                );
            }
          }
        })(),
      removeDuplicatesInSavedTracks: () =>
        (async () => {
          const duplicates = await _deduplicator__WEBPACK_IMPORTED_MODULE_1__["SavedTracksDeduplicator"].removeDuplicates(
            app.savedTracks
          );
          app.savedTracks.duplicates = [];
          app.savedTracks.status = 'Duplicates removed';
          if (global.ga) {
            ga(
              'send',
              'event',
              'spotify-dedup',
              'saved-tracks-removed-duplicates'
            );
          }
        })(),
    },
    computed: {
      duplicates: function() {
        return (
          this.playlists.reduce(
            (prev, current) => prev + current.duplicates.length,
            0
          ) + this.savedTracks.duplicates.length
        );
      },
    },
  });

  document.getElementById('login').addEventListener('click', async () => {
    const token = await _oauth_manager__WEBPACK_IMPORTED_MODULE_0__["default"].obtainToken({
      scopes: [
        /*
          the permission for reading public playlists is granted
          automatically when obtaining an access token through
          the user login form
          */
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-library-read',
        'user-library-modify',
      ],
    }).catch(function(error) {
      console.error(error);
    });

    onTokenReceived(token);

    function onPlaylistProcessed(playlist) {
      playlist.processed = true;
      var remaining = app.toProcess - 1;
      app.toProcess -= 1;
      if (remaining === 0 && global.ga) {
        ga('send', 'event', 'spotify-dedup', 'library-processed');
      }
    }

    const playlistToPlaylistModel = playlist => ({
      playlist: playlist,
      duplicates: [],
      status: '',
      processed: false,
    });

    async function onUserDataFetched(data) {
      var user = data.id,
        playlistsToCheck = [];

      let ownedPlaylists;
      ownedPlaylists = await Object(_library__WEBPACK_IMPORTED_MODULE_7__["fetchUserOwnedPlaylists"])(api, user).catch(e => {
        if (global.ga) {
          ga('send', 'event', 'spotify-dedup', 'error-fetching-user-playlists');
        }
        console.error("There was an error fetching user's playlists", e);
      });

      if (ownedPlaylists) {
        playlistsToCheck = ownedPlaylists;
        app.playlists = playlistsToCheck.map(p => playlistToPlaylistModel(p));
        app.toProcess = app.playlists.length + 1 /* saved tracks */;
        const savedTracks = await _deduplicator__WEBPACK_IMPORTED_MODULE_1__["SavedTracksDeduplicator"].getTracks(
          api,
          api.getMySavedTracks({ limit: 50 })
        );
        app.savedTracks.duplicates = _deduplicator__WEBPACK_IMPORTED_MODULE_1__["SavedTracksDeduplicator"].findDuplicatedTracks(
          savedTracks
        );
        if (app.savedTracks.duplicates.length && global.ga) {
          ga('send', 'event', 'spotify-dedup', 'saved-tracks-found-duplicates');
        }
        app.toProcess--;

        for (const playlistModel of app.playlists) {
          if (playlistCache.needsCheckForDuplicates(playlistModel.playlist)) {
            let playlistTracks;
            try {
              playlistTracks = await _deduplicator__WEBPACK_IMPORTED_MODULE_1__["PlaylistDeduplicator"].getTracks(
                api,
                playlistModel.playlist
              );
              playlistModel.duplicates = _deduplicator__WEBPACK_IMPORTED_MODULE_1__["PlaylistDeduplicator"].findDuplicatedTracks(
                playlistTracks
              );
              if (playlistModel.duplicates.length === 0) {
                playlistCache.storePlaylistWithoutDuplicates(
                  playlistModel.playlist
                );
              }
              onPlaylistProcessed(playlistModel.playlist);
            } catch (e) {
              console.error(
                'There was an error fetching tracks for playlist',
                playlistModel.playlist,
                e
              );
              onPlaylistProcessed(playlistModel.playlist);
            }
          } else {
            onPlaylistProcessed(playlistModel.playlist);
          }
        }
      }
    }

    async function onTokenReceived(accessToken) {
      app.isLoggedIn = true;
      api = new _spotify_api__WEBPACK_IMPORTED_MODULE_2__["default"]();
      api.setAccessToken(accessToken);

      const meData = await api.getMe();
      onUserDataFetched(meData);
    }
  });
};

global.Raven &&
  Raven.config(
    'https://22cbac299caf4962b74de18bc87a8d74@sentry.io/1239123'
  ).install();

if (global.Raven) {
  Raven.context(init);
} else {
  init();
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./app/scripts/oauth-config.js":
/*!*************************************!*\
  !*** ./app/scripts/oauth-config.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const clientId = '04dca0de1c4e4aca88cc615ac23581be';
const redirectUri =
  location.host === 'localhost:8005'
    ? 'http://localhost:8005/callback.html'
    : 'https://jmperezperez.com/spotify-dedup/callback.html';

const host = /http[s]?:\/\/[^/]+/.exec(redirectUri)[0];

/* harmony default export */ __webpack_exports__["default"] = ({
  clientId,
  redirectUri,
  host,
});


/***/ }),

/***/ "./app/scripts/oauth-manager.js":
/*!**************************************!*\
  !*** ./app/scripts/oauth-manager.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _oauth_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./oauth-config */ "./app/scripts/oauth-config.js");


function toQueryString(obj) {
  const parts = [];
  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(`${encodeURIComponent(i)}=${encodeURIComponent(obj[i])}`);
    }
  }
  return parts.join('&');
}

function obtainToken(options = {}) {
  const promise = new Promise((resolve, reject) => {
    let authWindow = null;
    let pollAuthWindowClosed = null;

    function receiveMessage(event) {
      clearInterval(pollAuthWindowClosed);
      if (event.origin !== _oauth_config__WEBPACK_IMPORTED_MODULE_0__["default"].host) {
        reject();
        return;
      }
      if (authWindow !== null) {
        authWindow.close();
        authWindow = null;
      }

      window.removeEventListener('message', receiveMessage, false);

      // todo: manage case when the user rejects the oauth
      // or the oauth fails to obtain a token
      resolve(event.data);
    }

    window.addEventListener('message', receiveMessage, false);

    const width = 400;
    const height = 600;
    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;

    /*jshint camelcase:false*/
    const params = {
      client_id: _oauth_config__WEBPACK_IMPORTED_MODULE_0__["default"].clientId,
      redirect_uri: _oauth_config__WEBPACK_IMPORTED_MODULE_0__["default"].redirectUri,
      response_type: 'token',
    };

    if (options.scopes) {
      params.scope = options.scopes.join(' ');
    }

    authWindow = window.open(
      `https://accounts.spotify.com/authorize?${toQueryString(params)}`,
      'Spotify',
      `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    pollAuthWindowClosed = setInterval(() => {
      if (authWindow !== null) {
        if (authWindow.closed) {
          clearInterval(pollAuthWindowClosed);
          reject({ message: 'access_denied' });
        }
      }
    }, 1000);
  });

  return promise;
}

/* harmony default export */ __webpack_exports__["default"] = ({ obtainToken });


/***/ }),

/***/ "./app/scripts/playlist-cache.js":
/*!***************************************!*\
  !*** ./app/scripts/playlist-cache.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return PlaylistCache; });
class PlaylistCache {
  needsCheckForDuplicates(playlist) {
    if ('snapshot_id' in playlist) {
      try {
        if (localStorage.getItem(playlist.snapshot_id) === '0') {
          return false;
        }
      } catch (e) {
        return true;
      }
    }
    return true;
  }

  storePlaylistWithoutDuplicates(playlist) {
    if ('snapshot_id' in playlist) {
      try {
        localStorage.setItem(playlist.snapshot_id, '0');
      } catch (e) {}
    }
  }
}


/***/ }),

/***/ "./app/scripts/promiseForPages.js":
/*!****************************************!*\
  !*** ./app/scripts/promiseForPages.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return promisesForPages; });
function stripParameters(href) {
  return href.indexOf('?') !== -1 ? href.substr(0, href.indexOf('?')) : href;
}

async function fetchGeneric(api, href, offset, limit) {
  return api.getGeneric(
    `${stripParameters(href)}?offset=${offset}&limit=${limit}`
  );
}

async function fetchPageWithDefaults(api, href, offset, limit) {
  let result;
  try {
    result = await fetchGeneric(api, href, offset, limit);
  } catch (e) {
    // todo: report this in the UI somehow
    /* console.error(
      `Error making request to fetch tracks from ${href} with offset ${offset} and limit ${limit}`,
      e
    );*/
    result = { items: new Array(limit).fill(null) };
  }
  return result;
}

async function promisesForPages(api, initialRequest) {
  const results = await initialRequest;
  if (results === null) {
    return [];
  }

  const { limit, total, offset, href } = results;
  if (total === 0) {
    return Promise.resolve([]);
  }
  const promises = new Array(Math.ceil((total - limit - offset) / limit))
    .fill('')
    .reduce(
      (prev, _, currentIndex) => {
        prev.push(() =>
          fetchPageWithDefaults(
            api,
            href,
            limit + offset + currentIndex * limit,
            limit
          )
        );
        return prev;
      },
      [() => initialRequest]
    );

  return promises.reduce(
    (promise, func) =>
      promise
        .then(result =>
          func()
            .then(Array.prototype.concat.bind(result))
            .catch(e => {
              console.error(e);
            })
        )
        .catch(e => {
          console.error(e);
        }),
    Promise.resolve([])
  );
}


/***/ }),

/***/ "./app/scripts/spotify-api.js":
/*!************************************!*\
  !*** ./app/scripts/spotify-api.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SpotifyWebApi; });
/* harmony import */ var _custom_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./custom-fetch */ "./app/scripts/custom-fetch.js");


const apiPrefix = 'https://api.spotify.com/v1';

const parseAPIResponse = response =>
  new Promise(resolve => resolve(response.text()))
    .catch(err =>
      Promise.reject({
        type: 'NetworkError',
        status: response.status,
        message: err,
      })
    )
    .then(responseBody => {
      try {
        const parsedJSON = JSON.parse(responseBody);
        if (response.ok) return parsedJSON;
        if (response.status >= 500) {
          return Promise.reject({
            type: 'ServerError',
            status: response.status,
            body: parsedJSON,
          });
        } else {
          return Promise.reject({
            type: 'ApplicationError',
            status: response.status,
            body: parsedJSON,
          });
        }
      } catch (e) {
        // We should never get these unless response is mangled
        // Or API is not properly implemented
        return Promise.reject({
          type: 'InvalidJSON',
          status: response.status,
          body: responseBody,
        });
      }
    });

class SpotifyWebApi {
  constructor() {
    this.token = null;
  }

  setAccessToken(token) {
    this.token = token;
  }

  async getMe() {
    return await this.getGeneric(`${apiPrefix}/me`);
  }

  async getGeneric(url, options = {}) {
    const optionsString =
      Object.keys(options).length === 0
        ? ''
        : `?${Object.keys(options)
            .map(k => `${k}=${options[k]}`)
            .join('&')}`;

    try {
      const res = await Object(_custom_fetch__WEBPACK_IMPORTED_MODULE_0__["default"])(`${url}${optionsString}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return parseAPIResponse(res);
    } catch (e) {
      console.error('e', e);
      return Promise.reject(e);
    }
  }

  async getUserPlaylists(userId, options) {
    const url =
      typeof userId === 'string'
        ? `${apiPrefix}/users/${encodeURIComponent(userId)}/playlists`
        : `${apiPrefix}/me/playlists`;
    return await this.getGeneric(url, options);
  }

  async removeTracksFromPlaylist(userId, playlistId, uris) {
    const dataToBeSent = {
      tracks: uris.map(uri => (typeof uri === 'string' ? { uri: uri } : uri)),
    };

    const res = await Object(_custom_fetch__WEBPACK_IMPORTED_MODULE_0__["default"])(
      `${apiPrefix}/users/${encodeURIComponent(
        userId
      )}/playlists/${playlistId}/tracks`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(dataToBeSent),
      }
    );
    return parseAPIResponse(res);
  }

  async getMySavedTracks(options) {
    return this.getGeneric(`${apiPrefix}/me/tracks`, options);
  }

  async removeFromMySavedTracks(trackIds) {
    const res = await Object(_custom_fetch__WEBPACK_IMPORTED_MODULE_0__["default"])(`${apiPrefix}/me/tracks`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(trackIds),
    });
    return parseAPIResponse(res);
  }
}


/***/ }),

/***/ "./app/styles/custom.css":
/*!*******************************!*\
  !*** ./app/styles/custom.css ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../node_modules/mini-css-extract-plugin/dist/loader.js!../../node_modules/css-loader!./custom.css */ "./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/index.js!./app/styles/custom.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./app/styles/main.css":
/*!*****************************!*\
  !*** ./app/styles/main.css ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../node_modules/mini-css-extract-plugin/dist/loader.js!../../node_modules/css-loader!./main.css */ "./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/index.js!./app/styles/main.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/index.js!./app/styles/custom.css":
/*!***************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader!./app/styles/custom.css ***!
  \***************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/index.js!./app/styles/main.css":
/*!*************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader!./app/styles/main.css ***!
  \*************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "./node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!***********************************************!*\
  !*** ./node_modules/style-loader/lib/urls.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })

/******/ });
//# sourceMappingURL=main.5ee23c35664c39e8a0a1.js.map