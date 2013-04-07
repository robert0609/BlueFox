using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BlueFox.Common.Interface
{
    public interface ITransform
    {
        /// <summary>
        /// 坐标缩放
        /// </summary>
        /// <param name="sx"></param>
        /// <param name="sy"></param>
        void Scale(Number sx, Number sy);

        /// <summary>
        /// 坐标旋转(顺时针)
        /// </summary>
        /// <param name="angle"></param>
        void Rotate(Number angle);

        /// <summary>
        /// 坐标平移
        /// </summary>
        /// <param name="ix"></param>
        /// <param name="iy"></param>
        void Translate(Number ix, Number iy);

        /// <summary>
        /// 变换矩阵生效化
        /// </summary>
        void Transform();

        Location Matrix2Screen(Location point);

        Location Screen2Matrix(Location point);
    }
}
