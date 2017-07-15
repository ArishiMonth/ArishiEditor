/**
 * ==========================================================
 * Copyright (C)
 * 公用组件JS
 * Author: Arishi
 * Date: 2017-7-11
 * ==========================================================
 */

function Editor() {
    this.$wrap = $('#uploader');
    this.Node = null;
    this.imageList = [];
    this.imgUploadHtml = $("#uploader").html();
    this.Init();


}
Editor.prototype={
    Init:function(){
        this.setContentHeight();
        this.bindEvent.AddImg.call(this);
        this.bindEvent.NodeChange.call(this);
        this.bindEvent.SaveData.call(this);
        this.initUploader();
        this.Resize();
    },
    bindEvent:{
        AddImg:function(){
            var that = this;
            $("#imgModal").on("shown.bs.modal", function () {
                that.initUploader();
            });
            $("#imgModal").on("hidden.bs.modal", function () {
                that.destroy();
            });
            $(document).on("click", "button[name=saveSort]", function () {
                if (that.imageList.length <= 0) {
                    Ewin.alert({ message: "不存在已上传图片" });
                } else {
                    that.imgChange("#content");
                     $("#imgModal").modal("hide");
                }
            });
            $(document).on("click", "#content>img", function (e) {
                Ewin.confirm({message:"是否删除该图片？"}).on(function(){
                    $("#content")[0].removeChild(e.target);
                });
            });
        },
        NodeChange:function(){
            var that=this;
            var $p=document.createElement("p");
            $("#content").keyup( function(e) {
                var $div= $("#content");
                //处理当删除到div时，要重新给p标签展位
                if($div.html()=="" ){
                    $div.append("<p><br/></p>");
                }
            });
            $("#content").mousedown(function(e) {
                that.Node= e.target;
            });
        },
        /**
         * 最后保存获取html
         * */
        SaveData:function(){
            var that=this;
            $(document).on("click","#btn_Save",function(){
                var $html = that.getAllHtml();
                Ewin.alert({ message: $html });
              // alert($html);
              // console.log($html);
            });
        }
    },
    /**
    图片上传插件初始化
    */
    initUploader:function(){
        var _this = this,
       $ = jQuery,    // just in case. Make sure it's not an other libaray.
       $wrap = _this.$wrap,
       // 图片容器
       $queue = $('<ul class="filelist"></ul>')
           .appendTo($wrap.find('.queueList')),

       // 状态栏，包括进度和控制按钮
       $statusBar = $wrap.find('.statusBar'),

       // 文件总体选择信息。
       $info = $statusBar.find('.info'),

       // 上传按钮
       $upload = $wrap.find('.uploadBtn'),

       // 没选择文件之前的内容。
       $placeHolder = $wrap.find('.placeholder'),

       // 总体进度条
       $progress = $statusBar.find('.progress').hide(),

       // 添加的文件数量
       fileCount = 0,

       // 添加的文件总大小
       fileSize = 0,

       // 优化retina, 在retina下这个值是2
       ratio = window.devicePixelRatio || 1,

       // 缩略图大小
       thumbnailWidth = 90 * ratio,
       thumbnailHeight = 90 * ratio,

       // 可能有pedding, ready, uploading, confirm, done.
       state = 'pedding',
       // 所有文件的进度信息，key为file id
       percentages = {},
       BASE_URL = "",
       supportTransition = (function () {
           var s = document.createElement('p').style,
               r = 'transition' in s ||
                     'WebkitTransition' in s ||
                     'MozTransition' in s ||
                     'msTransition' in s ||
                     'OTransition' in s;
           s = null;
           return r;
       })(),

       // WebUploader实例
       uploader;

        if (!WebUploader.Uploader.support()) {
            alert('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
            throw new Error('WebUploader does not support the browser you are using.');
        }
            // 实例化
            uploader = WebUploader.create({
                pick: {
                    id: '#filePicker',
                    label: '点击选择图片'
                },
                dnd: '#uploader .queueList',
                paste: document.body,

                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                },
                // swf文件路径
                swf: BASE_URL + '../../ueditor/third-party/webuploader/Uploader.swf',

                disableGlobalDnd: true,

                chunked: true,
                // server: 'http://webuploader.duapp.com/server/fileupload.php',
                server: '../UEditorController.ashx?action=uploadimage',
                fileNumLimit: 300,
                fileSizeLimit: 200 * 1024 * 1024,    // 200 M
                fileSingleSizeLimit: 5 * 1024 * 1024    // 5 M
            });
            // 添加“添加文件”的按钮，
            uploader.addButton({
                id: '#filePicker2',
                label: '继续添加'
            });

            uploader.on('uploadSuccess', function (file, ret) {
                var $file = $('#' + file.id);
                try {
                    var json = ret;
                    if (json.state == 'SUCCESS') {
                        _this.imageList.push(json);
                        //console.log(json)
                       // console.log(file)
                        $file.append('<span class="success"></span>');
                    } else {
                        $file.find('.error').text(json.state).show();
                    }
                } catch (e) {
                    $file.find('.error').text("服务器错误").show();
                }
            });
            uploader.onUploadProgress = function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress span');

                $percent.css('width', percentage * 100 + '%');
                percentages[file.id][1] = percentage;
                updateTotalProgress();
            };

            uploader.onFileQueued = function (file) {
                fileCount++;
                fileSize += file.size;

                if (fileCount === 1) {
                    $placeHolder.addClass('element-invisible');
                    $statusBar.show();
                }

                addFile(file);
                setState('ready');
                updateTotalProgress();
            };

            uploader.onFileDequeued = function (file) {
                fileCount--;
                fileSize -= file.size;

                if (!fileCount) {
                    setState('pedding');
                }

                removeFile(file);
                updateTotalProgress();

            };

            uploader.on('all', function (type) {
                var stats;
                switch (type) {
                    case 'uploadFinished':
                        setState('confirm');
                        break;

                    case 'startUpload':
                        setState('uploading');
                        break;

                    case 'stopUpload':
                        setState('paused');
                        break;

                }
            });

            uploader.onError = function (code,file) {
               // console.log(file)
                var message = "";
                switch (code) {
                    case "Q_TYPE_DENIED":
                        message = "文件类型错误";
                        break;
                    case "F_EXCEED_SIZE":
                    case "Q_EXCEED_SIZE_LIMIT":
                        message = "该文件大小超出范围";
                        break;
                    default:
                        message = code;
                        break;
                }
                Ewin.alert({ message: message });
            };
            updateTotalProgress();

        // 当有文件添加进来时执行，负责view的创建
        function addFile(file) {
            var $li = $('<li id="' + file.id + '">' +
                    '<p class="title">' + file.name + '</p>' +
                    '<p class="imgWrap"></p>' +
                    '<p class="progress"><span></span></p>' +
                    '</li>'),

                $btns = $('<div class="file-panel">' +
                    '<span class="cancel">删除</span>' +
                    '<span class="rotateRight">向右旋转</span>' +
                    '<span class="rotateLeft">向左旋转</span></div>').appendTo($li),
                $prgress = $li.find('p.progress span'),
                $wrap = $li.find('p.imgWrap'),
                $info = $('<p class="error"></p>'),

                showError = function (code) {
                    switch (code) {
                        case 'exceed_size':
                            text = '文件大小超出';
                            break;

                        case 'interrupt':
                            text = '上传暂停';
                            break;

                        default:
                            text = '上传失败，请重试';
                            break;
                    }

                    $info.text(text).appendTo($li);
                };

            if (file.getStatus() === 'invalid') {
                showError(file.statusText);
            } else {
                // @todo lazyload
                $wrap.text('预览中');
                uploader.makeThumb(file, function (error, src) {
                    if (error) {
                        $wrap.text('不能预览');
                        return;
                    }

                    var img = $('<img src="' + src + '">');
                    $wrap.empty().append(img);
                }, thumbnailWidth, thumbnailHeight);

                percentages[file.id] = [file.size, 0];
                file.rotation = 0;
            }

            file.on('statuschange', function (cur, prev) {
                if (prev === 'progress') {
                    $prgress.hide().width(0);
                } else if (prev === 'queued') {
                    $li.off('mouseenter mouseleave');
                    $btns.remove();
                }

                // 成功
                if (cur === 'error' || cur === 'invalid') {
                    console.log(file.statusText);
                    showError(file.statusText);
                    percentages[file.id][1] = 1;
                } else if (cur === 'interrupt') {
                    showError('interrupt');
                } else if (cur === 'queued') {
                    percentages[file.id][1] = 0;
                } else if (cur === 'progress') {
                    $info.remove();
                    $prgress.css('display', 'block');
                } else if (cur === 'complete') {
                    $li.append('<span class="success"></span>');
                }

                $li.removeClass('state-' + prev).addClass('state-' + cur);
            });

            $li.on('mouseenter', function () {
                $btns.stop().animate({ height: 30 });
            });

            $li.on('mouseleave', function () {
                $btns.stop().animate({ height: 0 });
            });

            $btns.on('click', 'span', function () {
                var index = $(this).index(),
                    deg;

                switch (index) {
                    case 0:
                        uploader.removeFile(file);
                        return;

                    case 1:
                        file.rotation += 90;
                        break;

                    case 2:
                        file.rotation -= 90;
                        break;
                }

                if (supportTransition) {
                    deg = 'rotate(' + file.rotation + 'deg)';
                    $wrap.css({
                        '-webkit-transform': deg,
                        '-mos-transform': deg,
                        '-o-transform': deg,
                        'transform': deg
                    });
                } else {
                    $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');

                }


            });

            $li.appendTo($queue);
        }

        // 负责view的销毁
        function removeFile(file) {
            var $li = $('#' + file.id);
            delete percentages[file.id];
            updateTotalProgress();
            $li.off().find('.file-panel').off().end().remove();
        }

        function updateTotalProgress() {
            var loaded = 0,
                total = 0,
                spans = $progress.children(),
                percent;

            $.each(percentages, function (k, v) {
                total += v[0];
                loaded += v[0] * v[1];
            });

            percent = total ? loaded / total : 0;

            spans.eq(0).text(Math.round(percent * 100) + '%');
            spans.eq(1).css('width', Math.round(percent * 100) + '%');
            updateStatus();
        }

        function updateStatus() {
            var text = '', stats;

            if (state === 'ready') {
                text = '选中' + fileCount + '张';
            } else if (state === 'confirm') {
                stats = uploader.getStats();
                if (stats.uploadFailNum) {
                    text = '已成功上传' + stats.successNum + '张';
                }

            } else {
                stats = uploader.getStats();
                if (state !== 'uploading') {
                    text = '成功上传' + stats.successNum + '张';
                }

                if (stats.uploadFailNum) {
                    text += '，失败' + stats.uploadFailNum + '张';
                }
            }

            $info.html(text);
        }

        function setState(val) {
            var file, stats;

            if (val === state) {
                return;
            }

            $upload.removeClass('state-' + state);
            $upload.addClass('state-' + val);
            state = val;

            switch (state) {
                case 'pedding':
                    $placeHolder.removeClass('element-invisible');
                    $queue.parent().removeClass('filled');
                    $queue.hide();
                    $statusBar.addClass('element-invisible');
                    uploader.refresh();
                    break;

                case 'ready':
                    $placeHolder.addClass('element-invisible');
                    $('#filePicker2').removeClass('element-invisible');
                    $queue.parent().addClass('filled');
                    $queue.show();
                    $statusBar.removeClass('element-invisible');
                    uploader.refresh();
                    break;

                case 'uploading':
                    $('#filePicker2').addClass('element-invisible');
                    $progress.show();
                    $upload.text('暂停上传');
                    break;

                case 'paused':
                    $progress.show();
                    $upload.text('继续上传');
                    break;

                case 'confirm':
                    $progress.hide();
                    $upload.text('开始上传').addClass('disabled');

                    stats = uploader.getStats();
                    if (stats.successNum && !stats.uploadFailNum) {
                        setState('finish');
                        return;
                    }
                    break;
                case 'finish':
                    stats = uploader.getStats();
                    $('#filePicker2').removeClass('element-invisible');
                    $upload.text('开始上传').removeClass('disabled');
                    if (stats.successNum) {
                        // alert('上传成功');
                    } else {
                        // 没有成功的图片，重设
                        state = 'done';
                        location.reload();
                    }
                    break;
            }

            updateStatus();
        }


        $upload.on('click', function () {
            if ($(this).hasClass('disabled')) {
                return false;
            }

            if (state === 'ready') {
                uploader.upload();
            } else if (state === 'paused') {
                uploader.upload();
            } else if (state === 'uploading') {
                uploader.stop();
            }
        });

        $info.on('click', '.retry', function () {
            uploader.retry();
        });

        $info.on('click', '.ignore', function () {
           // alert('todo');
        });
        $upload.addClass('state-' + state);
    },
    /**
    *图片上传插件销毁
    */
    destroy: function () {
        this.$wrap.empty();
        this.$wrap.append(this.imgUploadHtml);
    },
    /**
     图片选择更改时处理
     */
    imgChange: function (obj1) {
        var that = this;
        var imgContainer = $(obj1)[0];
        if(imgContainer.children.length>0 && imgContainer.children[0].firstChild && imgContainer.children[0].firstChild.nodeName.toLowerCase()=="br"){
            $(obj1).empty();
        }
        if(imgContainer.lastElementChild && imgContainer.lastElementChild.nodeName.toLowerCase()=="p" && (imgContainer.lastElementChild.innerHTML=="<br>" || imgContainer.lastElementChild.innerHTML=="")){
            imgContainer.removeChild(imgContainer.lastElementChild);
        }
        for (var i = 0; i < that.imageList.length; i++) {
            var img = document.createElement("img");
            img.setAttribute("src", that.imageList[i].url);
            imgContainer.appendChild(img);
        }
        that.imageList = [];
        $("#content").append("<p><br/></p>");
        //that.imgRemove();
    },
    /**
     * 软键盘弹出时屏幕上移
     * */
    Resize: function () {
        var that = this;
        var height = window.innerHeight;
        window.onresize = function (e) {
            var opt = $dxh.common.getElementOffset(that.Node==null?$("#content")[0].lastChild:that.Node);
            if (window.innerHeight < height-30) {
                setTimeout(function () {
                    // 使用定时器是为了让输入框上滑时更加自然
                   $("#content").scrollTop(opt.top);
                }, 50);
            }
            //   var opt = $dxh.common.getElementOffset(that.Node);
            // that.Node=$("#content").clientY+document.body.scrollTop+document.documentElement.scrollTop;
            that.setContentHeight();
        }
    },
    /**
    屏幕高度发生变化时，界面高度自动改变
    */
    setContentHeight:function(){
       var $height=window.innerHeight-$("#footer").innerHeight()-20;
       //alert(window.innerHeight + "," + window.screen.availHeight)
        $("#content").css("height",$height+"px");
    },
    /**
     * 获取html
     * @return: 以<html><head>...</head><body>...</body></html>形式返回
     * */
    getAllHtml:function(){
        var $headHtml=$("#editorCss")[0].href;
        $headHtml= '<link rel="stylesheet" href="'+$headHtml+'" />';
        return '<html><head>' + '<meta http-equiv="Content-Type" content="text/html; charset="UTF-8"/>'
                +'<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width, minimal-ui">'
                + $headHtml + '</head>'
                + '<body class="view">' + $("#content").html() + '</body></html>';
    }
}
$(function () {
    "use strict";
this.editor=new Editor();

});
