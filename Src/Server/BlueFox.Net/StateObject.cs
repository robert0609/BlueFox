/*
 * 作业系统服务器通讯状态类
 * 向丹峰 2013.3.7
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.IO;
using System.Net;
using System.Net.Sockets;

namespace BOC.COS.Network
{
    public class StateObject
    {
        public const int StateObjectBufferLength = 1024;

        public Socket Socket
        {
            get;
            private set;
        }

        public int Handle
        {
            get;
            private set;
        }

        public string RemoteEndpoint
        {
            get;
            private set;
        }

        public byte[] Buffer
        {
            get;
            set;
        }

        public StateObject(Socket sck)
        {
            this.Socket = sck;
            this.Handle = sck.Handle.ToInt32();
            this.RemoteEndpoint = sck.RemoteEndPoint.ToString();
            this.Buffer = new byte[StateObjectBufferLength];
        }
    }
}
