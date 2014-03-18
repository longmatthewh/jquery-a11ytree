describe('a11yTree plugin', function() {
    const MAIN_SELECTOR = '#main';
    const LEVEL_1_ID = 'level-1', LEVEL_1_ID_SELECTOR = '#' + LEVEL_1_ID;
    const LEVEL_2_ID = 'level-2', LEVEL_2_ID_SELECTOR = '#' + LEVEL_2_ID;
    const LEVEL_3_ID = 'level-3'; LEVEL_3_ID_SELECTOR = '#' + LEVEL_3_ID;
    const NO_CHILDREN_CLASS = 'no-children', NO_CHILDREN_CLASS_SELECTOR = '.' + NO_CHILDREN_CLASS;
    const HAS_CHILDREN_CLASS = 'has-children', HAS_CHILDREN_CLASS_SELECTOR = '.' + HAS_CHILDREN_CLASS;

    beforeEach(function() {
        var htmlContent = '<div id="main"></div>';
        $('body').append(htmlContent);
        appendList(MAIN_SELECTOR, LEVEL_1_ID, 2);
        appendList(LEVEL_1_ID_SELECTOR + ' > li:nth-child(1)', LEVEL_2_ID, 2);
        appendList(LEVEL_2_ID_SELECTOR + ' > li:nth-child(1)', LEVEL_3_ID, 2);
    });

    afterEach(function() {
        $(MAIN_SELECTOR).remove();
    });

    describe('used on a parent ul element', function() {

        it('identifies the parent tree', function() {
            $(LEVEL_1_ID_SELECTOR).a11yTree();
            expect($('ul[role="tree"]').length).toBe(1);
            expect($(LEVEL_1_ID_SELECTOR).attr('role')).toBe('tree');
        });

        it('identifies all tree items', function() {
            $(LEVEL_1_ID_SELECTOR).a11yTree();
            expect($('[role="treeitem"]').length).toBe(6);
            expect($('li[role="treeitem"]').length).toBe(6);
        });

        it('identifies the appropriate nested level for each tree item', function() {
            $(LEVEL_1_ID_SELECTOR).a11yTree();
            expect($('[aria-level]').length).toBe(6);
            expect($(LEVEL_1_ID_SELECTOR + ' > li[aria-level="1"]').length).toBe(2);
            expect($(LEVEL_2_ID_SELECTOR + ' > li[aria-level="2"]').length).toBe(2);
            expect($(LEVEL_3_ID_SELECTOR + ' > li[aria-level="3"]').length).toBe(2);
        });

        it('identifies items with no children', function() {
            $(LEVEL_1_ID_SELECTOR).a11yTree();
            expect($(NO_CHILDREN_CLASS_SELECTOR).length).toBe(4);
            expect($(LEVEL_1_ID_SELECTOR + ' > li:nth-child(2)').hasClass(NO_CHILDREN_CLASS)).toBeTruthy();
            expect($(LEVEL_2_ID_SELECTOR + ' > li:nth-child(2)').hasClass(NO_CHILDREN_CLASS)).toBeTruthy();
            expect($(LEVEL_3_ID_SELECTOR + ' > li:nth-child(1)').hasClass(NO_CHILDREN_CLASS)).toBeTruthy();
            expect($(LEVEL_3_ID_SELECTOR + ' > li:nth-child(2)').hasClass(NO_CHILDREN_CLASS)).toBeTruthy();
        });

        it('identifies items with children', function() {
            $(LEVEL_1_ID_SELECTOR).a11yTree();
            expect($('ul[role="group"]').length).toBe(2);
            expect($(HAS_CHILDREN_CLASS_SELECTOR).length).toBe(2);
            expect($(LEVEL_1_ID_SELECTOR + ' > li:nth-child(1)').hasClass(HAS_CHILDREN_CLASS)).toBeTruthy();
            expect($(LEVEL_2_ID_SELECTOR).attr('role')).toBe('group');
            expect($(LEVEL_2_ID_SELECTOR + ' > li:nth-child(1)').hasClass(HAS_CHILDREN_CLASS)).toBeTruthy();
            expect($(LEVEL_3_ID_SELECTOR).attr('role')).toBe('group');
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