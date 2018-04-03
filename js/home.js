$('#bing-search-form').submit(function (e) {
    e.preventDefault();

    const queryInput = $('#bing-search-query');
    const searchTerm = queryInput.val();

    if (!searchTerm.trim().length) {
        return;
    }

    queryInput.val('');

    loadPage(`https://bing.com/search?q=${searchTerm.split(' ').filter(e => e.trim().length).map(encodeURI).join('+')}`);
});