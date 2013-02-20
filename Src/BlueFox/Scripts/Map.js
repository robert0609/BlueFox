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
            self.BFResourceContainer.SetImage(res.ResourceId, res.ImageFilePath);
        }

        var mapList = GetMapList();
        var buildingList = GetBuildingList();



        BlueFox.Run();
    }
    catch (ex)
    {
        alert(ex);
    }
}


