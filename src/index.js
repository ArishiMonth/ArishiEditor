/**
 * Created by Arishi on 2017/7/19.
 */
$(function(){
    var editor= $("#content").ArishiEditor({
        imgTag:"imgModal",
        imgUrl:"/UEditorController.ashx?action=uploadimage",
        content:'',
        cssStyleId:"#editorCss"
    });
    console.log(editor);
    editor.setContentHeight=function(){
        var $height = window.innerHeight - $("#footer").innerHeight() - 20;
        $("#content").css("height", $height + "px");
    };
    $(document).on("click","#btn_Save",function(){
        var $html = editor.getAllHtml();
        alert($html);
    });

});