
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
    public class ServerSession
    {
        public event SessionEventHandler SessionEnded;
        public event SessionEventHandler SessionStarted;

        public event MessageReceivedEventHandler MessageReceived;

        public DateTime LastActiveTime
        {
            get;
            private set;
        }

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

        public ServerSocket Server
        {
            get;
            private set;
        }

        public ServerSession(Socket sck, ServerSocket server)
        {
            this.Socket = sck;
            this.Server = server;
            this.Handle = sck.Handle.ToInt32();
            this.RemoteEndpoint = sck.RemoteEndPoint.ToString();
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
                result = false;
            }
            catch (ConnectFailledException cfe)
            {
                result = false;
            }
            return result;
        }

        protected internal void StartSession()
        {
            StateObject obj = new StateObject(this.Socket);
            this.OnSessionStarted();
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
                this.OnSessionEnded();
            }
        }

        protected void OnSessionStarted()
        {
            if (this.SessionStarted != null)
            {
                this.SessionStarted(this, new SessionEventArgs(this));
            }
        }

        protected void OnSessionEnded()
        {
            if (this.SessionEnded != null)
            {
                this.SessionEnded(this, new SessionEventArgs(this));
            }
        }

        private void HandleMessage(object msgObj)
        {
            string msg = msgObj as string;
            if (msg.Length < MessageHeader.MH_HEADLENGTH)
            {
                return;
            }
            this.LastActiveTime = DateTime.Now;
            string header = msg.Substring(0, MessageHeader.MH_HEADLENGTH);
            switch (header.ToUpper())
            {
                case MessageHeader.MH_HEARTBEAT:
                    return;
                case MessageHeader.MH_SERVERSTOP:
                    this.Socket.Close();
                    return;
                default:
                    break;
            }
            this.OnMessageReceived(header, msg.Substring(MessageHeader.MH_HEADLENGTH + 1));
        }

        protected  void OnMessageReceived(string header, string body)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, new MessageEventArgs(header, body));
            }
        }
    }
}
