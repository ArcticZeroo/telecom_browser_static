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

const packageList = $('#package-list');
for (const key of Object.keys(PACKAGES)) {
    packageList.append(`<li class="package-item" id="package-${key}"></li>`);

    const packageData = PACKAGES[key];
    const thisPackage = $(`#package-${key}`);

    thisPackage.append(`${packageData.name} Package`);
    thisPackage.append(`<ul id="package-${key}-perks"></ul>`);

    const perks = $(`#package-${key}-perks`);

    perks.append(`<li>Price: $${packageData.price}/month</li>`)
    perks.append(`<li>Provides access to: ${packageData.includes.join(', ')}</li>`);
}