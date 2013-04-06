using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common.Interface
{
    public interface IFoundation
    {
        Location Center
        {
            get;
            set;
        }

        FoundationKind Kind
        {
            get;
            set;
        }

        int Radius
        {
            get;
            set;
        }

        IList<Location> RectPoints
        {
            get;
            set;
        }

        int Width
        {
            get;
        }

        int Height
        {
            get;
        }

        int KW
        {
            get;
        }

        int KH
        {
            get;
        }

        bool CheckConflict(IFoundation foundation);

        void Cast2Map(AbstractLayer layer);
    }

    public enum FoundationKind
    {
        Circle,
        Rectangle
    }
}
