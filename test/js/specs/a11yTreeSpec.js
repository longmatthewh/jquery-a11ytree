describe('showMarkup plugin', function() {
    const MAIN_SELECTOR = '#main';
    const LEVEL_1_ID = 'level-1', LEVEL_2_ID = 'level-2', LEVEL_3_ID = 'level-3';


    beforeEach(function() {
        var htmlContent = '<div id="main"></div>';
        $('body').append(htmlContent);
        appendList(MAIN_SELECTOR, LEVEL_1_ID, 2);
        appendList('#' + LEVEL_1_ID + ' > li:first-child', LEVEL_2_ID, 2);
        appendList('#' + LEVEL_2_ID + ' > li:first-child', LEVEL_3_ID, 2);
    });

    afterEach(function() {
        $(MAIN_SELECTOR).remove();
    });

    describe('used on a parent ul element', function() {

        it('identifies items with no children', function() {
            $('#' + LEVEL_1_ID).a11yTree();
            expect($('.no-children').length).toBe(4);
            expect($('#' + LEVEL_1_ID + ' > li:nth-child(2)').hasClass('no-children')).toBeTruthy();
            expect($('#' + LEVEL_2_ID + ' > li:nth-child(2)').hasClass('no-children')).toBeTruthy();
            expect($('#' + LEVEL_3_ID + ' > li:nth-child(1)').hasClass('no-children')).toBeTruthy();
            expect($('#' + LEVEL_3_ID + ' > li:nth-child(2)').hasClass('no-children')).toBeTruthy();
        });

    });

    function appendList(parentSelector, listId, numberOfListItems) {
        var listHtml = '<ul id="' + listId + '">' + createListItems(listId, numberOfListItems) + '</ul>';
        $(parentSelector).append(listHtml);
    }

    function createListItems(listId, numberOfListItems) {
        var listItemsHtml = '';
        for (var listItem = 1; listItem <= numberOfListItems; listItem++) {
            listItemsHtml += '<li>' + listId + ' ' + listItem + '</li>';
        }
        return listItemsHtml;
    }
});