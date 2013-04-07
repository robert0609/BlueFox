using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common
{
    public struct Number
    {
        private double _realValue;

        private double _value;

        public double Value
        {
            get
            {
                return this._value;
            }
        }

        public Number(double d)
        {
            this._realValue = d;
            this._value = Math.Round(this._realValue, 3, MidpointRounding.AwayFromZero);
        }

        public static Number operator +(Number d1, Number d2)
        {
            return new Number(d1._realValue + d2._realValue);
        }

        public static Number operator -(Number d1, Number d2)
        {
            return new Number(d1._realValue - d2._realValue);
        }

        public static Number operator *(Number d1, Number d2)
        {
            return new Number(d1._realValue * d2._realValue);
        }

        public static Number operator /(Number d1, Number d2)
        {
            return new Number(d1._realValue / d2._realValue);
        }

        public static bool operator ==(Number d1, Number d2)
        {
            return d1._value == d2._value;
        }

        public static bool operator !=(Number d1, Number d2)
        {
            return d1._value != d2._value;
        }

        public static bool operator >=(Number d1, Number d2)
        {
            return d1._value >= d2._value;
        }

        public static bool operator <=(Number d1, Number d2)
        {
            return d1._value <= d2._value;
        }

        public static bool operator >(Number d1, Number d2)
        {
            return d1._value > d2._value;
        }

        public static bool operator <(Number d1, Number d2)
        {
            return d1._value < d2._value;
        }
    }

    public static class Extension
    {
        public static Number ToNumber(this int n)
        {
            return new Number(n);
        }

        public static Number ToNumber(this long n)
        {
            return new Number(n);
        }

        public static Number ToNumber(this float n)
        {
            return new Number(n);
        }

        public static Number ToNumber(this double n)
        {
            return new Number(n);
        }
    }
}
