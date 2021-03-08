(function() {
    "use strict";

    let spotify = {};
    let PRIVATE = {
        TOKEN: localStorage.getItem("access_token")
    };
    let template = Handlebars.compile(`@@include(../_templates/sample.html)`);
    let template2 = Handlebars.compile(`@@include(../_templates/sample2.html)`);

    PRIVATE.getDOMElements = function() {
        return {
            node: {
                main: document.querySelector("main"),
                search: document.querySelector(".search input"),
                tracks: document.querySelectorAll(".album-img"),
                track: document.querySelectorAll(".track-name"),
                bar: document.querySelector("#bars"),
                link: document.querySelector(".link"),
                soundTrack: document.querySelector(".sound-track")
            }
        }
    };

    PRIVATE.getHash = function() {
        let ret = {};
        let e, r = /([^&;=]+)=?([^&;]*)/g;
        let q = window.location.hash.substring(1)

        while (e = r.exec(q)) {
            ret[e[1]] = decodeURIComponent(e[2]);
        }

        return ret;
    };

    PRIVATE.auth = function() {
        alert("Sign in required!");

        window.location.replace(`${window.origin}/login`);

        return false;
    };

    PRIVATE.registreToken = function() {
        let hash = PRIVATE.getHash();

        if(!hash.access_token || !hash.refresh_token) return;

        localStorage.setItem("access_token", hash.access_token);
        localStorage.setItem("refresh_token", hash.refresh_token);

        PRIVATE.TOKEN = hash.access_token;
        history.pushState(null, null, "/");

    };

    PRIVATE.signIn = function() {
        let hash = PRIVATE.getHash();
        let token = localStorage.getItem("access_token");

        if(hash.access_token) {
            PRIVATE.registreToken();
        } else if(!token && !hash.access_token) {
            PRIVATE.auth();
        }
    };

    PRIVATE.search = function(e, search=null) {
        let value = null;
        let DOM = PRIVATE.getDOMElements();

        if(search) {
            value = search;
        } else if(DOM.node.search) {
            value = DOM.node.search.value.trim();

        }

        let access_token = localStorage.getItem("access_token");
        let cache_tracks = JSON.parse(localStorage.getItem("cache_tracks"));

        if((e.keyCode !== 13 || !value) && !search) return;
        if(!access_token) return PRIVATE.auth();

        PRIVATE.current_search = value;
        history.pushState({search: value}, value, `?search=${value}`);

        if(cache_tracks && cache_tracks[value]) {
            PRIVATE.bindEvents({
                albums: cache_tracks[value],
                message: `Results found for "${value}"`
            });
            PRIVATE.tracks();

            return true;
        }

        fetch(`https://api.spotify.com/v1/search?query=${value}&type=track%2Cartist&offset=0&limit=20`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`
            },
        }).then(function(response) {
            if(response.status === 401) PRIVATE.auth();

            return response.json();
        }).then(function(data) {
            PRIVATE.bindEvents({
                albums: data.tracks.items,
                message: `Results found for "${value}"`
            });
            PRIVATE.tracks();

            var cache = window.localStorage.getItem("cache_tracks");
            var obj = JSON.parse(cache) || {};;

            obj[value] = data.tracks.items;

            window.localStorage.setItem("cache_tracks", JSON.stringify(obj));
        });
    };

    PRIVATE.tracks = function(id) {
        let DOM = PRIVATE.getDOMElements();
        let access_token = localStorage.getItem("access_token");
        let cache_track = JSON.parse(localStorage.getItem("cache_track"));

        if(!DOM.node.tracks) return;

        if(!access_token) return PRIVATE.auth();

        if(id) {
            if(cache_track && cache_track[id]) {
                PRIVATE.playSound({tracks: cache_track[id].tracks, album: cache_track[id].album});

                return;
            }
        }

        DOM.node.tracks.forEach(elm => {
            elm.addEventListener("click", function(e) {
                var id = e.target.attributes['data-id'].value;
                var album = {
                    img: e.target.attributes['src'].value,
                    album: e.target.attributes['data-album'].value,
                    artist: e.target.attributes['data-artist'].value,
                };


                if(cache_track && cache_track[id]) {
                    history.pushState({track: id}, id, `?track=${id}`);
                    PRIVATE.playSound({tracks: cache_track[id].tracks, album: cache_track[id].album});

                    return;
                }

                fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${access_token}`
                    },
                }).then(function(response) {
                    if(response.status === 401) PRIVATE.auth();

                    return response.json();
                }).then(function(data) {
                    history.pushState({track: id}, id, `?track=${id}`);

                    console.log(data);

                    data.items.forEach(_ => {
                        _.duration_ms = PRIVATE.millisToMinutesAndSeconds(_.duration_ms)
                    });

                    PRIVATE.playSound({tracks: data.items, album: album});

                    var cache = window.localStorage.getItem("cache_track");
                    var obj = JSON.parse(cache) || {};;

                    obj[id] = {
                        album: album,
                        tracks: data.items
                    };

                    localStorage.setItem("cache_track", JSON.stringify(obj))
                });
            });
        });
    };

    PRIVATE.playSound = function(data) {
        PRIVATE.getDOMElements().node.main.innerHTML = template2({
            album: data.album,
            tracks: data.tracks
        });

        PRIVATE.getDOMElements().node.link.addEventListener("click", _ => history.back());

        PRIVATE.getDOMElements().node.track.forEach((track) => {
            track.addEventListener("click", e => {
                var last_track = PRIVATE.last_play;

                var track = e.target;
                var sound = track.nextElementSibling;

                if(last_track) {
                    var last_sound = last_track.nextElementSibling;

                    last_track.classList.remove("play");

                    if(last_sound === sound && !sound.paused) {
                        PRIVATE.getDOMElements().node.bar.classList.remove("play");

                        return sound.pause();
                    }

                    if(!last_sound.paused && sound !== last_sound) {
                        last_sound.pause();
                    }
                }

                sound.play();

                PRIVATE.last_play = track;
                track.classList.add("play");
                PRIVATE.getDOMElements().node.bar.classList.add("play");
                // PRIVATE.getDOMElements().node.soundTrack.innerHTML = `- ${track.innerHTML}`;

                clearTimeout(PRIVATE.timeWave);
                PRIVATE.timeWave = setTimeout(_ => {
                    PRIVATE.getDOMElements().node.bar.classList.remove("play");
                }, 30000);
            });
        })
    };

    PRIVATE.URLSearch = function() {
        let params = new URLSearchParams(location.search.substring(1));
        let cache_tracks = JSON.parse(localStorage.getItem("cache_tracks"));
        let search = params.get("search");
        let track_id = params.get("track");

        if(!PRIVATE.TOKEN) return;

        if(track_id) {
            PRIVATE.tracks(track_id);
        } else if (search) {
            PRIVATE.search(this, search);
        } else if(cache_tracks) {
            cache_tracks = Object.entries(cache_tracks);

            let rand = Math.floor(Math.random() * cache_tracks.length);

            let tracks = cache_tracks[rand][1];
            let max = tracks.length > 5 ? tracks.length - 5 : 0;
            let albums = tracks.slice(max);

            PRIVATE.bindEvents({
                albums: albums,
                message: `Recently searched albums`
            });
            PRIVATE.tracks();
        };
    };

    PRIVATE.millisToMinutesAndSeconds = function(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);

        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    PRIVATE.bindEvents = function(data) {
        PRIVATE.getDOMElements().node.main.innerHTML = template(data);

        let DOM = PRIVATE.getDOMElements();

        if(PRIVATE.current_search) DOM.node.search.value = PRIVATE.current_search;

        DOM.node.search.focus();
        DOM.node.search.addEventListener("keyup", PRIVATE.search);
    };

    spotify.init = function() {
        PRIVATE.signIn();

        if(!PRIVATE.TOKEN) return;

        PRIVATE.bindEvents();
        PRIVATE.URLSearch();

        if(localStorage.getItem("last_search")) localStorage.removeItem("last_search");

        window.addEventListener('popstate', PRIVATE.URLSearch);
    };

    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });

    spotify.init();
})(window);