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

        var bodyWidth = document.body.clientWidth;
        var bodyHeight = document.body.clientHeight;

        var BFCanvas = BlueFox.CreateBFCanvas(bodyWidth, bodyHeight);

        var layer1 = BlueFox.CreateBFTransformLayer(bodyWidth, bodyHeight);
        layer1.Index = 0;
        layer1.AutoStopRefresh = true;
        var layer2 = BlueFox.CreateBFLayer(bodyWidth, bodyHeight);
        layer2.Index = 2;
        layer2.StrokeStyle('orange');
        var layer3 = BlueFox.CreateBFCollisionLayer(bodyWidth, bodyHeight);
        layer3.Index = 1;
        layer3.StrokeStyle('red');

        BFCanvas.AddLayer(layer2);
        BFCanvas.AddLayer(layer1);
        BFCanvas.AddLayer(layer3);

        layer1.Scale(1, 0.5);
        layer1.Rotate(Math.PI / 4);
        layer1.Translate(400, -600);
        layer1.Transform();

        layer3.Scale(1, 0.5);
        layer3.Rotate(Math.PI / 4);
        layer3.Translate(400, -600);
        layer3.Transform();
        for (var mapCellIdx = 0; mapCellIdx < mapList.length; ++mapCellIdx)
        {
            var mapCell = BlueFox.CreateBFRender(mapList[mapCellIdx]);
            layer1.AddRender(mapCell);
        }
        for (var buildingIdx = 0; buildingIdx < buildingList.length; ++ buildingIdx)
        {
            var building = BlueFox.CreateBFMovableRender(buildingList[buildingIdx]);
            building.Cast2Map(layer3);
            layer2.AddRender(building);
        }

        BlueFox.Run();
    }
    catch (ex)
    {
        alert(ex);
    }
}


