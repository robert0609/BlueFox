using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOC.COS.Network
{
    public class SessionEventArgs: EventArgs 
    {
        public ServerSession Session
        {
            get;
            private set;
        }

        public SessionEventArgs(ServerSession session)
            : base()
	    {
            this.Session = session;
	    }
    }

    public delegate void SessionEventHandler(object sender ,SessionEventArgs e);

    public class MessageEventArgs : EventArgs
    {
        public string Header
        {
            get;
            private set;
        }
        public string Body
        {
            get;
            private set;
        }
        public MessageEventArgs(string header,string body)
        {
            this.Header = header;
            this.Body = body;
        }
    }

    public delegate void MessageReceivedEventHandler(object sender, MessageEventArgs e);
}
