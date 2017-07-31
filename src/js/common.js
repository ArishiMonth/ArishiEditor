/**
 * Created by Administrator on 2017/7/27.
 */
if (typeof $arishi=== 'undefined') {
    var $arishi = {
        version: '1.0.0'
    };
}

$arishi.common={
    /**
     * info
     * @param: {str} display [显示/隐藏 show/hide]
     * @param: {obj} options [参数]
     * author: ghj
     * time: 2013-10-22 15:08:01
     */
    info: function (display, options) {
        var defaults = {
            // 新增参数
            html: '<div class="alert-info"><div class="info-content"></div></div>',
            content: '',
            timeout: 1000,
            container: 'body'
        };
        var config = $.extend(true, {}, defaults, options),
            $container = $(config.container),
            $node = $(config.html),
            mTop = null,mLef=null;
        if (display === 'show') {
            $node.css({
                "position": "fixed",
                "top": "40%",
                "left": "30%",
                'textAlign': 'center',
                'border': 0,
                "z-index": 99999
            });
            if ($(".alert-info", $container).length === 0) {
                $node.find('.info-content').text(config.content === '' ? '正在加载...' : config.content);
                $container.append($node);
                setTimeout(function () {
                    $(".alert-info", $container).remove();
                }, config.timeout);
            }

        } else if (display === 'hide') {
            $(".alert-info", $container).remove();
        }
    }
}