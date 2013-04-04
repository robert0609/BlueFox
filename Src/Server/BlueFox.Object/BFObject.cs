using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Object
{
    public class BFObject : IDisposable
    {
        public Guid UniqueID
        {
            get;
            private set;
        }

        public BFObject()
        {
            this.UniqueID = Guid.NewGuid();
        }

        public virtual void Dispose()
        {

        }
    }
}
