function PromiseThrottle(a){this.requestsPerSecond=a.requestsPerSecond,this.promiseImplementation=a.promiseImplementation||Promise,this.lastStartTime=0,this.queued=[]}var OAuthConfig=function(){"use strict";var a,b="04dca0de1c4e4aca88cc615ac23581be";a="localhost:8005"===location.host?"http://localhost:8005/callback.html":"https://jmperezperez.com/spotify-dedup/callback.html";var c=/http[s]?:\/\/[^\/]+/.exec(a)[0];return{clientId:b,redirectUri:a,host:c}}(),OAuthManager=function(){"use strict";function a(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")}function b(b){b=b||{};var c=new Promise(function(c,d){function e(a){return clearInterval(g),a.origin!==OAuthConfig.host?void d():(null!==f&&(f.close(),f=null),window.removeEventListener("message",e,!1),void c(a.data))}var f=null,g=null;window.addEventListener("message",e,!1);var h=400,i=600,j=screen.width/2-h/2,k=screen.height/2-i/2,l={client_id:OAuthConfig.clientId,redirect_uri:OAuthConfig.redirectUri,response_type:"token"};b.scopes&&(l.scope=b.scopes.join(" ")),f=window.open("https://accounts.spotify.com/authorize?"+a(l),"Spotify","menubar=no,location=no,resizable=no,scrollbars=no,status=no, width="+h+", height="+i+", top="+k+", left="+j),g=setInterval(function(){null!==f&&f.closed&&(clearInterval(g),d({message:"access_denied"}))},1e3)});return c}return{obtainToken:b}}();PromiseThrottle.prototype.add=function(a){var b=this;return new b.promiseImplementation(function(c,d){b.queued.push({resolve:c,reject:d,promise:a}),b.dequeue()})},PromiseThrottle.prototype.addAll=function(a){a.forEach(function(a){this.add(a)}.bind(this))},PromiseThrottle.prototype.dequeue=function(){if(0!==this.queued.length){var a=new Date,b=1e3/this.requestsPerSecond,c=a-this.lastStartTime;c>=b?this._execute():setTimeout(function(){this.dequeue()}.bind(this),b-c)}},PromiseThrottle.prototype._execute=function(){this.lastStartTime=new Date;var a=this.queued.shift();a.promise().then(function(b){a.resolve(b)})["catch"](function(b){a.reject(b)})},function(){"use strict";function a(a){this.playlist=a,this.duplicates=ko.observableArray([]);var b=this;this.removeDuplicates=function(){"starred"===b.playlist.id&&window.alert("It is not possible to delete duplicates from your Starred playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually."),b.playlist.collaborative?window.alert("It is not possible to delete duplicates from a collaborative playlist using this tool since this is not supported in the Spotify Web API. You will need to remove these manually."):k.add(function(){var a=b.duplicates().map(function(a){return{uri:a.track.linked_from?a.track.linked_from.uri:a.track.uri,positions:[a.index]}}),c=a.splice(0,100);return i.removeTracksFromPlaylist(b.playlist.owner.id,b.playlist.id,c).then(function(){return l.process(b).then(function(){a.length>0?b.removeDuplicates():(b.duplicates([]),b.status("Duplicates removed"),window.ga&&ga("send","event","spotify-dedup","playlist-removed-duplicates"))})})})},this.status=ko.observable(""),this.processed=ko.observable(!1)}function b(){var a=this;this.playlists=ko.observableArray([]),this.isLoggedIn=ko.observable(!1),this.toProcess=ko.observable(100),this.duplicates=ko.computed(function(){var b=0;return ko.utils.arrayForEach(a.playlists(),function(a){b+=ko.utils.unwrapObservable(a.duplicates()).length}),b})}function c(a){return g(k.add(function(){return i.getUserPlaylists(a,{limit:50})})).then(function(a){return Promise.all(a)}).then(function(b){var c=[];return b.forEach(function(b){c=c.concat(b.items.filter(function(b){return b.owner.id===a}))}),c.push({id:"starred",owner:{id:a},name:"Starred",href:"https://api.spotify.com/v1/users/"+a+"/starred",tracks:{href:"https://api.spotify.com/v1/users/"+a+"/starred/tracks"}}),c})}function d(a){a.processed(!0);var b=m.toProcess()-1;m.toProcess(b),0===b&&window.ga&&ga("send","event","spotify-dedup","playlists-processed")}function e(b){var e=b.id,f=[];c(e).then(function(b){f=b,m.playlists(f.map(function(b){return new a(b)})),m.toProcess(m.playlists().length),m.playlists().forEach(function(a){l.process(a).then(d.bind(this,a))["catch"](d.bind(this,a))})})}function f(a){m.isLoggedIn(!0),h=a,i=new SpotifyWebApi,i.setAccessToken(h),k.add(function(){return i.getMe().then(e)})}function g(a){function b(a){var b=new URL(a);return b.origin+b.pathname}function c(a,c,d){return i.getGeneric(b(a.href)+"?offset="+c+"&limit="+d)}return new Promise(function(b,d){a.then(function(d){for(var e=[a],f=d.limit+d.offset,g=d.limit;d.total>f;){var h=k.add(c.bind(this,d,f,g));e.push(h),f+=g}b(e)})["catch"](function(){d([])})})}var h,i,j=function(){};j.prototype.process=function(a){var b={},c={};return a.duplicates([]),new Promise(function(d,e){return g(k.add(function(){return i.getGeneric(a.playlist.tracks.href)})).then(function(a){return Promise.all(a)}).then(function(e){e.forEach(function(d){var e=d.offset;d.items.forEach(function(d,f){if(null!==d.track.id){var g=!1,h=d.track.name+":"+d.track.artists[0].name;d.track.id in b?g=!0:h in c&&Math.abs(c[h]-d.track.duration_ms)<2e3&&(g=!0),g?a.duplicates.push({index:e+f,track:d.track,reason:d.track.id in b?"same-id":"same-name-artist"}):(b[d.track.id]=!0,c[h]=d.track.duration_ms)}})}),d()})["catch"](e)})};var k=new PromiseThrottle({requestsPerSecond:5}),l=new j,m=new b;ko.applyBindings(m),document.getElementById("login").addEventListener("click",function(){OAuthManager.obtainToken({scopes:["playlist-read-private","playlist-read-collaborative","playlist-modify-public","playlist-modify-private"]}).then(function(a){f(a)})["catch"](function(a){console.error(a)})})}();