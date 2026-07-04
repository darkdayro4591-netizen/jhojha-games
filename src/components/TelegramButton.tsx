import { Send } from 'lucide-react';

export default function TelegramButton() {
  return (
    <a
      href="https://t.me/JhojhaGames"
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-float group"
      aria-label="Chat on Telegram"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-yellow-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
        <div className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl border-2 border-yellow-400/50 group-hover:scale-110 transition-transform duration-300">
          <Send className="w-7 h-7 lg:w-8 lg:h-8 text-black" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-black animate-pulse" />
      </div>
    </a>
  );
}
