using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common
{
    public class Matrix
    {
        public Number A
        {
            get;
            private set;
        }

        public Number B
        {
            get;
            private set;
        }

        public Number C
        {
            get;
            private set;
        }

        public Number D
        {
            get;
            private set;
        }

        public Number E
        {
            get;
            private set;
        }

        public Number F
        {
            get;
            private set;
        }

        public Matrix()
        {
            this.A = new Number(1d);
            this.B = new Number(0d);
            this.C = new Number(0d);
            this.D = new Number(1d);
            this.E = new Number(0d);
            this.F = new Number(0d);
        }

        public Matrix Multiply(Matrix n)
        {
            var m = this;
            var a = m.A * n.A + m.C * n.B;
            var b = m.B * n.A + m.D * n.B;
            var c = m.A * n.C + m.C * n.D;
            var d = m.B * n.C + m.D * n.D;
            var e = m.A * n.E + m.C * n.F + m.E;
            var f = m.B * n.E + m.D * n.F + m.F;
            this.A = a;
            this.B = b;
            this.C = c;
            this.D = d;
            this.E = e;
            this.F = f;
            return this;
        }
    }
}
