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
        self.FPS = 30;
        // 每帧间隔时间，毫秒
        self.Interval = 1000 / self.FPS;
        self.MapCellUnitLength = 64;
        self.LookAngle = Math.PI / 6;
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
            self.DragedRender = this;
            this.MouseDownLocation.X = e.ClickX;
            this.MouseDownLocation.Y = e.ClickY;
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

        this.Scale = function (angle)
        {
            _context.scale(1, Math.sin(angle));
        };

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

        this.AddRender = function (render)
        {
            render.ParentLayer = this;
            _renderList.push(render);
        };

        this.FindRender = function (x, y)
        {
            var ret = null;
            var render = null;
            var start = FindLessOrEqual(y + this.RenderHeightMax);
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
        function FindLessOrEqual(z)
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
        }
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
     * @param renderEntity,格式:{"CX": 100, "CY": 458, "CWidth": 96, "CHeight": 128, "SX": 0, "SY": 0, "SWidth": 96, "SHeight": 128, "ZOrder": 586, "ImageFilePath": "./Resource/Img/tree.png"}
     * @return {BFRenderClass}
     * @method
     */
    self.CreateBFRender = function (renderEntity)
    {
        if (IsNullOrUndefined(renderEntity))
        {
            throw '[CreateBFRender] method\'s parameter is null or undefined!';
        }
        if (!IsObject(renderEntity))
        {
            throw '[CreateBFRender] method\'s parameter is not object!';
        }
        var render = new BFRenderClass();
        render.SetImage(renderEntity.ResourceId);
        render.SLocation.X = renderEntity.SX;
        render.SLocation.Y = renderEntity.SY;
        render.SSize.Width = renderEntity.SWidth;
        render.SSize.Height = renderEntity.SHeight;
        render.CLocation.X = renderEntity.CX;
        render.CLocation.Y = renderEntity.CY;
        render.CSize.Width = renderEntity.CWidth;
        render.CSize.Height = renderEntity.CHeight;
        render.ZOrder = renderEntity.CY + renderEntity.CHeight;

        return render;
    };

    self.CreateBFMovableRender = function (renderOrEntity)
    {
        if (IsNullOrUndefined(renderOrEntity))
        {
            throw '[CreateBFMovableRender] method\'s parameter is null or undefined!';
        }
        if (!IsObject(renderOrEntity))
        {
            throw '[CreateBFMovableRender] method\'s parameter is not object!';
        }
        if (renderOrEntity instanceof BFRenderClass)
        {
            //继承基本绘图单元
            BFMovableRenderClass.prototype = renderOrEntity;
        }
        else
        {
            //继承基本绘图单元
            BFMovableRenderClass.prototype = self.CreateBFRender(renderOrEntity);
        }

        function BFMovableRenderClass()
        {
            // 元素移动的基准位置坐标
            this.CenterLocation = new BFLocationClass(this.CLocation.X + Math.floor(this.CSize.Width / 2), this.CLocation.Y + this.CSize.Height);

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
                this.CLocation.X = this.CenterLocation.X - Math.floor(this.CSize.Width / 2);

                this.CenterLocation.Y += this.DirectionY * this.Speed;
                by = this.CheckExceedY();
                if (by)
                {
                    this.CenterLocation.Y = ty;
                    this.DirectionY = 0;
                }
                this.CLocation.Y = this.CenterLocation.Y - this.CSize.Height;

                this.ZOrder = this.CLocation.Y + this.CSize.Height;

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

    self.CreateBFCanvas = function (w, h)
    {
        self.GlobalBFCanvas = new BFCanvasClass(w, h);
        return self.GlobalBFCanvas;
    };
    /* BlueFox.World End */

    self.CreateBFMapCell = function (mapCellEntity)
    {
        //继承基本绘图单元
        BFMapCellClass.prototype = new BFRenderClass();

        /**
         * 地图单元格
         * @param mapCellEntity: 该单元格的数据实体
         * @constructor
         */
        function BFMapCellClass(mapCellEntity)
        {
            this.SLocation.X = mapCellEntity.SX;
            this.SLocation.Y = mapCellEntity.SY;
            this.SSize.Width = self.MapCellUnitLength;
            this.SSize.Height = self.MapCellUnitLength;
            this.CLocation = ConvertMapIndex2Location(mapCellEntity.XIndex, mapCellEntity.YIndex);
            this.CSize.Width = self.MapCellUnitLength;
            this.CSize.Height = self.MapCellUnitLength;
            this.ZOrder = this.CLocation.Y + self.MapCellUnitLength;

            this.OnUpdate = function ()
            {
            };

            this.SetImage(mapCellEntity.ResourceId);
        }

        /**
         * 将地图的单元格索引转换成画布坐标
         * @param xIndex: x轴索引
         * @param yIndex: y轴索引
         * @return {BFLocationClass}
         * @method
         */
        function ConvertMapIndex2Location(xIndex, yIndex)
        {
            var x = 0;
            if (xIndex >= 1)
            {
                x = (xIndex - 1) * self.MapCellUnitLength;
            }
            var y = 0;
            if (yIndex >= 1)
            {
                y = (yIndex - 1) * self.MapCellUnitLength;
            }
            return new BFLocationClass(x, y);
        }

        return new BFMapCellClass(mapCellEntity);
    };

    self.CreateBFBuilding = function (buildingEntity)
    {
        //继承基本绘图单元
        BFBuildingClass.prototype = new BFRenderClass();

        /**
         * 地图上的阻碍物(建筑等)
         * @param buildingEntity: 阻碍物的数据实体
         * @constructor
         */
        function BFBuildingClass(buildingEntity)
        {
            this.SLocation.X = buildingEntity.SX;
            this.SLocation.Y = buildingEntity.SY;
            this.SSize.Width = buildingEntity.SWidth;
            this.SSize.Height = buildingEntity.SHeight;
            this.CLocation.X = buildingEntity.CX;
            this.CLocation.Y = buildingEntity.CY;
            this.CSize.Width = buildingEntity.CWidth;
            this.CSize.Height = buildingEntity.CHeight;
            this.ZOrder = buildingEntity.CY + buildingEntity.CHeight;

            this.OnUpdate = function ()
            {
            };

            this.Foundation = new BFFoundationClass();
            this.Foundation.BaseLocation = this.CLocation;
            this.Foundation.AddCell(new BFFoundationCellClass(10, 50));
            this.Foundation.AddCell(new BFFoundationCellClass(20, 50));
            this.Foundation.AddCell(new BFFoundationCellClass(15, 60));

            this.SetImage(buildingEntity.ResourceId);
        }

        function BFFoundationClass()
        {
            this.BaseLocation = new BFLocationClass(0, 0);
            this.CellList = new Array();

            this.AddCell = function (foundationCell)
            {
                this.CellList.push(foundationCell);
            };

            this.CheckConflict = function ()
            {

            };
        }

        function BFFoundationCellClass(x, y)
        {
            this.FLocation = new BFLocationClass(x, y);
            this.FSize = new BFSizeClass(self.FoundationCellWidth, self.FoundationCellHeight);
        }

        return new BFBuildingClass(buildingEntity);
    };

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
                self.DragedRender.MouseDownLocation.X = clickX;
                self.DragedRender.MouseDownLocation.Y = clickY;
                self.DragedRender.CLocation.X = self.DragedRender.CenterLocation.X - Math.floor(self.DragedRender.CSize.Width / 2);
                self.DragedRender.CLocation.Y = self.DragedRender.CenterLocation.Y - self.DragedRender.CSize.Height;
                self.DragedRender.ZOrder = self.DragedRender.CLocation.Y + self.DragedRender.CSize.Height;
            }
            CancelEventFlow(e);
        }
    };

    return self;
}(BlueFox || {}));





