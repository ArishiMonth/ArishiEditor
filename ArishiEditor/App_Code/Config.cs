// =================================================================== 
// 项目说明
//====================================================================
// 文件： Config
// 创建时间：2017/6/10
// Ueditor插件配置类
// ===================================================================
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Web;

/// <summary>
/// Config 的摘要说明
/// </summary>
public static class Config
    {
        private static bool noCache = true;
        /// <summary>
        /// 读取上传相关配置，配置文件为config.json
        /// </summary>
        /// <returns></returns>
        private static JObject BuildItems()
        {
            var json = File.ReadAllText(HttpContext.Current.Server.MapPath("config.json"));
            return JObject.Parse(json);
        }
        /// <summary>
        /// 返回类型类
        /// </summary>
        public static JObject Items
        {
            get
            {
                if (noCache || _Items == null)
                {
                    _Items = BuildItems();
                }
                return _Items;
            }
        }
        private static JObject _Items;

        public static T GetValue<T>(string key)
        {
            return Items[key].Value<T>();
        }
        /// <summary>
        /// 获取图片类型列表
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static String[] GetStringList(string key)
        {
            return Items[key].Select(x => x.Value<String>()).ToArray();
        }
        /// <summary>
        /// 获取字符串类型配置数据
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static String GetString(string key)
        {
            return GetValue<String>(key);
        }
        /// <summary>
        /// 获取整型配置数据
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static int GetInt(string key)
        {
            return GetValue<int>(key);
        }
    }

