using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net.Sockets;
using System.Threading;

namespace BlueFox.Net.TCP
{
    public abstract class AbstractSession : IDisposable
    {
        public event SessionEventHandler SessionEnded;
        public event SessionEventHandler SessionException;
        public event SessionEventHandler SessionStarted;
        public event MessageReceivedEventHandler MessageReceived;

        public DateTime LastActiveTime
        {
            get;
            private set;
        }

        public bool Actived
        {
            get;
            protected set;
        }

        public Socket Socket
        {
            get;
            protected set;
        }

        public int Handle
        {
            get;
            protected set;
        }

        public string RemoteEndpoint
        {
            get;
            protected set;
        }

        protected Thread _thread;

        public AbstractSession(Socket sck)
        {
            this.Actived = false;
            this.Socket = sck;
            this.Handle = sck.Handle.ToInt32();
            this.RemoteEndpoint = sck.RemoteEndPoint.ToString();
        }

        public void StartSession()
        {
            this._thread = new Thread(new ThreadStart(this.Start));
            this._thread.IsBackground = true;
            this._thread.Start();
        }

        public void StopSession()
        {
            this.Dispose();
            this.OnSessionEnded();
        }

        private void Start()
        {
            StateObject obj = new StateObject(this.Socket);
            this.Actived = true;
            this.OnSessionStarted();
            try
            {
                while (this.Actived)
                {
                    int read = obj.Socket.Receive(obj.Buffer, 0, obj.Buffer.Length, SocketFlags.None);
                    this.LastActiveTime = DateTime.Now;
                    string msg = System.Text.Encoding.UTF8.GetString(obj.Buffer, 0, read);
                    this.HandleMessage(msg);
                }
            }
            catch (Exception ex)
            {
                this.OnSessionException(ex);
            }
            finally
            {
                this.Actived = false;
                if (this.Socket.Connected)
                {
                    this.Socket.Shutdown(SocketShutdown.Both);
                }
                this.Socket.Close();
                this.Socket.Dispose();
                this.Socket = null;
                this.OnSessionEnded();
            }
        }

        private void HandleMessage(string msg)
        {
            if (msg.Length < MessageHeader.MH_HEADLENGTH)
            {
                return;
            }
            var header = msg.Substring(0, MessageHeader.MH_HEADLENGTH).ToUpper();
            var body = msg.Substring(MessageHeader.MH_HEADLENGTH);
            switch (header)
            {
                case MessageHeader.MH_BREAKOFF:
                    this.Actived = false;
                    return;
                default:
                    ThreadPool.QueueUserWorkItem(new WaitCallback(this.OnMessageReceived), new MessageEventArgs(header, body));
                    break;
            }
        }

        protected virtual void OnSessionStarted()
        {
            if (this.SessionStarted != null)
            {
                this.SessionStarted(this, new SessionEventArgs(this));
            }
        }

        protected virtual void OnSessionEnded()
        {
            if (this.SessionEnded != null)
            {
                this.SessionEnded(this, new SessionEventArgs(this));
            }
        }

        protected virtual void OnSessionException(Exception ex)
        {
            if (this.SessionException != null)
            {
                this.SessionException(this, new SessionEventArgs(this, ex));
            }
        }

        protected virtual void OnMessageReceived(object arg)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, arg as MessageEventArgs);
            }
        }

        public void SendMessage(string head, string msg)
        {
            if (!this.Actived)
            {
                return;
            }
            byte[] hbuf = System.Text.Encoding.UTF8.GetBytes(head);
            if (head.Length != MessageHeader.MH_HEADLENGTH)
            {
                throw new ArgumentException("head length is not correct");
            }
            byte[] buf = System.Text.Encoding.UTF8.GetBytes(string.Format("{0}{1}", head, msg));
            try
            {
                var result = this.Socket.Send(buf) == buf.Length;
                if (!result)
                {
                    throw new Exception("发送数据不完整");
                }
            }
            catch (SocketException ex)
            {
                throw ex;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public virtual void Dispose()
        {
            if (this.Actived)
            {
                this._thread.Abort();
                this._thread = null;
                this.Actived = false;
                if (this.Socket.Connected)
                {
                    this.Socket.Shutdown(SocketShutdown.Both);
                }
                this.Socket.Close();
                this.Socket.Dispose();
                this.Socket = null;
            }
        }
    }
}
