;(function ( $, window, document, undefined ) {
    var PLUGIN_NAME = 'a11yTree';
    var PLUGIN_PREFIX = 'plugin_';
    var LIST_SELECTOR = 'ul', LIST_ITEM_SELECTOR = 'li';
    var ID_ATTR_NAME = 'id', ITEM_ID_PREFIX = 'at-n', ITEM_ID_DATA_ATTR = 'at-identity', NODE_LABEL_SUFFIX = '-label';
    var TABINDEX_ATTR_NAME = 'tabindex';
    var KEYDOWN_EVENT = 'keydown', CLICK_EVENT = 'click';
    var ROLE_ATTR_NAME = 'role', ARIA_LEVEL_ATTR_NAME = 'aria-level';
    var ARIA_TREE_ROLE = 'tree', ARIA_TREEITEM_ROLE = 'treeitem', ARIA_GROUP_ROLE = 'group';
    var ARIA_SELECTED_ATTR = 'aria-selected', ARIA_EXPANDED_ATTR='aria-expanded', ARIA_ACTIVEDESCENDANT_ATTR='aria-activedescendant', ARIA_LABELLEDBY_ATTR = 'aria-labelledby';
    var EXPANDED_ITEM_SELECTOR = 'li[aria-expanded="true"]', ITEM_SELECTED_SELECTOR = '[aria-selected="true"]';
    var HAS_CHILDREN_CLASS = 'at-has-children', HAS_CHILDREN_CLASS_SELECTOR = '.' + HAS_CHILDREN_CLASS;
    var NO_CHILDREN_CLASS = 'at-no-children';
    var TOGGLE_CLASS = 'at-toggle', TOGGLE_CLASS_SELECTOR = '.' + TOGGLE_CLASS;
    var DOWN_ARROW_KEY = 40, UP_ARROW_KEY = 38, RIGHT_ARROW_KEY = 39, LEFT_ARROW_KEY = 37, ENTER_KEY=13, END_KEY=35, HOME_KEY=36;

    defaults = {
        treeLabelId : undefined,
        treeItemLabelSelector : undefined,
        toggleSelector : undefined,
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
            this.addTreeLabels($tree);
            this.addToggle($tree);
            this.addMouseNav($tree);
            this.addKeyBoardNav($tree);
        },
        addTreeLabels : function($tree) {
            var self = this;
            var treeLabelId = self.options.treeLabelId;
            if (treeLabelId && $('#' + treeLabelId).length > 0) {
                $tree.attr(ARIA_LABELLEDBY_ATTR,treeLabelId);
            }

            var treeItemLabelSelector = this.options.treeItemLabelSelector;
            if (treeItemLabelSelector) {
                var $treeItems =  $tree.find(HAS_CHILDREN_CLASS_SELECTOR);
                $treeItems.each(function() {
                    var $treeItem = $(this);
                    var labelId = $treeItem.children(treeItemLabelSelector).attr(ID_ATTR_NAME);
                    if (labelId) {
                        $treeItem.children(LIST_SELECTOR).attr(ARIA_LABELLEDBY_ATTR,labelId);
                    }
                });
            }
        },
        addToggle : function($tree) {
            var self = this;
            if (self.options.insertToggle === false) {
                return;
            }

            if (self.options.toggleSelector) {
                $tree.find(self.options.toggleSelector).addClass(TOGGLE_CLASS);
            } else {
                var toggleHtml = '';
                if (self.options.customToggle.html) {
                    toggleHtml = self.options.customToggle.html;
                }
                $tree.find(HAS_CHILDREN_CLASS_SELECTOR).prepend('<div class="' + TOGGLE_CLASS  + '" aria-hidden="true">' + toggleHtml + '</div>');
            }


            $tree.find(TOGGLE_CLASS_SELECTOR).on(CLICK_EVENT, function(event) {
                var $listItemWithToggle = $(this).parent(LIST_ITEM_SELECTOR);
                self.toggleExpandCollapse($listItemWithToggle);
            });
        },
        addMouseNav : function($tree) {
            var self = this;
            $tree.find(LIST_ITEM_SELECTOR).click(function(event) {
                event.stopPropagation();
                self.focusOn($(this), $tree);
            });
        },
        addKeyBoardNav : function($tree) {
            this.focusOn(this.findFirstListItem($tree),$tree);
            this.addTreeToTabOrder($tree);
            this.handleKeys($tree);
        },
        isKey : function(event, key) {
            return event.which === key;
        },
        handleKeys : function($tree) {
            var self = this;
            $tree.on(KEYDOWN_EVENT, function(event) {
                var $currentFocusedElement = $tree.find(ITEM_SELECTED_SELECTOR);
                if (self.isKey(event, DOWN_ARROW_KEY)) {
                    event.preventDefault();
                    self.handleDownArrowKey($currentFocusedElement, $tree);
                } else if (self.isKey(event, UP_ARROW_KEY)) {
                    event.preventDefault();
                    self.handleUpArrowKey($currentFocusedElement, $tree);
                } else if (self.isKey(event, RIGHT_ARROW_KEY)) {
                    event.preventDefault();
                    self.handleRightArrowKey($currentFocusedElement, $tree);
                } else if (self.isKey(event, LEFT_ARROW_KEY)) {
                    event.preventDefault();
                    self.handleLeftArrowKey($currentFocusedElement, $tree);
                } else if (self.isKey(event, ENTER_KEY)) {
                    self.handleEnterKey($currentFocusedElement, $tree);
                } else if (self.isKey(event, END_KEY)) {
                    event.preventDefault();
                    self.handleEndKey($currentFocusedElement, $tree);
                } else if (self.isKey(event, HOME_KEY)) {
                    event.preventDefault();
                    self.handleHomeKey($currentFocusedElement, $tree);
                }
            });
        },
        addTreeToTabOrder : function($tree) {
            $tree.attr(TABINDEX_ATTR_NAME, '0');
        },
        handleLeftArrowKey : function($item, $tree) {
            if (this.isExpanded($item)) {
                this.collapse($item);
            } else {
                this.focusOn(this.findParent($item), $tree);
            }
        },
        handleRightArrowKey : function($item, $tree) {
            if (this.isCollapsed($item)) {
                this.expand($item);
            } else if (this.isExpanded($item)) {
                this.focusOn(this.findFirstListItemInSubList($item), $tree);
            }
        },
        handleUpArrowKey : function($item, $tree) {
            var $prevSibling = $item.prev();
            if (this.isExpanded($prevSibling)) {
                this.focusOnLastVisibleElementInTree($prevSibling.children(LIST_SELECTOR), $tree);
            } else if ($item.prev().length === 0) {
                this.focusOn(this.findParent($item), $tree);
            } else {
                this.focusOn($item.prev(), $tree);
            }
        },
        handleDownArrowKey : function($item, $tree) {
            if (this.hasChildren($item) && this.isExpanded($item)) {
                this.focusOn(this.findFirstListItemInSubList($item), $tree);
            } else {
                this.focusOnNextAvailableSiblingInTree($item, $tree);
            }
        },
        handleEnterKey : function($item, $tree) {
            this.toggleExpandCollapse($item);
        },
        handleEndKey : function($item, $tree) {
            this.focusOnLastVisibleElementInTree($tree);
        },
        handleHomeKey : function($item, $tree) {
            this.focusOn(this.findFirstListItem($tree), $tree);
        },
        hasChildren : function($item) {
            return $item.hasClass(HAS_CHILDREN_CLASS);
        },
        focusOn : function($item, $tree) {
            if ($item.length === 1) {
                $tree.find(LIST_ITEM_SELECTOR).attr(ARIA_SELECTED_ATTR,'false');
                $item.attr(ARIA_SELECTED_ATTR,'true');
                $tree.attr(ARIA_ACTIVEDESCENDANT_ATTR, $item.attr(ID_ATTR_NAME));
            }
        },
        focusOnNextAvailableSiblingInTree : function($item, $tree) {
            if ($item.length === 0) {return;}

            if ($item.next().length > 0) {
                this.focusOn($item.next(), $tree);
            } else {
                this.focusOnNextAvailableSiblingInTree(this.findParent($item), $tree);
            }
        },
        focusOnLastVisibleElementInTree: function ($tree, $parentTree) {
            var $lastListItemInTree = $tree.find(LIST_ITEM_SELECTOR).last();
            var $listWithLastListItemInTree = $lastListItemInTree.parent(LIST_SELECTOR);
            if (!this.isParentTree($listWithLastListItemInTree)) {
                var $closestExpandedListItem = $lastListItemInTree.closest(EXPANDED_ITEM_SELECTOR);
                if ($closestExpandedListItem.length === 0) {
                    $listWithLastListItemInTree = $tree;
                } else {
                    $listWithLastListItemInTree = $closestExpandedListItem.children(LIST_SELECTOR);
                }
            }
            this.focusOn(this.findLastListItem($listWithLastListItemInTree), $parentTree || $tree);
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
        toggleExpandCollapse : function($item) {
            if (this.isCollapsed($item)) {
                this.expand($item);
            } else {
                this.collapse($item);
            }
        },
        isParentTree : function($list) {
            return $list.attr(ROLE_ATTR_NAME) === ARIA_TREE_ROLE;
        },
        findParent : function($item) {
            return $item.parent(LIST_SELECTOR).parent(LIST_ITEM_SELECTOR);
        },
        findLastListItem : function($list) {
            return $list.find(' > li:last-child');
        },
        findFirstListItem : function($list) {
            return $list.find(' > li:first-child');
        },
        findFirstListItemInSubList : function($item) {
            return $item.children(LIST_SELECTOR).find(' > li:first-child');
        },
        identifyListItemWithChildren : function($listItem) {
            this.collapse($listItem);
            $listItem.addClass(HAS_CHILDREN_CLASS);
        },
        identifySubChildren : function($listItem, $parentList, nestingLevel) {
            var $childList = $listItem.children(LIST_SELECTOR);
            if ($childList.length > 0) {
                this.identifyListItemWithChildren($listItem);
                this.identifyChildren($childList, ARIA_GROUP_ROLE, nestingLevel + 1, $parentList);
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
                self.addIdToListItem($(this), $list, nestingLevel);
                self.identifySubChildren($(this), $list, nestingLevel);
            });
        },
        addIdToListItem : function($listItem, $list) {
            var useId = this.generateListItemId($listItem, $list);
            this.addIdAsDataOrId($listItem, useId);
        },
        addIdAsDataOrId : function($listItem, useId) {
            var existingId = $listItem.attr(ID_ATTR_NAME);
            var nodeLabelIdPrefix = useId;
            if (!existingId) {
                $listItem.attr(ID_ATTR_NAME, useId);
            } else {
                nodeLabelIdPrefix = existingId;
                $listItem.data(ITEM_ID_DATA_ATTR,useId);
            }
            this.addIdToNodeLabel($listItem, nodeLabelIdPrefix);

        },
        addIdToNodeLabel : function($listItem, nodeLabelIdPrefix) {
            var treeItemLabelSelector = this.options.treeItemLabelSelector;
            if (treeItemLabelSelector) {
                var $treeItemLabel = $listItem.children(treeItemLabelSelector);
                var existingId = $treeItemLabel.attr(ID_ATTR_NAME);
                if (!existingId) {
                    $treeItemLabel.attr(ID_ATTR_NAME, nodeLabelIdPrefix + NODE_LABEL_SUFFIX);
                }
            }
        },
        generateListItemId : function($listItem, $list) {
            var id;
            if ($list.parent(LIST_ITEM_SELECTOR).length === 0) {
                id = ITEM_ID_PREFIX;
            } else {
                id = $listItem.data(ITEM_ID_DATA_ATTR) || $list.parent(LIST_ITEM_SELECTOR).attr(ID_ATTR_NAME);
            }
            return id + '-' + $list.children(LIST_ITEM_SELECTOR).index($listItem);
        }
    };

    $.fn[PLUGIN_NAME] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, PLUGIN_PREFIX + PLUGIN_NAME)) {
                $.data(this, PLUGIN_PREFIX + PLUGIN_NAME,
                    new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );