import React, { useState } from 'react';
import { hashPassword } from '../../utils/auth';

interface SetupScreenProps {
  onSetupSuccess: (email: string) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('لطفاً تمام فیلدها را پر کنید.');
      return;
    }
    if (password !== confirmPassword) {
      setError('رمزهای عبور با یکدیگر مطابقت ندارند.');
      return;
    }
    if (password.length < 6) {
        setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
        return;
    }

    try {
      const passwordHash = await hashPassword(password);
      localStorage.setItem('rooznegar-user-email', email);
      localStorage.setItem('rooznegar-password-hash', passwordHash);
      onSetupSuccess(email);
    } catch (err) {
      setError('خطایی در هنگام تنظیم حساب رخ داد. لطفاً دوباره تلاش کنید.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-2">به روزنگار من خوش آمدید!</h1>
        <p className="text-center text-gray-400 mb-8">برای شروع، یک حساب کاربری محلی بسازید.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
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
          <div>
             <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-300 mb-2">تکرار رمز عبور</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
          >
            ایجاد حساب
          </button>
        </form>
         <p className="text-xs text-gray-500 mt-6 text-center">
            توجه: حساب شما فقط روی این دستگاه ذخیره می‌شود. هیچ اطلاعاتی به سرور ارسال نمی‌گردد.
        </p>
      </div>
    </div>
  );
};
