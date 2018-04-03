const music = document.getElementById('the-music');

function playSong(elem, url) {
    const artist = elem.find('.music-item-artist').html();
    const name = elem.find('.music-item-song').html();

    console.log(`Playing ${name} by ${artist}`);

    if (music.src && !music.paused) {
        music.pause();
    }

    $('#music-toggle').css('opacity', 1.0).html('pause');
    $('#music-name').html(name);
    $('#music-artist').html(artist);

    music.src = PAGE_ROOT + 'audio/' + url + '.mp3';

    music.play();
}

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