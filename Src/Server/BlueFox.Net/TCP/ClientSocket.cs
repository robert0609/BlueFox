﻿
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

        private Thread _heartBeatThread;

        private Thread _monitorThread;

        private AbstractSession _session;

        private object _sync = new object();

        private ManualResetEvent _manualEvent = new ManualResetEvent(true);

        public ClientSocket()
        {
            this.HeartBeatInterval = 1000;
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
                    AbstractSession session = null;
                    lock (this._sync)
                    {
                        if (this._session != null)
                        {
                            TimeSpan ts = DateTime.Now - this._session.LastActiveTime;
                            if (ts.TotalSeconds > this.SessionTimeOut)
                            {
                                session = this._session;
                            }
                        }
                    }
                    if (session != null)
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

        public void StartHeartBeat()
        {
            if (this._heartBeatThread == null)
            {
                this._heartBeatThread = new Thread(new ThreadStart(this.LoopHeartBeat));
                this._heartBeatThread.IsBackground = true;
                this._heartBeatThread.Start();
            }
        }

        private void LoopHeartBeat()
        {
            try
            {
                while (true)
                {
                    lock (this._sync)
                    {
                        if (this._session != null)
                        {
                            this._session.SendMessage(MessageHeader.MH_HEARTBEAT, string.Empty);
                        }
                    }
                    Thread.Sleep(this.HeartBeatInterval);
                }
            }
            catch (Exception ex)
            {
                //TODO:记录心跳线程异常日志
                throw new Exception("客户端心跳线程报错", ex);
            }
        }

        public void Connect(IPEndPoint rep)
        {
            if (this._session != null)
            {
                return;
            }
            try
            {
                this._manualEvent.Reset();
                var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                socket.Connect(rep);
                var session = new ClientSession(socket);
                session.SessionStarted += session_SessionStarted;
                session.SessionEnded += session_SessionEnded;
                session.SessionException += session_SessionException;
                session.MessageReceived += session_MessageReceived;
                session.StartSession();
                this._manualEvent.WaitOne();
            }
            catch (Exception ex)
            {
                throw new Exception("Connect出现异常", ex);
            }
        }

        public void Disconnect()
        {
            try
            {
                lock (this._sync)
                {
                    if (this._session != null)
                    {
                        this._session.SendMessage(MessageHeader.MH_BREAKOFF, string.Empty);
                    }
                }
            }
            catch (Exception ex)
            {
                //记录断开连接异常日志
                throw new Exception("客户端断开连接出现异常", ex);
            }
            finally
            {
                this.Dispose();
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
            lock (this._sync)
            {
                this._session = session;
                this._manualEvent.Set();
            }
            if (this.SessionStarted != null)
            {
                this.SessionStarted(this, new SessionEventArgs(session));
            }
        }

        protected virtual void OnSessionEnded(AbstractSession session)
        {
            lock (this._sync)
            {
                this._session = null;
            }
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
            lock (this._sync)
            {
                if (this._session != null)
                {
                    this._session.Dispose();
                    this._session = null;
                }
            }
        }
    }
}
