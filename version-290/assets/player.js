(function () {
    window.initializeMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('moviePlayButton');
        var prepared = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function prepareVideo() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            prepareVideo();
            if (button) {
                button.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
