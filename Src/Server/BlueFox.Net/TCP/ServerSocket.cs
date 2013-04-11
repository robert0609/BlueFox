
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Net.Sockets;
using System.Threading;

namespace BlueFox.Net.TCP
{
    public class ServerSocket : IDisposable
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

        public IPEndPoint LocalEndPoint
        {
            get;
            private set;
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

        private Dictionary<int, AbstractSession> _sessionList = new Dictionary<int, AbstractSession>();

        private object _sync = new object();

        public ServerSocket(IPEndPoint lep)
        {
            this.LocalEndPoint = lep;
            this.SessionTimeOut = 10;
        }

        public void StartMonitor()
        {
            if (this._monitorThread == null)
            {
                this._monitorThread = new Thread(new ThreadStart(this.LoopTimeOut));
                this._monitorThread.IsBackground = true;
                this._monitorThread.Start();
            }
        }

        private void LoopTimeOut()
        {
            try
            {
                while (true)
                {
                    Thread.Sleep(10000);
                    List<AbstractSession> timeOutList = new List<AbstractSession>();
                    lock (this._sync)
                    {
                        foreach (var obj in this._sessionList)
                        {
                            TimeSpan ts = DateTime.Now - obj.Value.LastActiveTime;
                            if (ts.TotalSeconds > this.SessionTimeOut)
                            {
                                timeOutList.Add(obj.Value);
                            }
                        }
                    }
                    foreach (var session in timeOutList)
                    {
                        session.StopSession();
                    }
                }
            }
            catch (Exception ex)
            {
                //TODO:记录监控线程异常日志
                throw new Exception("监控线程报错", ex);
            }
        }

        public void Start()
        {
            if (this._thread == null)
            {
                this._thread = new Thread(new ThreadStart(this.Listen));
                this._thread.IsBackground = true;
                this._thread.Start();
            }
        }

        public void Stop()
        {
            try
            {
                lock (this._sync)
                {
                    foreach (var obj in this._sessionList.Values)
                    {
                        obj.SendMessage(MessageHeader.MH_BREAKOFF, string.Empty);
                    }
                }
            }
            catch (Exception ex)
            {
                //记录断开连接异常日志
                throw new Exception("服务端停止出现异常", ex);
            }
            this.Dispose();
        }

        private void Listen()
        {
            this.Socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            this.Socket.Bind(this.LocalEndPoint);
            this.Socket.Listen(100);
            this.IsRunning = true;
            try
            {
                while (this.IsRunning)
                {
                    var sck = this.Socket.Accept();
                    AbstractSession session = new ServerSession(sck);
                    session.SessionStarted += session_SessionStarted;
                    session.SessionEnded += session_SessionEnded;
                    session.SessionException += session_SessionException;
                    session.MessageReceived += session_MessageReceived;
                    session.StartSession();
                }
            }
            catch (Exception ex)
            {
                //TODO:记录服务端监听线程的异常日志
                throw new Exception("服务端Socket发生异常", ex);
            }
            finally
            {
                this.IsRunning = false;
                if (this.Socket.Connected)
                {
                    this.Socket.Shutdown(SocketShutdown.Both);
                }
                this.Socket.Close();
                this.Socket.Dispose();
                this.Socket = null;
            }
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
            this.OnSessionEnded(e.Session.Handle);
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
            lock (this._sync)
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
            lock (this._sync)
            {
                if (this._sessionList.ContainsKey(handle))
                {
                    AbstractSession session = this._sessionList[handle];
                    this._sessionList.Remove(handle);

                    if (this.SessionEnded != null)
                    {
                        this.SessionEnded(this, new SessionEventArgs(session));
                    }
                }
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
            if (this._thread != null)
            {
                this._thread.Abort();
                this._thread = null;
            }
            if (this.IsRunning)
            {
                this.IsRunning = false;
                if (this.Socket.Connected)
                {
                    this.Socket.Shutdown(SocketShutdown.Both);
                }
                this.Socket.Close();
                this.Socket.Dispose();
                this.Socket = null;
            }
            lock (this._sync)
            {
                foreach (var session in this._sessionList.Values)
                {
                    session.Dispose();
                }
                this._sessionList = new Dictionary<int, AbstractSession>();
            }
        }
    }
}
