"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const sizes = [512, 1024, 2048, 4096, 8192];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [text, setText] = useState("");
  const [size, setSize] = useState(1024);
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!text.trim() || !canvasRef.current) {
      setGenerated(false);
      return;
    }

    QRCode.toCanvas(
      canvasRef.current,
      text,
      {
        width: size,
        margin: 4,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: foreground,
          light: background,
        },
      },
      (error) => {
        if (error) {
          console.error("QR generation error:", error);
          setGenerated(false);
          return;
        }

        setGenerated(true);
      }
    );
  }, [text, size, foreground, background, errorLevel]);

  async function downloadPNG() {
    if (!text.trim()) return;

    try {
      setDownloading(true);

      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 4,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: foreground,
          light: background,
        },
      });

      const newWindow = window.open("", "_blank");

      if (!newWindow) {
        alert(
          "Не удалось открыть страницу PNG. Разрешите всплывающие окна для QR Pro."
        );
        return;
      }

      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          >
          <title>QR Pro — PNG</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              padding: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #020617;
              color: white;
              font-family:
                -apple-system,
                BlinkMacSystemFont,
                "SF Pro Display",
                "Segoe UI",
                sans-serif;
            }

            .container {
              width: 100%;
              max-width: 700px;
              text-align: center;
            }

            .title {
              font-size: 26px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .subtitle {
              color: #94a3b8;
              font-size: 14px;
              margin-bottom: 24px;
            }

            .qr-wrapper {
              background: white;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              max-width: 100%;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            }

            img {
              display: block;
              width: auto;
              max-width: min(80vw, 600px);
              height: auto;
            }

            .instruction {
              margin-top: 24px;
              padding: 16px 20px;
              border-radius: 16px;
              background: #0f172a;
              border: 1px solid #1e293b;
              color: #cbd5e1;
              line-height: 1.6;
              font-size: 14px;
            }

            .hint {
              margin-top: 12px;
              color: #64748b;
              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <div class="container">
            <div class="title">QR Pro</div>

            <div class="subtitle">
              ${size} × ${size} px • PNG
            </div>

            <div class="qr-wrapper">
              <img src="${dataUrl}" alt="QR-код QR Pro">
            </div>

            <div class="instruction">
              На iPhone нажмите
              <strong>«Поделиться»</strong>,
              затем выберите
              <strong>«Сохранить изображение»</strong>
              или <strong>«Сохранить в Файлы»</strong>.
            </div>

            <div class="hint">
              QR-код создан в высоком разрешении.
            </div>
          </div>
        </body>
        </html>
      `);

      newWindow.document.close();
    } catch (error) {
      console.error("PNG export error:", error);
      alert("Не удалось создать PNG.");
    } finally {
      setDownloading(false);
    }
  }

  function clearAll() {
    setText("");
    setGenerated(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white font-black text-slate-950">
            QR
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              QR Pro
            </h1>

            <p className="text-sm text-slate-400">
              Генератор QR-кодов высокого разрешения
            </p>
          </div>
        </header>

        {/* MAIN */}

        <div className="grid gap-6 lg:grid-cols-[1fr_460px]">

          {/* SETTINGS */}

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-7">

            <h2 className="mb-1 text-xl font-semibold">
              Создать QR-код
            </h2>

            <p className="mb-6 text-sm text-slate-400">
              Введите данные и настройте QR-код.
            </p>

            {/* TYPE */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Тип данных
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["URL", "Текст", "Wi-Fi", "Контакт"].map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* TEXT */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Текст или ссылка
              </label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="min-h-36 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white outline-none transition placeholder:text-slate-600 focus:border-white"
              />
            </div>

            {/* SIZE */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Разрешение
              </label>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {sizes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSize(value)}
                    className={`rounded-xl border px-3 py-3 text-sm transition ${
                      size === value
                        ? "border-white bg-white text-slate-950"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Максимум: 8192 × 8192 px
              </p>
            </div>

            {/* ERROR CORRECTION */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Коррекция ошибок
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  ["L", "7%"],
                  ["M", "15%"],
                  ["Q", "25%"],
                  ["H", "30%"],
                ].map(([level, percent]) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setErrorLevel(
                        level as "L" | "M" | "Q" | "H"
                      )
                    }
                    className={`rounded-xl border px-3 py-3 transition ${
                      errorLevel === level
                        ? "border-white bg-white text-slate-950"
                        : "border-slate-700 bg-slate-950 text-slate-300"
                    }`}
                  >
                    <div className="font-semibold">
                      {level}
                    </div>

                    <div className="text-xs opacity-60">
                      {percent}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* COLORS */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Цвет QR
                </label>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={foreground}
                    onChange={(e) =>
                      setForeground(e.target.value)
                    }
                    className="h-11 w-16 cursor-pointer rounded-xl border border-slate-700 bg-slate-950"
                  />

                  <input
                    value={foreground}
                    onChange={(e) =>
                      setForeground(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm uppercase outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Фон
                </label>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) =>
                      setBackground(e.target.value)
                    }
                    className="h-11 w-16 cursor-pointer rounded-xl border border-slate-700 bg-slate-950"
                  />

                  <input
                    value={background}
                    onChange={(e) =>
                      setBackground(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm uppercase outline-none"
                  />
                </div>
              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Очистить
              </button>

              <button
                type="button"
                onClick={downloadPNG}
                disabled={!generated || downloading}
                className="flex-1 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {downloading
                  ? "Создание PNG..."
                  : "Скачать PNG"}
              </button>

            </div>

          </section>

          {/* PREVIEW */}

          <section className="flex min-h-[520px] flex-col rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-7">

            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Предпросмотр
              </h2>

              <p className="text-sm text-slate-400">
                {generated
                  ? `${size} × ${size} px`
                  : "Введите данные"}
              </p>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden rounded-3xl bg-white p-5">

              {!generated && (
                <div className="text-center text-slate-400">

                  <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300">
                    <span className="text-sm">
                      QR-код
                    </span>
                  </div>

                  <p className="text-sm">
                    Введите текст или ссылку
                  </p>

                </div>
              )}

              <canvas
                ref={canvasRef}
                className={
                  generated
                    ? "h-auto max-h-full max-w-full rounded-xl"
                    : "hidden"
                }
              />

            </div>

            {generated && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Разрешение
                  </span>

                  <span className="font-semibold">
                    {size} × {size}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Коррекция
                  </span>

                  <span className="font-semibold">
                    {errorLevel}
                  </span>
                </div>

              </div>
            )}

          </section>

        </div>

        <footer className="py-8 text-center text-xs text-slate-600">
          QR Pro • High Resolution QR Generator
        </footer>

      </div>
    </main>
  );
}
