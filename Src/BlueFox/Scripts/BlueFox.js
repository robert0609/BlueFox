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
    this.RenderCanvas = document.createElement('canvas');
    this.RenderContext = this.RenderCanvas.getContext('2d');

    this.CLocation = new BFLocationClass(0, 0);
    this.CSize = new BFSizeClass(0, 0);

    this.SLocation = new BFLocationClass(0, 0);
    this.SSize = new BFSizeClass(0, 0);

    this.DLocation = new BFLocationClass(0, 0);
    this.DSize = new BFSizeClass(0, 0);

    this.FoundationLocation = new BFLocationClass(0, 0);
    this.FoundationSize = new BFSizeClass(0, 0);
    this.ZOrder = 0;

    this._image = BFResourceContainer.GetImage(imageFilePath);

    /**
     * 每帧都会调用Draw方法绘制
     * @constructor
     */
    this.Draw = function ()
    {
        if (this._image.ImageLoaded)
        {
            this.RenderCanvas.width = this.CSize.Width;
            this.RenderCanvas.height = this.CSize.Height;
            this.RenderContext.drawImage(this._image.ImageCanvas, this.SLocation.X, this.SLocation.Y, this.SSize.Width, this.SSize.Height, this.DLocation.X, this.DLocation.Y, this.DSize.Width, this.DSize.Height);
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
        this.DLocation = new BFLocationClass(0, 0);
        this.DSize = new BFSizeClass(this._image.ImageCanvas.width, this._image.ImageCanvas.height);
        this.CSize = new BFSizeClass(this._image.ImageCanvas.width, this._image.ImageCanvas.height);
    };

    /**
     * 切换该绘图单元的图片
     * @param imageFilePath: string类型 图片文件相对路径
     * @constructor
     */
    this.ChangeImage = function (imageFilePath)
    {
        if (this._image.ImageFilePath == imageFilePath)
        {
            return;
        }
        this._image = BFResourceContainer.GetImage(imageFilePath);
    };

    /**
     * 将此绘图单元添加至某DOM元素
     * @param element: 要追加至的DOM元素
     * @constructor
     */
    this.AppendTo = function (element)
    {
        element.appendChild(this.RenderCanvas);
    };
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
    _bufferCanvas.width = 800;
    _bufferCanvas.height = 600;
    document.body.appendChild(_bufferCanvas);
    var _bufferContext = _bufferCanvas.getContext('2d');

    BFWorldClass();
    var map = new BFMapClass();

    var _draw = function ()
    {
        for (var i = 0; i < map.CellList.length; ++i)
        {
            map.CellList[i].Update();
            map.CellList[i].Draw();
            _bufferContext.drawImage(map.CellList[i].RenderCanvas, 0, 0, map.CellList[i].CSize.Width, map.CellList[i].CSize.Height, map.CellList[i].CLocation.X, map.CellList[i].CLocation.Y, map.CellList[i].CSize.Width, map.CellList[i].CSize.Height);
        }

    };

    this.Run = function ()
    {
        window.setInterval(_draw, BFGlobal.Interval);
    };
}


