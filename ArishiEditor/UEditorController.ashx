<%@ WebHandler Language="C#" Class="UEditorHandler" %>
using System;
using System.Web;
using System.IO;
using System.Collections;
using Newtonsoft.Json;
/// <summary>
/// �༭�����ϴ�����ʵ��
/// </summary>
public class UEditorHandler : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        Handler action = null;
        switch (context.Request["action"])
        {
            //��ʼ��
            case "config":
                action = new ConfigHandler(context);
                break;
            //��ȡͼƬ��ز���
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