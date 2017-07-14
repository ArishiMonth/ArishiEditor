<%@ WebHandler Language="C#" Class="UEditorHandler" %>
using System;
using System.Web;
using System.IO;
using System.Collections;
using Newtonsoft.Json;
/// <summary>
/// 编辑器中上传方法实现
/// </summary>
public class UEditorHandler : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        Handler action = null;
        switch (context.Request["action"])
        {
            //初始化
            case "config":
                action = new ConfigHandler(context);
                break;
            //获取图片相关参数
            case "uploadimage":
                action = new UploadHandler(context, new UploadConfig()
                {
                    AllowExtensions = Config.GetStringList("imageAllowFiles"),
                    PathFormat = Config.GetString("imagePathFormat"),
                    SizeLimit = Config.GetInt("imageMaxSize"),
                    imageUrlPrefix=Config.GetString("imageUrlPrefix"),
                    UploadFieldName = Config.GetString("imageFieldName")
                });
                break;
        }
        action.Process();
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}