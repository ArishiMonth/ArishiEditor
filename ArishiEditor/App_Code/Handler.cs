// =================================================================== 
// 项目说明
//====================================================================
// 文件： Handler
// 创建时间：2017/6/10
// Ueditor插件callback返回相关
// ===================================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;


    /// <summary>
    /// Handler 的摘要说明
    /// </summary>
public abstract class Handler
    {
        public Handler(HttpContext context)
        {
            this.Request = context.Request;
            this.Response = context.Response;
            this.Context = context;
            this.Server = context.Server;
        }

        public abstract void Process();
        /// <summary>
        /// 上传结果返回
        /// </summary>
        /// <param name="response"></param>
        protected void WriteJson(object response)
        {
            string jsonpCallback = Request["callback"],
                json = JsonConvert.SerializeObject(response);
            if (String.IsNullOrWhiteSpace(jsonpCallback))
            {
                Response.AddHeader("Content-Type", "text/plain");
                Response.Write(json);
            }
            else
            {
                Response.AddHeader("Content-Type", "application/javascript");
                Response.Write(String.Format("{0}({1});", jsonpCallback, json));
            }
            Response.End();
        }
        /// <summary>
        /// 请求
        /// </summary>
        public HttpRequest Request { get; private set; }
        /// <summary>
        /// 响应
        /// </summary>
        public HttpResponse Response { get; private set; }
        /// <summary>
        /// 当前连接
        /// </summary>
        public HttpContext Context { get; private set; }
        public HttpServerUtility Server { get; private set; }
    }
    /// <summary>
    /// 图片上传初始化配置
    /// </summary>
public class ConfigHandler : Handler
    {
        public ConfigHandler(HttpContext context) : base(context) { }
        /// <summary>
        /// 图片插件初始化配置返回
        /// </summary>
        public override void Process()
        {
            WriteJson(Config.Items);
        }
    }

