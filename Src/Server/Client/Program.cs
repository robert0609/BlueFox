using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BlueFox.Net.TCP;
using System.Net;
using BlueFox.Net;

namespace Client
{
    class Program
    {
        static void Main(string[] args)
        {
            ClientSocket sck = new ClientSocket();
            sck.SessionStarted += new BlueFox.Net.SessionEventHandler(sck_SessionStarted);
            sck.SessionEnded += new BlueFox.Net.SessionEventHandler(sck_SessionEnded);
            sck.MessageReceived += new BlueFox.Net.MessageReceivedEventHandler(sck_MessageReceived);
            sck.SessionException += new SessionEventHandler(sck_SessionException);
            sck.Connect(new IPEndPoint(IPAddress.Parse("192.168.56.101"), 8888));
            sck.Send("HTDD", "send");
            Console.ReadKey();
        }

        static void sck_SessionException(object sender, SessionEventArgs e)
        {
            Console.WriteLine(string.Format("Socket异常：{0}", e.SessionException.Message));
        }

        static void sck_MessageReceived(object sender, BlueFox.Net.MessageEventArgs e)
        {
            Console.WriteLine(string.Format("收到消息：{0}", e.Body));
        }

        static void sck_SessionEnded(object sender, BlueFox.Net.SessionEventArgs e)
        {
            Console.WriteLine(string.Format("Session结束：{0}", e.Session.RemoteEndpoint));
        }

        static void sck_SessionStarted(object sender, BlueFox.Net.SessionEventArgs e)
        {
            Console.WriteLine(string.Format("Session启动：{0}", e.Session.RemoteEndpoint));
        }
    }
}
