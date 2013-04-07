
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Net.Sockets;
using System.Threading;

namespace BOC.COS.Network
{
    public class ServerSocket
    {
        public event SessionEventHandler SessionEnded;
        public event SessionEventHandler SessionStarted;

        public event MessageReceivedEventHandler MessageReceived;

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

        private ManualResetEvent blocker = new ManualResetEvent(false);

        private Thread thread;

        private Dictionary<int, ServerSession> sessionList = new Dictionary<int, ServerSession>();

        public ServerSocket(IPEndPoint lep)
        {
            this.LocalEndPoint = lep;
        }

        private void LoopTimeOut(object state)
        {
            while (true)
            {
                System.Threading.Thread.Sleep(1000);
                List<int> timeOutList = new List<int>();
                lock (this.sessionList)
                {
                    foreach (KeyValuePair<int, ServerSession> obj in this.sessionList)
                    {
                        TimeSpan ts = DateTime.Now - obj.Value.LastActiveTime;
                        if (ts.TotalSeconds > this.SessionTimeOut)
                        {
                            timeOutList.Add(obj.Key);
                        }
                    }
                }
                foreach (int sessionID in timeOutList)
                {
                    this.OnSessionEnded(sessionID);
                }
            }
        }

        public void Start()
        {
            try
            {
                this.Socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                this.Socket.Bind(this.LocalEndPoint);
                this.IsRunning = true;
                this.thread = new Thread(new ThreadStart(this.Listen));
                this.thread.IsBackground = true;
                this.thread.Start();
            }
            catch (Exception ex)
            {
                this.IsRunning = false;
                throw new Exception("启动服务器发生异常", ex);
            }
        }

        public void Stop()
        {
            this.IsRunning = false;
            this.thread.Abort();
            if (this.Socket.Connected)
            {
                this.Socket.Shutdown(SocketShutdown.Both);
            }
            this.Socket.Close();
        }

        private void Listen()
        {
            this.Socket.Listen(100);
            while (this.IsRunning)
            {
                this.blocker.Reset();
                this.Socket.BeginAccept(new AsyncCallback(this.AcceptCallback), this.Socket);
                this.blocker.WaitOne();
            }
        }

        private void AcceptCallback(IAsyncResult ia)
        {
            try
            {
                Socket sck = this.Socket.EndAccept(ia);
                ServerSession session = new ServerSession(sck, this);
                session.SessionStarted += session_SessionStarted;
                session.StartSession();
            }
            catch (Exception ex)
            {
                //Console.WriteLine(ex.Message);
            }
            finally
            {
                this.blocker.Set();
            }
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

        protected virtual void OnMessageReceived(ServerSession session, MessageEventArgs e)
        {
            if (this.MessageReceived != null)
            {
                this.MessageReceived(session, e);
            }
        }

        protected virtual void OnSesstionStarted(ServerSession session)
        {
            lock (this.sessionList)
            {
                this.sessionList.Add(session.Handle, session);
            }
            session.SessionEnded += session_SessionEnded;
            //session.SessionStarted += session_SessionStarted;
            session.MessageReceived += session_MessageReceived;

            if (this.SessionStarted != null)
            {
                this.SessionStarted(session, new SessionEventArgs(session));
            }
        }

        protected virtual void OnSessionEnded(int handle)
        {
            ServerSession session;

            lock (this.sessionList)
            {
                if (!this.sessionList.ContainsKey(handle))
                {
                    return;
                }
                session = this.sessionList[handle];
                this.sessionList.Remove(handle);
            }
            if (this.SessionEnded != null)
            {
                try
                {
                    this.SessionEnded(this, new SessionEventArgs(session));
                }
                catch
                {
                }
            }
        }
    }
}
