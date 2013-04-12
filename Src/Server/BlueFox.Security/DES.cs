using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using System.IO;

namespace BlueFox.Security
{
    public class DES
    {
        private byte[] _rgbIV = new byte[] { 0x12, 0x34, 0x56, 120, 0x90, 0xab, 0xcd, 0xef };

        private ICryptoTransform _encryptor;

        private ICryptoTransform _decryptor;

        public DES(string encryptKey)
        {
            byte[] rgbKey = new byte[8];
            Array.Copy(Encoding.UTF8.GetBytes(encryptKey.PadRight(8)), rgbKey, 8);
            DESCryptoServiceProvider provider = new DESCryptoServiceProvider();
            this._encryptor = provider.CreateEncryptor(rgbKey, this._rgbIV);
            this._decryptor = provider.CreateDecryptor(rgbKey, this._rgbIV);
        }

        public string Encrypt(string inputString)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(inputString);
            using (MemoryStream stream = new MemoryStream())
            {
                using (CryptoStream stream2 = new CryptoStream(stream, this._encryptor, CryptoStreamMode.Write))
                {
                    stream2.Write(bytes, 0, bytes.Length);
                    stream2.FlushFinalBlock();
                    inputString = Convert.ToBase64String(stream.ToArray());
                }
            }
            return inputString;
        }

        public string Decrypt(string inputString)
        {
            byte[] buffer = Convert.FromBase64String(inputString);
            using (MemoryStream stream = new MemoryStream())
            {
                using (CryptoStream stream2 = new CryptoStream(stream, this._decryptor, CryptoStreamMode.Write))
                {
                    stream2.Write(buffer, 0, buffer.Length);
                    stream2.FlushFinalBlock();
                    inputString = new UTF8Encoding().GetString(stream.ToArray());
                }
            }
            return inputString;
        }
    }
}
