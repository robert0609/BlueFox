
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Threading;
using System.Net;
using System.Net.Sockets;

namespace BlueFox.Net.TCP
{
    public class ClientSession : AbstractSession
    {
        public ClientSession(Socket sck) : base(sck)
        {
        }

        protected override void OnMessageReceived(object arg)
        {
            var msg = arg as MessageEventArgs;
            switch (msg.Header)
            {
                case MessageHeader.MH_HEARTBEAT:
                    //忽略收到的服务回发的心跳
                    return;
                default:
                    break;
            }
            base.OnMessageReceived(arg);
        }
    }
}
