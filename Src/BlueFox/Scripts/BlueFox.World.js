/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-18
 * Time: 下午5:33
 * To change this template use File | Settings | File Templates.
 */
/**
 * ------Global variant declare area Begin------
 */
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
    BFMapCellClass.prototype = new BFRenderClass(null);
    BFBuildingClass.prototype = new BFRenderClass(null);

    BFGlobal.MapCellUnitLength = 64;
    BFGlobal.LookAngle = Math.PI / 6;
    BFGlobal.FoundationCellWidth = 10;
    BFGlobal.FoundationCellHeight = 10;
}());
/**
 * ------Javascript file onload callback End------
 */

function BFWorldClass()
{
}

function BFMapClass()
{
    this.CellList = new Array();

    this.MapCanvas = document.createElement('canvas');
    this.MapCanvas.width = 1280;
    this.MapCanvas.height = 960;
    var _context = this.MapCanvas.getContext('2d');
    _context.scale(1, Math.sin(BFGlobal.LookAngle));

    for (var x = 1; x < 21; ++x)
    {
        for (var y = 1; y < 32; ++y)
        {
            var mapCell = new BFMapCellClass(x, y);
            mapCell.SetImage('./Resource/Img/mapCell.png');
            this.CellList.push(mapCell);
        }
    }

    this.Draw = function ()
    {
        for (var i = 0; i < this.CellList.length; ++i)
        {
            this.CellList[i].Update();
            this.CellList[i].Draw(_context);
        }
    };
}

/**
 * 地图单元格
 * @param xIndex: 该单元格的x轴索引
 * @param yIndex: 该单元格的y轴索引
 * @param imageFilePath: 该单元格的加载图片
 * @constructor
 */
function BFMapCellClass(xIndex, yIndex)
{
    this.CLocation = ConvertMapIndex2Location(xIndex, yIndex);
    this.CSize.Width = BFGlobal.MapCellUnitLength;
    this.CSize.Height = BFGlobal.MapCellUnitLength;

    this.Update = function ()
    {
        this.SLocation.X = 0;
        this.SLocation.Y = 0;
        this.SSize.Width = BFGlobal.MapCellUnitLength;
        this.SSize.Height = BFGlobal.MapCellUnitLength;
    };
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
        x = (xIndex - 1) * BFGlobal.MapCellUnitLength;
    }
    var y = 0;
    if (yIndex >= 1)
    {
        y = (yIndex - 1) * BFGlobal.MapCellUnitLength;
    }
    return new BFLocationClass(x, y);
}

/**
 * 地图上的阻碍物(建筑等)
 * @constructor
 */
function BFBuildingClass()
{
    this.Foundation = new BFFoundationClass();

    this.Update = function ()
    {
        this.SLocation = new BFLocationClass(0, 0);
        this.SSize = new BFSizeClass(96, 128);
        this.CLocation = new BFLocationClass(0, 0);
        this.CSize = new BFSizeClass(96, 128);
        this.Foundation.BaseLocation = this.CLocation;
    };

    this.Foundation.AddCell(new BFFoundationCellClass(10, 50));
    this.Foundation.AddCell(new BFFoundationCellClass(20, 50));
    this.Foundation.AddCell(new BFFoundationCellClass(15, 60));

    this.SetImage('../tree.png');
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
    this.FSize = new BFSizeClass(BFGlobal.FoundationCellWidth, BFGlobal.FoundationCellHeight);
}