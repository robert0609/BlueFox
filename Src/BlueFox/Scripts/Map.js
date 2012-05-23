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
            var app = new BFApplicationClass();
            app.Run();
        }
        catch (ex)
        {
            alert(ex);
        }
    }
);