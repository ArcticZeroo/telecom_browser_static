const music = document.getElementById('the-music');
let playingArtist;
let playingName;

function playSong(elem, url) {
    playingArtist = elem.find('.music-item-artist').html();
    playingName = elem.find('.music-item-song').html();

    console.log(`Playing ${playingName} by ${playingArtist}`);

    if (music.src && !music.paused) {
        music.pause();
    }

    $('#music-toggle').css('opacity', 1.0).html('pause');
    $('#music-name').html(playingName + ' (Loading)');
    $('#music-artist').html(playingArtist);

    music.src = PAGE_ROOT + 'audio/' + url + '.mp3';

    music.play();
}

music.addEventListener('playing', function () {
    $('#music-name').html(playingName);
});

music.addEventListener('pause', function () {
    $('#music-name').html(playingName + ' (Paused)');
});

$('#music-toggle').click(function () {
    if (!music.src) {
        return;
    }

    if (music.paused) {
        music.play();
        $('#music-toggle').html('pause');
    } else {
        music.pause();
        $('#music-toggle').html('play_arrow');
    }
});

/*$('.music-item').click(function () {
    new PopupModal({ title: 'Why would you click that?', text: 'No really why?', id: 'music-click-bad' }).modal.addClass('red');
});*/