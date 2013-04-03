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

        var layer1 = BlueFox.CreateBFTransformLayer(640, 640);
        layer1.Index = 0;
        layer1.AutoStopRefresh = true;
        layer1.Scale(1, 0.4);
        layer1.Rotate(Math.PI / 4);
        layer1.Translate(320, -320);
        layer1.Transform();

        var layer3 = BlueFox.CreateBFCollisionLayer(layer1.LayerWidth(), layer1.LayerHeight());
        layer3.Index = 1;
        layer3.StrokeStyle('red');
        layer3.Scale(1, 0.4);
        layer3.Rotate(Math.PI / 4);
        layer3.Translate(320, -320);
        layer3.Transform();

        var layer2 = BlueFox.CreateBFLayer(640, 640);
        layer2.Index = 2;
        layer2.StrokeStyle('orange');

        var BFCanvas = BlueFox.CreateBFMovableCanvas(800, 600);
        BFCanvas.AddLayer(layer2);
        BFCanvas.AddLayer(layer1);
        BFCanvas.AddLayer(layer3);

        for (var mapCellIdx = 0; mapCellIdx < mapList.length; ++mapCellIdx)
        {
            var mapCell = BlueFox.CreateBFRender(mapList[mapCellIdx]);
            layer1.AddRender(mapCell);
        }
        for (var buildingIdx = 0; buildingIdx < buildingList.length; ++ buildingIdx)
        {
            var building = BlueFox.CreateBFMovableRender(buildingList[buildingIdx]);
            building.ForceCheckConflict = true;
            building.Cast2Map(layer3);
            layer2.AddRender(building);
        }

        BlueFox.DebugSwitch = true;
        BlueFox.Run();

        //alert(building.CenterLocation.X + ',' + building.CenterLocation.Y);
        BFCanvas.SetCenterLocation(building.CenterLocation.X, building.CenterLocation.Y);
    }
    catch (ex)
    {
        alert(ex);
    }
}


