
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

        protected override void OnMessageReceived(string header, string body)
        {
            switch (header.ToUpper())
            {
                case MessageHeader.MH_HEARTBEAT:
                    //TODO:回发一个心跳
                    return;
                case MessageHeader.MH_SERVERSTOP:
                    //TODO
                    return;
                default:
                    break;
            }
            base.OnMessageReceived(header, body);
        }
    }
}
