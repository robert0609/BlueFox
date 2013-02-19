/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-5
 * Time: 下午6:21
 * To change this template use File | Settings | File Templates.
 */

var BlueFox = (function (self)
{
    /**
     * 所有资源的容器
     * @type {BFResourceContainerClass}
     */
    var BFResourceContainer = new BFResourceContainerClass();
    BFResourceContainer.GetImage('./Resource/Img/mapCell.png');
    BFResourceContainer.GetImage('./Resource/Img/tree.png');
    // 每秒帧数
    self.FPS = 30;
    // 每帧间隔时间，毫秒
    self.Interval = 1000 / self.FPS;
    self.MapCellUnitLength = 64;
    self.LookAngle = Math.PI / 6;
    self.FoundationCellWidth = 16;
    self.FoundationCellHeight = 16;

    /* BlueFox.Common Begin */
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
                throw 'BFDictionary已经存在Key:' + key + '，无法重复添加';
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
    }
    /* BlueFox.Common End */

    /* BlueFox Begin */
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

        this.ZOrder = 0;

        this.Selected = false;

        // 移动目标坐标
        var _targetX = 0;
        var _targetY = 0;
        // 移动方向
        this.DirectionX = 0;
        this.DirectionY = 0;
        // 元素在每帧移动的像素数
        this.Speed = 0;

        var _image = null;
        if (imageFilePath == undefined || imageFilePath == null)
        {
            _image = BFResourceContainer.GetImage('');
        }
        else
        {
            _image = BFResourceContainer.GetImage(imageFilePath);
        }

        /**
         * 每帧都会调用Draw方法绘制
         * @method
         */
        this.Draw = function (context)
        {
            if (_image.GetImageLoaded())
            {
                context.drawImage(_image.GetImageCanvas(), this.SLocation.X, this.SLocation.Y, this.SSize.Width, this.SSize.Height, this.CLocation.X, this.CLocation.Y, this.CSize.Width, this.CSize.Height);
                if (this.Selected)
                {
                    context.strokeRect(this.CLocation.X, this.CLocation.Y, this.CSize.Width, this.CSize.Height);
                }
            }
        };

        /**
         * 每帧都会调用Update方法更新该绘图单元的位置及尺寸
         * @method
         */
        this.Update = function ()
        {
            this.SLocation = new BFLocationClass(0, 0);
            this.SSize = new BFSizeClass(_image.GetImageCanvas().width, _image.GetImageCanvas().height);
            this.CLocation = new BFLocationClass(0, 0);
            this.CSize = new BFSizeClass(_image.GetImageCanvas().width, _image.GetImageCanvas().height);
        };

        /**
         * 设置该绘图单元的图片
         * @param imageFilePath: string类型 图片文件相对路径
         * @method
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
            if (_image.ImageFilePath == filePath)
            {
                return;
            }
            _image = BFResourceContainer.GetImage(filePath);
        };

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
            if (_targetX > this.CLocation.X)
            {
                this.DirectionX = 1;
            }
            else if (_targetX < this.CLocation.X)
            {
                this.DirectionX = -1;
            }
            if (_targetY > this.CLocation.Y)
            {
                this.DirectionY = 1;
            }
            else if (_targetY < this.CLocation.Y)
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
                c = this.CLocation.X;
                d = this.DirectionX;
            }
            else if (dFlag == 'y')
            {
                t = _targetY;
                c = this.CLocation.Y;
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
                var img = new BFImageClass(imageFilePath);
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

        this.RenderList = new Array();

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
                this.RenderList = this.RenderList.sort(function (a, b)
                {
                    return a.ZOrder - b.ZOrder;
                });
                var render = null;
                for (var i = 0; i < this.RenderList.length; ++i)
                {
                    render = this.RenderList[i];
                    render.Update();
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
    }

    /**
     * 最外层Canvas类，包含若干图层
     * @param w
     * @param h
     * @constructor
     */
    function BFCanvasClass(w, h)
    {
        this.LayerList = new Array();

        var _bufferCanvas = document.createElement('canvas');
        _bufferCanvas.width = w;
        _bufferCanvas.height = h;
        document.body.appendChild(_bufferCanvas);
        AddEventHandler(_bufferCanvas, 'click', MouseClickEvent, false);
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

            this.LayerList = this.LayerList.sort(function (a, b)
            {
                return a.Index - b.Index;
            });
            var layer = null;
            var layerCanvas = null;
            for (var i = 0; i < this.LayerList.length; ++i)
            {
                layer = this.LayerList[i];
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
    }
    /* BlueFox End */

    /* BlueFox.World Begin */
    /**
     * 鼠标单击事件
     * @param e
     * @event
     */
    function MouseClickEvent(e)
    {
        var clickX = e.pageX - self.GlobalCanvas.LocationX();
        var clickY = e.pageY - self.GlobalCanvas.LocationY();
        var element = FindClickElement(clickX, clickY, self.GlobalCanvas.LayerList[1]);
        if (element != null)
        {
            if (self.SelectRender != null)
            {
                self.SelectRender.Selected = false;
            }
            self.SelectRender = element;
            self.SelectRender.Selected = true;
        }
        else
        {
            element = self.SelectRender;
            element.SetMoveTarget(clickX, clickY);
            element.Speed = 2;
        }
        CancelEventFlow(e);
    }

    function FindClickElement(clickX, clickY, BFLayer)
    {
        var ret = null;
        var render = null;
        BFLayer.RenderList = BFLayer.RenderList.sort(function (a, b)
        {
            return b.ZOrder - a.ZOrder;
        });
        for (var i = 0; i < BFLayer.RenderList.length; ++i)
        {
            render = BFLayer.RenderList[i];
            if (clickX >= render.CLocation.X && clickX <= render.CLocation.X + render.CSize.Width &&
                clickY >= render.CLocation.Y && clickY <= render.CLocation.Y + render.CSize.Height)
            {
                ret = render;
                break;
            }
        }
        return ret;
    }

    self.CreateBFMapCell = function (mapCellEntity)
    {
        //继承基本绘图单元
        BFMapCellClass.prototype = new BFRenderClass(null);

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
            this.ZOrder = mapCellEntity.ZOrder;

            this.Update = function ()
            {
            };

            this.SetImage(mapCellEntity.ImageFilePath);
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
        BFBuildingClass.prototype = new BFRenderClass(null);

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
            this.ZOrder = buildingEntity.ZOrder;

            this.Update = function ()
            {
                if (this.Speed == 0)
                {
                    return;
                }
                var bx = false;
                var by = false;
                var tx = this.TargetX();
                var ty = this.TargetY();
                this.CLocation.X += this.DirectionX * this.Speed;
                bx = this.CheckExceedX();
                if (bx)
                {
                    this.CLocation.X = tx;
                    this.DirectionX = 0;
                }
                this.CLocation.Y += this.DirectionY * this.Speed;
                this.ZOrder = this.CLocation.Y;
                by = this.CheckExceedY();
                if (by)
                {
                    this.CLocation.Y = ty;
                    this.ZOrder = this.CLocation.Y;
                    this.DirectionY = 0;
                }

                if (bx && by)
                {
                    this.Speed = 0;
                }
            };

            this.Foundation = new BFFoundationClass();
            this.Foundation.BaseLocation = this.CLocation;
            this.Foundation.AddCell(new BFFoundationCellClass(10, 50));
            this.Foundation.AddCell(new BFFoundationCellClass(20, 50));
            this.Foundation.AddCell(new BFFoundationCellClass(15, 60));

            this.SetImage(buildingEntity.ImageFilePath);
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

    /**
     * 创建画布上的绘制元素
     * @param renderEntity,格式:{"CX": 100, "CY": 458, "CWidth": 96, "CHeight": 128, "SX": 0, "SY": 0, "SWidth": 96, "SHeight": 128, "ZOrder": 586, "ImageFilePath": "./Resource/Img/tree.png"}
     * @return {BFRenderClass}
     * @method
     */
    self.CreateBFRender = function (renderEntity)
    {
        var render = new BFRenderClass(renderEntity.ImageFilePath);
        render.SLocation.X = renderEntity.SX;
        render.SLocation.Y = renderEntity.SY;
        render.SSize.Width = renderEntity.SWidth;
        render.SSize.Height = renderEntity.SHeight;
        render.CLocation.X = renderEntity.CX;
        render.CLocation.Y = renderEntity.CY;
        render.CSize.Width = renderEntity.CWidth;
        render.CSize.Height = renderEntity.CHeight;
        render.ZOrder = renderEntity.ZOrder;

        render.Update = function ()
        {
            if (this.Speed == 0)
            {
                return;
            }
            var bx = false;
            var by = false;
            var tx = this.TargetX();
            var ty = this.TargetY();
            this.CLocation.X += this.DirectionX * this.Speed;
            bx = this.CheckExceedX();
            if (bx)
            {
                this.CLocation.X = tx;
                this.DirectionX = 0;
            }
            this.CLocation.Y += this.DirectionY * this.Speed;
            this.ZOrder = this.CLocation.Y;
            by = this.CheckExceedY();
            if (by)
            {
                this.CLocation.Y = ty;
                this.ZOrder = this.CLocation.Y;
                this.DirectionY = 0;
            }

            if (bx && by)
            {
                this.Speed = 0;
            }
        };

        return render;
    };
    /* BlueFox.World End */

    self.GlobalCanvas = null;
    self.SelectRender = null;
    // 毫秒数,缓存了上一帧绘制结束的时刻,用以计算每帧耗时
    self.CurrentTime = 0;
    self.Run = function ()
    {
        try
        {
            var BFCanvas = new BFCanvasClass(1280, 960);
            self.GlobalCanvas = BFCanvas;
            var layer1 = new BFLayerClass(1280, 960);
            layer1.Index = 0;
            layer1.AutoStopRefresh = true;
            var layer2 = new BFLayerClass(1280, 960);
            layer2.Index = 1;
            layer2.StrokeStyle('orange');
            BFCanvas.LayerList.push(layer2);
            BFCanvas.LayerList.push(layer1);

            layer1.Scale(self.LookAngle);
            for (var mapCellIdx = 0; mapCellIdx < TestMapData.MapCells.length; ++mapCellIdx)
            {
                var mapCell = self.CreateBFMapCell(TestMapData.MapCells[mapCellIdx]);
                layer1.RenderList.push(mapCell);
            }
            for (var buildingIdx = 0; buildingIdx < TestMapData.Buildings.length; ++ buildingIdx)
            {
                var building = self.CreateBFRender(TestMapData.Buildings[buildingIdx]);
                layer2.RenderList.push(building);
            }

            window.setInterval(function (){ BFCanvas.Draw(); }, self.Interval);
        }
        catch (ex)
        {
            alert(ex);
        }
    };

    return self;
}(BlueFox || {}));





