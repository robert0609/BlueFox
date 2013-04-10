
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Threading;
using System.Net;
using System.Net.Sockets;

namespace BOC.COS.Network
{
    public class ServerSession : AbstractSession
    {
        public ServerSession(Socket sck) : base(sck)
        {
        }

        protected override void OnMessageReceived(object arg)
        {
            var msg = arg as MessageEventArgs;
            switch (msg.Header)
            {
                case MessageHeader.MH_HEARTBEAT:
                    //TODO:回发一个心跳
                    return;
                default:
                    break;
            }
            base.OnMessageReceived(arg);
        }
    }
}
