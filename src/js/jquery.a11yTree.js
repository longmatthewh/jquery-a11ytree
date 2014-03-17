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
                checkForChildren($(this.element));
            }
    };

    function checkForChildren(obj) {
        obj.children('li').each(function(idx, listItem) {
            var childList = $(listItem).children('ul');
            if (childList.length > 0) {
                checkForChildren(childList);
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
