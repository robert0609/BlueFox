/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-9
 * Time: 下午1:36
 * To change this template use File | Settings | File Templates.
 */
/**
 * 全局变量缓存对象
 * @type {object}
 */
var BFGlobal = null;
/**
 * 构造全局变量缓存对象
 */
GetBFGlobal();

/**
 * 构造全局变量缓存对象
 * @return {object}
 * @method
 */
function GetBFGlobal()
{
    if (BFGlobal == null)
    {
        BFGlobal = new Object();
        // 每秒帧数
        BFGlobal.FPS = 30;
        // 每帧间隔时间，毫秒
        BFGlobal.Interval = 1000 / BFGlobal.FPS;
    }
    return BFGlobal;
}

/**
 * 位置类
 * @param x: 横坐标
 * @param y: 纵坐标
 * @constructor
 */
function BFLocationClass(x, y)
{
    this.X = Number(x);
    this.Y = Number(y);
}

/**
 * 尺寸类
 * @param w: 宽度
 * @param h: 高度
 * @constructor
 */
function BFSizeClass(w, h)
{
    this.Width = Number(w);
    this.Height = Number(h);
}

/**
 * 键值对
 * @param key: 键
 * @param value: 值
 * @constructor
 */
function BFKeyValuePairClass(key, value)
{
    this.Key = String(key);
    this.Value = value;
}

/**
 * 字典结构
 * @constructor
 */
function BFDictionaryClass()
{
    // 将当前创建的实例缓存起来
    var _instance = this;

    var _innerList = new Array();

    _instance.Add = function (key, value)
    {
        if (_instance.ContainsKey(key))
        {
            throw 'BFDictionary已经存在Key:' + key + '，无法重复添加';
        }
        else
        {
            var pair = new BFKeyValuePairClass(key, value);
            _innerList.push(pair);
        }
    };

    _instance.Get = function (key)
    {
        var ret = null;
        for (var i = 0; i < _innerList.length; ++i)
        {
            if (_innerList[i].Key == String(key))
            {
                ret = _innerList[i].Value;
                break;
            }
        }
        return ret;
    };

    _instance.ContainsKey = function (key)
    {
        var ret = false;
        for (var i = 0; i < _innerList.length; ++i)
        {
            if (_innerList[i].Key == String(key))
            {
                ret = true;
                break;
            }
        }
        return ret;
    };
}