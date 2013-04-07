using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Mathematics
{
    public static class Computer
    {
        /// <summary>
        /// Returns the greatest common divisor (<c>gcd</c>) of two integers using Euclid's algorithm.
        /// </summary>
        /// <param name="a">First Integer: a.</param>
        /// <param name="b">Second Integer: b.</param>
        /// <returns>Greatest common divisor <c>gcd</c>(a,b)</returns>
        public static int GreatestCommonDivisor(int a, int b)
        {
            while (b != 0)
            {
                var remainder = a % b;
                a = b;
                b = remainder;
            }

            return Math.Abs(a);
        }

        /// <summary>
        /// Returns the greatest common divisor (<c>gcd</c>) of a set of integers using Euclid's
        /// algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Greatest common divisor <c>gcd</c>(list of integers)</returns>
        public static int GreatestCommonDivisor(IList<int> integers)
        {
            if (null == integers)
            {
                throw new ArgumentNullException("integers");
            }

            if (integers.Count == 0)
            {
                return 0;
            }

            var gcd = Math.Abs(integers[0]);

            for (var i = 1; (i < integers.Count) && (gcd > 1); i++)
            {
                gcd = GreatestCommonDivisor(gcd, integers[i]);
            }

            return gcd;
        }

        /// <summary>
        /// Returns the greatest common divisor (<c>gcd</c>) of a set of integers using Euclid's algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Greatest common divisor <c>gcd</c>(list of integers)</returns>
        public static int GreatestCommonDivisor(params int[] integers)
        {
            return GreatestCommonDivisor((IList<int>)integers);
        }

        /// <summary>
        /// Returns the least common multiple (<c>lcm</c>) of two integers using Euclid's algorithm.
        /// </summary>
        /// <param name="a">First Integer: a.</param>
        /// <param name="b">Second Integer: b.</param>
        /// <returns>Least common multiple <c>lcm</c>(a,b)</returns>
        public static int LeastCommonMultiple(int a, int b)
        {
            if ((a == 0) || (b == 0))
            {
                return 0;
            }

            return Math.Abs((a / GreatestCommonDivisor(a, b)) * b);
        }

        /// <summary>
        /// Returns the least common multiple (<c>lcm</c>) of a set of integers using Euclid's algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Least common multiple <c>lcm</c>(list of integers)</returns>
        public static int LeastCommonMultiple(IList<int> integers)
        {
            if (null == integers)
            {
                throw new ArgumentNullException("integers");
            }

            if (integers.Count == 0)
            {
                return 1;
            }

            var lcm = Math.Abs(integers[0]);

            for (var i = 1; i < integers.Count; i++)
            {
                lcm = LeastCommonMultiple(lcm, integers[i]);
            }

            return lcm;
        }

        /// <summary>
        /// Returns the least common multiple (<c>lcm</c>) of a set of integers using Euclid's algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Least common multiple <c>lcm</c>(list of integers)</returns>
        public static int LeastCommonMultiple(params int[] integers)
        {
            return LeastCommonMultiple((IList<int>)integers);
        }



        /// <summary>
        /// Returns the greatest common divisor (<c>gcd</c>) of two integers using Euclid's algorithm.
        /// </summary>
        /// <param name="a">First Integer: a.</param>
        /// <param name="b">Second Integer: b.</param>
        /// <returns>Greatest common divisor <c>gcd</c>(a,b)</returns>
        public static long GreatestCommonDivisor(long a, long b)
        {
            while (b != 0)
            {
                var remainder = a % b;
                a = b;
                b = remainder;
            }

            return Math.Abs(a);
        }

        /// <summary>
        /// Returns the greatest common divisor (<c>gcd</c>) of a set of integers using Euclid's
        /// algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Greatest common divisor <c>gcd</c>(list of integers)</returns>
        public static long GreatestCommonDivisor(IList<long> integers)
        {
            if (null == integers)
            {
                throw new ArgumentNullException("integers");
            }

            if (integers.Count == 0)
            {
                return 0;
            }

            var gcd = Math.Abs(integers[0]);

            for (var i = 1; (i < integers.Count) && (gcd > 1); i++)
            {
                gcd = GreatestCommonDivisor(gcd, integers[i]);
            }

            return gcd;
        }

        /// <summary>
        /// Returns the greatest common divisor (<c>gcd</c>) of a set of integers using Euclid's algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Greatest common divisor <c>gcd</c>(list of integers)</returns>
        public static long GreatestCommonDivisor(params long[] integers)
        {
            return GreatestCommonDivisor((IList<long>)integers);
        }

        /// <summary>
        /// Returns the least common multiple (<c>lcm</c>) of two integers using Euclid's algorithm.
        /// </summary>
        /// <param name="a">First Integer: a.</param>
        /// <param name="b">Second Integer: b.</param>
        /// <returns>Least common multiple <c>lcm</c>(a,b)</returns>
        public static long LeastCommonMultiple(long a, long b)
        {
            if ((a == 0) || (b == 0))
            {
                return 0;
            }

            return Math.Abs((a / GreatestCommonDivisor(a, b)) * b);
        }

        /// <summary>
        /// Returns the least common multiple (<c>lcm</c>) of a set of integers using Euclid's algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Least common multiple <c>lcm</c>(list of integers)</returns>
        public static long LeastCommonMultiple(IList<long> integers)
        {
            if (null == integers)
            {
                throw new ArgumentNullException("integers");
            }

            if (integers.Count == 0)
            {
                return 1;
            }

            var lcm = Math.Abs(integers[0]);

            for (var i = 1; i < integers.Count; i++)
            {
                lcm = LeastCommonMultiple(lcm, integers[i]);
            }

            return lcm;
        }

        /// <summary>
        /// Returns the least common multiple (<c>lcm</c>) of a set of integers using Euclid's algorithm.
        /// </summary>
        /// <param name="integers">List of Integers.</param>
        /// <returns>Least common multiple <c>lcm</c>(list of integers)</returns>
        public static long LeastCommonMultiple(params long[] integers)
        {
            return LeastCommonMultiple((IList<long>)integers);
        }
    }
}
