/**
 * Created with JetBrains WebStorm.
 * User: yangxu(Role:admin)
 * Date: 12-5-23
 * Time: 下午10:46
 * To change this template use File | Settings | File Templates.
 */
/**
 * ------Global variant declare area Begin------
 */
/**
 * 需要每帧刷新的对象列表
 * @type {BFRefreshListClass}
 */
var BFRefreshList = null;
/**
 * ------Global variant declare area End------
 */
/**
 * ------Javascript file onload callback Begin------
 */
/**
 * js文件加载执行回调
 */
(function () {
    BFRefreshList = new BFRefreshListClass();
}());
/**
 * ------Javascript file onload callback End------
 */
/**
 * 需要每帧刷新的对象列表
 * @constructor
 */
function BFRefreshListClass()
{
}