;(function ( $, window, document, undefined ) {
    var PLUGIN_NAME = 'a11yTree';

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
                identifyTree($(this.element));
                checkForChildren($(this.element), 1);
            }
    };

    function identifyTree(obj) {
        obj.attr('role','tree');
    }

    function checkForChildren(obj, nestingLevel) {
        obj.children('li').each(function(idx, listItem) {
            $(listItem).attr('role','treeitem');
            $(listItem).attr('aria-level',nestingLevel);

            var childList = $(listItem).children('ul');
            if (childList.length > 0) {
                childList.attr('role','group');
                $(listItem).addClass('has-children');
                checkForChildren(childList, nestingLevel+1);
                return;
            }
            $(listItem).addClass('no-children');
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
