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

    try
    {
        /**
         * 所有资源的容器
         * @type {BFResourceContainerClass}
         */
        self.BFResourceContainer = new BFResourceContainerClass();
        // 每秒帧数
        self.FPS = 60;
        // 每帧间隔时间，毫秒
        self.Interval = 1000 / self.FPS;
        self.FoundationCellWidth = 16;
        self.FoundationCellHeight = 16;
        // 全局画布
        self.GlobalBFCanvas = null;
        // 当前选中的元素
        self.SelectRender = null;
        // 当前捕获了鼠标光标的元素
        self.CaptureMouseRender = null;
        // 当前鼠标拖住的元素
        self.DragedRender = null;
        // 毫秒数,缓存了上一帧绘制结束的时刻,用以计算每帧耗时
        self.CurrentTime = 0;
    }
    catch (ex)
    {
        alert(ex);
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
        {
//            this.SLocation = new BFLocationClass(0, 0);
//            this.SSize = new BFSizeClass(_image.GetImageCanvas().width, _image.GetImageCanvas().height);
//            this.CLocation = new BFLocationClass(0, 0);
//            this.CSize = new BFSizeClass(_image.GetImageCanvas().width, _image.GetImageCanvas().height);
        };

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

        this.Index = 0;

        var _renderList = new Array();

        this.ParentCanvas = null;

        // 该字段缓存当前图层中高度最大的元素的高度值，用以辅助判断鼠标点击在哪个元素上
        this.RenderHeightMax = 0;

        var _layerCanvas = document.createElement('canvas');
        _layerCanvas.width = w;
        _layerCanvas.height = h;
        var _context = _layerCanvas.getContext('2d');

        this.StrokeStyle = function (color)
        {
            _context.strokeStyle = color;
        };

        this.Draw = function ()
        {
            if (this.Refresh)
            {
                _context.clearRect(0, 0, w, h);
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

        this.RenderList = function ()
        {
            return _renderList;
        }

        this.LayerContext = function ()
        {
            return _context;
        };

        this.AddRender = function (render)
        {
            render.ParentLayer = this;
            _renderList.push(render);
        };

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

        /**
         * 重绘处理
         * @method
         */
        this.Draw = function ()
        {
            // 获取当前时刻
            var dt1 = (new Date()).getTime();

            _bufferContext.clearRect(0, 0, w, h);
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
                _bufferContext.drawImage(layerCanvas, 0, 0, layerCanvas.width, layerCanvas.height, 0, 0, w, h);
            }

            // 获取当前时刻
            var dt2 = (new Date()).getTime();

            DisplayFPS(dt1, dt2);
        };

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

        this.AddLayer = function (layer)
        {
            layer.ParentCanvas = this;
            _layerList.push(layer);
        };

        this.FindRender = function (x, y)
        {
            return innerFindRender(x, y);
        };

        function innerFindRender(x, y)
        {
            var element = null;
            for (var i = _layerList.length - 1; i > -1; --i)
            {
                var layer = _layerList[i];
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
            var clickX = e.pageX - this.offsetLeft;
            var clickY = e.pageY - this.offsetTop;
            var element = innerFindRender(clickX, clickY);
            if (element != null)
            {
                element.OnDoubleClick({ ClickX : clickX, ClickY : clickY });
            }
            else
            {
                element = self.SelectRender;
                element.OnStartMove({ TargetX : clickX, TargetY : clickY, Speed : 4 });
            }
            CancelEventFlow(e);
        }

        function MouseDownEvent(e)
        {
            var clickX = e.pageX - this.offsetLeft;
            var clickY = e.pageY - this.offsetTop;
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
            }
            else
            {
                if (e.button == 0)
                {
                    element = self.SelectRender;
                    element.OnStartMove({ TargetX : clickX, TargetY : clickY, Speed : 2 });
                }
                else if (e.button == 2)
                {
                    // TODO:右键单击“空白”区域
                }
            }
            CancelEventFlow(e);
        }

        function MouseUpEvent(e)
        {
            var clickX = e.pageX - this.offsetLeft;
            var clickY = e.pageY - this.offsetTop;
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
            CancelEventFlow(e);
        }

        function ContextMenuEvent(e)
        {
            CancelDefault(e);
            CancelEventFlow(e);
        }
    }

    /**
     * 元素的地基类
     * @param foundation
     * @constructor
     */
    function BFFoundationClass(foundation)
    {
        this.Flag = foundation.flag;
        this.Radius = 0;
        this.Width = 0;
        this.Height = 0;
        if (this.Flag == 'circle')
        {
            this.Radius = foundation.Radius;
        }
        else if (this.Flag == 'rectangle')
        {
            this.Width = foundation.Width;
            this.Height = foundation.Height;
        }
    }

    /* BlueFox.World Begin */
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

            // 元素移动的基准位置坐标
            this.CenterLocation = new BFLocationClass(this.CLocation2Center('x', this.CLocation.X), this.CLocation2Center('y', this.CLocation.Y));

            // 元素的地基，用以碰撞检测 TODO
            this.Foundation = new BFFoundationClass(entity.Foundation);
            this.FoundationCenter = null;
            var _mapLayer = null;
            this.Cast2Map = function (mapLayer)
            {
                if (!IsNullOrUndefined(mapLayer))
                {
                    _mapLayer = mapLayer;
                }
                if (!IsNullOrUndefined(_mapLayer))
                {
                    if (_mapLayer.CanTransform)
                    {
                        this.FoundationCenter = _mapLayer.ConvertScreenLocation(this.CenterLocation.X, this.CenterLocation.Y);
                    }
                    else
                    {
                        this.FoundationCenter = this.CenterLocation;
                    }
                }
            }

            this.CheckConflict = function (foundationRender)
            {
                if (this.FoundationCenter == null || !foundationRender.FoundationCenter || foundationRender.FoundationCenter == null)
                {
                    return false;
                }

                var ret = false;
                var r = 0;
                var w = 0;
                var h = 0;
                var circleO = null;
                var rectO = null;
                if (this.Foundation.Flag == 'circle' && foundationRender.Foundation.Flag == 'circle')
                {
                    ret = ComputeCollisionCC(this.Foundation.Radius, foundationRender.Foundation.Radius, this.FoundationCenter.X - foundationRender.FoundationCenter.X, this.FoundationCenter.Y - foundationRender.FoundationCenter.Y);
                }
                else if (this.Foundation.Flag == 'rectangle' && foundationRender.Foundation.Flag == 'rectangle')
                {

                }
                else
                {
                    if (this.Foundation.Flag == 'circle')
                    {
                        ret = ComputeCollisionCR(foundationRender.Foundation.Width, foundationRender.Foundation.Height, this.Foundation.Radius, this.FoundationCenter.X - foundationRender.FoundationCenter.X, this.FoundationCenter.Y - foundationRender.FoundationCenter.Y);
                    }
                    else
                    {
                        ret = ComputeCollisionCR(this.Foundation.Width, this.Foundation.Height, foundationRender.Foundation.Radius, foundationRender.FoundationCenter.X - this.FoundationCenter.X, foundationRender.FoundationCenter.Y - this.FoundationCenter.Y);
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
        }

        return new BFFoundationRenderClass();
    };

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
            // 移动目标坐标
            var _targetX = 0;
            var _targetY = 0;
            // 移动方向
            this.DirectionX = 0;
            this.DirectionY = 0;
            // 元素在每帧移动的像素数
            this.Speed = 0;

            /**
             * 设置移动的目标坐标
             * @param x
             * @param y
             * @method
             */
            this.SetMoveTarget = function (x, y)
            {
                _targetX = x;
                _targetY = y;
                if (_targetX > this.CenterLocation.X)
                {
                    this.DirectionX = 1;
                }
                else if (_targetX < this.CenterLocation.X)
                {
                    this.DirectionX = -1;
                }
                if (_targetY > this.CenterLocation.Y)
                {
                    this.DirectionY = 1;
                }
                else if (_targetY < this.CenterLocation.Y)
                {
                    this.DirectionY = -1;
                }
            };

            /**
             * 判断X方向是否移动到了目标坐标
             * @return {Boolean}
             * @method
             */
            this.CheckExceedX = function ()
            {
                return this.CheckExceed('x');
            }

            /**
             * 判断Y方向是否移动到了目标坐标
             * @return {Boolean}
             * @method
             */
            this.CheckExceedY = function ()
            {
                return this.CheckExceed('y');
            }

            /**
             * 判断是否移动到了目标坐标
             * @param 方向标志
             * @return {Boolean}
             * @method
             */
            this.CheckExceed = function (dFlag)
            {
                var t = 0;
                var c = 0;
                var d = 0;
                if (dFlag == 'x')
                {
                    t = _targetX;
                    c = this.CenterLocation.X;
                    d = this.DirectionX;
                }
                else if (dFlag == 'y')
                {
                    t = _targetY;
                    c = this.CenterLocation.Y;
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
            }

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

                this.CenterLocation.X += this.DirectionX * this.Speed;
                bx = this.CheckExceedX();
                if (bx)
                {
                    this.CenterLocation.X = tx;
                    this.DirectionX = 0;
                }
                this.CLocation.X = this.Center2CLocation('x', this.CenterLocation.X);

                this.CenterLocation.Y += this.DirectionY * this.Speed;
                by = this.CheckExceedY();
                if (by)
                {
                    this.CenterLocation.Y = ty;
                    this.DirectionY = 0;
                }
                this.CLocation.Y = this.Center2CLocation('y', this.CenterLocation.Y);

                this.ZOrder = this.CLocation.Y + this.CSize.Height;

                this.Cast2Map();

                if (bx && by)
                {
                    this.Speed = 0;
                    this.OnStopMove({ TargetX : tx, TargetY : ty });
                }
            };

            /**
             * 开始移动事件
             * @param e:{ TargetX : clickX, TargetY: clickY }
             * @event
             */
            this.OnStartMove = function (e)
            {
                this.SetMoveTarget(e.TargetX, e.TargetY);
                this.Speed = e.Speed;
            };

            /**
             * 停止移动事件
             * @param e:{ TargetX : clickX, TargetY: clickY }
             * @event
             */
            this.OnStopMove = function (e)
            {

            };
        }

        return new BFMovableRenderClass();
    };

    self.CreateBFLayer = function (w, h)
    {
        return new BFLayerClass(w, h);
    };

    self.CreateBFTransformLayer = function (w, h)
    {
        BFTransformLayerClass.prototype = self.CreateBFLayer(w, h);

        function BFTransformLayerClass()
        {
            this.CanTransform = true;

            var _context = this.LayerContext();

            var _transformCache = [ [1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0] ];

            var _matrix = [1, 0, 0, 1, 0, 0];

            this.Scale = function (sx, sy)
            {
                var a = _transformCache[0];
                a[0] = sx;
                a[3] = sy;
            };

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

            this.Translate = function (x, y)
            {
                var a = _transformCache[2];
                a[4] = x;
                a[5] = y;
            };

            this.Transform = function ()
            {
                _context.setTransform(1, 0, 0, 1, 0, 0);
                var m = [1, 0, 0, 1, 0, 0];
                var a = null;
                for (var i = 0; i < _transformCache.length; ++i)
                {
                    a = _transformCache[i];
                    _context.transform(a[0], a[1], a[2], a[3], a[4], a[5]);
                    m = MatrixMultiply(m, a);
                }

                _matrix = m;
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

    self.CreateBFCanvas = function (w, h)
    {
        self.GlobalBFCanvas = new BFCanvasClass(w, h);
        return self.GlobalBFCanvas;
    };
    /* BlueFox.World End */

    self.Run = function ()
    {
        try
        {
            window.setInterval(Refresh, self.Interval);
        }
        catch (ex)
        {
            alert(ex);
        }

        var loadingHtmlDisplay = false;
        var canvasDiaplay = false;

        function Refresh()
        {
            if (self.BFResourceContainer.GetResourceLoaded())
            {
                self.GlobalBFCanvas.BufferCanvas().onmousemove = MouseMoveEvent;
                if (!canvasDiaplay)
                {
                    document.body.innerHTML = '';
                    document.body.appendChild(self.GlobalBFCanvas.BufferCanvas());
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

        function MouseMoveEvent(e)
        {
            self.GlobalBFCanvas.BufferCanvas().onmousemove = null;
            var clickX = e.pageX - this.offsetLeft;
            var clickY = e.pageY - this.offsetTop;
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
                self.DragedRender.CenterLocation.X += (clickX - self.DragedRender.MouseDownLocation.X);
                self.DragedRender.CenterLocation.Y += (clickY - self.DragedRender.MouseDownLocation.Y);
                self.DragedRender.Cast2Map();
                self.DragedRender.MouseDownLocation.X = clickX;
                self.DragedRender.MouseDownLocation.Y = clickY;
                self.DragedRender.CLocation.X = self.DragedRender.Center2CLocation('x', self.DragedRender.CenterLocation.X);
                self.DragedRender.CLocation.Y = self.DragedRender.Center2CLocation('y', self.DragedRender.CenterLocation.Y);
                self.DragedRender.ZOrder = self.DragedRender.CLocation.Y + self.DragedRender.CSize.Height;
            }
            CancelEventFlow(e);
        }
    };

    return self;
}(BlueFox || {}));





