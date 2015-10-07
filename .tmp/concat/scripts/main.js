/*exported OAuthConfig*/

var OAuthConfig = (function() {
  'use strict';

  var clientId = '04dca0de1c4e4aca88cc615ac23581be';
  var redirectUri;
  if (location.host === 'localhost:8005') {
    redirectUri = 'http://localhost:8005/callback.html';
  } else {
    redirectUri = 'http://jmperezperez.com/spotify-dedup/callback.html';
  }
  var host = /http[s]?:\/\/[^/]+/.exec(redirectUri)[0];
  return {
    clientId: clientId,
    redirectUri: redirectUri,
    host: host
  };
})();

/*global Promise, OAuthConfig*/
/*exported OAuthManager*/

var OAuthManager = (function() {
  'use strict';

  function toQueryString(obj) {
    var parts = [];
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        parts.push(encodeURIComponent(i) +
                   '=' +
                   encodeURIComponent(obj[i]));
      }
    }
    return parts.join('&');
  }

  function obtainToken(options) {
    options = options || {};

    var promise = new Promise(function(resolve, reject) {

      var authWindow = null,
      pollAuthWindowClosed = null;

      function receiveMessage(event) {
        clearInterval(pollAuthWindowClosed);
        if (event.origin !== OAuthConfig.host) {
          reject();
          return;
        }
        if (authWindow !== null) {
          authWindow.close();
          authWindow = null;
        }

        window.removeEventListener('message',
                                   receiveMessage,
                                   false);

        // todo: manage case when the user rejects the oauth
        // or the oauth fails to obtain a token
        resolve(event.data);
      }

      window.addEventListener('message',
                              receiveMessage,
                              false);

      var width = 400,
      height = 600,
      left = (screen.width / 2) - (width / 2),
      top = (screen.height / 2) - (height / 2);

      /*jshint camelcase:false*/
      var params = {
        client_id: OAuthConfig.clientId,
        redirect_uri: OAuthConfig.redirectUri,
        response_type: 'token'
      };

      if (options.scopes) {
        params.scope = options.scopes.join(' ');
      }

      authWindow = window.open(
                               'https://accounts.spotify.com/authorize?' + toQueryString(params),
                               'Spotify',
                               'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
                               );

      pollAuthWindowClosed = setInterval(function() {
        if (authWindow !== null) {
          if (authWindow.closed) {
            clearInterval(pollAuthWindowClosed);
            reject({message: 'access_denied'});
          }
        }
      }, 1000);

    });

    return promise;
  }

  return {
    obtainToken: obtainToken
  };

})();

/* exported PromiseThrottle */

'use strict';

/**
 * @constructor
 * @param {number} requestsPerSecond The amount of requests per second
 *   the library will limit to
 */
function PromiseThrottle(options) {
  this.requestsPerSecond = options.requestsPerSecond;
  this.promiseImplementation = options.promiseImplementation || Promise;
  this.lastStartTime = 0;
  this.queued = [];
}

/**
 * Adds a promise
 * @param {Promise} promise The promise to be added
 */
PromiseThrottle.prototype.add = function (promise) {
  var self = this;
  return new self.promiseImplementation(function(resolve, reject) {
    self.queued.push({
      resolve: resolve,
      reject: reject,
      promise: promise
    });

    self.dequeue();
  });
};

/**
 * Adds all the promises passed as parameters
 * @param {array} promises An array of promises
 */
PromiseThrottle.prototype.addAll = function (promises) {
  promises.forEach(function(promise) {
    this.add(promise);
  }.bind(this));
};

/**
 * Dequeues a promise
 */
PromiseThrottle.prototype.dequeue = function () {
  if (this.queued.length === 0) {
    return;
  }

  var now = new Date(),
      inc = 1000 / this.requestsPerSecond,
      elapsed = now - this.lastStartTime;

  if (elapsed >= inc) {
    this._execute();
  } else {
    // we have reached the limit, schedule a dequeue operation
    setTimeout(function() {
      this.dequeue();
    }.bind(this), inc - elapsed);
  }
};

/**
 * Executes the promise
 */
PromiseThrottle.prototype._execute = function () {
  this.lastStartTime = new Date();
  var candidate = this.queued.shift();
  candidate.promise().then(function(r) {
    candidate.resolve(r);
  }).catch(function(r) {
    candidate.reject(r);
  });
};
/*global ko, PromiseThrottle, SpotifyWebApi, OAuthManager, Promise */

(function() {
  'use strict';

  var token,
      api;

  function PlaylistModel(playlist) {
    this.playlist = playlist;
    this.duplicates = ko.observableArray([]);
    var self = this;
    this.removeDuplicates = function() {
      if (self.playlist.id === 'starred') {
        window.alert('It is not possible to delete duplicates from your Starred playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually.');
      } else {
        promiseThrottle.add(function() {

          var tracksToRemove = self.duplicates().map(function(d) {
            return {
              uri: d.track.uri,
              positions: [d.index]
            };
          });

          // remove chunks of max 100 tracks
          // find again duplicated tracks
          // delete another chunk

          var chunk = tracksToRemove.splice(0, 100);

          api.removeTracksFromPlaylist(
            self.playlist.owner.id,
            self.playlist.id,
            chunk).then(function() {
              playlistProcessor.process(self)
                .then(function() {
                  if (tracksToRemove.length > 0) {
                    self.removeDuplicates();
                  } else {
                    self.duplicates([]);
                    self.status('Duplicates removed');
                  }
                });
            });
        });
      }
    };
    this.status = ko.observable('');
    this.processed = ko.observable(false);
  }

  function PlaylistsDedupModel() {
    var self = this;
    this.playlists = ko.observableArray([]);
    this.isLoggedIn = ko.observable(false);
    this.toProcess = ko.observable(100);
    this.duplicates = ko.computed(function() {
      var total = 0;
      ko.utils.arrayForEach(self.playlists(), function(playlist) {
        total += ko.utils.unwrapObservable(playlist.duplicates()).length;
      });
      return total;
    });
  }

  var PlaylistProcessor = function() {};

  PlaylistProcessor.prototype.process = function(playlist) {
    var seen = {};
    playlist.duplicates([]);
    return new Promise(function(resolve, reject) {
      return promisesForPages(
        promiseThrottle.add(function() {
          return api.getGeneric(playlist.playlist.tracks.href);
        }))
      .then(function(pagePromises) {
          // todo: I'd love to replace this with
          // .then(Promise.all)
          // à la http://www.html5rocks.com/en/tutorials/es6/promises/#toc-transforming-values
          return Promise.all(pagePromises);
        })
      .then(function(pages) {
        pages.forEach(function(page) {
          var pageOffset = page.offset;
          page.items.forEach(function(item, index) {
            if (item.track.id !== null) {
              if (item.track.id in seen) {
                playlist.duplicates.push({
                  index: pageOffset + index,
                  track: item.track
                });
              } else {
                seen[item.track.id] = true;
              }
            }
          });
        });
        resolve();
      }).catch (reject);
    });
  };

  var promiseThrottle = new PromiseThrottle({requestsPerSecond: 10}),
      playlistProcessor = new PlaylistProcessor(),
      model = new PlaylistsDedupModel();

  ko.applyBindings(model);

  document.getElementById('login').addEventListener('click', function() {
    OAuthManager.obtainToken({
      scopes: [
        /*
          the permission for reading public playlists is granted
          automatically when obtaining an access token through
          the user login form
          */
          'playlist-read-private',
          'playlist-modify-public',
          'playlist-modify-private'
        ]
      }).then(function(token) {
        onTokenReceived(token);
      }).catch(function(error) {
        console.error(error);
      });
  });

  function fetchUserOwnedPlaylists(user) {
    return promisesForPages(promiseThrottle.add(function() {
        // fetch user's playlists, 50 at a time
          return api.getUserPlaylists(user, {limit: 50});
        }))
        .then(function(pagePromises) {
          // wait for all promises to be finished
          return Promise.all(pagePromises);
        }).then(function(pages) {
          // combine and filter playlists
          var userOwnedPlaylists = [];
          pages.forEach(function(page) {
            userOwnedPlaylists = userOwnedPlaylists.concat(
              page.items.filter(function(playlist) {
                return playlist.owner.id === user;
              })
            );
          });
          // add starred
          userOwnedPlaylists.push({
            id: 'starred',
            owner: {
              id: user
            },
            name: 'Starred',
            href: 'https://api.spotify.com/v1/users/' + user + '/starred',
            tracks: {
              href: 'https://api.spotify.com/v1/users/' + user + '/starred/tracks'
            }
          });
          return userOwnedPlaylists;
        });
  }

  function onPlaylistProcessed(playlist) {
    playlist.processed(true);
    model.toProcess(model.toProcess() - 1);
  }

  function onUserDataFetched(data) {
    var user = data.id,
        playlistsToCheck = [];

    fetchUserOwnedPlaylists(user)
      .then(function(ownedPlaylists) {
        playlistsToCheck = ownedPlaylists;
    
        model.playlists(playlistsToCheck.map(function(p) {
          return new PlaylistModel(p);
        }));

        model.toProcess(model.playlists().length);

        model.playlists().forEach(function(playlist) {
          playlistProcessor.process(playlist)
            .then(onPlaylistProcessed.bind(this, playlist))
            .catch(onPlaylistProcessed.bind(this, playlist));
        });
      });
  }

  function onTokenReceived(accessToken) {
    model.isLoggedIn(true);
    token = accessToken;

    api = new SpotifyWebApi();
    api.setAccessToken(token);

    promiseThrottle.add(function() {
      return api.getMe().then(onUserDataFetched);
    });
  }


  function promisesForPages(promise) {

    function stripParameters(href) {
      var u = new URL(href);
      return u.origin + u.pathname;
    }

    function fetchGeneric(results, offset, limit) {
      return api.getGeneric(stripParameters(results.href) +
        '?offset=' + offset +
        '&limit=' + limit);
    }

    return new Promise(function(resolve, reject) {
      promise.then(function(results) {
        var promises = [promise],                       // add the initial page
            offset = results.limit + results.offset,    // start from the second page
            limit = results.limit;
        while (results.total > offset) {
          var q = promiseThrottle.add(fetchGeneric.bind(this, results, offset, limit));
          promises.push(q);
          offset += limit;
        }
        resolve(promises);
      }).catch(function() {
        reject([]);
      });
    });
  }

})();
