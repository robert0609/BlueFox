/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-5
 * Time: 下午2:13
 * To change this template use File | Settings | File Templates.
 */

function Load()
{
    try
    {
        var resourceList = GetResourceList();
        for (var i = 0; i < resourceList.length; ++i)
        {
            var res = resourceList[i];
            BlueFox.BFResourceContainer.SetImage(res.ResourceId, res.ImageFilePath);
        }

        var mapList = GetMapList();
        var buildingList = GetBuildingList();

        var BFCanvas = BlueFox.CreateBFCanvas(1280, 960);;

        var layer1 = BlueFox.CreateBFLayer(1280, 960);
        layer1.Index = 0;
        layer1.AutoStopRefresh = true;
        var layer2 = BlueFox.CreateBFLayer(1280, 960);
        layer2.Index = 1;
        layer2.StrokeStyle('orange');
        BFCanvas.LayerList.push(layer2);
        BFCanvas.LayerList.push(layer1);

        layer1.Scale(BlueFox.LookAngle);
        for (var mapCellIdx = 0; mapCellIdx < mapList.length; ++mapCellIdx)
        {
            var mapCell = BlueFox.CreateBFMapCell(mapList[mapCellIdx]);
            layer1.RenderList.push(mapCell);
        }
        for (var buildingIdx = 0; buildingIdx < buildingList.length; ++ buildingIdx)
        {
            var building = BlueFox.CreateBFRender(buildingList[buildingIdx]);
            layer2.RenderList.push(building);
        }

        document.body.appendChild(BFCanvas.BufferCanvas());
        BlueFox.Run();
    }
    catch (ex)
    {
        alert(ex);
    }
}


