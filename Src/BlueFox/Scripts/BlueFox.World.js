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
    this.RenderList = new Array();

    this._canvas = document.createElement('canvas');
    this._canvas.width = 1280;
    this._canvas.height = 960;
    var _context = this._canvas.getContext('2d');

    var _map = new BFMapClass();

    this.Update = function ()
    {

    };
}

function BFMapClass()
{
    this.CellList = new Array();

    this.MapCanvas = document.createElement('canvas');
    this.MapCanvas.width = 1280;
    this.MapCanvas.height = 960;
    var _context = this.MapCanvas.getContext('2d');
    _context.scale(1, Math.sin(BFGlobal.LookAngle));

    for (var mapCellIdx = 0; mapCellIdx < TestMapData.MapCells.length; ++ mapCellIdx)
    {
        var mapCell = new BFMapCellClass(TestMapData.MapCells[mapCellIdx]);
        this.CellList.push(mapCell);
    }
    for (var buildingIdx = 0; buildingIdx < TestMapData.Buildings.length; ++ buildingIdx)
    {
        var building = new BFBuildingClass(TestMapData.Buildings[buildingIdx]);
        this.CellList.push(building);
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
 * @param mapCellEntity: 该单元格的数据实体
 * @constructor
 */
function BFMapCellClass(mapCellEntity)
{
    this.Update = function ()
    {
        this.SLocation = new BFLocationClass(mapCellEntity.SX, mapCellEntity.SY);
        this.SSize = new BFSizeClass(BFGlobal.MapCellUnitLength, BFGlobal.MapCellUnitLength);
        this.CLocation = ConvertMapIndex2Location(mapCellEntity.XIndex, mapCellEntity.YIndex);
        this.CSize = new BFSizeClass(BFGlobal.MapCellUnitLength, BFGlobal.MapCellUnitLength);
        this.ZOrder = mapCellEntity.ZOrder;
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
 * @param buildingEntity: 阻碍物的数据实体
 * @constructor
 */
function BFBuildingClass(buildingEntity)
{
    this.Foundation = new BFFoundationClass();

    this.Update = function ()
    {
        this.SLocation = new BFLocationClass(buildingEntity.SX, buildingEntity.SY);
        this.SSize = new BFSizeClass(buildingEntity.SWidth, buildingEntity.SHeight);
        this.CLocation = new BFLocationClass(buildingEntity.CX, buildingEntity.CY);
        this.CSize = new BFSizeClass(buildingEntity.CWidth, buildingEntity.CHeight);
        this.ZOrder = buildingEntity.ZOrder;
        this.Foundation.BaseLocation = this.CLocation;
    };

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
    this.FSize = new BFSizeClass(BFGlobal.FoundationCellWidth, BFGlobal.FoundationCellHeight);
}