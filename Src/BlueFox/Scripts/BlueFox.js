/**
 * Created with JetBrains WebStorm.
 * User: yangxu(Role:admin)
 * Date: 12-5-5
 * Time: 下午6:21
 * To change this template use File | Settings | File Templates.
 */
/**
 * ------Global variant declare area Begin------
 */
/**
 * 所有资源的容器
 * @type {BFResourceContainerClass}
 */
var BFResourceContainer = null;
/**
 * 需要每帧刷新的对象列表
 * @type {BFRefreshListClass}
 */
var BFRefreshList = null;
/**
 * ------Global variant declare area End------
 */
/**
 * ------Javascript file onload callback Begin------
 */
/**
 * js文件加载执行回调
 */
(function ()
{
    BFResourceContainer = new BFResourceContainerClass();
    BFRefreshList = new BFRefreshListClass();
}());
/**
 * ------Javascript file onload callback End------
 */


/**
 * 基本绘图单元
 * @param imageFilePath: string类型 图片文件相对路径
 * @constructor
 */
function BFRenderClass(imageFilePath)
{
    this.CLocation = new BFLocationClass(0, 0);
    this.CSize = new BFSizeClass(0, 0);

    this.SLocation = new BFLocationClass(0, 0);
    this.SSize = new BFSizeClass(0, 0);

    this.FoundationLocation = new BFLocationClass(0, 0);
    this.FoundationSize = new BFSizeClass(0, 0);
    this.ZOrder = 0;

    if (imageFilePath == undefined || imageFilePath == null)
    {
        this._image = BFResourceContainer.GetImage('');
    }
    else
    {
        this._image = BFResourceContainer.GetImage(imageFilePath);
    }

    /**
     * 每帧都会调用Draw方法绘制
     * @constructor
     */
    this.Draw = function (context)
    {
        if (this._image.ImageLoaded)
        {
            context.drawImage(this._image.ImageCanvas, this.SLocation.X, this.SLocation.Y, this.SSize.Width, this.SSize.Height, this.CLocation.X, this.CLocation.Y, this.CSize.Width, this.CSize.Height);
        }
    };

    /**
     * 每帧都会调用Update方法更新该绘图单元的位置及尺寸
     * @constructor
     */
    this.Update = function ()
    {
        this.SLocation = new BFLocationClass(0, 0);
        this.SSize = new BFSizeClass(this._image.ImageCanvas.width, this._image.ImageCanvas.height);
        this.CLocation = new BFLocationClass(0, 0);
        this.CSize = new BFSizeClass(this._image.ImageCanvas.width, this._image.ImageCanvas.height);
    };

    /**
     * 切换该绘图单元的图片
     * @param imageFilePath: string类型 图片文件相对路径
     * @constructor
     */
    this.SetImage = function (imageFilePath)
    {
        var filePath;
        if (imageFilePath == undefined || imageFilePath == null)
        {
            filePath = '';
        }
        else
        {
            filePath = imageFilePath;
        }
        if (this._image.ImageFilePath == filePath)
        {
            return;
        }
        this._image = BFResourceContainer.GetImage(filePath);
    };

    /**
     * 将此绘图单元添加至某DOM元素
     * @param element: 要追加至的DOM元素
     * @constructor
     */
    /*this.AppendTo = function (element)
    {
        element.appendChild(this.RenderCanvas);
    };*/
}

/**
 * 所有加载的资源的容器
 * @constructor
 */
function BFResourceContainerClass()
{
    var _imageDic = new BFDictionaryClass();

    this.GetImage = function (imageFilePath)
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
    this._image = new Image();
    this.ImageCanvas = document.createElement('canvas');
    this.ImageCanvas.width = 32;
    this.ImageCanvas.height = 32;
    this.ImageLoaded = false;
    var _context = this.ImageCanvas.getContext('2d');

    var _instance = this;
    this._image.onload = function ()
    {
        _instance.ImageCanvas.width = this.width;
        _instance.ImageCanvas.height = this.height;
        _context.drawImage(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
        _instance.ImageLoaded = true;
    };

    this._image.src = imageFilePath;
    this.ImageFilePath = imageFilePath;
}

/**
 * 需要每帧刷新的对象列表
 * @constructor
 */
function BFRefreshListClass()
{
}

function BFApplicationClass()
{
    var _bufferCanvas = document.createElement('canvas');
    _bufferCanvas.width = 1280;
    _bufferCanvas.height = 960;
    document.body.appendChild(_bufferCanvas);
    var _bufferContext = _bufferCanvas.getContext('2d');

    var map = new BFMapClass();

    var _draw = function ()
    {
        map.Draw();
        _bufferContext.drawImage(map.MapCanvas, 0, 0, map.MapCanvas.width, map.MapCanvas.height, 0, 0, map.MapCanvas.width, map.MapCanvas.height);
    };

    this.Run = function ()
    {
        window.setInterval(_draw, BFGlobal.Interval);
    };
}


