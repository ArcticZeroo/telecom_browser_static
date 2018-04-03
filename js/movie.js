$('.movie-item').click(function () {
    new PopupModal({ title: 'Why would you click that?', text: 'No really why?', id: 'music-click-bad', classes: ['error'] });
});