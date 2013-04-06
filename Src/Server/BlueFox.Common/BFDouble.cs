using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common
{
    public struct BFDouble
    {
        private double _realValue;

        private double _value;

        private double RealValue
        {
            get
            {
                return this._realValue;
            }
            set
            {
                this._realValue = value;
                this._value = Math.Round(this._realValue, 3, MidpointRounding.AwayFromZero);
            }
        }

        public double Value
        {
            get
            {
                return this._value;
            }
        }

        public BFDouble(double d)
        {
            this._realValue = d;
            this._value = Math.Round(this._realValue, 3, MidpointRounding.AwayFromZero);
        }

        public static BFDouble operator +(BFDouble d1, BFDouble d2)
        {
            return new BFDouble(d1.RealValue + d2.RealValue);
        }
    }
}
