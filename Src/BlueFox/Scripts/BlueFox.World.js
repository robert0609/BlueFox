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

    BFGlobal.MapCellUnitLength = 64;
    BFGlobal.FoundationCellWidth = 20;
    BFGlobal.FoundationCellHeight = 10;
    BFGlobal.LookAngle = Math.PI / 6;
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

    for (var x = 1; x < 11; ++x)
    {
        for (var y = 1; y < 11; ++y)
        {
            var mapCell = new BFMapCellClass(x, y);
            mapCell.SetImage('./Resource/Img/mapCell.jpg');
            this.CellList.push(mapCell);
        }
    }

    this.Draw = function (context)
    {
        for (var i = 0; i < this.CellList.length; ++i)
        {
            this.CellList[i].Update();
            this.CellList[i].Draw(context);
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
        this.DLocation.X = 0;
        this.DLocation.Y = 0;
        this.DSize.Width = BFGlobal.MapCellUnitLength;
        this.DSize.Height = BFGlobal.MapCellUnitLength;
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

function BFFoundationClass()
{

}

function BFFoundationCellClass()
{

}