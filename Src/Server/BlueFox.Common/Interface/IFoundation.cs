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

        Number Radius
        {
            get;
            set;
        }

        IList<Location> RectPoints
        {
            get;
            set;
        }

        Number Width
        {
            get;
        }

        Number Height
        {
            get;
        }

        Number KW
        {
            get;
        }

        Number KH
        {
            get;
        }

        bool CheckConflict(IFoundation foundation);

        void Cast2Layer(AbstractLayer layer);
    }

    public enum FoundationKind
    {
        Circle,
        Rectangle
    }
}
