"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl text-slate-950">
              QR
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                QR Pro
              </h1>
              <p className="text-sm text-slate-400">
                Генератор QR-кодов высокого разрешения
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h2 className="mb-1 text-xl font-semibold">
              Создать QR-код
            </h2>

            <p className="mb-6 text-sm text-slate-400">
              Введите данные, которые должен содержать QR-код.
            </p>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Текст или ссылка
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://example.com"
              className="min-h-40 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-white"
            />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["URL", "Текст", "Wi-Fi", "Контакт"].map((type) => (
                <button
                  key={type}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-800 bg-white p-8">
            <div className="text-center text-slate-400">
              <div className="mx-auto mb-5 flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300">
                <span className="text-sm">
                  QR-код появится здесь
                </span>
              </div>

              <p className="text-sm">
                Предпросмотр
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
