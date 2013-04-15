using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using System.IO;

namespace BlueFox.Security
{
    public sealed class Certificates
    {
        private const string PUBLIC_KEY_FILE_NAME = "PublicKey.ck";
        private const string PRIVATE_KEY_FILE_NAME = "PrivateKey.ck";

        private const string CERT_D = "D:{0}";
        private const string CERT_DP = "DP:{0}";
        private const string CERT_DQ = "DQ:{0}";
        private const string CERT_Exponent = "Exponent:{0}";
        private const string CERT_InverseQ = "InverseQ:{0}";
        private const string CERT_Modulus = "Modulus:{0}";
        private const string CERT_P = "P:{0}";
        private const string CERT_Q = "Q:{0}";

        private const char DIVIDOR = ' ';

        private RSACryptoServiceProvider _rsa;

        public Certificates()
        {
            this._rsa = new RSACryptoServiceProvider();
        }

        public string Export(string outPath, bool expPrivate)
        {
            var expParam = this._rsa.ExportParameters(expPrivate);
            var fileName = outPath;
            if (expPrivate)
            {
                fileName += PRIVATE_KEY_FILE_NAME;
            }
            else
            {
                fileName += PUBLIC_KEY_FILE_NAME;
            }
            using (StreamWriter sw = new StreamWriter(fileName, false, Encoding.UTF8))
            {
                sw.WriteLine(CERT_D, this.ByteList2String(expParam.D));
                sw.WriteLine(CERT_DP, this.ByteList2String(expParam.DP));
                sw.WriteLine(CERT_DQ, this.ByteList2String(expParam.DQ));
                sw.WriteLine(CERT_Exponent, this.ByteList2String(expParam.Exponent));
                sw.WriteLine(CERT_InverseQ, this.ByteList2String(expParam.InverseQ));
                sw.WriteLine(CERT_Modulus, this.ByteList2String(expParam.Modulus));
                sw.WriteLine(CERT_P, this.ByteList2String(expParam.P));
                sw.WriteLine(CERT_Q, this.ByteList2String(expParam.Q));
                sw.Flush();
                sw.Close();
            }
            return fileName;
        }

        public void Import(string fileName)
        {
            RSAParameters impParam = new RSAParameters();
            if (!File.Exists(fileName))
            {
                throw new FileNotFoundException(string.Format("{0} is not found.", fileName));
            }
            using (StreamReader sr = new StreamReader(fileName, Encoding.UTF8))
            {
                while (!sr.EndOfStream)
                {
                    var lst = sr.ReadLine().Split(':');
                    var bytes = this.String2ByteList(lst[1]);
                    switch (lst[0])
                    {
                        case "D":
                            impParam.D = bytes;
                            break;
                        case "DP":
                            impParam.DP = bytes;
                            break;
                        case "DQ":
                            impParam.DQ = bytes;
                            break;
                        case "Exponent":
                            impParam.Exponent = bytes;
                            break;
                        case "InverseQ":
                            impParam.InverseQ = bytes;
                            break;
                        case "Modulus":
                            impParam.Modulus = bytes;
                            break;
                        case "P":
                            impParam.P = bytes;
                            break;
                        case "Q":
                            impParam.Q = bytes;
                            break;
                        default:
                            break;
                    }
                }
                sr.Close();
            }
            this._rsa.ImportParameters(impParam);
        }

        private string ByteList2String(byte[] bytes)
        {
            if (bytes == null || bytes.Length < 1)
            {
                return string.Empty;
            }
            StringBuilder sb = new StringBuilder(bytes[0].ToString("X"));
            for (var i = 1; i < bytes.Length; ++i)
            {
                sb.Append(DIVIDOR);
                sb.Append(bytes[i].ToString("X"));
            }
            return sb.ToString();
        }

        private byte[] String2ByteList(string str)
        {
            if (string.IsNullOrEmpty(str))
            {
                return null;
            }
            IList<byte> bytes = new List<byte>();
            var lst = str.Split(DIVIDOR);
            foreach (var s in lst)
            {
                bytes.Add(byte.Parse(s, System.Globalization.NumberStyles.HexNumber));
            }
            return bytes.ToArray();
        }

        public string Sign(string originalData)
        {
            var bytes = this._rsa.SignData(Encoding.UTF8.GetBytes(originalData), new SHA1CryptoServiceProvider());
            return Encoding.UTF8.GetString(bytes);
        }

        public bool Verify(string originalData, string signedData)
        {
            return this._rsa.VerifyData(Encoding.UTF8.GetBytes(originalData), new SHA1CryptoServiceProvider(), Encoding.UTF8.GetBytes(signedData));
        }
    }
}
