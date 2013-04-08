
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
        public event SessionEventHandler SessionEnded;
        public event SessionEventHandler SessionException;
        public event SessionEventHandler SessionStarted;
        public event MessageReceivedEventHandler MessageReceived;

        /// <summary>
        /// Session过期时间，秒
        /// </summary>
        public int SessionTimeOut
        {
            get;
            set;
        }

        /// <summary>
        /// 心跳间隔，毫秒
        /// </summary>
        public int HeartBeatInterval
        {
            get;
            set;
        }

        protected Socket Socket
        {
            get;
            private set;
        }

        public bool IsRunning
        {
            get;
            private set;
        }

        private Thread _thread;

        private Thread _monitorThread;

        private ClientSession _session;

        public ClientSocket()
        {
            this.HeartBeatInterval = 1000;
            this.SessionTimeOut = 10;
        }

        public void Connect(IPEndPoint rep)
        {
            this.Socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            this.Socket.Connect(rep);
            this._session = new ClientSession(this.Socket);
            this._session.SessionStarted += session_SessionStarted;
            this._session.SessionEnded += session_SessionEnded;
            this._session.SessionException += session_SessionException;
            this._session.MessageReceived += session_MessageReceived;
            this._session.StartSession();
        }

        private void session_SessionStarted(object sender, SessionEventArgs e)
        {
            this.OnSesstionStarted(e.Session);
        }

        private void session_MessageReceived(object sender, MessageEventArgs e)
        {
            this.OnMessageReceived(sender as ServerSession, e);
        }

        private void session_SessionEnded(object sender, SessionEventArgs e)
        {
            this.OnSessionEnded(e.Session.Handle);
        }

        private void session_SessionException(object sender, SessionEventArgs e)
        {
            this.OnSessionException(e.Session, e.SessionException);
        }

        protected virtual void OnMessageReceived(ServerSession session, MessageEventArgs e)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, e);
            }
        }

        protected virtual void OnSesstionStarted(ServerSession session)
        {
            lock (this._sessionList)
            {
                this._sessionList[session.Handle] = session;
            }

            if (this.SessionStarted != null)
            {
                this.SessionStarted(this, new SessionEventArgs(session));
            }
        }

        protected virtual void OnSessionEnded(int handle)
        {
            if (this._sessionList.ContainsKey(handle))
            {
                ServerSession session;
                lock (this._sessionList)
                {
                    session = this._sessionList[handle];
                    this._sessionList.Remove(handle);
                }

                if (this.SessionEnded != null)
                {
                    this.SessionEnded(this, new SessionEventArgs(session));
                }
            }
        }

        protected virtual void OnSessionException(ServerSession session, Exception ex)
        {
            if (this.SessionException != null)
            {
                this.SessionException(this, new SessionEventArgs(session, ex);
            }
        }






        public event EventHandler Connected;
        public event EventHandler Disconnected;





        public void Connect(IPEndPoint rep)
        {
            this.Socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            this.Socket.Connect(rep);
            this.OnConnected();

            this._thread = new Thread(new ThreadStart(this.Listen));
            this._thread.IsBackground = true;
            this._thread.Start();

            this._heartBeatThread = new Thread(new ThreadStart(this.StartHeartBeat));
            this._heartBeatThread.IsBackground = true;
            this._heartBeatThread.Start();

            this._monitorThread = new Thread(new ThreadStart(this.MonitorTimeout));
            this._monitorThread.IsBackground = true;
            this._monitorThread.Start();
        }

        public void Disconnect()
        {
            this.SendMessage(MessageHeader.MH_SERVERSTOP, "");
        }

        private void MonitorTimeout()
        {
            try
            {
                Thread.Sleep(10000);
                TimeSpan ts = DateTime.Now - this.LastActiveTime;
                if (ts.TotalSeconds > this.Timeout)
                { 
                    //TODO:
                }
            }
            catch (Exception ex)
            {
                //TODO
                throw new Exception("监控线程报错", ex);
            }
        }

        private void StartHeartBeat()
        {
            while (true)
            {
                this.SendMessage(MessageHeader.MH_HEARTBEAT, "");
                Thread.Sleep(this.HeartBeatInterval);
            }
        }

        private void Listen()
        {
            StateObject obj = new StateObject(this.Socket);
            try
            {
                while (this.IsConnected)
                {
                    int read = obj.Socket.Receive(obj.Buffer, 0, obj.Buffer.Length, SocketFlags.None);
                    this.LastActiveTime = DateTime.Now;
                    string msg = System.Text.Encoding.UTF8.GetString(obj.Buffer, 0, read);
                    ThreadPool.QueueUserWorkItem(new WaitCallback(this.HandleMessage), msg);
                }
            }
            catch (Exception ex)
            {
                //TODO
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
            catch (Exception ex)
            {
                this.OnDisconnected();
            }
            return result;
        }

        protected virtual void OnMessageReceived(string head, string body)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, new MessageEventArgs(head, body));
            }
        }

        protected virtual void OnConnected()
        {
            this.IsConnected = true;
        }

        protected virtual void OnDisconnected()
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
