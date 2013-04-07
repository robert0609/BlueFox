
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
    public class ClientSocket : IDisposable 
    {
        /// <summary>
        /// 套接字
        /// </summary>
        /// <remarks>创建人员(日期): 向丹峰(130311 16:13)</remarks>
        protected internal Socket Socket
        {
            get;
            private set;
        }

        /// <summary>
        /// 获取或设置断线后是否自动重连
        /// </summary>
        /// <remarks>创建人员(日期): 向丹峰(130311 16:13)</remarks>
        public bool AutoReconnect
        {
            get;
            set;
        }

        /// <summary>
        /// 获取或设置断线自动重连尝试次数
        /// </summary>
        /// <remarks>创建人员(日期): 向丹峰(130311 16:14)</remarks>
        public int RetryTimes
        {
            get;
            set;
        }

        /// <summary>
        /// 获取或设置断线自动重连延时（单位毫秒）
        /// </summary>
        /// <remarks>创建人员(日期): 向丹峰(130311 16:14)</remarks>
        public int RetryDelay
        {
            get;
            set;
        }

        /// <summary>
        /// 获取或设置心跳事件间隔（毫秒）
        /// </summary>
        /// <remarks>创建人员(日期): 向丹峰(130311 16:18)</remarks>
        public int HeartBeatInterval
        {
            get;
            set;
        }

        public bool IsConnected
        {
            get;
            private set;
        }

        public event EventHandler Connected;
        public event EventHandler Disconnected;
        public event MessageReceivedEventHandler MessageReceived;

        public ClientSocket()
        {
            this.Socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        }

        /// <summary>
        /// 连接到远程端口
        /// </summary>
        /// <remarks>处理流程:</remarks>
        /// <remarks>创建人员(日期):向丹峰(130311 16:18)</remarks>
        /// <param name="rep"></param>
        /// <returns></returns>
        public bool Connect(IPEndPoint rep)
        {
            this.Socket.Connect(rep);
            this.OnConnected();
            return true;
        }

        /// <summary>
        /// 启动心跳
        /// </summary>
        /// <remarks>处理流程:</remarks>
        /// <remarks>创建人员(日期):向丹峰(130311 16:18)</remarks>
        public void StartHeartBeat()
        {
        }

        public void Disconnect()
        {
            this.SendMessage(MessageHeader.MH_SERVERSTOP, "");
            this.OnDisconnected();
        }

        public void BeginReceiveMessage()
        {
            var obj = new StateObject(this.Socket);
            obj.Socket.BeginReceive(obj.Buffer, 0, obj.Buffer.Length, SocketFlags.None, new AsyncCallback(this.ReceiveCallback), obj);
        }

        private void ReceiveCallback(IAsyncResult ia)
        {
            StateObject obj = ia.AsyncState as StateObject;
            try
            {
                int read = obj.Socket.EndReceive(ia);
                string msg = System.Text.Encoding.UTF8.GetString(obj.Buffer, 0, read);
                ThreadPool.QueueUserWorkItem(new WaitCallback(this.HandleMessage), msg);
                obj.Socket.BeginReceive(obj.Buffer, 0, obj.Buffer.Length, SocketFlags.None, new AsyncCallback(this.ReceiveCallback), obj);
            }
            catch (Exception ex)
            {
            }
        }

        private void HandleMessage(object msgObj)
        {
            string msg = msgObj as string;
            if (msg.Length < MessageHeader.MH_HEADLENGTH)
            {
                return;
            }
            string header = msg.Substring(0, MessageHeader.MH_HEADLENGTH);
            this.OnMessageReceived(header, msg.Substring(MessageHeader.MH_HEADLENGTH + 1));
        }

        protected void Reconnect()
        {
            //多次重新连接失败以后，引发disconnected事件
        }

        public bool SendMessage(string head, string msg)
        {
            byte[] hbuf = System.Text.Encoding.UTF8.GetBytes(head);
            if (head.Length != MessageHeader.MH_HEADLENGTH)
            {
                throw new ArgumentException("head length is not correct");
            }
            bool result = false;
            byte[] buf = System.Text.Encoding.UTF8.GetBytes(string.Format("{0} {1}", head, msg));
            try
            {
                result = this.Socket.Send(buf) == buf.Length;
            }
            catch (SocketException ex)
            {
                this.Reconnect();
                result = false;
            }
            catch (ConnectFailledException cfe)
            {
                this.OnDisconnected();
            }
            return result;
        }

        protected void SendHeartBeatMessage()
        {
        }

        protected virtual void OnMessageReceived(string head, string body)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, new MessageEventArgs(head, body));
            }
        }

        protected void OnConnected()
        {
            this.IsConnected = true;
        }

        protected void OnDisconnected()
        {
            this.IsConnected = false;
            this.Socket.Close();
            this.Socket.Dispose();
        }

        public void Dispose()
        {
            this.IsConnected = false;
            if (this.Socket != null)
            {
                this.Socket.Dispose();
            }
        }
    }
}
