;(function ( $, window, document, undefined ) {
    var PLUGIN_NAME = 'a11yTree';
    var LIST_SELECTOR = 'ul', LIST_ITEM_SELECTOR = 'li';
    var ROLE_ATTR_NAME = 'role', ARIA_LEVEL_ATTR_NAME = 'aria-level';
    var ARIA_TREE_ROLE = 'tree', ARIA_TREEITEM_ROLE = 'treeitem', ARIA_GROUP_ROLE = 'group';
    var HAS_CHILDREN_CLASS = 'has-children', NO_CHILDREN_CLASS = 'no-children';

    defaults = {
        initShow: true,
        buttonShow: undefined,
        buttonHide: undefined
    };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this.init();
    }

    Plugin.prototype = {
            init : function () {
                var $parentList = $(this.element);
                identifyTree($parentList);
                identifyChildren($parentList, 1);
            }
    };

    function identifyTree($list) {
        $list.attr(ROLE_ATTR_NAME, ARIA_TREE_ROLE);
    }

    function identifyChildren($list, nestingLevel) {
        $list.children(LIST_ITEM_SELECTOR).each(function(idx, listItem) {
            var $listItem = $(listItem);

            $listItem.attr(ROLE_ATTR_NAME,ARIA_TREEITEM_ROLE);
            $listItem.attr(ARIA_LEVEL_ATTR_NAME,nestingLevel);

            var childList = $listItem.children(LIST_SELECTOR);
            if (childList.length > 0) {
                childList.attr(ROLE_ATTR_NAME,ARIA_GROUP_ROLE);
                $listItem.addClass(HAS_CHILDREN_CLASS);
                identifyChildren(childList, nestingLevel+1);
                return;
            }
            $listItem.addClass(NO_CHILDREN_CLASS);
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
