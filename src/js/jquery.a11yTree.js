;(function ( $, window, document, undefined ) {
    var PLUGIN_NAME = 'a11yTree';
    var PLUGIN_PREFIX = 'plugin_';
    var LIST_SELECTOR = 'ul', LIST_ITEM_SELECTOR = 'li';
    var TABINDEX_ATTR_NAME = 'tabindex', TABINDEX_0 = '0';
    var KEYDOWN_EVENT = 'keydown', CLICK_EVENT = 'click';
    var ROLE_ATTR_NAME = 'role', ARIA_LEVEL_ATTR_NAME = 'aria-level';
    var ARIA_TREE_ROLE = 'tree', ARIA_TREEITEM_ROLE = 'treeitem', ARIA_GROUP_ROLE = 'group';
    var ARIA_SELECTED_ATTR = 'aria-selected', ARIA_EXPANDED_ATTR='aria-expanded';
    var HAS_CHILDREN_CLASS = 'at-has-children', HAS_CHILDREN_CLASS_SELECTOR = '.' + HAS_CHILDREN_CLASS;
    var NO_CHILDREN_CLASS = 'at-no-children';
    var TOGGLE_CLASS = 'at-toggle', TOGGLE_CLASS_SELECTOR = '.' + TOGGLE_CLASS;
    var DOWN_ARROW_KEY = 40, UP_ARROW_KEY = 38, RIGHT_ARROW_KEY = 39, LEFT_ARROW_KEY = 37;

    defaults = {
        insertToggle : true,
        customToggle : {
            html : undefined
        },
        onExpand : function() {},
        onCollapse : function() {}
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
            this.identifyChildren($tree, ARIA_TREE_ROLE, 1);
            this.addToggle($tree);
            this.addKeyBoardNav($tree);
            this.addNodeSelection($tree);
        },
        addNodeSelection : function($tree) {
            $tree.find('li').on('focus', function(event) {
                $tree.find('li').attr(ARIA_SELECTED_ATTR,'false');
                $(this).attr(ARIA_SELECTED_ATTR,'true');
            });
        },
        addToggle : function($tree) {
            var self = this;
            if (self.options.insertToggle === false) {
                return;
            }

            var toggleHtml = '';
            if (self.options.customToggle.html) {
                toggleHtml = self.options.customToggle.html;
            }


            $tree.find(HAS_CHILDREN_CLASS_SELECTOR).prepend('<div class="' + TOGGLE_CLASS  + '" aria-hidden="true">' + toggleHtml + '</div>');
            $tree.find(TOGGLE_CLASS_SELECTOR).on(CLICK_EVENT, function() {
                var $listWithToggle = $(this).parent(LIST_ITEM_SELECTOR);
                if (self.isCollapsed($listWithToggle)) {
                    self.expand($listWithToggle);
                } else {
                    self.collapse($listWithToggle);
                }
            });
        },
        addKeyBoardNav : function($tree) {
            this.addTreeItemsToTabOrder($tree);
            this.handleArrowKeys($tree);
        },
        handleArrowKeys : function($tree) {
            var self = this;
            $tree.on(KEYDOWN_EVENT, function(event) {
                var $currentFocusedElement = $tree.find('li:focus');
                if (event.which === DOWN_ARROW_KEY) {
                    event.preventDefault();
                    self.handleDownArrowKey($currentFocusedElement);
                } else if (event.which === UP_ARROW_KEY) {
                    event.preventDefault();
                    self.handleUpArrowKey($currentFocusedElement);
                } else if (event.which === RIGHT_ARROW_KEY) {
                    event.preventDefault();
                    self.handleRightArrowKey($currentFocusedElement);
                } else if (event.which === LEFT_ARROW_KEY) {
                    event.preventDefault();
                    self.handleLeftArrowKey($currentFocusedElement);
                }
            });
        },
        addTreeItemsToTabOrder : function($tree) {
            $tree.find(LIST_ITEM_SELECTOR).attr(TABINDEX_ATTR_NAME, TABINDEX_0);
        },
        handleLeftArrowKey : function($item) {
            if (this.isExpanded($item)) {
                this.collapse($item);
            } else {
                this.focusOn(this.findParent($item));
            }
        },
        handleRightArrowKey : function($item) {
            if (this.isCollapsed($item)) {
                this.expand($item);
            } else if (this.isExpanded($item)) {
                this.focusOn(this.findFirstChild($item));
            }
        },
        handleUpArrowKey : function($item) {
            if (this.isExpanded($item.prev())) {
                var $previousSiblingList = $item.prev().children(LIST_SELECTOR);
                this.focusOn(this.findLastChild($previousSiblingList).focus());
            } else if ($item.prev().length === 0) {
                this.focusOn(this.findParent($item));
            } else {
                this.focusOn($item.prev());
            }
        },
        handleDownArrowKey : function($item) {
            if (this.hasChildren($item) && this.isExpanded($item)) {
                this.focusOn(this.findFirstChild($item));
            } else if ($item.next().length === 0) {
                this.focusOn(this.findParent($item).next());
            } else {
                this.focusOn($item.next());
            }
        },
        hasChildren : function($item) {
            return $item.hasClass(HAS_CHILDREN_CLASS);
        },
        focusOn : function($item) {
            $item.focus();
        },
        expand : function($item) {
            if (this.options.onExpand) {
                this.options.onExpand($item);
            }
            $item.attr(ARIA_EXPANDED_ATTR,'true');
        },
        collapse : function($item) {
            if (this.options.onCollapse) {
                this.options.onCollapse($item);
            }
            $item.attr(ARIA_EXPANDED_ATTR,'false');
        },
        isExpanded : function($item) {
            return $item.attr(ARIA_EXPANDED_ATTR) === 'true';
        },
        isCollapsed : function($item) {
            return $item.attr(ARIA_EXPANDED_ATTR) === 'false';
        },
        findParent : function($item) {
            return $item.parent(LIST_SELECTOR).parent(LIST_ITEM_SELECTOR);
        },
        findLastChild : function($list) {
            return $list.find(' > li:last-child');
        },
        findFirstChild : function($item) {
            return $item.children(LIST_SELECTOR).find(' > li:nth-child(1)');
        },
        identifyListItemWithChildren : function($listItem) {
            this.collapse($listItem);
            $listItem.addClass(HAS_CHILDREN_CLASS);
        },
        identifySubChildren : function($listItem, nestingLevel) {
            var $childList = $listItem.children(LIST_SELECTOR);
            if ($childList.length > 0) {
                this.identifyListItemWithChildren($listItem);
                this.identifyChildren($childList, ARIA_GROUP_ROLE, nestingLevel + 1);
            } else {
                $listItem.addClass(NO_CHILDREN_CLASS);
            }
        },
        identifyChildren : function($list, listRole, nestingLevel) {
            var self = this;
            $list.attr(ROLE_ATTR_NAME, listRole);
            var $listItems = $list.children(LIST_ITEM_SELECTOR);
            $listItems.attr(ROLE_ATTR_NAME,ARIA_TREEITEM_ROLE).attr(ARIA_LEVEL_ATTR_NAME,nestingLevel);
            $listItems.each(function() {
                self.identifySubChildren($(this), nestingLevel);
            });
        }
    };

    $.fn[PLUGIN_NAME] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, PLUGIN_PREFIX + PLUGIN_NAME)) {
                $.data(this, PLUGIN_PREFIX + PLUGIN_NAME,
                    new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );