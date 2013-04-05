using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common.Interface
{
    public interface IRender
    {
        Location CLocation
        {
            get;
            set;
        }

        Size CSize
        {
            get;
            set;
        }

        Location SLocation
        {
            get;
            set;
        }

        Size SSize
        {
            get;
            set;
        }

        int ZOrder
        {
            get;
            set;
        }
    }
}
