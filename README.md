# ArishiEditor

ArishiEditor利用HTML5的contenteditable特性实现简单富文本编辑器，图片上传插件使用百度的webuploader;

目录

   ——ArishiEditor：具有图片上传后台（.net）的完整demo
   
   ——src:无后台demo，纯前端展示，图片使用base64位字符串进行预览

该编辑器兼容移动端与PC端，图片上传后端使用.NET，如1.1所示，根据不同语言改变后台地址即可，
图片插件后端相关详细规则查看webuploader官网(http://fex.baidu.com/webuploader/doc/index.html)：

1.1：

 uploader = WebUploader.create({
  ...
  server: '../UEditorController.ashx?action=uploadimage',
  ...
  });

#2017/7/14 Arishi

修改换行无焦点问题（换行将div换成p标签后焦点丢失，暂时无解决办法，目前的修改办法是
使用div标签，修改编辑内相关样式，保证div标签样式与p标签一致）

#2017/7/21 将插件进行封装
