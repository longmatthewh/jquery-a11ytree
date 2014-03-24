;(function ( $, window, document, undefined ) {
    var PLUGIN_NAME = 'a11yTree';
    var LIST_SELECTOR = 'ul', LIST_ITEM_SELECTOR = 'li';
    var ROLE_ATTR_NAME = 'role', ARIA_LEVEL_ATTR_NAME = 'aria-level';
    var ARIA_TREE_ROLE = 'tree', ARIA_TREEITEM_ROLE = 'treeitem', ARIA_GROUP_ROLE = 'group';
    var HAS_CHILDREN_CLASS = 'has-children', NO_CHILDREN_CLASS = 'no-children';
    var COLLAPSED_CLASS = 'collapsed';
    var EXPANDED_CLASS = 'expanded';

    defaults = {
    };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this.init();
    }

    Plugin.prototype = {
        init : function () {
            var $tree = $(this.element);
            identifyChildren($tree, ARIA_TREE_ROLE, 1);
            addToggleClick($tree);
            addKeyBoardNav($tree);
        }
    };

    function addToggleClick($tree) {
        $tree.find('.toggle').on('click', function() {
            var $listWithToggle = $(this).parent('li');
            if (isCollapsed($listWithToggle)) {
                expand($listWithToggle);
            } else {
                collapse($listWithToggle);
            }
        });
    }

    function addKeyBoardNav($tree) {
        $tree.find('li').attr('tabindex','0');
        $tree.on('keydown', function(event) {
            var $currentFocusedElement = $tree.find('li:focus');
            if (event.which === 40) {
                handleDownArrowKey($currentFocusedElement);
            } else if (event.which === 38) {
                handleUpArrowKey($currentFocusedElement);
            } else if (event.which === 39) {
                handleRightArrowKey($currentFocusedElement);
            } else if (event.which === 37) {
                handleLeftArrowKey($currentFocusedElement);
            }
        });
    }

    function handleLeftArrowKey($item) {
        if (isExpanded($item)) {
            collapse($item);
        } else {
            focusOn(findParent($item));
        }
    }

    function handleRightArrowKey($item) {
        if (isCollapsed($item)) {
            expand($item);
        } else if (isExpanded($item)) {
            focusOn(findFirstChild($item));
        }
    }

    function handleUpArrowKey($item) {
        if (isExpanded($item.prev())) {
            var $previousSiblingList = $item.prev().children('ul');
            focusOn(findLastChild($previousSiblingList).focus());
        } else if ($item.prev().length === 0) {
            focusOn(findParent($item));
        } else {
            focusOn($item.prev());
        }
    }

    function handleDownArrowKey($item) {
        if (hasChildren($item) && isExpanded($item)) {
            focusOn(findFirstChild($item));
        } else if ($item.next().length === 0) {
            focusOn(findParent($item).next());
        } else {
            focusOn($item.next());
        }
    }

    function hasChildren($item) {
        return $item.hasClass(HAS_CHILDREN_CLASS);
    }

    function focusOn($item) {
        $item.focus();
    }

    function expand($item) {
        $item.removeClass(COLLAPSED_CLASS).addClass(EXPANDED_CLASS);
    }

    function collapse($item) {
        $item.removeClass(EXPANDED_CLASS).addClass(COLLAPSED_CLASS);
    }

    function findParent($item) {
        return $item.parent('ul').parent('li');
    }

    function findLastChild($list) {
        return $list.find(' > li:last-child');
    }

    function findFirstChild($item) {
        return $item.children('ul').find(' > li:nth-child(1)');
    }

    function isExpanded($item) {
        return $item.hasClass(EXPANDED_CLASS);
    }

    function isCollapsed($item) {
        return $item.hasClass(COLLAPSED_CLASS);
    }

    function identifyListItemWithChildren($listItem) {
        $listItem.addClass(HAS_CHILDREN_CLASS).addClass(COLLAPSED_CLASS);
        $listItem.prepend('<div class="toggle" aria-hidden="true"></div>');
    }

    function identifySubChildren($listItem, nestingLevel) {
        var $childList = $listItem.children(LIST_SELECTOR);
        if ($childList.length > 0) {
            identifyListItemWithChildren($listItem);
            identifyChildren($childList, ARIA_GROUP_ROLE, nestingLevel + 1);
        } else {
            $listItem.addClass(NO_CHILDREN_CLASS);
        }
    }

    function identifyChildren($list, listRole, nestingLevel) {
        $list.attr(ROLE_ATTR_NAME, listRole);
        var $listItems = $list.children(LIST_ITEM_SELECTOR);
        $listItems.attr(ROLE_ATTR_NAME,ARIA_TREEITEM_ROLE).attr(ARIA_LEVEL_ATTR_NAME,nestingLevel);
        $listItems.each(function() {
            identifySubChildren($(this), nestingLevel);
        });
    }

    $.fn[PLUGIN_NAME] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + PLUGIN_NAME)) {
                $.data(this, 'plugin_' + PLUGIN_NAME,
                    new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );
