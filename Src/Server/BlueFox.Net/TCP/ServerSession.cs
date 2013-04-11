
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
                    this.SendMessage(MessageHeader.MH_HEARTBEAT, string.Empty);
                    return;
                default:
                    break;
            }
            base.OnMessageReceived(arg);
        }
    }
}
