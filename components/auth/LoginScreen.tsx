import React, { useState } from 'react';
import { hashPassword } from '../../utils/auth';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleForgotPassword = () => {
    alert(
      "بازیابی رمز عبور در این نسخه امکان‌پذیر نیست.\n\n" +
      "این برنامه اطلاعات شما را به صورت محلی در مرورگر ذخیره می‌کند و سروری برای ارسال ایمیل بازیابی وجود ندارد.\n\n" +
      "اگر رمز خود را فراموش کرده‌اید، تنها راه ورود مجدد، پاک کردن داده‌های سایت (Clear Site Data) از تنظیمات مرورگر است. لطفاً توجه داشته باشید که این کار تمام خاطرات ذخیره شده شما را نیز برای همیشه حذف خواهد کرد."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storedHash = localStorage.getItem('rooznegar-password-hash');
    const email = localStorage.getItem('rooznegar-user-email');

    if (!storedHash || !email) {
      setError('خطای سیستمی: اطلاعات حساب کاربری یافت نشد.');
      return;
    }

    try {
      const inputHash = await hashPassword(password);
      if (inputHash === storedHash) {
        onLoginSuccess(email);
      } else {
        setError('رمز عبور اشتباه است.');
      }
    } catch (err) {
      setError('خطایی در هنگام ورود رخ داد. لطفاً دوباره تلاش کنید.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">ورود به روزنگار</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
          >
            ورود
          </button>
        </form>
        <div className="text-center mt-6">
            <button onClick={handleForgotPassword} className="text-sm text-cyan-500 hover:underline">
                رمز عبور را فراموش کرده‌ام
            </button>
        </div>
      </div>
    </div>
  );
};
