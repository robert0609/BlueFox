/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 13-2-17
 * Time: 下午3:01
 * To change this template use File | Settings | File Templates.
 */
function AddEventHandler(element, evtName, callback, useCapture)
{
    //DOM标准
    if (element.addEventListener)
    {
        element.addEventListener(evtName, callback, useCapture);
    }
    else
    {
        //IE方式,忽略useCapture参数
        element.attachEvent('on' + evtName, callback);
    }
}

function RemoveEventHandler(element, evtName, callback, useCapture)
{
    //DOM标准
    if (element.removeEventListener)
    {
        element.removeEventListener(evtName, callback, useCapture);
    }
    else
    {
        //IE方式,忽略useCapture参数
        element.dettachEvent('on' + evtName, callback);
    }
}

function CancelEventFlow(event)
{
    event = event || window.event;
    if(event.stopPropagation)
    {
        event.stopPropagation();
    }
    else
    {
        event.cancelBubble = true;
    }
}

function CancelDefault(event)
{
    event = event || window.event;
    if (event.preventDefault)
    {
        event.preventDefault();
    }
    else
    {
        event,returnValue = false;
    }
}

function NewGUID()
{
    var guid = '';
    for (var i = 1; i <= 32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid +=   n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }
    return guid;
}

