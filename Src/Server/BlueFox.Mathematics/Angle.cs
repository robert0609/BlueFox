using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Mathematics
{
    public struct Angle
    {
        public static readonly Angle UNIT = new Angle(new Fraction(1, 180));

        public Fraction TimesOfPi
        {
            get;
            private set;
        }

        public double DoubleValue
        {
            get;
            private set;
        }

        public Angle(long degree)
        {
            this.TimesOfPi = degree.ToFraction() * UNIT.TimesOfPi;
            this.DoubleValue = this.TimesOfPi.Numerator * Math.PI / this.TimesOfPi.Denominator;
        }

        public Angle(Fraction timesOfPi)
        {
            this.TimesOfPi = timesOfPi;
            this.DoubleValue = this.TimesOfPi.Numerator * Math.PI / this.TimesOfPi.Denominator;
        }

        public string ToString()
        {
            return string.Format("{0}∏/{1}", this.TimesOfPi.Numerator.ToString(), this.TimesOfPi.Denominator.ToString());
        }
    }
}
