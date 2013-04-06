using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common
{
    public abstract class AbstractObject : IDisposable
    {
        public Guid UniqueID
        {
            get;
            private set;
        }

        public AbstractObject()
        {
            this.UniqueID = Guid.NewGuid();
        }

        public virtual void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}
