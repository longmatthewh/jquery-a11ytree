describe('a11yTree plugin', function() {
    const MAIN_SELECTOR = '#main';
    const LEVEL_1_ID = 'level-1', LEVEL_1_ID_SELECTOR = '#' + LEVEL_1_ID;
    const LEVEL_2_ID = 'level-2', LEVEL_2_ID_SELECTOR = '#' + LEVEL_2_ID;
    const LEVEL_3_ID = 'level-3', LEVEL_3_ID_SELECTOR = '#' + LEVEL_3_ID;
    const NO_CHILDREN_CLASS = 'no-children', NO_CHILDREN_CLASS_SELECTOR = '.' + NO_CHILDREN_CLASS;
    const HAS_CHILDREN_CLASS = 'has-children', HAS_CHILDREN_CLASS_SELECTOR = '.' + HAS_CHILDREN_CLASS;
    const COLLAPSED_CLASS = 'collapsed', COLLAPSED_CLASS_SELECTOR = '.' + COLLAPSED_CLASS;
    const TOGGLE_CLASS_SELECTOR = '.toggle';

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

        beforeEach(function() {
            $(LEVEL_1_ID_SELECTOR).a11yTree();
        });

        it('identifies the parent tree', function() {
            expect($('ul[role="tree"]').length).toBe(1);
            expect($(LEVEL_1_ID_SELECTOR).attr('role')).toBe('tree');
        });

        it('identifies all tree items', function() {
            expect($('[role="treeitem"]').length).toBe($('li[role="treeitem"]').length);
        });

        it('identifies the appropriate nested level for each tree item', function() {
            expect($('[aria-level]').length).toBe(6);
            verifyAriaLevelForChildren(LEVEL_1_ID_SELECTOR, 1, 2);
            verifyAriaLevelForChildren(LEVEL_2_ID_SELECTOR, 2, 2);
            verifyAriaLevelForChildren(LEVEL_3_ID_SELECTOR, 3, 2);
        });

        it('identifies items with no children', function() {
            expect($(NO_CHILDREN_CLASS_SELECTOR).length).toBe(4);
            verifyClassForChildren(LEVEL_1_ID_SELECTOR, 2, NO_CHILDREN_CLASS);
            verifyClassForChildren(LEVEL_2_ID_SELECTOR, 2, NO_CHILDREN_CLASS);
            verifyClassForChildren(LEVEL_3_ID_SELECTOR, 1, NO_CHILDREN_CLASS);
            verifyClassForChildren(LEVEL_3_ID_SELECTOR, 2, NO_CHILDREN_CLASS);
        });

        it('identifies items with children', function() {
            expect($('ul[role="group"]').length).toBe($(HAS_CHILDREN_CLASS_SELECTOR).length);
            verifyElementHasAttribute(LEVEL_2_ID_SELECTOR,'role','group');
            verifyElementHasAttribute(LEVEL_3_ID_SELECTOR,'role','group');
            verifyClassForChildren(LEVEL_1_ID_SELECTOR, 1, HAS_CHILDREN_CLASS);
            verifyClassForChildren(LEVEL_2_ID_SELECTOR, 1, HAS_CHILDREN_CLASS);
        });

        it('items with children are collapsed by default', function() {
            expect($(COLLAPSED_CLASS_SELECTOR).length).toBe(2);
            verifyClassForChildren(LEVEL_1_ID_SELECTOR, 1, COLLAPSED_CLASS);
            verifyClassForChildren(LEVEL_2_ID_SELECTOR, 1, COLLAPSED_CLASS);
        });

        it('adds toggle control to items with children', function() {
            expect($(TOGGLE_CLASS_SELECTOR).length).toBe(2);
            verifyItemHasToggle($(LEVEL_1_ID_SELECTOR + ' > li:nth-child(1)'));
            verifyItemHasToggle($(LEVEL_2_ID_SELECTOR + ' > li:nth-child(1)'));
        });

    });

    function verifyItemHasToggle($listItem) {
        var $toggle = $listItem.children(TOGGLE_CLASS_SELECTOR);
        expect($toggle.length).toBe(1);
        expect($toggle.attr('aria-hidden')).toBe('true');
        expect($listItem.children(TOGGLE_CLASS_SELECTOR).length).toBe(1);
    }

    function verifyElementHasAttribute(selector,attribute,value) {
        expect($(selector).attr(attribute)).toBe(value);
    }

    function verifyClassForChildren(ulSelector, childIdx, className) {
        expect($(ulSelector + ' > li:nth-child(' + childIdx + ')').hasClass(className)).toBeTruthy();
    }

    function verifyAriaLevelForChildren(ulSelector, level, count) {
        expect($(ulSelector + ' > li[aria-level="' + level + '"]').length).toBe(count);
    }

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