/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-5
 * Time: 下午6:21
 * To change this template use File | Settings | File Templates.
 */

var BlueFox = (function (self)
{
    var ConstLoadingHtml = '<table style="width: 100%; height: 100%;"><tr><td style="text-align: center;vertical-align: middle;"><img src="./Resource/Img/loading.gif" /></td></tr></table>';
    var DebugHtml = '<table style="width: 1200px;"><tr><td id="mainCanvas" style="width: 850px;"></td><td style="width: 350px;"><textarea id="txtLog" style="width: 100%; height: 500px; "></textarea></td></tr></table>';

    try
    {
        // 调试开关
        self.DebugSwitch = false;
        /**
         * 所有资源的容器
         * @type {BFResourceContainerClass}
         */
        self.BFResourceContainer = new BFResourceContainerClass();
        // 每秒帧数
        self.FPS = 60;
        // 每帧间隔时间，毫秒
        self.Interval = 1000 / self.FPS;
        // 全局画布(即摄像机)
        self.GlobalBFCanvas = null;
        // 当前选中的元素
        self.SelectRender = null;
        // 当前捕获了鼠标光标的元素
        self.CaptureMouseRender = null;
        // 当前鼠标拖住的元素
        self.DragedRender = null;
        // 毫秒数,缓存了上一帧绘制结束的时刻,用以计算每帧耗时
        self.CurrentTime = 0;
        // 整个地图的屏幕尺寸
        self.MapScreenSize = new BFSizeClass(0, 0);
    }
    catch (ex)
    {
        OutputDebug(ex);
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

        this.Copy = function ()
        {
            return new BFLocationClass(this.X, this.Y);
        };

        this.Equal = function (location)
        {
            var b = false;
            if (this.X == location.X && this.Y == location.Y)
            {
                b = true;
            }
            return b;
        };
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

        this.Copy = function ()
        {
            return new BFSizeClass(this.Width, this.Height);
        };

        this.Equal = function (size)
        {
            var b = false;
            if (this.Width == size.Width && this.Height == size.Height)
            {
                b = true;
            }
            return b;
        };
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
     * 字典类
     * @constructor
     */
    function BFDictionaryClass()
    {
        //private varible
        var _innerList = new Array();

        //private method
        var _getPairByKey = function (key)
        {
            var ret = null;
            for (var i = 0; i < _innerList.length; ++i)
            {
                if (_innerList[i].Key == String(key))
                {
                    ret = _innerList[i];
                    break;
                }
            }
            return ret;
        };

        //public method
        this.Add = function (key, value)
        {
            if (this.ContainsKey(key))
            {
                throw 'KeyValuePair that its Key is [:' + key + '] was already added in BFDictionary!';
            }
            else
            {
                var pair = new BFKeyValuePairClass(key, value);
                _innerList.push(pair);
            }
        };

        this.Get = function (key)
        {
            var ret = null;
            var pair = _getPairByKey(key);
            if (pair != null)
            {
                ret = pair.Value;
            }
            return ret;
        };

        this.ContainsKey = function (key)
        {
            if (_getPairByKey(key) == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        };

        this.ToList = function ()
        {
            return _innerList;
        };
    }

    /**
     * 四叉树类
     * @param x 矩形左上坐标
     * @param y 矩形左上坐标
     * @param w 长度
     * @param h 宽度
     * @constructor
     */
    function QuarterTreeClass(x, y, w, h)
    {
        var _maxRenders = 10;

        this.Location = new BFLocationClass(x, y);
        this.Size = new BFSizeClass(w, h);
        // 该树节点全包含的FoundationRender列表
        this.FoundationRenders = new Array();
        // 该树节点包含的子节点
        this.Subs = new Array();

        /**
         * 递归清空四叉树
         * @method
         */
        this.Clear = function ()
        {
            this.FoundationRenders.splice(0, this.FoundationRenders.length);

            while (this.Subs.length > 0)
            {
                var loop = this.Subs.shift();
                loop.Clear();
            }
        };

        /**
         * 将本节点分割成四部分
         * @method
         */
        this.Split = function ()
        {
            var x1 = this.Location.X;
            var y1 = this.Location.Y;
            var w1 = this.Size.Width;
            var h1 = this.Size.Height;
            this.Subs.push(new QuarterTreeClass(x1, y1, w1 / 2, h1 / 2));
            this.Subs.push(new QuarterTreeClass(x1 + w1 / 2, y1, w1 / 2, h1 / 2));
            this.Subs.push(new QuarterTreeClass(x1, y1 + h1 / 2, w1 / 2, h1 / 2));
            this.Subs.push(new QuarterTreeClass(x1 + w1 / 2, y1 + h1 / 2, w1 / 2, h1 / 2));
        };

        /**
         * 判断当前节点区域是否全包含指定的地基
         * @param foundationRender 地基
         * @return {Boolean}
         * @method
         */
        this.Contains = function (foundationRender)
        {
            var ret = false;

            var x1 = this.Location.X;
            var y1 = this.Location.Y;
            var w1 = this.Size.Width;
            var h1 = this.Size.Height;
            var fd = foundationRender.Foundation;
            if (fd.Flag == 'circle')
            {
                var r = fd.Radius;
                if (fd.Center.X >= x1 + r && fd.Center.X <= x1 + w1 - r &&
                    fd.Center.Y >= y1 + r && fd.Center.Y <= y1 + h1 - r)
                {
                    ret = true;
                }
            }
            else if (fd.Flag == 'rectangle')
            {
                var i, j;
                var bIn = true;
                for (i = 0; i < fd.RectPoints.length; ++i)
                {
                    var list = fd.RectPoints[i];
                    for (j = 0; j < list.length; ++j)
                    {
                        var p = list[j];
                        if (p.X >= x1 && p.X <= x1 + w1 && p.Y >= y1 && p.Y <= y1 + h1)
                        {
                            continue;
                        }
                        bIn = false;
                        break;
                    }
                    if (!bIn)
                    {
                        break;
                    }
                }
                ret = bIn;
            }

            return ret;
        };

        /**
         * 判断指定的地基属于哪个子节点的区域
         * @param foundationRender 地基
         * @return {Number}
         * @method
         */
        this.GetIndex = function (foundationRender)
        {
            var idx = -1;
            if (this.Subs.length > 0)
            {
                for (var i = 0; i < this.Subs.length; ++i)
                {
                    if (this.Subs[i].Contains(foundationRender))
                    {
                        idx = i;
                        break;
                    }
                }
            }
            return idx;
        };

        /**
         * 将指定的地基插入至四叉树中的某个节点，若节点的包含地基数超出指定最大数目则自动分割
         * @param foundationRender 地基
         * @method
         */
        this.Insert = function (foundationRender)
        {
            if (this.Subs.length < 1)
            {
                this.FoundationRenders.push(foundationRender);
                if (this.FoundationRenders.length > _maxRenders)
                {
                    this.Split();
                    var rest = new Array();
                    while (this.FoundationRenders.length > 0)
                    {
                        var loop = this.FoundationRenders.shift();
                        var i = this.GetIndex(loop);
                        if (i > -1)
                        {
                            this.Subs[i].Insert(loop);
                        }
                        else
                        {
                            rest.push(loop);
                        }
                    }
                    this.FoundationRenders = rest;
                }
            }
            else
            {
                var j = this.GetIndex(foundationRender);
                if (j > -1)
                {
                    this.Subs[j].Insert(foundationRender);
                }
                else
                {
                    this.FoundationRenders.push(foundationRender);
                }
            }
        };

        /**
         * 返回当前节点包含的所有地基
         * @return {Array}
         * @method
         */
        this.GetContainedRenders = function ()
        {
            if (this.Subs.length > 0)
            {
                return this.FoundationRenders.concat(this.Subs[0].GetContainedRenders(), this.Subs[1].GetContainedRenders(), this.Subs[2].GetContainedRenders(), this.Subs[3].GetContainedRenders());
            }
            else
            {
                return this.FoundationRenders;
            }
        };

        /**
         * 返回可能与指定的地基产生碰撞的地基列表
         * @param foundationRender 地基
         * @return {Array}
         * @method
         */
        this.Retrieve = function (foundationRender)
        {
            var i = this.GetIndex(foundationRender);
            if (i > -1)
            {
                return this.FoundationRenders.concat(this.Subs[i].Retrieve(foundationRender));
            }
            else
            {
                return this.GetContainedRenders();
            }
        };

        /**
         * 绘制分割的矩形的痕迹
         * @param context
         * @method
         */
        this.Draw = function (context)
        {
            context.strokeRect(this.Location.X, this.Location.Y, this.Size.Width, this.Size.Height);
            for (var i = 0; i < this.Subs.length; ++i)
            {
                this.Subs[i].Draw(context);
            }
        };
    }

    /**
     * 所有加载的资源的容器
     * @constructor
     */
    function BFResourceContainerClass()
    {
        var _imageDic = new BFDictionaryClass();
        var _resourceLoaded = false;

        AddDefaultResource();

        function AddDefaultResource()
        {
            var img = new BFImageClass('');
            _imageDic.Add('default', img);
        }

        this.GetImage = function (resourceId)
        {
            if (_imageDic.ContainsKey(resourceId))
            {
                return _imageDic.Get(resourceId);
            }
            else
            {
                throw 'Resource Container doesn\'t contain the image that its ID is [' + String(resourceId) + ']!';
            }
        };

        this.SetImage = function (resourceId, imageFilePath)
        {
            if (_imageDic.ContainsKey(resourceId))
            {
                throw 'Resource Container already contains the image that its ID is [' + String(resourceId) + ']!';
            }
            var img = new BFImageClass(imageFilePath);
            _imageDic.Add(resourceId, img);
        };

        this.GetResourceLoaded = function ()
        {
            if (_resourceLoaded)
            {
                return _resourceLoaded;
            }
            var ret = true;
            var list = _imageDic.ToList();
            for (var i = 0; i < list.length; ++i)
            {
                if (!list[i].Value.GetImageLoaded())
                {
                    ret = false;
                    break;
                }
            }
            _resourceLoaded = ret;
            return _resourceLoaded;
        };
    }

    /**
     * 图片资源
     * @param imageFilePath: string类型 图片文件相对路径
     * @constructor
     */
    function BFImageClass(imageFilePath)
    {
        var _image = new Image();
        _image.onload = function ()
        {
            _imageCanvas.width = this.width;
            _imageCanvas.height = this.height;
            _context.drawImage(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
            _imageLoaded = true;
        };


        var _imageCanvas = document.createElement('canvas');
        _imageCanvas.width = 32;
        _imageCanvas.height = 32;
        var _context = _imageCanvas.getContext('2d');

        var _imageLoaded = false;
        if (IsNullOrUndefined(imageFilePath) || imageFilePath == '')
        {
            _imageLoaded = true;
        }

        _image.src = imageFilePath;

        this.ImageFilePath = imageFilePath;

        this.GetImageLoaded = function ()
        {
            return _imageLoaded;
        };

        this.GetImageCanvas = function ()
        {
            return _imageCanvas;
        };
    }

    /**
     * 基本绘图单元
     * @constructor
     */
    function BFRenderClass()
    {
        this.GUID = NewGUID();

        this.CLocation = new BFLocationClass(0, 0);
        this.CSize = new BFSizeClass(0, 0);

        this.SLocation = new BFLocationClass(0, 0);
        this.SSize = new BFSizeClass(0, 0);

        // Z-Order与CLocation.Y + CSize.Height相等
        this.ZOrder = 0;

        // 当鼠标按下时光标所点击的位置
        this.MouseDownLocation = new BFLocationClass(0, 0);

        var _selected = false;

        this.ParentLayer = null;

        // 默认的资源图片
        var _image = self.BFResourceContainer.GetImage('default');;

        /**
         * 每帧都会调用Draw方法绘制
         * @method
         */
        this.Draw = function (context)
        {
            if (_image.GetImageLoaded())
            {
                context.drawImage(_image.GetImageCanvas(), this.SLocation.X, this.SLocation.Y, this.SSize.Width, this.SSize.Height, this.CLocation.X, this.CLocation.Y, this.CSize.Width, this.CSize.Height);
                if (_selected)
                {
                    context.strokeRect(this.CLocation.X, this.CLocation.Y, this.CSize.Width, this.CSize.Height);
                }
            }
        };

        /**
         * 每帧都会调用Update方法更新该绘图单元的位置及尺寸
         * @Event
         */
        this.OnUpdate = function ()
        {};

        /**
         * 设置该绘图单元的图片
         * @param resourceId: string类型 图片资源ID
         * @method
         */
        this.SetImage = function (resourceId)
        {
            var id;
            if (resourceId == undefined || resourceId == null)
            {
                id = 'default';
            }
            else
            {
                id = resourceId;
            }
            _image = self.BFResourceContainer.GetImage(id);
        };

        /**
         * 判断指定的点是否在该元素的显示范围内
         * @param x
         * @param y
         * @return {Boolean}
         * @method
         */
        this.Contains = function (x, y)
        {
            if (x >= this.CLocation.X && x <= this.CLocation.X + this.CSize.Width &&
                y >= this.CLocation.Y && y <= this.CLocation.Y + this.CSize.Height)
            {
                return true;
            }
            return false;
        };

        this.Select = function ()
        {
            _selected = true;
            this.OnSelect();
        };

        this.UnSelect = function ()
        {
            _selected = false;
            this.OnUnSelect();
        };

        this.OnDoubleClick = function (e)
        {
            // TODO:优化
            if (self.SelectRender != null)
            {
                self.SelectRender.UnSelect();
            }
            this.Select();
            self.SelectRender = this;
        };

        /**
         * 被选中事件
         * @event
         */
        this.OnSelect = function ()
        {
        };

        /**
         * 失去选中状态事件
         * @event
         */
        this.OnUnSelect = function ()
        {
        };

        this.OnMouseOver = function (e)
        {

        };

        this.OnMouseOut = function (e)
        {

        };

        this.OnLeftMouseDown = function (e)
        {
            // TODO:优化
            if (self.SelectRender != null)
            {
                self.SelectRender.UnSelect();
            }
            this.Select();
            self.SelectRender = this;
            if (this.CanDrag)
            {
                self.DragedRender = this;
                this.MouseDownLocation.X = e.ClickX;
                this.MouseDownLocation.Y = e.ClickY;
            }
        };

        this.OnRightMouseDown = function (e)
        {

        };
    }

    /**
     * 图层类
     * @param w
     * @param h
     * @constructor
     */
    function BFLayerClass(w, h)
    {
        // 该图层是否定时刷新。True:需要;False:不需要
        this.Refresh = true;
        // 该图层是否需要刷新成功之后自动停止刷新。True:需要;False:不需要
        this.AutoStopRefresh = false;
        // 图层重绘的次序，由小到大
        this.Index = 0;

        var _renderList = new Array();

        this.ParentCanvas = null;

        // 该字段缓存当前图层中高度最大的元素的高度值，用以辅助判断鼠标点击在哪个元素上
        this.RenderHeightMax = 0;

        // 该Layer的长宽
        var _layerWidth = w;
        var _layerHeight = h;

        var _layerCanvas = document.createElement('canvas');
        _layerCanvas.width = w;
        _layerCanvas.height = h;
        var _context = _layerCanvas.getContext('2d');

        // 每帧需要清除的范围(地图坐标)
        this.ClearLocation = new BFLocationClass(0, 0);
        this.ClearSize = new BFSizeClass(_layerWidth, _layerHeight);

        /**
         * 该图层的宽度(地图坐标)
         * @return {Number}
         * @method
         */
        this.LayerWidth = function ()
        {
            return _layerWidth;
        };

        /**
         * 该图层的高度(地图坐标)
         * @return {Number}
         * @method
         */
        this.LayerHeight = function ()
        {
            return _layerHeight;
        };

        /**
         * 设置线条颜色
         * @param color
         * @method
         */
        this.StrokeStyle = function (color)
        {
            _context.strokeStyle = color;
        };

        /**
         * 计算需要清除的区域
         * @param screenX (屏幕坐标)
         * @param screenY (屏幕坐标)
         * @param width
         * @param height
         * @method
         */
        this.ComputeClearArea = function (screenX, screenY, width, height)
        {
            this.ClearLocation.X = screenX - width;
            this.ClearLocation.Y = screenY - height;
            this.ClearSize.Width = width * 3;
            this.ClearSize.Height = height * 3;
        };

        /**
         * 重绘
         * @method
         */
        this.Draw = function ()
        {
            if (this.Refresh)
            {
                _context.clearRect(this.ClearLocation.X, this.ClearLocation.Y, this.ClearSize.Width, this.ClearSize.Height);
                _renderList = _renderList.sort(function (a, b)
                {
                    return a.ZOrder - b.ZOrder;
                });
                var render = null;
                for (var i = 0; i < _renderList.length; ++i)
                {
                    render = _renderList[i];
                    if (render.CSize.Height > this.RenderHeightMax)
                    {
                        this.RenderHeightMax = render.CSize.Height;
                    }
                    render.OnUpdate();
                    render.Draw(_context);
                }
                if (this.AutoStopRefresh)
                {
                    this.Refresh = false;
                }
            }
        };

        this.LayerCanvas = function ()
        {
            return _layerCanvas;
        };

        /**
         * 重新设置Canvas的尺寸
         * @param width
         * @param height
         * @method
         */
        this.SetLayerCanvasSize = function (width, height)
        {
            var strokeStyleCache = _context.strokeStyle;
            _layerCanvas.width = width;
            _layerCanvas.height = height;
            // 设置长宽之后会重置Context的所有Matrix和Style，因此此处重新设置
            _context.strokeStyle = strokeStyleCache;
        };

        this.RenderList = function ()
        {
            return _renderList;
        };

        this.LayerContext = function ()
        {
            return _context;
        };

        /**
         * 向该图层添加绘图单元
         * @param render
         * @method
         */
        this.AddRender = function (render)
        {
            render.ParentLayer = this;
            _renderList.push(render);
        };

        /**
         * 根据指定的坐标返回该坐标落在哪个绘图单元上
         * @param x 屏幕横坐标
         * @param y 屏幕纵坐标
         * @return {BFRenderClass}
         * @method
         */
        this.FindRender = function (x, y)
        {
            var ret = null;
            var render = null;
            var start = this.FindLessOrEqual(y + this.RenderHeightMax);
            for (var i = start; i > -1; --i)
            {
                render = _renderList[i];
                if (render.Contains(x, y))
                {
                    ret = render;
                    break;
                }
            }
            return ret;
        };

        /**
         * 在本图层的元素列表中查找ZOrder小于等于z的元素，返回它们的最大索引
         * @param z
         * @method
         */
        this.FindLessOrEqual = function (z)
        {
            var first = 0;
            var last = _renderList.length - 1;
            var middle = first + Math.floor((last - first) / 2);
            if (middle < 0)
            {
                return middle;
            }

            while (true)
            {
                if (_renderList[middle].ZOrder <= z && _renderList[middle + 1].ZOrder > z)
                {
                    break;
                }
                else if (z < _renderList[middle].ZOrder)
                {
                    if (middle == 0)
                    {
                        middle = -1;
                        break;
                    }
                    last = middle;
                    middle = first + Math.floor((last - first) / 2);
                }
                else
                {
                    if (middle + 1 == _renderList.length - 1)
                    {
                        middle = _renderList.length - 1;
                        break;
                    }
                    first = middle;
                    middle = first + Math.floor((last - first) / 2);
                }
            }

            return middle;
        };
    }

    /**
     * 最外层Canvas类，包含若干图层
     * @param w
     * @param h
     * @constructor
     */
    function BFCanvasClass(w, h)
    {
        var _layerList = new Array();

        var _bufferCanvas = document.createElement('canvas');
        _bufferCanvas.width = w;
        _bufferCanvas.height = h;
        _bufferCanvas.innerText = 'Sorry! The Web browser you\'re using doesn\'t support HTML5. Please try Chrome or Firefox.';

        AddEventHandler(_bufferCanvas, 'dblclick', MouseDoubleClickEvent, false);
        AddEventHandler(_bufferCanvas, 'mousedown', MouseDownEvent, false);
        AddEventHandler(_bufferCanvas, 'mouseup', MouseUpEvent, false);
        AddEventHandler(_bufferCanvas, 'contextmenu', ContextMenuEvent, false);

        var _bufferContext = _bufferCanvas.getContext('2d');
        _bufferContext.fillStyle = 'red';
        _bufferContext.font = '20px Lucida Console';

        // 要显示的Canvas起始的位置，(相对于整个地图的左上屏幕坐标)
        var _drawLocation = new BFLocationClass(0, 0);

        /**
         * 重绘处理
         * @method
         */
        this.Draw = function ()
        {
            // 获取当前时刻
            var dt1 = (new Date()).getTime();

            _bufferContext.clearRect(0, 0, w, h);
            this.OnUpdate();
            _layerList = _layerList.sort(function (a, b)
            {
                return a.Index - b.Index;
            });
            var layer = null;
            var layerCanvas = null;
            for (var i = 0; i < _layerList.length; ++i)
            {
                layer = _layerList[i];
                layer.Draw();
                layerCanvas = layer.LayerCanvas();
                _bufferContext.drawImage(layerCanvas, _drawLocation.X, _drawLocation.Y, w, h, 0, 0, w, h);
            }

            // 获取当前时刻
            var dt2 = (new Date()).getTime();

            DisplayFPS(dt1, dt2);
        };

        this.OnUpdate = function ()
        {};

        function DisplayFPS(dt1, dt2)
        {
            var str = 'TPP:';
            var tpp = (dt2 - dt1) / 1000;
            str += String(tpp);
            str += ';'
            if (self.CurrentTime > 0)
            {
                var interval = dt2 - self.CurrentTime;
                var frameCnt = 1000 / interval;
                if (frameCnt < self.FPS)
                {
                    frameCnt = Math.floor(frameCnt);
                }
                else
                {
                    frameCnt = self.FPS;
                }
                str += 'FPS:';
                str += String(frameCnt);
            }
            _bufferContext.fillText(str, 2, 20);
            self.CurrentTime = dt2;
        }

        this.LocationX = function ()
        {
            return _bufferCanvas.offsetLeft;
        };

        this.LocationY = function ()
        {
            return _bufferCanvas.offsetTop;
        };

        this.BufferCanvas = function ()
        {
            return _bufferCanvas;
        };

        this.LayerList = function ()
        {
            return _layerList;
        };

        /**
         * 向该Canvas添加图层
         * @param layer
         * @method
         */
        this.AddLayer = function (layer)
        {
            layer.ParentCanvas = this;
            layer.ComputeClearArea(_drawLocation.X, _drawLocation.Y, this.CanvasWidth(), this.CanvasHeight());
            _layerList.push(layer);
        };

        /**
         * 根据指定的坐标判断落在哪个绘图单元上
         * @param x 屏幕横坐标
         * @param y 屏幕纵坐标
         * @return {BFRenderClass}
         * @method
         */
        this.FindRender = function (x, y)
        {
            return innerFindRender(x, y);
        };

        /**
         * 根据指定的坐标判断落在哪个绘图单元上
         * @param x 屏幕横坐标
         * @param y 屏幕纵坐标
         * @return {BFRenderClass}
         * @method
         */
        function innerFindRender(x, y)
        {
            var element = null;
            for (var i = _layerList.length - 1; i > -1; --i)
            {
                var layer = _layerList[i];
                //TODO:判断条件得改一下
                if (!layer.Refresh)
                {
                    continue;
                }
                element = layer.FindRender(x, y);
                if (element != null)
                {
                    break;
                }
            }
            return element;
        }

        /**
         * 鼠标双击事件
         * @param e
         * @event
         */
        function MouseDoubleClickEvent(e)
        {
            try
            {
                var clickX = e.pageX - this.offsetLeft + self.GlobalBFCanvas.DrawLocation().X;
                var clickY = e.pageY - this.offsetTop + self.GlobalBFCanvas.DrawLocation().Y;
                var element = innerFindRender(clickX, clickY);
                if (element != null)
                {
                    element.OnDoubleClick({ ClickX : clickX, ClickY : clickY });
                    if (self.GlobalBFCanvas.CanMove && element.HaveFoundation)
                    {
                        self.GlobalBFCanvas.OnStartMove({ TargetX : element.CenterLocation.X, TargetY : element.CenterLocation.Y, Speed : 8 });
                    }
                }
                else
                {
                    if (!IsNullOrUndefined(self.SelectRender))
                    {
                        element = self.SelectRender;
                        element.OnStartMove({ TargetX : clickX, TargetY : clickY, Speed : 4 });
                    }
                }
            }
            catch (ex)
            {
                OutputDebug(ex);
            }
            finally
            {
                CancelEventFlow(e);
            }
        }

        function MouseDownEvent(e)
        {
            try
            {
                var clickX = e.pageX - this.offsetLeft + self.GlobalBFCanvas.DrawLocation().X;
                var clickY = e.pageY - this.offsetTop + self.GlobalBFCanvas.DrawLocation().Y;
                var element = innerFindRender(clickX, clickY);
                if (element != null)
                {
                    if (e.button == 0)
                    {
                        element.OnLeftMouseDown({ ClickX : clickX, ClickY : clickY });
                    }
                    else if (e.button == 2)
                    {
                        element.OnRightMouseDown({ ClickX : clickX, ClickY : clickY });
                    }
                    if (self.GlobalBFCanvas.CanMove && element.HaveFoundation)
                    {
                        self.GlobalBFCanvas.OnStartMove({ TargetX : element.CenterLocation.X, TargetY : element.CenterLocation.Y, Speed : 8 });
                    }
                }
                else
                {
                    if (e.button == 0)
                    {
                        if (!IsNullOrUndefined(self.SelectRender))
                        {
                            element = self.SelectRender;
                            element.OnStartMove({ TargetX : clickX, TargetY : clickY, Speed : 2 });
                        }
                    }
                    else if (e.button == 2)
                    {
                        // TODO:右键单击“空白”区域
                    }
                }
            }
            catch (ex)
            {
                OutputDebug(ex);
            }
            finally
            {
                CancelEventFlow(e);
            }
        }

        function MouseUpEvent(e)
        {
            try
            {
                var clickX = e.pageX - this.offsetLeft + self.GlobalBFCanvas.DrawLocation().X;
                var clickY = e.pageY - this.offsetTop + self.GlobalBFCanvas.DrawLocation().Y;
                self.DragedRender = null;
    //            var element = innerFindRender(clickX, clickY);
    //            if (element != null)
    //            {
    //                if (e.button == 0)
    //                {
    //                    element.OnLeftMouseUp({ ClickX : clickX, ClickY : clickY });
    //                }
    //                else if (e.button == 2)
    //                {
    //                    element.OnRightMouseUp({ ClickX : clickX, ClickY : clickY });
    //                }
    //            }
            }
            catch (ex)
            {
                OutputDebug(ex);
            }
            finally
            {
                CancelEventFlow(e);
            }
        }

        function ContextMenuEvent(e)
        {
            CancelDefault(e);
            CancelEventFlow(e);
        }

        this.DrawLocation = function ()
        {
            return _drawLocation;
        };

        this.CanvasWidth = function ()
        {
            return _bufferCanvas.width;
        };

        this.CanvasHeight = function ()
        {
            return _bufferCanvas.height;
        };
    }

    /**
     * 元素的地基类
     * @param foundation
     * @constructor
     */
    function BFFoundationClass(foundation)
    {
        this.Center = new BFLocationClass(0, 0);

        this.Radius = 0;

        this.RectPoints = [[ new BFLocationClass(0, 0), new BFLocationClass(0, 0) ], [ new BFLocationClass(0, 0), new BFLocationClass(0, 0) ]];
        this.Width = 0;
        this.Height = 0;
        this.KW = 0;
        this.KH = 0;

        this.Flag = foundation.Flag;
        if (this.Flag == 'circle')
        {
            this.Radius = foundation.Radius;
        }
        else if (this.Flag == 'rectangle')
        {
            // 初始化矩形的四个顶点坐标，该坐标是假设矩形中心坐标为(0, 0)的情况下，相对的坐标
            this.RectPoints[0][0].X = foundation.RectPoints[0][0].X;
            this.RectPoints[0][0].Y = foundation.RectPoints[0][0].Y;
            this.RectPoints[0][1].X = foundation.RectPoints[0][1].X;
            this.RectPoints[0][1].Y = foundation.RectPoints[0][1].Y;
            this.RectPoints[1][0].X = foundation.RectPoints[1][0].X;
            this.RectPoints[1][0].Y = foundation.RectPoints[1][0].Y;
            this.RectPoints[1][1].X = foundation.RectPoints[1][1].X;
            this.RectPoints[1][1].Y = foundation.RectPoints[1][1].Y;

            this.Width = Math.sqrt(Math.pow((this.RectPoints[0][0].X - this.RectPoints[0][1].X), 2) + Math.pow((this.RectPoints[0][0].Y - this.RectPoints[0][1].Y), 2));
            this.Height = Math.sqrt(Math.pow((this.RectPoints[0][0].X - this.RectPoints[1][0].X), 2) + Math.pow((this.RectPoints[0][0].Y - this.RectPoints[1][0].Y), 2));
            this.KW = Math.round((this.RectPoints[0][0].Y - this.RectPoints[0][1].Y) / (this.RectPoints[0][0].X - this.RectPoints[0][1].X));
            this.KH = Math.round((this.RectPoints[0][0].Y - this.RectPoints[1][0].Y) / (this.RectPoints[0][0].X - this.RectPoints[1][0].X));
        }

        /**
         * 设置该地基的中心坐标(地图坐标)
         * @param x
         * @param y
         * @method
         */
        this.SetCenter = function (x, y)
        {
            var originalX = this.Center.X;
            var originalY = this.Center.Y;
            this.Center.X = x;
            this.Center.Y = y;
            if (this.Flag == 'rectangle')
            {
                var i, j;
                for (i = 0; i < this.RectPoints.length; ++i)
                {
                    var list = this.RectPoints[i];
                    for (j = 0; j < list.length; ++j)
                    {
                        var p = list[j];
                        p.X = p.X + this.Center.X - originalX;
                        p.Y = p.Y + this.Center.Y - originalY;
                    }
                }
            }
        };

        /**
         * 检测与其他地基是否碰撞
         * @param BFFoundation 地基
         * @return {Boolean}
         * @method
         */
        this.CheckConflict = function (BFFoundation)
        {
            var ret = false;
            if (this.Flag == 'circle' && BFFoundation.Flag == 'circle')
            {
                ret = ComputeCollisionCC(this.Radius, BFFoundation.Radius, this.Center.X - BFFoundation.Center.X, this.Center.Y - BFFoundation.Center.Y);
            }
            else if (this.Flag == 'rectangle' && BFFoundation.Flag == 'rectangle')
            {
                ret = ComputeCollisionRR(this, BFFoundation);
            }
            else
            {
                if (this.Flag == 'circle')
                {
                    ret = ComputeCollisionCR(BFFoundation.Width, BFFoundation.Height, this.Radius, this.Center.X - BFFoundation.Center.X, this.Center.Y - BFFoundation.Center.Y);
                }
                else
                {
                    ret = ComputeCollisionCR(this.Width, this.Height, BFFoundation.Radius, BFFoundation.Center.X - this.Center.X, BFFoundation.Center.Y - this.Center.Y);
                }
            }
            return ret;
        };

        /**
         * 检测圆形和矩形是否碰撞
         * @param w 矩形长度
         * @param h 矩形宽度
         * @param r 圆形半径
         * @param rx 圆形中心与矩形中心相对坐标
         * @param ry 圆形中心与矩形中心相对坐标
         * @return {Boolean}
         * @method
         */
        function ComputeCollisionCR(w, h, r, rx, ry)
        {
            var dx = Math.min(rx, w * 0.5);
            var dx1 = Math.max(dx, -w * 0.5);
            var dy = Math.min(ry, h * 0.5);
            var dy1 = Math.max(dy, -h * 0.5);
            return (dx1 - rx) * (dx1 - rx) + (dy1 - ry) * (dy1 - ry) <= r * r;
        }

        /**
         * 检测圆形和圆形是否碰撞
         * @param r1 圆形1半径
         * @param r2 圆形2半径
         * @param rx 两个圆形圆心x坐标之间距离的绝对值
         * @param ry 两个圆形圆心y坐标之间距离的绝对值
         * @return {Boolean}
         * @method
         */
        function ComputeCollisionCC(r1, r2, rx, ry)
        {
            return rx * rx + ry * ry <= (r1 + r2) * (r1 + r2);
        }

        /**
         * 检测矩形和矩形是否碰撞
         * @param fd1 矩形1(地基类)
         * @param fd2 矩形2(地基类)
         * @return {Boolean}
         * @method
         */
        function ComputeCollisionRR(fd1, fd2)
        {
            /**
             * 判断points中的点在斜率k，起点为oPoint，终点为ePoint的向量上的投影是否在起点和终点之间
             * @param oPoint 起点
             * @param ePoint 终点
             * @param k 斜率
             * @param points 判断的点列表
             * @return {Boolean} True:在之间; False:之外
             * @method
             */
            function Check(oPoint, ePoint, k, points)
            {
                /**
                 * 计算点(m, n)在起点为(a, b)的斜率为k的向量上的投影点的公式:
                 * x = (a * k * k + (n - b) * k + m) / (k * k + 1)
                 * y = (n * k * k + (m - a) * k + b) / (k * k + 1)
                 */

                var finalRet = false;

                var a = oPoint.X;
                var b = oPoint.Y;
                var m, n, x, y;
                var min, max;
                if (k == Infinity || k == -Infinity)
                {
                    min = Math.min(oPoint.Y, ePoint.Y);
                    max = Math.max(oPoint.Y, ePoint.Y);
                }
                else
                {
                    min = Math.min(oPoint.X, ePoint.X);
                    max = Math.max(oPoint.X, ePoint.X);
                }

                var chkRet;
                var chkVal;
                for (var i = 0; i < points.length; ++i)
                {
                    var row = points[i];
                    for (var j = 0; j < row.length; ++j)
                    {
                        var point = row[j];
                        m = point.X;
                        n = point.Y;

                        if (k == Infinity || k == -Infinity)
                        {
                            chkVal = n;
                        }
                        else
                        {
                            chkVal = (a * k * k + (n - b) * k + m) / (k * k + 1);
                        }
                        if (chkVal > max)
                        {
                            if (chkRet != undefined && chkRet != 1)
                            {
                                finalRet = true;
                                break;
                            }
                            chkRet = 1;
                        }
                        else if (chkVal < min)
                        {
                            if (chkRet != undefined && chkRet != -1)
                            {
                                finalRet = true;
                                break;
                            }
                            chkRet = -1;
                        }
                        else
                        {
                            chkRet = 0;
                            finalRet = true;
                            break;
                        }
                    }
                    if (finalRet)
                    {
                        break;
                    }
                }
                return finalRet;
            }

            if (!Check(fd1.RectPoints[0][0], fd1.RectPoints[0][1], fd1.KW, fd2.RectPoints))
            {
                return false;
            }
            if (!Check(fd1.RectPoints[0][0], fd1.RectPoints[1][0], fd1.KH, fd2.RectPoints))
            {
                return false;
            }
            if (fd1.KW != fd2.KW)
            {
                if (!Check(fd2.RectPoints[0][0], fd2.RectPoints[0][1], fd2.KW, fd1.RectPoints))
                {
                    return false;
                }
                if (!Check(fd2.RectPoints[0][0], fd2.RectPoints[1][0], fd2.KH, fd1.RectPoints))
                {
                    return false;
                }
            }
            return true;
        }

        /**
         * 绘制地基图形
         * @param context
         * @method
         */
        this.Draw = function (context)
        {
            if (this.Flag == 'circle')
            {
                context.beginPath();
                context.arc(this.Center.X, this.Center.Y, this.Radius, 0, 2 * Math.PI, true);
                context.fill();
            }
            else if (this.Flag == 'rectangle')
            {
                context.fillRect(this.RectPoints[0][0].X, this.RectPoints[0][0].Y, this.Width, this.Height);
            }
        };
    }

    function IsNullOrUndefined(obj)
    {
        if (obj == null || obj == undefined)
        {
            return true;
        }
        return false;
    }

    function IsObject(obj)
    {
        var t = typeof obj;
        if (t == 'object')
        {
            return true;
        }
        return false;
    }

    /**
     * 控制元素位置信息更新的计数器
     * @param xOry
     * @param cnt
     * @constructor
     */
    function BFCounterClass(xOry, cnt)
    {
        this.MoveFlagX = false;
        this.MoveFlagY = false;
        if (xOry == 'x')
        {
            this.MoveFlagX = true;
        }
        else if (xOry == 'y')
        {
            this.MoveFlagY = true;
        }

        var _cnt = 0;

        /**
         * 在Update每一帧元素的位置信息之前，先调用此方法进行计数
         * @method
         */
        this.Count = function ()
        {
            ++_cnt;
            if (_cnt < cnt)
            {
                if (xOry == 'x')
                {
                    this.MoveFlagY = false;
                }
                else if (xOry == 'y')
                {
                    this.MoveFlagX = false;
                }
            }
            else
            {
                if (xOry == 'x')
                {
                    this.MoveFlagY = true;
                }
                else if (xOry == 'y')
                {
                    this.MoveFlagX = true;
                }
                _cnt = 0;
            }
        };
    }

    /**
     * 创建画布上的绘制元素
     * @param entity,格式:{"CX": 100, "CY": 458, "CWidth": 96, "CHeight": 128, "SX": 0, "SY": 0, "SWidth": 96, "SHeight": 128, "ZOrder": 586, "ImageFilePath": "./Resource/Img/tree.png"}
     * @return {BFRenderClass}
     * @method
     */
    self.CreateBFRender = function (entity)
    {
        if (IsNullOrUndefined(entity))
        {
            throw '[CreateBFRender] method\'s parameter is null or undefined!';
        }
        if (!IsObject(entity))
        {
            throw '[CreateBFRender] method\'s parameter is not object!';
        }
        var render = new BFRenderClass();
        render.SetImage(entity.ResourceId);
        render.SLocation.X = entity.SX;
        render.SLocation.Y = entity.SY;
        render.SSize.Width = entity.SWidth;
        render.SSize.Height = entity.SHeight;
        render.CLocation.X = entity.CX;
        render.CLocation.Y = entity.CY;
        render.CSize.Width = entity.CWidth;
        render.CSize.Height = entity.CHeight;
        render.ZOrder = entity.CY + entity.CHeight;

        return render;
    };

    /**
     * 创建带有地基的绘制元素
     * @param entity
     * @return {BFFoundationRenderClass}
     * @method
     */
    self.CreateBFFoundationRender = function (entity)
    {
        if (IsNullOrUndefined(entity))
        {
            throw '[CreateBFFoundationRender] method\'s parameter is null or undefined!';
        }
        if (!IsObject(entity))
        {
            throw '[CreateBFFoundationRender] method\'s parameter is not object!';
        }
        BFFoundationRenderClass.prototype = self.CreateBFRender(entity);

        function BFFoundationRenderClass()
        {
            this.CanDrag = true;

            this.HaveFoundation = true;

            // 是否强制检测碰撞的标志位。True:不论对方的ForceCheckConflict真假都检测碰撞;False:当对方的ForceCheckConflict为真才检测碰撞
            this.ForceCheckConflict = false;

            /**
             * 将基准中心位置的坐标转换成左上坐标(屏幕坐标)
             * @param xOry
             * @param val
             * @return {Number}
             * @method
             */
            this.Center2CLocation = function (xOry, val)
            {
                var ret = 0;
                if (xOry == 'x')
                {
                    ret = val - Math.floor(this.CSize.Width / 2);
                }
                else if (xOry == 'y')
                {
                    ret = val - this.CSize.Height;
                }
                return ret;
            };

            /**
             * 将左上坐标转换成基准中心位置的坐标(屏幕坐标)
             * @param xOry
             * @param val
             * @return {Number}
             * @method
             */
            this.CLocation2Center = function (xOry, val)
            {
                var ret = 0;
                if (xOry == 'x')
                {
                    ret = val + Math.floor(this.CSize.Width / 2);
                }
                else if (xOry == 'y')
                {
                    ret = val + this.CSize.Height;
                }
                return ret;
            };

            // 元素移动的基准中心位置坐标(屏幕坐标)
            this.CenterLocation = new BFLocationClass(this.CLocation2Center('x', this.CLocation.X), this.CLocation2Center('y', this.CLocation.Y));

            // 元素的地基，用以碰撞检测
            this.Foundation = new BFFoundationClass(entity.Foundation);
            // 地基中心坐标(地图坐标)
            this.FoundationCenter = null;
            // 地图图层
            var _mapLayer = null;

            this.MapLayer = function ()
            {
                return _mapLayer;
            };

            /**
             * 根据FoundationCenter重置当前render的位置
             * @method
             */
            this.ResetLocationByFoundationCenter = function ()
            {
                if (IsNullOrUndefined(_mapLayer))
                {
                    return;
                }
                if (_mapLayer.CanTransform)
                {
                    this.CenterLocation = _mapLayer.ConvertMapLocation(this.FoundationCenter.X, this.FoundationCenter.Y);
                }
                else
                {
                    this.CenterLocation = this.FoundationCenter.Copy();
                }
                this.CLocation.X = this.Center2CLocation('x', this.CenterLocation.X);
                this.CLocation.Y = this.Center2CLocation('y', this.CenterLocation.Y);
                this.ZOrder = this.CLocation.Y + this.CSize.Height;
                this.Foundation.SetCenter(this.FoundationCenter.X, this.FoundationCenter.Y);
            };

            /**
             * 将本元素的地基投影到地图图层上
             * @param mapLayer 地图图层
             * @method
             */
            this.Cast2Map = function (mapLayer)
            {
                if (!IsNullOrUndefined(mapLayer))
                {
                    _mapLayer = mapLayer;
                    if (_mapLayer.CanCheckConflict)
                    {
                        _mapLayer.AddFoundationRender(this);
                    }
                    if (IsNullOrUndefined(this.FoundationCenter))
                    {
                        this.CenterLocation = _mapLayer.ConvertMapLocation(this.CenterLocation.X, this.CenterLocation.Y);
                        this.CLocation.X = this.Center2CLocation('x', this.CenterLocation.X);
                        this.CLocation.Y = this.Center2CLocation('y', this.CenterLocation.Y);
                        this.ZOrder = this.CLocation.Y + this.CSize.Height;
                    }
                }
                if (!IsNullOrUndefined(_mapLayer))
                {
                    if (_mapLayer.CanTransform)
                    {
                        this.FoundationCenter = _mapLayer.ConvertScreenLocation(this.CenterLocation.X, this.CenterLocation.Y);
                    }
                    else
                    {
                        this.FoundationCenter = this.CenterLocation.Copy();
                    }
                    this.Foundation.SetCenter(this.FoundationCenter.X, this.FoundationCenter.Y);
                }
            };

            /**
             * 检测与其他元素是否碰撞
             * @param foundationRender
             * @return {Boolean} True:有碰撞;False:无碰撞
             * @method
             */
            this.CheckConflict = function (foundationRender)
            {
                if (this.FoundationCenter == null || !foundationRender.FoundationCenter || foundationRender.FoundationCenter == null)
                {
                    return false;
                }

                return this.Foundation.CheckConflict(foundationRender.Foundation);
            };

            /**
             * 碰撞事件
             * @param foundationRender 发生碰撞的对方元素
             * @event
             */
            this.OnConflict = function (foundationRender)
            {};
        }

        return new BFFoundationRenderClass();
    };

    /**
     * 创建可以移动的带有地基的绘制元素
     * @param entity
     * @return {BFMovableRenderClass}
     * @method
     */
    self.CreateBFMovableRender = function (entity)
    {
        if (IsNullOrUndefined(entity))
        {
            throw '[CreateBFMovableRender] method\'s parameter is null or undefined!';
        }
        if (!IsObject(entity))
        {
            throw '[CreateBFMovableRender] method\'s parameter is not object!';
        }
        //继承基本绘图单元
        BFMovableRenderClass.prototype = self.CreateBFFoundationRender(entity);

        function BFMovableRenderClass()
        {
            // 移动目标坐标(地图坐标)
            var _targetX = 0;
            var _targetY = 0;
            // 移动方向(地图方向)
            this.DirectionX = 0;
            this.DirectionY = 0;
            // 元素在每帧移动的像素数
            this.Speed = 0;
            // 元素在上一帧的地基坐标(FoundationCenter)
            var _lastFoundationCenterX = 0;
            var _lastFoundationCenterY = 0;
            // 该元素是否位于屏幕(摄像机)中央
            var _middle = false;

            var _counter = null;

            /**
             * 设置移动的目标坐标
             * @param tx
             * @param ty
             * @return {Boolean}
             * @method
             */
            this.SetMoveTarget = function (tx, ty)
            {
                var dx = 0;
                var dy = 0;
                if (tx > this.FoundationCenter.X)
                {
                    dx = 1;
                }
                else if (tx < this.FoundationCenter.X)
                {
                    dx = -1;
                }
                if (ty > this.FoundationCenter.Y)
                {
                    dy = 1;
                }
                else if (ty < this.FoundationCenter.Y)
                {
                    dy = -1;
                }

                var distanceX = Math.abs(tx - this.FoundationCenter.X);
                var distanceY = Math.abs(ty - this.FoundationCenter.Y);
                if (distanceX > distanceY)
                {
                    _counter = new BFCounterClass('x', Math.floor(distanceX / distanceY));
                }
                else
                {
                    _counter = new BFCounterClass('y', Math.floor(distanceY / distanceX));
                }

                _targetX = tx;
                _targetY = ty;
                this.DirectionX = dx;
                this.DirectionY = dy;
                return true;
            };

            /**
             * 判断是否移动到了目标坐标
             * @param 方向标志
             * @return {Boolean}
             * @method
             */
            this.CheckExceed = function (xOry)
            {
                var t = 0;
                var c = 0;
                var d = 0;
                if (xOry == 'x')
                {
                    t = _targetX;
                    c = this.FoundationCenter.X;
                    d = this.DirectionX;
                }
                else if (xOry == 'y')
                {
                    t = _targetY;
                    c = this.FoundationCenter.Y;
                    d = this.DirectionY;
                }

                if (d > 0)
                {
                    if (c >= t)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else if (d < 0)
                {
                    if (c <= t)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return true;
                }
            };

            /**
             * 移动目标X坐标值
             * @return {Number}
             * @method
             */
            this.TargetX = function ()
            {
                return _targetX;
            };

            /**
             * 移动目标Y坐标值
             * @return {Number}
             * @method
             */
            this.TargetY = function ()
            {
                return _targetY;
            };

            /**
             * 移动中心坐标
             * @param xOry
             * @return {Boolean}
             * @method
             */
            this.MoveFoundationCenter = function (xOry)
            {
                var b = false;
                if (xOry == 'x')
                {
                    this.FoundationCenter.X += this.DirectionX * this.Speed;
                    b = this.CheckExceed('x');
                    if (b)
                    {
                        this.FoundationCenter.X = this.TargetX();
                    }
                }
                else
                {
                    this.FoundationCenter.Y += this.DirectionY * this.Speed;
                    b = this.CheckExceed('y');
                    if (b)
                    {
                        this.FoundationCenter.Y = this.TargetY();
                    }
                }
                return b;
            };

            this.OnUpdate = function ()
            {
                if (this.Speed == 0)
                {
                    return;
                }
                var bx = false;
                var by = false;
                var tx = this.TargetX();
                var ty = this.TargetY();

                _lastFoundationCenterX = this.FoundationCenter.X;
                _lastFoundationCenterY = this.FoundationCenter.Y;

                _counter.Count();
                if (this.DirectionX == 0)
                {
                    bx = true;
                }
                else
                {
                    if (this.DirectionY != 0)
                    {
                        if (_counter.MoveFlagX)
                        {
                            this.MoveFoundationCenter('x');
                        }
                    }
                    else
                    {
                        this.MoveFoundationCenter('x');
                    }
                }

                if (this.DirectionY == 0)
                {
                    by = true;
                }
                else
                {
                    if (this.DirectionX != 0)
                    {
                        if (_counter.MoveFlagY)
                        {
                            this.MoveFoundationCenter('y');
                        }
                    }
                    else
                    {
                        this.MoveFoundationCenter('y');
                    }
                }

                if (bx)
                {
                    this.DirectionX = 0;
                }
                if (by)
                {
                    this.DirectionY = 0;
                }
                this.ResetLocationByFoundationCenter();
                if (self.GlobalBFCanvas.CanMove)
                {
                    if (_middle)
                    {
                        self.GlobalBFCanvas.SetCenterLocation(this.CenterLocation.X, this.CenterLocation.Y);
                    }
                    else
                    {
                        self.GlobalBFCanvas.OnStartMove({ TargetX : this.CenterLocation.X, TargetY : this.CenterLocation.Y, Speed : 8 });
                    }
                }

                if (bx && by)
                {
                    this.Speed = 0;
                    this.OnStopMove({ TargetX : tx, TargetY : ty });
                }
            };

            /**
             * 开始移动事件
             * @param e:{ TargetX : clickX, TargetY: clickY, Speed: speed } 屏幕坐标
             * @event
             */
            this.OnStartMove = function (e)
            {
                // 判断该元素是否处于屏幕(摄像机)中央
                if (self.GlobalBFCanvas.CanMove)
                {
                    if (this.CenterLocation.Equal(self.GlobalBFCanvas.CenterLocation))
                    {
                        _middle = true;
                    }
                    else
                    {
                        _middle = false;
                    }
                }

                var x = e.TargetX;
                var y = e.TargetY;
                var mapLyr = this.MapLayer();
                if (IsNullOrUndefined(mapLyr))
                {
                    throw '元素(' + this.GUID + ')还没有投影至地图层上，无法在地图上移动!';
                }
                if (mapLyr.CanTransform)
                {
                    var tmp = mapLyr.ConvertScreenLocation(e.TargetX, e.TargetY);
                    x = tmp.X;
                    y = tmp.Y;
                }
                if (this.SetMoveTarget(x, y))
                {
                    this.Speed = e.Speed;
                }
            };

            /**
             * 停止移动事件
             * @param e:{ TargetX : clickX, TargetY: clickY } 地图坐标
             * @event
             */
            this.OnStopMove = function (e)
            {

            };

            /**
             * 碰撞事件
             * @param foundationRender 发生碰撞的对方元素
             * @event
             */
            this.OnConflict = function (foundationRender)
            {
                if (this.Speed > 0)
                {
                    this.Speed = 0;
                    if (this.FoundationCenter.X != _lastFoundationCenterX || this.FoundationCenter.Y != _lastFoundationCenterY)
                    {
                        this.FoundationCenter.X = _lastFoundationCenterX;
                        this.FoundationCenter.Y = _lastFoundationCenterY;
                        this.ResetLocationByFoundationCenter();
                        this.OnStopMove({ TargetX : this.FoundationCenter.X, TargetY : this.FoundationCenter.Y });
                    }
                }
            };
        }

        return new BFMovableRenderClass();
    };

    /**
     * 创建图层
     * @param w
     * @param h
     * @return {BFLayerClass}
     * @method
     */
    self.CreateBFLayer = function (w, h)
    {
        return new BFLayerClass(w, h);
    };

    /**
     * 创建可以矩阵变换的图层
     * @param w
     * @param h
     * @return {BFTransformLayerClass}
     * @method
     */
    self.CreateBFTransformLayer = function (w, h)
    {
        BFTransformLayerClass.prototype = self.CreateBFLayer(w, h);

        function BFTransformLayerClass()
        {
            this.CanTransform = true;

            var _context = this.LayerContext();

            var _transformCache = [ [1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0] ];

            // 变换矩阵[a, b, c, d, e, f]
            var _matrix = [1, 0, 0, 1, 0, 0];

            /**
             * 坐标缩放
             * @param sx
             * @param sy
             * @method
             */
            this.Scale = function (sx, sy)
            {
                var a = _transformCache[0];
                a[0] = sx;
                a[3] = sy;
            };

            /**
             * 坐标旋转(顺时针)
             * @param angle
             * @method
             */
            this.Rotate = function (angle)
            {
                var a = _transformCache[1];
                var sin = Math.sin(angle);
                var cos = Math.cos(angle);
                a[0] = cos;
                a[1] = sin;
                a[2] = 0 - sin;
                a[3] = cos;
            };

            /**
             * 坐标平移
             * @param x
             * @param y
             * @method
             */
            this.Translate = function (x, y)
            {
                var a = _transformCache[2];
                a[4] = x;
                a[5] = y;
            };

            /**
             * 设置变换矩阵
             * @method
             */
            this.Transform = function ()
            {
                var m = [1, 0, 0, 1, 0, 0];
                var a = null;
                for (var i = 0; i < _transformCache.length; ++i)
                {
                    a = _transformCache[i];
                    m = MatrixMultiply(m, a);
                }

                _matrix = m;

                var p1 = this.ConvertMapLocation(0, 0);
                var p2 = this.ConvertMapLocation(this.LayerWidth(), 0);
                var p3 = this.ConvertMapLocation(this.LayerWidth(), this.LayerHeight());
                var p4 = this.ConvertMapLocation(0, this.LayerHeight());

                this.SetLayerCanvasSize(Math.abs(p2.X - p4.X), Math.abs(p1.Y - p3.Y));
                _context.setTransform(_matrix[0], _matrix[1], _matrix[2], _matrix[3], _matrix[4], _matrix[5]);
            };

            function MatrixMultiply(m, n)
            {
                var a = m[0] * n[0] + m[2] * n[1];
                var b = m[1] * n[0] + m[3] * n[1];
                var c = m[0] * n[2] + m[2] * n[3];
                var d = m[1] * n[2] + m[3] * n[3];
                var e = m[0] * n[4] + m[2] * n[5] + m[4];
                var f = m[1] * n[4] + m[3] * n[5] + m[5];
                return [a, b, c, d, e, f];
            }

            /**
             * 矩阵变换运算，由地图坐标计算出屏幕坐标
             * @param x 地图x坐标
             * @param y 地图y坐标
             * @return {BFLocationClass}
             * @method
             */
            this.ConvertMapLocation = function (x, y)
            {
                var a = _matrix[0];
                var b = _matrix[1];
                var c = _matrix[2];
                var d = _matrix[3];
                var e = _matrix[4];
                var f = _matrix[5];

                var x1 = a * x + c * y + e;
                var y1 = b * x + d * y + f;

                return new BFLocationClass(x1, y1);
            };

            /**
             * 矩阵逆变换运算，由屏幕坐标计算出地图坐标
             * @param x 屏幕x坐标
             * @param y 屏幕y坐标
             * @return {BFLocationClass}
             * @method
             */
            this.ConvertScreenLocation = function (x, y)
            {
                // 矩阵逆变换运算，由屏幕坐标计算出地图坐标
                var a = _matrix[0];
                var b = _matrix[1];
                var c = _matrix[2];
                var d = _matrix[3];
                var e = _matrix[4];
                var f = _matrix[5];

                var x1 = (d * (x - e) - c * (y - f)) / (a * d - b * c);
                var y1 = (a * (y - f) - b * (x - e)) / (a * d - b * c);

                return new BFLocationClass(x1, y1);
            };

            /**
             * 计算需要清除的区域
             * @param screenX (屏幕坐标)
             * @param screenY (屏幕坐标)
             * @param width
             * @param height
             * @method
             */
            this.ComputeClearArea = function (screenX, screenY, width, height)
            {
                var p1 = this.ConvertScreenLocation(screenX, screenY);
                var p2 = this.ConvertScreenLocation(screenX + width, screenY);
                var p3 = this.ConvertScreenLocation(screenX + width, screenY + height);
                var p4 = this.ConvertScreenLocation(screenX, screenY + height);

                var x = p1.X;
                var y = p2.Y;
                var ww = Math.abs(p3.X - p1.X);
                var hh = Math.abs(p4.Y - p2.Y);

                this.ClearLocation.X = x - ww;
                this.ClearLocation.Y = y - hh;
                this.ClearSize.Width = width * 3;
                this.ClearSize.Height = height * 3;
            };

            /**
             * 根据指定的坐标返回该坐标落在哪个绘图单元上
             * @param x 屏幕横坐标
             * @param y 屏幕纵坐标
             * @return {BFRenderClass}
             * @method
             */
            this.FindRender = function (x, y)
            {
                var loc = this.ConvertScreenLocation(x, y);
                x = loc.X;
                y = loc.Y;
                var ret = null;
                var render = null;
                var start = this.FindLessOrEqual(y + this.RenderHeightMax);
                for (var i = start; i > -1; --i)
                {
                    render = this.RenderList()[i];
                    if (render.Contains(x, y))
                    {
                        ret = render;
                        break;
                    }
                }
                return ret;
            };
        }

        return new BFTransformLayerClass();
    };

    /**
     * 创建可以检测碰撞并且可以矩阵变换的图层
     * @param w
     * @param h
     * @return {BFCollisionLayerClass}
     * @method
     */
    self.CreateBFCollisionLayer = function (w, h)
    {
        BFCollisionLayerClass.prototype = self.CreateBFTransformLayer(w, h);

        function BFCollisionLayerClass()
        {
            this.CanCheckConflict = true;
            // 该类图层禁止添加绘图单元
            this.RenderList = null;
            this.AddRender = null;

            var _foundationRenderList = new Array();

            var _quarterTree = new QuarterTreeClass(0, 0, w, h);

            /**
             * 添加要检测碰撞的绘图单元
             * @param foundationRender
             * @method
             */
            this.AddFoundationRender = function (foundationRender)
            {
                _foundationRenderList.push(foundationRender);
            };

            this.Draw = function ()
            {
                if (this.Refresh)
                {
                    var context = this.LayerContext();
                    context.clearRect(this.ClearLocation.X, this.ClearLocation.Y, this.ClearSize.Width, this.ClearSize.Height);
                    _quarterTree.Clear();
                    var foundationRender = null;
                    var checkRenders = new Array();
                    for (var i = 0; i < _foundationRenderList.length; ++i)
                    {
                        foundationRender = _foundationRenderList[i];
                        foundationRender.Foundation.Draw(context);
                        _quarterTree.Insert(foundationRender);
                        if (foundationRender.Speed && foundationRender.Speed > 0)
                        {
                            checkRenders.push(foundationRender);
                        }
                    }
                    //TODO:test
                    _quarterTree.Draw(context);
                    // 进行碰撞检测
                    var checkRender = null;
                    for (var j = 0; j < checkRenders.length; ++j)
                    {
                        checkRender = checkRenders[j];
                        var collisionRenders = _quarterTree.Retrieve(checkRender);
                        for (var k = 0; k < collisionRenders.length; ++k)
                        {
                            var collisionRender = collisionRenders[k];
                            if (checkRender.GUID == collisionRender.GUID)
                            {
                                continue;
                            }
                            if (checkRender.ForceCheckConflict || collisionRender.ForceCheckConflict)
                            {
                                if (checkRender.CheckConflict(collisionRender))
                                {
                                    // 碰撞发生了!
                                    checkRender.OnConflict(collisionRender);
                                    if (!collisionRender.Speed || collisionRender.Speed <= 0)
                                    {
                                        collisionRender.OnConflict(checkRender);
                                    }
                                }
                            }
                        }
                    }
                    if (this.AutoStopRefresh)
                    {
                        this.Refresh = false;
                    }
                }
            };
        }

        return new BFCollisionLayerClass();
    };

    /**
     * 创建全局Canvas
     * @param w
     * @param h
     * @return {BFCanvasClass}
     * @method
     */
    self.CreateBFCanvas = function (w, h)
    {
        self.GlobalBFCanvas = new BFCanvasClass(w, h);
        return self.GlobalBFCanvas;
    };

    /**
     * 创建可移动的全局Canvas，即摄像机
     * @param w
     * @param h
     * @return {BFMovableCanvas}
     * @method
     */
    self.CreateBFMovableCanvas = function (w, h)
    {
        BFMovableCanvasClass.prototype = new BFCanvasClass(w, h);

        function BFMovableCanvasClass()
        {
            this.CanMove = true;

            // 移动的目标坐标(屏幕坐标)
            var _targetX = 0;
            var _targetY = 0;
            // 每帧移动的像素数
            var _speed = 0;
            // 移动的方向(屏幕坐标)
            var _directionX = 0;
            var _directionY = 0;
            // 摄像机的中心基准位置相对于左上屏幕坐标的偏移量
            var _offsetX = w / 2;
            var _offsetY = h * 0.618;
            this.CenterLocation = new BFLocationClass(this.DrawLocation().X + _offsetX, this.DrawLocation().Y + _offsetY);

            var _counter = null;

            /**
             * 设置移动的目标坐标
             * @param tx
             * @param ty
             * @return {Boolean}
             * @method
             */
            this.SetMoveTarget = function (tx, ty)
            {
                var dx = 0;
                var dy = 0;
                if (tx > this.CenterLocation.X)
                {
                    dx = 1;
                }
                else if (tx < this.CenterLocation.X)
                {
                    dx = -1;
                }
                if (ty > this.CenterLocation.Y)
                {
                    dy = 1;
                }
                else if (ty < this.CenterLocation.Y)
                {
                    dy = -1;
                }

                var distanceX = Math.abs(tx - this.CenterLocation.X);
                var distanceY = Math.abs(ty - this.CenterLocation.Y);
                if (distanceX > distanceY)
                {
                    _counter = new BFCounterClass('x', Math.floor(distanceX / distanceY));
                }
                else
                {
                    _counter = new BFCounterClass('y', Math.floor(distanceY / distanceX));
                }

                _targetX = tx;
                _targetY = ty;
                _directionX = dx;
                _directionY = dy;
            };

            /**
             * 判断是否移动到了目标坐标
             * @param 方向标志
             * @return {Boolean}
             * @method
             */
            this.CheckExceed = function (xOry)
            {
                var t = 0;
                var c = 0;
                var d = 0;
                if (xOry == 'x')
                {
                    t = _targetX;
                    c = this.CenterLocation.X;
                    d = _directionX;
                }
                else if (xOry == 'y')
                {
                    t = _targetY;
                    c = this.CenterLocation.Y;
                    d = _directionY;
                }

                if (d > 0)
                {
                    if (c >= t)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else if (d < 0)
                {
                    if (c <= t)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return true;
                }
            };

            /**
             * 判断是否移动到了边界
             * @param xOry
             * @return {Boolean}
             * @method
             */
            this.CheckBorder = function (xOry)
            {
                var t = 0;
                var c = 0;
                var l = 0
                var d = 0;
                if (xOry == 'x')
                {
                    t = self.MapScreenSize.Width;
                    c = this.CenterLocation.X - _offsetX;
                    l = w;
                    d = _directionX;
                }
                else if (xOry == 'y')
                {
                    t = self.MapScreenSize.Height;
                    c = this.CenterLocation.Y - _offsetY;
                    l = h;
                    d = _directionY;
                }

                if (d > 0)
                {
                    if (c + l >= t)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else if (d < 0)
                {
                    if (c <= 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return true;
                }
            };

            /**
             * 移动中心坐标
             * @param xOry
             * @return {Boolean}
             * @method
             */
            this.MoveCenter = function (xOry)
            {
                var b = false;
                if (xOry == 'x')
                {
                    this.CenterLocation.X += _directionX * _speed;
                    b = this.CheckBorder('x');
                    if (b)
                    {
                        if (_directionX > 0)
                        {
                            this.CenterLocation.X = self.MapScreenSize.Width - _offsetX;
                        }
                        else if (_directionX < 0)
                        {
                            this.CenterLocation.X = _offsetX;
                        }
                    }
                    else
                    {
                        b = this.CheckExceed('x');
                        if (b)
                        {
                            this.CenterLocation.X = _targetX;
                        }
                    }
                }
                else
                {
                    this.CenterLocation.Y += _directionY * _speed;
                    b = this.CheckBorder('y');
                    if (b)
                    {
                        if (_directionY > 0)
                        {
                            this.CenterLocation.Y = self.MapScreenSize.Height - h + _offsetY;
                        }
                        else if (_directionY < 0)
                        {
                            this.CenterLocation.Y = _offsetY;
                        }
                    }
                    else
                    {
                        b = this.CheckExceed('y');
                        if (b)
                        {
                            this.CenterLocation.Y = _targetY;
                        }
                    }
                }
                return b;
            };

            this.OnUpdate = function ()
            {
                if (_speed == 0)
                {
                    return;
                }
                var bx = false;
                var by = false;
                var tx = _targetX;
                var ty = _targetY;

                _counter.Count();
                if (_directionX == 0)
                {
                    bx = true;
                }
                else
                {
                    if (_directionY != 0)
                    {
                        if (_counter.MoveFlagX)
                        {
                            bx = this.MoveCenter('x');
                        }
                    }
                    else
                    {
                        bx = this.MoveCenter('x');
                    }
                }

                if (_directionY == 0)
                {
                    by = true;
                }
                else
                {
                    if (_directionX != 0)
                    {
                        if (_counter.MoveFlagY)
                        {
                            by = this.MoveCenter('y');
                        }
                    }
                    else
                    {
                        by = this.MoveCenter('y');
                    }
                }

                if (bx)
                {
                    _directionX = 0;
                }
                if (by)
                {
                    _directionY = 0;
                }
                this.SetDrawLocationByCenter();

                if (bx && by)
                {
                    _speed = 0;
                    this.OnStopMove({ TargetX : tx, TargetY : ty });
                }
            };

            /**
             * 设置中心基准位置(屏幕坐标)
             * @param x
             * @param y
             * @method
             */
            this.SetCenterLocation = function (x, y)
            {
                this.SetCenterX(x);
                this.SetCenterY(y);
                this.SetDrawLocationByCenter();
            };

            /**
             * 根据中心基准位置设置左上屏幕坐标(屏幕坐标)
             * @method
             */
            this.SetDrawLocationByCenter = function ()
            {
                this.DrawLocation().X = this.CenterLocation.X - _offsetX;
                this.DrawLocation().Y = this.CenterLocation.Y - _offsetY;
                for (var i = 0; i < this.LayerList().length; ++i)
                {
                    this.LayerList()[i].ComputeClearArea(this.DrawLocation().X, this.DrawLocation().Y, this.CanvasWidth(), this.CanvasHeight());
                }
            };

            this.SetCenterX = function (val)
            {
                var d = 0;
                if (val > this.CenterLocation.X)
                {
                    d = 1;
                }
                else if (val < this.CenterLocation.X)
                {
                    d = -1;
                }
                var t = self.MapScreenSize.Width;
                var c = val - _offsetX;
                var l = w;

                var b = false
                if (d > 0)
                {
                    if (c + l >= t)
                    {
                        b = true;
                    }
                    else
                    {
                        b = false;
                    }
                }
                else if (d < 0)
                {
                    if (c <= 0)
                    {
                        b = true;
                    }
                    else
                    {
                        b = false;
                    }
                }
                else
                {
                    b = true;
                }

                this.CenterLocation.X = val;
                if (b)
                {
                    if (d > 0)
                    {
                        this.CenterLocation.X = self.MapScreenSize.Width - _offsetX;
                    }
                    else if (d < 0)
                    {
                        this.CenterLocation.X = _offsetX;
                    }
                }
            };

            this.SetCenterY = function (val)
            {
                var d = 0;
                if (val > this.CenterLocation.Y)
                {
                    d = 1;
                }
                else if (val < this.CenterLocation.Y)
                {
                    d = -1;
                }
                var t = self.MapScreenSize.Height;
                var c = val - _offsetY;
                var l = h;

                var b = false
                if (d > 0)
                {
                    if (c + l >= t)
                    {
                        b = true;
                    }
                    else
                    {
                        b = false;
                    }
                }
                else if (d < 0)
                {
                    if (c <= 0)
                    {
                        b = true;
                    }
                    else
                    {
                        b = false;
                    }
                }
                else
                {
                    b = true;
                }

                this.CenterLocation.Y = val;
                if (b)
                {
                    if (d > 0)
                    {
                        this.CenterLocation.Y = self.MapScreenSize.Height - h + _offsetY;
                    }
                    else if (d < 0)
                    {
                        this.CenterLocation.Y = _offsetY;
                    }
                }
            };

            /**
             * 开始移动事件
             * @param e:{ TargetX : clickX, TargetY: clickY, Speed: speed } 屏幕坐标
             * @event
             */
            this.OnStartMove = function (e)
            {
                this.SetMoveTarget(e.TargetX, e.TargetY);
                _speed = e.Speed;
            };

            /**
             * 停止移动事件
             * @param e:{ TargetX : clickX, TargetY: clickY } 屏幕坐标
             * @event
             */
            this.OnStopMove = function (e)
            {};
        }

        self.GlobalBFCanvas = new BFMovableCanvasClass();
        return self.GlobalBFCanvas;
    };

    self.Run = function ()
    {
        try
        {
            window.setInterval(Refresh, self.Interval);
        }
        catch (ex)
        {
            OutputDebug(ex);
        }

        var loadingHtmlDisplay = false;
        var canvasDiaplay = false;

        function Refresh()
        {
            try
            {
                if (self.BFResourceContainer.GetResourceLoaded())
                {
                    //TODO self.GlobalBFCanvas.BufferCanvas().onmousemove = MouseMoveEvent;
                    if (!canvasDiaplay)
                    {
                        if (this.DebugSwitch)
                        {
                            document.body.innerHTML = DebugHtml;
                            var mainCanvas = document.getElementById('mainCanvas');
                            mainCanvas.appendChild(self.GlobalBFCanvas.BufferCanvas());
                        }
                        else
                        {
                            document.body.innerHTML = '';
                            document.body.appendChild(self.GlobalBFCanvas.BufferCanvas());
                        }
                        canvasDiaplay = true;
                    }
                    self.GlobalBFCanvas.Draw();
                }
                else
                {
                    if (!loadingHtmlDisplay)
                    {
                        document.body.innerHTML = ConstLoadingHtml;
                        loadingHtmlDisplay = true;
                    }
                }
            }
            catch (ex)
            {
                OutputDebug(ex);
            }
        }

        function MouseMoveEvent(e)
        {
            try
            {
                self.GlobalBFCanvas.BufferCanvas().onmousemove = null;
                var clickX = e.pageX - this.offsetLeft + self.GlobalBFCanvas.DrawLocation().X;
                var clickY = e.pageY - this.offsetTop + self.GlobalBFCanvas.DrawLocation().Y;
                if (self.DragedRender == null)
                {
                    var element = self.GlobalBFCanvas.FindRender(clickX, clickY);
                    if (self.CaptureMouseRender == null)
                    {
                        if (element != null)
                        {
                            element.OnMouseOver({ ClickX : clickX, ClickY : clickY });
                            self.CaptureMouseRender = element;
                        }
                    }
                    else
                    {
                        if (element == null)
                        {
                            self.CaptureMouseRender.OnMouseOut({ ClickX : clickX, ClickY : clickY });
                            self.CaptureMouseRender = null;
                        }
                        else
                        {
                            if (self.CaptureMouseRender.GUID != element.GUID)
                            {
                                self.CaptureMouseRender.OnMouseOut({ ClickX : clickX, ClickY : clickY });
                                element.OnMouseOver({ ClickX : clickX, ClickY : clickY });
                                self.CaptureMouseRender = element;
                            }
                        }
                    }
                }
                else
                {
                    //TODO:modify
                    self.DragedRender.CenterLocation.X += (clickX - self.DragedRender.MouseDownLocation.X);
                    self.DragedRender.CenterLocation.Y += (clickY - self.DragedRender.MouseDownLocation.Y);
                    self.DragedRender.Cast2Map();
                    self.DragedRender.MouseDownLocation.X = clickX;
                    self.DragedRender.MouseDownLocation.Y = clickY;
                    self.DragedRender.CLocation.X = self.DragedRender.Center2CLocation('x', self.DragedRender.CenterLocation.X);
                    self.DragedRender.CLocation.Y = self.DragedRender.Center2CLocation('y', self.DragedRender.CenterLocation.Y);
                    self.DragedRender.ZOrder = self.DragedRender.CLocation.Y + self.DragedRender.CSize.Height;
                }
            }
            catch (ex)
            {
                OutputDebug(ex);
            }
            finally
            {
                CancelEventFlow(e);
            }
        }
    };

    function OutputDebug(logTxt)
    {
        if (this.DebugSwitch)
        {
            var txtLog = document.getElementById('txtLog');
            txtLog.value += logTxt + '\n';
        }
    }

    self.Debug = function (logTxt)
    {
        OutputDebug(logTxt);
    };

    return self;
}(BlueFox || {}));





