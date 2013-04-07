using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BOC.COS.Network
{
    public static class MessageHeader
    {
        public const int MH_HEADLENGTH = 4;

        public const string MH_HEARTBEAT = "HRTB";

        public const string MH_CLIENTONLINE = "CLTN";

        public const string MH_CLIENTOFFLINE = "CLTF";

        public const string MH_GETONLINELIST = "GTOL";

        public const string MH_SERVERSTOP = "SVSP";

        public const string MH_NOTIFYCLIENT = "NTFC";

        public const string MH_TASK = "TASK";
    }
}
