using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common
{
    public class Matrix
    {
        public double A
        {
            get;
            private set;
        }

        public double B
        {
            get;
            private set;
        }

        public double C
        {
            get;
            private set;
        }

        public double D
        {
            get;
            private set;
        }

        public double E
        {
            get;
            private set;
        }

        public double F
        {
            get;
            private set;
        }

        public Matrix()
        {
            this.A = 1;
            this.B = 0;
            this.C = 0;
            this.D = 1;
            this.E = 0;
            this.F = 0;
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
        }
    }
}
