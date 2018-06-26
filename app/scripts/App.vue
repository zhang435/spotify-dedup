<template lang="html">
  <div class="container" id="app">
    <dedup-header></dedup-header>
    <div class="default-content" v-if="!isLoggedIn">
      <div class="jumbotron">
        <h1>Spotify Playlists Deduplicator</h1>
        <p class="lead">Remove duplicated tracks from your playlists.</p>
        <p>
          <button class="btn btn-lg btn-success" id="login">Log in with Spotify</button>
        </p>
      </div>

      <div class="row marketing">
        <div class="col-sm-4 col-md-4 col-lg-4">
          <h4>Find &amp; remove</h4>
          <p>Dedup traverses the playlists in
            <strong>your Spotify library</strong>. Once Dedup finds duplicates you can remove them per-playlist basis.</p>
        </div>
        <div class="col-sm-4 col-md-4 col-lg-4">
          <h4>Safe</h4>
          <p>Dedup won't delete anything except for duplicates, and only in the playlists
            <strong>you</strong> want to apply the deletion.</p>
        </div>
        <div class="col-sm-4 col-md-4 col-lg-4">
          <h4>Open Source</h4>
          <p>You might want to have a look at the
            <strong>
              <a href="https://github.com/JMPerez/spotify-dedup/">source code on GitHub</a>
            </strong>. This web app uses the
            <a href="https://developer.spotify.com/web-api/">Spotify Web API</a> to manage user's playlists.</p>
        </div>
      </div>
    </div>

    <div class="dedup-result row" v-if="isLoggedIn">
      <div class="playlists col-lg-12">
        <h3>These are the Spotify playlists you have created</h3>
        <div class="panel panel-default">
          <div class="panel-body">
            <span v-if="toProcess > 0">
              We are finding duplicates, wait a sec. Still to process
              <span>{{ toProcess }}</span> playlists.
            </span>
            <span v-if="toProcess == 0 && duplicates > 0">
              Your playlists have been processed!
              <br/>Scroll down to see the duplicates. Look for
              <span class="badge">Duplicate</span> badges.
              <div style="padding-top: 1em">
                <a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/jmp">
                  <img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Would you buy me a coffee?">
                  <span style="margin-left:5px">Would you buy me a coffee?</span>
                </a>
              </div>
            </span>
            <span v-if="toProcess == 0 && duplicates == 0">
              Your playlists have been processed!
              <br/>Congrats! Your playlists don't have duplicates.
              <div style="padding-top: 1em">
                <a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/jmp">
                  <img src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" alt="Would you buy me a coffee?">
                  <span style="margin-left:5px">Would you buy me a coffee?</span>
                </a>
              </div>
            </span>
          </div>
        </div>
        <ul class="playlists-list">
          <li v-for="playlist in playlists">
            <span>{{ playlist.playlist.name }}</span>
            <span v-if="playlist.status" class="label label-success"> {{ playlist.status }}</span>
            <span v-if="playlist.duplicates.length">
              <span> - There are duplicates in this playlist </span>
              <button class="btn btn-primary btn-xs" v-on:click="removeDuplicates(playlist)">Remove duplicates from this playlist</button>
              <ul class="duplicates">
                <li v-for="duplicate in playlist.duplicates">
                  <span v-if="duplicate.reason === 'same-id'" class="badge">Duplicate</span>
                  <span v-if="duplicate.reason === 'same-name-artist'" class="badge">Duplicate (same name, artist and duration)</span>
                  <strong>
                    <span>{{ duplicate.track.name }}</span>
                  </strong> by
                  <strong>
                    <span>{{ duplicate.track.artists[0].name }}</span>
                  </strong>
                </li>
              </ul>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>Made with ♥ by
        <a href="https://jmperezperez.com">JMPerez</a> · Check out the
        <a href="https://github.com/JMPerez/spotify-dedup/">code on GitHub</a>
      </p>
    </div>
  </div>
</template>

<script>
import Header from './header';

export default {
  name: 'app',
  components: {
    Header
  }
}
</script>
