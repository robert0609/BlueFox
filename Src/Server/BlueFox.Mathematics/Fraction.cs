using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Mathematics
{
    public struct Fraction
    {
        public long Numerator
        {
            get;
            private set;
        }

        public long Denominator
        {
            get;
            private set;
        }

        public int Mark
        {
            get;
            private set;
        }

        private bool _isLong = false;
        private long _realValue = 0;

        public Fraction(long n)
            : this(n, 1)
        {

        }

        public Fraction(long numerator, long denominator)
        {
            if (denominator == 0)
            {
                throw new DivideByZeroException("分母不能是0");
            }
            if (numerator == 0)
            {
                this.Numerator = 0;
                this.Denominator = 1;
                this.Mark = 1;
            }
            else
            {
                if ((numerator > 0 && denominator > 0) ||
                    (numerator < 0 && denominator < 0))
                {
                    this.Mark = 1;
                }
                else
                {
                    this.Mark = -1;
                }
                var num = Math.Abs(numerator);
                var den = Math.Abs(denominator);
                var d = Computer.GreatestCommonDivisor(num, den);
                this.Numerator = num / d;
                this.Denominator = den / d;
            }

            if (this.Denominator == 1)
            {
                this._realValue = this.Mark * this.Numerator;
                this._isLong = true;
            }
        }

        public Fraction Reverse()
        {
            if (this.Numerator == 0)
            {
                throw new ArithmeticException("0没有倒数");
            }
            return new Fraction(this.Denominator, this.Numerator);
        }

        public bool TryParse(out long o)
        {
            o = 0;
            if (this._isLong)
            {
                o = this._realValue;
            }
            return this._isLong;
        }

        public static Fraction operator +(Fraction d1, Fraction d2)
        {
            long o1, o2;
            if (d1.TryParse(out o1) && d2.TryParse(out o2))
            {
                return new Fraction(o1 + o2);
            }
            else
            {
                var m = Computer.LeastCommonMultiple(d1.Denominator, d2.Denominator);
                return new Fraction(d1.Numerator * m / d1.Denominator + d2.Numerator * m / d2.Denominator, m);
            }
        }

        public static Fraction operator -(Fraction d1, Fraction d2)
        {
            long o1, o2;
            if (d1.TryParse(out o1) && d2.TryParse(out o2))
            {
                return new Fraction(o1 - o2);
            }
            else
            {
                var m = Computer.LeastCommonMultiple(d1.Denominator, d2.Denominator);
                return new Fraction(d1.Numerator * m / d1.Denominator - d2.Numerator * m / d2.Denominator, m);
            }
        }

        public static Fraction operator *(Fraction d1, Fraction d2)
        {
            long o1, o2;
            if (d1.TryParse(out o1) && d2.TryParse(out o2))
            {
                return new Fraction(o1 * o2);
            }
            else
            {
                return new Fraction(d1.Numerator * d2.Numerator, d1.Denominator * d2.Denominator);
            }
        }

        public static Fraction operator /(Fraction d1, Fraction d2)
        {
            return d1 * d2.Reverse();
        }

        public static bool operator ==(Fraction d1, Fraction d2)
        {
            long o1, o2;
            if (d1.TryParse(out o1) && d2.TryParse(out o2))
            {
                return o1 == o2;
            }
            else
            {
                return (d1.Numerator == d2.Numerator) && (d1.Denominator == d2.Denominator) && (d1.Mark == d2.Mark);
            }
        }

        public static bool operator !=(Fraction d1, Fraction d2)
        {
            return !(d1 == d2);
        }

        public static bool operator >=(Fraction d1, Fraction d2)
        {
            return (d1 == d2) || (d1 > d2);
        }

        public static bool operator <=(Fraction d1, Fraction d2)
        {
            return !(d1 > d2);
        }

        public static bool operator >(Fraction d1, Fraction d2)
        {
            var ret = false;
            long o1, o2;
            if (d1.TryParse(out o1) && d2.TryParse(out o2))
            {
                if (o1 > o2)
                {
                    ret = true;
                }
            }
            else
            {
                if (d1.Mark == d2.Mark)
                {
                    var m = Computer.LeastCommonMultiple(d1.Denominator, d2.Denominator);
                    if (d1.Mark * d1.Numerator * m / d1.Denominator - d2.Mark * d2.Numerator * m / d2.Denominator > 0)
                    {
                        ret = true;
                    }
                }
                else
                {
                    if (d1.Mark > 0)
                    {
                        ret = true;
                    }
                }
            }
            return ret;
        }

        public static bool operator <(Fraction d1, Fraction d2)
        {
            return !(d1 >= d2);
        }
    }
}
