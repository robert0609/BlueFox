
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

        public bool IsConnected
        {
            get;
            private set;
        }

        private Thread _heartBeatThread;

        private Thread _monitorThread;

        private AbstractSession _session;

        public ClientSocket()
        {
            this.HeartBeatInterval = 1000;
            this.SessionTimeOut = 10;
        }

        private void LoopTimeOut()
        {
            try
            {
                while (true)
                {
                    Thread.Sleep(10000);
                    TimeSpan ts = DateTime.Now - this._session.LastActiveTime;
                    if (ts.TotalSeconds > this.SessionTimeOut)
                    {
                        this._session.StopSession();
                    }
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
                this._session.SendMessage(MessageHeader.MH_HEARTBEAT, "");
                Thread.Sleep(this.HeartBeatInterval);
            }
        }

        public void Connect(IPEndPoint rep)
        {
            var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            socket.Connect(rep);
            var session = new ClientSession(socket);
            this._session = session;
            this.IsConnected = true;
            session.SessionStarted += session_SessionStarted;
            session.SessionEnded += session_SessionEnded;
            session.SessionException += session_SessionException;
            session.MessageReceived += session_MessageReceived;
            session.StartSession();

            this._heartBeatThread = new Thread(new ThreadStart(this.StartHeartBeat));
            this._heartBeatThread.IsBackground = true;

            this._monitorThread = new Thread(new ThreadStart(this.LoopTimeOut));
            this._monitorThread.IsBackground = true;

            this._heartBeatThread.Start();
            this._monitorThread.Start();
        }

        public void Disconnect()
        {
            this.Dispose();
        }

        private void session_SessionStarted(object sender, SessionEventArgs e)
        {
            this.OnSesstionStarted(e.Session);
        }

        private void session_MessageReceived(object sender, MessageEventArgs e)
        {
            this.OnMessageReceived(sender as AbstractSession, e);
        }

        private void session_SessionEnded(object sender, SessionEventArgs e)
        {
            this.OnSessionEnded(e.Session);
        }

        private void session_SessionException(object sender, SessionEventArgs e)
        {
            this.OnSessionException(e.Session, e.SessionException);
        }

        protected virtual void OnMessageReceived(AbstractSession session, MessageEventArgs e)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(this, e);
            }
        }

        protected virtual void OnSesstionStarted(AbstractSession session)
        {
            if (this.SessionStarted != null)
            {
                this.SessionStarted(this, new SessionEventArgs(session));
            }
        }

        protected virtual void OnSessionEnded(AbstractSession session)
        {
            this._session = null;
            this.IsConnected = false;
            if (this.SessionEnded != null)
            {
                this.SessionEnded(this, new SessionEventArgs(session));
            }
        }

        protected virtual void OnSessionException(AbstractSession session, Exception ex)
        {
            if (this.SessionException != null)
            {
                this.SessionException(this, new SessionEventArgs(session, ex));
            }
        }

        public void Dispose()
        {
            if (this._monitorThread != null)
            {
                this._monitorThread.Abort();
                this._monitorThread = null;
            }
            if (this._heartBeatThread != null)
            {
                this._heartBeatThread.Abort();
                this._heartBeatThread = null;
            }
            if (this.IsConnected)
            {
                //TODO
                this._session.SendMessage(MessageHeader.MH_SERVERSTOP, "");
                this._session.StopSession();
            }
        }
    }
}
