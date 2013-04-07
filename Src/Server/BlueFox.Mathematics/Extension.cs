using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Mathematics
{
    public static class Extension
    {
        public static Fraction ToFraction(this int n)
        {
            return new Fraction(n, 1);
        }

        public static Fraction ToFraction(this long n)
        {
            return new Fraction(n, 1);
        }
    }
}
