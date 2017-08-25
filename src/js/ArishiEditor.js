/**
 * ==========================================================
 * Copyright (C)
 * 简单编辑器ArishiEditor
 * Author: Arishi
 * Date: 2017-7-11
 * ==========================================================
 */
$.fn.extend({
    _opt: {
        imgTag:"imgModal",
        imgUrl:"/UEditorController.ashx?action=uploadimage",
        cssStyleId:"#editorCss",
        placeholder:"请输入内容",
        content:'',
        node:null,
        height:0,
        isHtml:false,
        //事件
        resizeHandler:undefined,
        getElementOffset:undefined
    },
    _img:{
        isPreView:true,//是否属于预览（后台无服务时为true,直接展示base64位）
        imageList:[],
        imgNode:null,
        $wrap :null,
        imgUploadHtml:""
    },
    ArishiEditor:function(options){
        var _this=this;

        _this._opt = $.extend(_this._opt, options);
        if (typeof (_this._opt.resizeHandler) !== 'function') {
            _this._opt.resizeHandler=_this.resizeHandler;
        }
        if (typeof (_this._opt.getElementOffset) !== 'function') {
            _this._opt.getElementOffset=_this.getElementOffset;
        }
        _this.Init(_this._opt.content);
        $(_this).on('mousedown', $.proxy(_this.mouseDownHandler, this));
        $(_this).blur(function (e) {
            $("body").scrollTop(0);
        });
        _this.placeholderHandler();
        _this.ImgModal.call(this);
        _this.initUploader();
        _this._opt.resizeHandler();
        _this.imgUpload();
        return{
            options: _this._opt,
            getAllHtml:$.proxy(this.getAllHtml, this),
            setContentHeight:$.proxy(this.setContentHeight, this)
        }
    },
    /**
     编辑器初始化
     */
    Init: function ($html) {
        var  _this=this;
        //截取获取编辑字符串
        var indexStart = $html.indexOf("<p"),
            indexEnd = $html.indexOf("</body");
        if (indexStart > 0 && indexEnd > 0) {
            $html = $html.substring(indexStart, indexEnd);
        }
        if ($html == "") {
            $(_this).html("<div class='e_font font_Editor'><br/></div>");
        } else {
            $(_this).html($html);
        }
        var styles = {
            "-webkit-user-select": "text",
            "user-select": "text",
            "text-break": "brak-all",
            "outline": "none",
            "cursor": "text"
        };
        var $height=_this._opt.height==0?"auto":_this._opt.height;
        _this.setContentHeight($height,_this._opt.height==0?true:false);
        $("#content>div").addClass("e_font");
        $("#content>.e_font").attr("contenteditable", true);
    },
    /**
     图片上传插件初始化
     */
    initUploader: function () {
        var _this = this,
            $ = jQuery,    // just in case. Make sure it's not an other libaray.
            $wrap = _this._img.$wrap,
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
            thumbnailWidth = 100 * ratio,
            thumbnailHeight = 100 * ratio,

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
            swf: BASE_URL + '../../webuploader/Uploader.swf',

            disableGlobalDnd: true,

            chunked: true,
            // server: 'http://webuploader.duapp.com/server/fileupload.php',
            server: _this._opt.imgUrl,
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
                var responseText = (ret._raw || ret),
                    json = JSON.parse(responseText),
                    $info = $('<p class="error"></p>');
                if (json.state == 'SUCCESS') {
                    //保证展示顺序不变
                    _this._img.imageList[$file.index()] = json;
                    $file.append('<span class="success"></span>');
                } else {
                    $file.find('.error').text(json.state).show();
                    fileCount--;
                }
            } catch (e) {
                $file.find('.error').text("服务器错误").show();
                fileCount--;
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
            if (fileCount > 0) {
                fileCount--;
            }
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

        uploader.onError = function (code, file) {
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
            alert(message);
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
                $info = $('<p class="error"></p>').hide().appendTo($li),

                showError = function (code) {
                    switch (code) {
                        case 'exceed_size':
                            text = '文件大小超出';
                            break;

                        case 'interrupt':
                            text = '上传暂停';
                            break;
                        case 'http':
                            text = "http请求错误";
                            break;
                        case 'not_allow_type':
                            text = "文件格式不允许";
                            break;
                        default:
                            text = '上传失败，请重试';
                            break;
                    }

                    $info.text(text).show();
                };

            if (file.getStatus() === 'invalid') {
                showError(file.statusText);
            } else {
                // @todo lazyload
                $wrap.text('预览中');
                if(_this._img.isPreView){
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        var base64Img= e.target.result;
                        _this._img.imageList.push({url:base64Img}) ;
                    };
                    reader.readAsDataURL(file.source.source);
                }
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
                    $info.hide();
                    $prgress.css('display', 'block');
                } else if (cur === 'complete') {
                    // $li.append('<span class="success"></span>');
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
                    text =  stats.uploadFailNum + '张上传失败,'+'<a class="retry" href="#">重新上传</a>';
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
        this._img.$wrap.empty();
        this._img.$wrap.append(this._img.imgUploadHtml);
    },
    /**
     图片选择更改时处理
     */
    imgChange: function (obj1) {
        var that = this;
        var imgContainer =obj1[0];
        if(imgContainer.lastElementChild && imgContainer.lastElementChild.nodeName.toLowerCase()=="p" && (imgContainer.lastElementChild.innerHTML=="<br>" || imgContainer.lastElementChild.innerHTML=="")){
         //   imgContainer.removeChild(imgContainer.lastElementChild);
            var $div = document.createElement("div"),
                $br = document.createElement("br");
            $div.appendChild($br);
            $div.setAttribute("class", "e_font font_Editor");
            $div.setAttribute("contenteditable", "true");
            imgContainer.appendChild($div);
        }
        for (var i = 0; i < that._img.imageList.length; i++) {
            data = that._img.imageList[i];
            if (data == undefined) {
                continue;
            }
            var img = document.createElement("img"),
                $div = document.createElement("div"),
                $br = document.createElement("br");
            $div.appendChild($br);
            $div.setAttribute("class", "e_font font_Editor");
            $div.setAttribute("contenteditable", "true");
            img.setAttribute("src", data.url);
            imgContainer.appendChild(img);
            imgContainer.appendChild($div);
        }
        that._img.imageList = [];
    },
    /**
     * 软键盘弹出时屏幕上移
     * */
    resizeHandler: function () {
        var that = this;
        var height = window.innerHeight;
        window.onresize = function (e) {
            var opt = that.getElementOffset(that.node==null?$(that)[0].lastChild:that.node);
            if (window.innerHeight < height-30) {
                setTimeout(function () {
                    // 使用定时器是为了让输入框上滑时更加自然
                    $(this).scrollTop(opt.top-50);
                }, 50);
            }
        }
    },
    /**
     屏幕高度发生变化时，界面高度自动改变
     */
    setContentHeight: function ($height,isAuto) {
        var _this=this;
        if(isAuto){
            $(this).css("height",$height);
        }else{
            $(this).css("height",$height+"px");
        }

    },
    /**
     * 获取html
     * @return: 以<html><head>...</head><body>...</body></html>形式返回
     * */
    getAllHtml:function(){
        this.setFontEditor();
        var _this=this,
            $headHtml = $(_this._opt.cssStyleId)[0].href,
            $bodyHtml=$(this).html(),
            $firstP="";
        if ($bodyHtml == "" || $bodyHtml == "<p><br></p>") {
            return "";
        }
        $headHtml = '<link rel="stylesheet" href="' + $headHtml + '" />';
        //判是否以p标签开头
        if ($bodyHtml.indexOf("<p") == 0) {
            $firstP = "";
        } else {
            $firstP = '<p class="hide"></p>';
        }
        $(this).find(".e_font").attr("contenteditable","true");
        this.placeholderHandler();
        return '<html><head>' + '<meta http-equiv="Content-Type" content="text/html; charset="UTF-8"/>'
            + '<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width, minimal-ui">'
            + $headHtml + '</head>'
            + '<body class="view">' + $firstP + $bodyHtml + '</body></html>';
    },
    setFontEditor: function () {
        $(this).find(".e_font").removeClass("font_Editor").addClass("font_Editor");
        var $pfonts =  $(this).find(".e_font");
        if ($pfonts.length > 0) {
            $pfonts.each(function (i,item) {
                var $html=$(item).html();
                if ($html.toLowerCase() != "<br>" && $html.toLowerCase() != "") {
                    $(item).removeClass("font_Editor");
                }
            })
        }
        $(this).find(".placeholder").remove();
        $(this).find(".e_font").removeAttr("contenteditable");
    },
    deleteImgHandler:function(){
        var that=this;
        $("#SingleimgModal").modal("hide");
        if(confirm("是否删除该图片？")){
            var preNode = that._img.imgNode.previousSibling.innerHTML,
                nextNode = that._img.imgNode.nextSibling.innerHTML;
            if (preNode == "" || preNode.toLowerCase() == "<br>") {
                preNode = nextNode;
            } else {
                preNode += "<br>" + nextNode;
            }
            $(that._img.imgNode.nextSibling).html(preNode);
            that._img.imgNode.parentNode.removeChild(that._img.imgNode.previousSibling);

            that._img.imgNode.parentNode.removeChild(that._img.imgNode);
            that._img.imgNode = null;
        }
    },
    mouseDownHandler:function(e){
        this._opt.node = e.target;
        if (e.target.nodeName.toLowerCase() == "img") {
            this._img.imgNode = e.target;
            $("#SingleimgModal").modal("show");
        }
    },
    updateImgHandler:function(){
        $("#SingleimgModal").modal("hide");
        $("#file").trigger("click");
    },
    /**
     * 图片上传插件弹窗
     * */
    ImgModal:function(){
        var _this=this,
            $imgUploadHtml=' <div class="statusBar" style="display:none;"> <div class="progress" style="display: none;">'
            +'<span class="text">0%</span> <span class="percentage" style="width: 0%;"></span> </div>'
            +'<div class="info" style="padding:0;line-height:27px;">共0张（0B），已上传0张</div> <div class="btns" style="top:-7px;right:0px;line-height: 30px;">'
            +'<div id="filePicker2" class="webuploader-container"> <div class="webuploader-pick">继续添加</div>'
            +'<div id="rt_rt_1bi0pe4e667mqnu1bskpr91jjb6" style="position: absolute; top: 0px; left: 0px; width: 1px; height: 1px; overflow: hidden;">'
            +'<input type="file" name="file" class="webuploader-element-invisible" multiple="multiple" accept="image/*">'
            +'<label style="opacity: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: rgb(255, 255, 255);"></label>'
            +'</div> </div> <div class="uploadBtn state-pedding">开始上传</div> </div> </div>'
            +'<div class="queueList"> <div id="dndArea" class="placeholder"> <div id="filePicker" class="webuploader-container">'
            +'<div class="webuploader-pick">点击选择图片</div>'
            +'<div id="rt_rt_1bi0pe4e21896147b1mh814gl12001" style="position: absolute; top: 0px; left: 448px; width: 168px; height: 44px; overflow: hidden; bottom: auto; right: auto;">'
            +'<input type="file" name="file" class="webuploader-element-invisible" multiple="multiple" accept="image/*">'
            +'<label style="opacity: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: rgb(255, 255, 255);"></label>'
            +'</div> </div> </div> <ul class="filelist"></ul> </div>',

             $html=' <div name="edit_img"> <div class="modal fade" id="'+_this._opt.imgTag+'" tabindex="-1" role="dialog" aria-labelledby="treeModalLabel" aria-hidden="true">'
            +'<div class="modal-dialog"> <div class="modal-content"> <div class="modal-header">'
            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true"> &times; </button>'
            +'<h4 class="modal-title">图片上传 </h4> </div>'
            +'<div class="modal-body"> <div id="uploader" class="wu-example"> '+$imgUploadHtml
            +'</div></div> <div class="modal-footer"> <button name="cancelAdd" type="button" class="btn btn-default" data-dismiss="modal">取消 </button>'
            +'<button name="saveSort" type="submit" class="btn btn-primary">确定 </button> </div> </div> </div> </div> </div>';
        $html+='<div class="modal bottom fade" id="SingleimgModal" style="top:auto;"tabindex="-1" role="dialog" aria-labelledby="treeModalLabel" aria-hidden="true">'+
            '<div class="modal-dialog" style="margin: 10px auto auto auto;width:100%;"> <form id="imgForm" target="_blank" class="hide">'+
            '<input type="file" name="file" id="file" data-min-file-count="1" value="" capture="camera" accept="image/*" /> </form>'+
            '<div class="modal-content btn-group-vertical" role="group" style="width:100%;">'+
            '<button name="updateImg"  type="button" class="btn btn-lg btn-b b1 " data-dismiss="modal">替换图片 </button>'+
            '<button name="deleteImg"  type="button" class="btn btn-lg btn-b b1 " data-dismiss="modal">删除图片 </button>'+
            '<button name="cancelAdd"  type="button" class="btn btn-lg btn-w b4" data-dismiss="modal">取消 </button> </div> </div> </div>'
        $(window.document.body).append($html);
        _this._img.$wrap = $('#uploader');
        _this._img.imgUploadHtml=$imgUploadHtml;
        $("#"+_this._opt.imgTag).on("shown.bs.modal", function () {
            _this.initUploader();
        });
        $("#"+_this._opt.imgTag).on("hidden.bs.modal", function () {
            _this.destroy();
        });
        $("#"+_this._opt.imgTag).on('click','button[name=saveSort]',function(e){
            var flag = _this._img.imageList.some(function (item) {
                return item != undefined;
            });
            if (_this._img.imageList.length <= 0 || !flag) {
                alert("不存在已上传图片");
            } else {
                _this.imgChange(_this);
                $("#"+_this._opt.imgTag).modal("hide");
            }
        });
        $(document).on('click', 'button[name=deleteImg]', function () {
            _this.deleteImgHandler();
        });
        $(document).on('click', 'button[name=updateImg]', function () {
            _this.updateImgHandler();
        });
    },
    /**
     获取元素对应位置
     *@e:dom对象
     */
    getElementOffset: function (e) {
        var t = e.offsetTop;
        var l = e.offsetLeft;
        var w = e.offsetWidth;
        var h = e.offsetHeight - 1;

        while (e = e.offsetParent) {
            t += e.offsetTop;
            l += e.offsetLeft;
        }
        return {
            top: t,
            left: l,
            width: w,
            height: h
        }
    },
    /**
     * 模拟input的placeholder属性
     * */
    placeholderHandler: function () {
        var _this = this;
        var imgReg = /<img\s*([\w]+=(\"|\')([^\"\']*)(\"|\')\s*)*\/?>/;
        $(".e_font:first").on('focus', function () {
            if ($.trim($(this).text()) === _this._opt.placeholder) {
                $(this).html('');
            }
        })
            .on('blur', function () {
                if (!$.trim($(this).text()) && !imgReg.test($(this).html())) {
                    $(this).html('<div class="placeholder" style="pointer-events: none;">' + _this._opt.placeholder + '</div>');
                }
            });

        if (!$.trim($(".e_font:first").text()) && !imgReg.test($(".e_font:first").html())) {
            $(".e_font:first").html('<div class="placeholder" style="pointer-events: none;">' + _this._opt.placeholder + '</div>');
        }
    },
    imgUpload: function () {
        var _upFile = document.getElementById("file"),
            that = this;;
        //文件上传控件change事件
        _upFile.addEventListener("change", function () {
            if (_upFile.files.length === 0) {
                return;
            }
            var oFile = _upFile.files[0];

            if (!new RegExp("(jpg|jpeg|png)+", "gi").test(oFile.type)) {
                Ewin.alert("照片上传：文件类型必须是JPG、JPEG、PNG");
                return;
            }
           /*有后台代码时使用
            $("#imgForm").ajaxSubmit({
                url: './UpLoadPhoto',
                type: 'POST',
                dataType: 'json',
                beforeSubmit: function () {
                    $dxh.common.loading('#content', 'show')
                },
                success: function (json) {
                    if (json.ResultCode == 1 && that.imgNode != null) {
                        $(that.imgNode).attr("src", json.Data);
                        that.imgNode = null;
                    } else {
                        Ewin.alert(json.ResultMsg);
                    }
                    $dxh.common.loading('#content', 'hide')
                }
            });*/
            var reader = new FileReader();
            reader.onload = function (e) {
                var base64Img = e.target.result;
                //压缩前预览
                $(that._img.imgNode).attr("src",base64Img);
                that._img.imgNode = null;
                // that.imgChange('#showImg', base64Img);
            };
            reader.readAsDataURL(oFile);
        }, false);
    },
});


