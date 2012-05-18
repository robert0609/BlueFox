/**
 * Created with JetBrains WebStorm.
 * User: yangxu(Role:admin)
 * Date: 12-5-5
 * Time: 下午6:21
 * To change this template use File | Settings | File Templates.
 */
/**
 * 所有资源的容器
 * @type {BFResourceContainerClass}
 */
var BFResourceContainer = new BFResourceContainerClass();
/**
 * 需要每帧刷新的对象列表
 * @type {BFRefreshListClass}
 */
var BFRefreshList = new BFRefreshListClass();

/**
 * 基本绘图单元
 * @param imageFilePath: string类型 图片文件相对路径
 * @constructor
 */
function BFRenderClass(imageFilePath)
{
    // 将当前创建的实例缓存起来
    var _instance = this;

    _instance.RenderCanvas = document.createElement('canvas');
    _instance.RenderContext = _instance.RenderCanvas.getContext('2d');

    _instance.CLocation = new BFLocationClass(0, 0);
    _instance.CSize = new BFSizeClass(0, 0);

    _instance.SLocation = new BFLocationClass(0, 0);
    _instance.SSize = new BFSizeClass(0, 0);

    _instance.DLocation = new BFLocationClass(0, 0);
    _instance.DSize = new BFSizeClass(0, 0);

    _instance.FoundationLocation = new BFLocationClass(0, 0);
    _instance.FoundationSize = new BFSizeClass(0, 0);
    _instance.ZOrder = 0;

    _instance._image = BFResourceContainer.GetImage(imageFilePath);

    /**
     * 每帧都会调用Draw方法绘制
     * @constructor
     */
    _instance.Draw = function ()
    {
        if (_instance._image.ImageLoaded)
        {
            _instance.RenderCanvas.width = _instance.CSize.Width;
            _instance.RenderCanvas.height = _instance.CSize.Height;
            _instance.RenderContext.drawImage(_instance._image.ImageCanvas, _instance.SLocation.X, _instance.SLocation.Y, _instance.SSize.Width, _instance.SSize.Height, _instance.DLocation.X, _instance.DLocation.Y, _instance.DSize.Width, _instance.DSize.Height);
        }
    };

    /**
     * 每帧都会调用Update方法更新该绘图单元的位置及尺寸
     * @constructor
     */
    _instance.Update = function ()
    {
        _instance.SLocation.X = 0;
        _instance.SLocation.Y = 0;
        _instance.SSize.Width = _instance._image.ImageCanvas.width;
        _instance.SSize.Height = _instance._image.ImageCanvas.height;
        _instance.DLocation.X = 0;
        _instance.DLocation.Y = 0;
        _instance.DSize.Width = _instance._image.ImageCanvas.width;
        _instance.DSize.Height = _instance._image.ImageCanvas.height;
        _instance.CSize.Width = _instance._image.ImageCanvas.width;
        _instance.CSize.Height = _instance._image.ImageCanvas.height;
    };

    /**
     * 切换该绘图单元的图片
     * @param imageFilePath: string类型 图片文件相对路径
     * @constructor
     */
    _instance.ChangeImage = function (imageFilePath)
    {
        if (_instance._image.ImageFilePath == imageFilePath)
        {
            return;
        }
        _instance._image = BFResourceContainer.GetImage(imageFilePath);
    };

    /**
     * 将此绘图单元添加至某DOM元素
     * @param element: 要追加至的DOM元素
     * @constructor
     */
    _instance.AppendTo = function (element)
    {
        element.appendChild(_instance.RenderCanvas);
    };

    /*_instance.MoveTo(targetLocation)
    {
        if (targetLocation instanceof BFLocationClass)
        {

        }
        else
        {
            throw '参数不是BFLocationClass类型';
        }
    }*/
}

/**
 * 所有加载的资源的容器
 * @constructor
 */
function BFResourceContainerClass()
{
    // 将当前创建的实例缓存起来
    var _instance = this;

    var _imageDic = new BFDictionaryClass();

    _instance.GetImage = function (imageFilePath)
    {
        if (_imageDic.ContainsKey(imageFilePath))
        {
            return _imageDic.Get(imageFilePath);
        }
        else
        {
            var img = new BFImage(imageFilePath);
            _imageDic.Add(imageFilePath, img);
            return img;
        }
    };
}

/**
 * 图片资源
 * @param imageFilePath: string类型 图片文件相对路径
 * @constructor
 */
function BFImage(imageFilePath)
{
    // 将当前创建的实例缓存起来
    var _instance = this;

    _instance._image = new Image();
    _instance.ImageCanvas = document.createElement('canvas');
    _instance.ImageCanvas.width = 32;
    _instance.ImageCanvas.height = 32;
    _instance.ImageLoaded = false;
    var _context = _instance.ImageCanvas.getContext('2d');

    _instance._image.onload = function ()
    {
        _instance.ImageCanvas.width = this.width;
        _instance.ImageCanvas.height = this.height;
        _context.drawImage(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        _instance.ImageLoaded = true;
    };

    _instance._image.src = imageFilePath;
    _instance.ImageFilePath = imageFilePath;
}

/**
 * 需要每帧刷新的对象列表
 * @constructor
 */
function BFRefreshListClass()
{
    // 将当前创建的实例缓存起来
    var _instance = this;
}

function BFApplicationClass()
{
    // 将当前创建的实例缓存起来
    var _instance = this;

    _instance.Render = null;

    var _draw = function ()
    {
        _instance.Render.Draw();
    };

    _instance.Run = function ()
    {
        window.setInterval(_draw, BFGlobal.Interval);
    };
}


