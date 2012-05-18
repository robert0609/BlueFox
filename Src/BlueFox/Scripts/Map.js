/**
 * Created with JetBrains WebStorm.
 * User: yangxu
 * Date: 12-5-5
 * Time: 下午2:13
 * To change this template use File | Settings | File Templates.
 */
$(
    function ()
    {
        try
        {
            var testRender = new BFRenderClass('./Resource/Img/loading.png');
            testRender.CLocation.X = 0;
            testRender.CLocation.Y = 0;
            testRender.AppendTo(document.body);

            var app = new BFApplicationClass();
            app.Render = testRender;
            app.Run();
        }
        catch (ex)
        {
            alert(ex);
        }
    }
);