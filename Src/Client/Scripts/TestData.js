/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-23
 * Time: 上午11:12
 * To change this template use File | Settings | File Templates.
 */
function GetResourceList()
{
    var str = '[{"ResourceId":"1","ImageFilePath":"./Resource/Img/o.png"},{"ResourceId":"2","ImageFilePath":"./Resource/Img/o.png"}]';
    return JSON.parse(str);
}

function GetMapList()
{
    return JSON.parse(str);
}

function GetBuildingList()
{
    var str = '[{"CX":400,"CY":100,"CWidth":96,"CHeight":128,"SX":0,"SY":0,"SWidth":96,"SHeight":128,"ResourceId":"2","Foundation":{"Flag":"circle","Radius":48,"RectPoints":null},"ZOrder":228},{"CX":300,"CY":256,"CWidth":96,"CHeight":128,"SX":0,"SY":0,"SWidth":96,"SHeight":128,"ResourceId":"2","Foundation":{"Flag":"rectangle","Radius":0,"RectPoints":[[{"X":-48,"Y":-20},{"X":48,"Y":-20}],[{"X":-48,"Y":20},{"X":48,"Y":20}]]},"ZOrder":384},{"CX":500,"CY":500,"CWidth":96,"CHeight":128,"SX":0,"SY":0,"SWidth":96,"SHeight":128,"ResourceId":"2","Foundation":{"Flag":"circle","Radius":48,"RectPoints":null},"ZOrder":628},{"CX":100,"CY":458,"CWidth":96,"CHeight":128,"SX":0,"SY":0,"SWidth":96,"SHeight":128,"ResourceId":"2","Foundation":{"Flag":"rectangle","Radius":0,"RectPoints":[[{"X":-48,"Y":-20},{"X":48,"Y":-20}],[{"X":-48,"Y":20},{"X":48,"Y":20}]]},"ZOrder":586}]';
    return JSON.parse(str);
}