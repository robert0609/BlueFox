/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-18
 * Time: 下午5:33
 * To change this template use File | Settings | File Templates.
 */
function BFWorldClass()
{
    BFGlobal.MapCellUnitLength = 50;
    BFGlobal.FoundationCellWidth = 20;
    BFGlobal.FoundationCellHeight = 10;
}

function BFMapClass()
{

}

/**
 * 地图单元格
 * @param xIndex: 该单元格的x轴索引
 * @param yIndex: 该单元格的y轴索引
 * @param imageFilePath: 该单元格的加载图片
 * @constructor
 */
function BFMapCellClass(xIndex, yIndex, imageFilePath)
{
    // 继承BFRenderClass类
    BFMapCellClass.prototype = new BFRenderClass(imageFilePath);
    // 将当前创建的实例缓存起来
    var _instance = this;

    _instance.CLocation = ConvertMapIndex2Location(xIndex, yIndex);
    _instance.CSize.Width = BFGlobal.MapCellUnitLength;
    _instance.CSize.Height = BFGlobal.MapCellUnitLength;

    _instance.Update = function ()
    {
        _instance.SLocation.X = 0;
        _instance.SLocation.Y = 0;
        _instance.SSize.Width = BFGlobal.MapCellUnitLength;
        _instance.SSize.Height = BFGlobal.MapCellUnitLength;
        _instance.DLocation.X = 0;
        _instance.DLocation.Y = 0;
        _instance.DSize.Width = BFGlobal.MapCellUnitLength;
        _instance.DSize.Height = BFGlobal.MapCellUnitLength;
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