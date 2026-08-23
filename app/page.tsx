"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const sizes = [512, 1024, 2048, 4096, 8192];

type ErrorLevel = "L" | "M" | "Q" | "H";
type WifiSecurity = "WPA" | "WEP" | "nopass";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState("URL");

  const [text, setText] = useState("");

  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] =
    useState<WifiSecurity>("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [size, setSize] = useState(1024);

  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");

  const [errorLevel, setErrorLevel] =
    useState<ErrorLevel>("H");

  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [showWifiInfo, setShowWifiInfo] = useState(false);

  function escapeWifi(value: string) {
    return value.replace(/([\\;,:"])/g, "\\$1");
  }

  function getQRText() {
    if (mode === "Wi-Fi") {
      return `WIFI:T:${wifiSecurity};S:${escapeWifi(
        wifiSSID
      )};P:${escapeWifi(wifiPassword)};H:${
        wifiHidden ? "true" : "false"
      };;`;
    }

    return text;
  }

  const qrText = getQRText();

  useEffect(() => {
    if (!qrText.trim() || !canvasRef.current) {
      setGenerated(false);
      return;
    }

    QRCode.toCanvas(
      canvasRef.current,
      qrText,
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
  }, [
    qrText,
    size,
    foreground,
    background,
    errorLevel,
  ]);

  function findWifiNetworks() {
    setShowWifiInfo(true);
  }

  async function downloadPNG() {
    if (!qrText.trim()) return;

    try {
      setDownloading(true);

      const dataUrl = await QRCode.toDataURL(qrText, {
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
          "Разрешите всплывающие окна для QR Pro."
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
            }

            img {
              display: block;
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
          </style>
        </head>

        <body>

          <div class="container">

            <div class="title">
              QR Pro
            </div>

            <div class="subtitle">
              ${size} × ${size} px • PNG
            </div>

            <div class="qr-wrapper">

              <img
                src="${dataUrl}"
                alt="QR-код QR Pro"
              />

            </div>

            <div class="instruction">
              На iPhone нажмите
              <strong>«Поделиться»</strong>
              → <strong>«Сохранить изображение»</strong>.
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

  async function downloadSVG() {
    if (!qrText.trim()) return;

    try {
      setDownloading(true);

      const svg = await QRCode.toString(qrText, {
        type: "svg",
        width: size,
        margin: 4,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: foreground,
          light: background,
        },
      });

      const blob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        `qr-pro-${mode.toLowerCase()}-${size}x${size}.svg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("SVG export error:", error);
      alert("Не удалось создать SVG.");
    } finally {
      setDownloading(false);
    }
  }

  function clearAll() {
    setText("");

    setWifiSSID("");
    setWifiPassword("");
    setWifiSecurity("WPA");
    setWifiHidden(false);

    setGenerated(false);
    setShowWifiInfo(false);
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
              Выберите тип данных.
            </p>

            {/* TYPE */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Тип QR-кода
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                {[
                  "URL",
                  "Текст",
                  "Wi-Fi",
                  "Контакт",
                ].map((type) => (

                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setMode(type);
                      setShowWifiInfo(false);
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      mode === type
                        ? "border-white bg-white text-slate-950"
                        : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {type}
                  </button>

                ))}

              </div>

            </div>

            {/* URL / TEXT */}

            {(mode === "URL" ||
              mode === "Текст") && (

              <div className="mb-6">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  {mode === "URL"
                    ? "Ссылка"
                    : "Текст"}
                </label>

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  placeholder={
                    mode === "URL"
                      ? "https://example.com"
                      : "Введите текст"
                  }
                  className="min-h-36 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-600 focus:border-white"
                />

              </div>

            )}

            {/* WIFI */}

            {mode === "Wi-Fi" && (

              <div className="mb-6 space-y-5">

                {/* SSID */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Название Wi-Fi сети
                  </label>

                  <div className="flex gap-2">

                    <input
                      value={wifiSSID}
                      onChange={(e) =>
                        setWifiSSID(
                          e.target.value
                        )
                      }
                      placeholder="My WiFi"
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
                    />

                    <button
                      type="button"
                      onClick={findWifiNetworks}
                      className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-slate-950"
                    >
                      <span className="text-base">
                        🔍
                      </span>

                      <span className="hidden sm:inline">
                        Найти сети
                      </span>

                    </button>

                  </div>

                </div>

                {/* WIFI INFO */}

                {showWifiInfo && (

                  <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-4">

                    <div className="mb-2 flex items-start gap-3">

                      <div className="text-xl">
                        📶
                      </div>

                      <div className="flex-1">

                        <div className="font-semibold text-blue-100">
                          Сканирование Wi-Fi
                        </div>

                        <p className="mt-1 text-sm leading-6 text-blue-200/80">
                          iPhone не разрешает обычным
                          веб-приложениям получать список
                          доступных Wi-Fi сетей.
                        </p>

                      </div>

                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Откройте настройки Wi-Fi на iPhone,
                      посмотрите название нужной сети
                      и вернитесь сюда, чтобы ввести её
                      название.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowWifiInfo(false)
                      }
                      className="mt-3 rounded-lg border border-blue-800 px-3 py-2 text-xs font-medium text-blue-200 hover:bg-blue-900/50"
                    >
                      Понятно
                    </button>

                  </div>

                )}

                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Пароль
                  </label>

                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) =>
                      setWifiPassword(
                        e.target.value
                      )
                    }
                    placeholder="Введите пароль"
                    disabled={
                      wifiSecurity ===
                      "nopass"
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white disabled:opacity-40"
                  />

                </div>

                {/* SECURITY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Защита сети
                  </label>

                  <select
                    value={wifiSecurity}
                    onChange={(e) =>
                      setWifiSecurity(
                        e.target.value as WifiSecurity
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                  >

                    <option value="WPA">
                      WPA / WPA2 / WPA3
                    </option>

                    <option value="WEP">
                      WEP
                    </option>

                    <option value="nopass">
                      Без пароля
                    </option>

                  </select>

                </div>

                {/* HIDDEN */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4">

                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) =>
                      setWifiHidden(
                        e.target.checked
                      )
                    }
                    className="h-5 w-5"
                  />

                  <div>

                    <div className="font-medium">
                      Скрытая сеть
                    </div>

                    <div className="text-xs text-slate-500">
                      SSID не отображается в списке Wi-Fi
                    </div>

                  </div>

                </label>

                {/* INFO */}

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-400">

                  📱 После сканирования QR-кода
                  телефон сможет предложить
                  подключение к этой Wi-Fi сети.

                </div>

              </div>

            )}

            {/* CONTACT */}

            {mode === "Контакт" && (

              <div className="mb-6">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Контакт
                </label>

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  placeholder={
                    "Имя: Иван Иванов\nТелефон: +79990000000\nEmail: example@mail.com"
                  }
                  className="min-h-36 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-600 focus:border-white"
                />

              </div>

            )}

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
                    onClick={() =>
                      setSize(value)
                    }
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

            {/* ERROR LEVEL */}

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
                ].map(
                  ([level, percent]) => (

                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setErrorLevel(
                          level as ErrorLevel
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

                  )
                )}

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
                      setForeground(
                        e.target.value
                      )
                    }
                    className="h-11 w-16 cursor-pointer rounded-xl border border-slate-700 bg-slate-950"
                  />

                  <input
                    value={foreground}
                    onChange={(e) =>
                      setForeground(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm uppercase outline-none"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Цвет фона
                </label>

                <div className="flex gap-2">

                  <input
                    type="color"
                    value={background}
                    onChange={(e) =>
                      setBackground(
                        e.target.value
                      )
                    }
                    className="h-11 w-16 cursor-pointer rounded-xl border border-slate-700 bg-slate-950"
                  />

                  <input
                    value={background}
                    onChange={(e) =>
                      setBackground(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm uppercase outline-none"
                  />

                </div>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-7 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Очистить
              </button>

              <button
                type="button"
                onClick={downloadPNG}
                disabled={
                  !generated ||
                  downloading
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {downloading
                  ? "Создание..."
                  : "PNG"}
              </button>

              <button
                type="button"
                onClick={downloadSVG}
                disabled={
                  !generated ||
                  downloading
                }
                className="rounded-xl border border-white bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {downloading
                  ? "Создание..."
                  : "SVG"}
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
                    Введите данные
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
                    Тип
                  </span>

                  <span className="font-semibold">
                    {mode}
                  </span>

                </div>

                <div className="mt-2 flex items-center justify-between">

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
