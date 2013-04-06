using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common.Interface
{
    public interface IMovable
    {
        Location Target
        {
            get;
            set;
        }

        Direction direction
        {
            get;
            set;
        }

        int Speed
        {
            get;
            set;
        }

        Location Last
        {
            get;
            set;
        }
    }
}
