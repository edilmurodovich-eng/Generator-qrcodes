"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const sizes = [512, 1024, 2048, 4096, 8192];

const logoSizes = [10, 15, 20, 25, 30];

type ErrorLevel = "L" | "M" | "Q" | "H";
type WifiSecurity = "WPA" | "WEP" | "nopass";
type DotStyle = "square" | "round" | "soft";
type CornerStyle = "square" | "round";
type Preset = "classic" | "modern" | "neon" | "business";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const [gradientEnabled, setGradientEnabled] =
    useState(false);

  const [gradientColor, setGradientColor] =
    useState("#6366f1");

  const [dotStyle, setDotStyle] =
    useState<DotStyle>("square");

  const [cornerStyle, setCornerStyle] =
    useState<CornerStyle>("square");

  const [borderEnabled, setBorderEnabled] =
    useState(false);

  const [borderWidth, setBorderWidth] =
    useState(20);

  const [captionEnabled, setCaptionEnabled] =
    useState(false);

  const [caption, setCaption] =
    useState("Сканируй меня");

  const [errorLevel, setErrorLevel] =
    useState<ErrorLevel>("H");

  const [preset, setPreset] =
    useState<Preset>("classic");

  const [generated, setGenerated] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [showWifiInfo, setShowWifiInfo] =
    useState(false);

  const [logo, setLogo] =
    useState<string | null>(null);

  const [logoSize, setLogoSize] =
    useState(20);

  const [logoError, setLogoError] =
    useState("");

  function escapeWifi(value: string) {
    return value.replace(/([\\;,:"])/g, "\\$1");
  }

  function getQRText() {
    if (mode === "Wi-Fi") {
      return `WIFI:T:${wifiSecurity};S:${escapeWifi(
        wifiSSID
      )};P:${escapeWifi(
        wifiPassword
      )};H:${wifiHidden ? "true" : "false"};;`;
    }

    return text;
  }

  const qrText = getQRText();

  /*
   * PRESETS
   */

  function applyPreset(value: Preset) {
    setPreset(value);

    if (value === "classic") {
      setForeground("#000000");
      setBackground("#ffffff");
      setGradientEnabled(false);
      setDotStyle("square");
      setCornerStyle("square");
      setBorderEnabled(false);
      setCaptionEnabled(false);
      return;
    }

    if (value === "modern") {
      setForeground("#111827");
      setBackground("#ffffff");
      setGradientEnabled(true);
      setGradientColor("#6366f1");
      setDotStyle("soft");
      setCornerStyle("round");
      setBorderEnabled(false);
      setCaptionEnabled(false);
      return;
    }

    if (value === "neon") {
      setForeground("#7c3aed");
      setBackground("#050505");
      setGradientEnabled(true);
      setGradientColor("#06b6d4");
      setDotStyle("round");
      setCornerStyle("round");
      setBorderEnabled(true);
      setBorderWidth(25);
      setCaptionEnabled(true);
      setCaption("SCAN ME");
      return;
    }

    if (value === "business") {
      setForeground("#111111");
      setBackground("#ffffff");
      setGradientEnabled(false);
      setDotStyle("soft");
      setCornerStyle("round");
      setBorderEnabled(true);
      setBorderWidth(18);
      setCaptionEnabled(true);
      setCaption("Сканируй меня");
    }
  }

  /*
   * LOGO
   */

  function handleLogoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLogoError("");

    if (!file.type.startsWith("image/")) {
      setLogoError(
        "Можно загружать только изображения."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoError(
        "Размер логотипа не должен превышать 5 МБ."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
      }
    };

    reader.onerror = () => {
      setLogoError(
        "Не удалось загрузить логотип."
      );
    };

    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogo(null);
    setLogoError("");

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  /*
   * QR CANVAS
   */

  async function generateBaseQR(
    target: HTMLCanvasElement
  ) {
    await QRCode.toCanvas(target, qrText, {
      width: size,
      margin: 4,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: foreground,
        light: background,
      },
    });
  }

  /*
   * РИСУЕМ ДИЗАЙН
   */

  async function drawDesignedQR() {
    const canvas = canvasRef.current;

    if (!canvas || !qrText.trim()) {
      return;
    }

    await generateBaseQR(canvas);

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    /*
     * Градиент
     */

    if (gradientEnabled) {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        size,
        size
      );

      gradient.addColorStop(
        0,
        foreground
      );

      gradient.addColorStop(
        1,
        gradientColor
      );

      /*
       * Перекрашиваем только непрозрачные
       * пиксели QR.
       */

      const imageData =
        ctx.getImageData(
          0,
          0,
          size,
          size
        );

      const pixels = imageData.data;

      for (
        let i = 0;
        i < pixels.length;
        i += 4
      ) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        /*
         * Определяем тёмные пиксели.
         */

        const brightness =
          (r + g + b) / 3;

        if (brightness < 220) {
          const x =
            ((i / 4) % size) / size;

          const y =
            Math.floor(
              i / 4 / size
            ) / size;

          const t =
            (x + y) / 2;

          const start =
            hexToRgb(foreground);

          const end =
            hexToRgb(gradientColor);

          if (start && end) {
            pixels[i] =
              Math.round(
                start.r +
                  (end.r - start.r) *
                    t
              );

            pixels[i + 1] =
              Math.round(
                start.g +
                  (end.g - start.g) *
                    t
              );

            pixels[i + 2] =
              Math.round(
                start.b +
                  (end.b - start.b) *
                    t
              );
          }
        }
      }

      ctx.putImageData(
        imageData,
        0,
        0
      );
    }

    /*
     * Логотип
     */

    if (logo) {
      await drawLogo(ctx);
    }

    /*
     * Рамка
     */

    if (borderEnabled) {
      drawBorder(ctx);
    }

    /*
     * Подпись
     */

    if (captionEnabled) {
      drawCaption(ctx);
    }
  }

  function hexToRgb(hex: string) {
    const clean = hex.replace(
      "#",
      ""
    );

    if (clean.length !== 6) {
      return null;
    }

    return {
      r: parseInt(
        clean.substring(0, 2),
        16
      ),
      g: parseInt(
        clean.substring(2, 4),
        16
      ),
      b: parseInt(
        clean.substring(4, 6),
        16
      ),
    };
  }

  /*
   * LOGO
   */

  async function drawLogo(
    ctx: CanvasRenderingContext2D
  ) {
    if (!logo) return;

    await new Promise<void>(
      (resolve) => {
        const image =
          new Image();

        image.onload = () => {
          const logoPixels =
            size *
            (logoSize / 100);

          const x =
            (size - logoPixels) /
            2;

          const y =
            (size - logoPixels) /
            2;

          const padding =
            logoPixels * 0.12;

          ctx.save();

          ctx.fillStyle =
            background;

          ctx.beginPath();

          ctx.roundRect(
            x - padding,
            y - padding,
            logoPixels +
              padding * 2,
            logoPixels +
              padding * 2,
            logoPixels * 0.12
          );

          ctx.fill();

          ctx.drawImage(
            image,
            x,
            y,
            logoPixels,
            logoPixels
          );

          ctx.restore();

          resolve();
        };

        image.onerror = () => {
          resolve();
        };

        image.src = logo;
      }
    );
  }

  /*
   * BORDER
   */

  function drawBorder(
    ctx: CanvasRenderingContext2D
  ) {
    ctx.save();

    ctx.strokeStyle =
      gradientEnabled
        ? gradientColor
        : foreground;

    ctx.lineWidth =
      borderWidth;

    ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      size - borderWidth,
      size - borderWidth
    );

    ctx.restore();
  }

  /*
   * CAPTION
   */

  function drawCaption(
    ctx: CanvasRenderingContext2D
  ) {
    const fontSize =
      Math.max(
        24,
        Math.floor(size * 0.035)
      );

    ctx.save();

    ctx.font =
      `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

    ctx.textAlign = "center";

    ctx.textBaseline =
      "bottom";

    ctx.fillStyle =
      foreground;

    ctx.fillText(
      caption,
      size / 2,
      size -
        Math.max(
          20,
          borderWidth
        )
    );

    ctx.restore();
  }

  /*
   * GENERATION
   */

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (
        !qrText.trim() ||
        !canvasRef.current
      ) {
        setGenerated(false);
        return;
      }

      try {
        await drawDesignedQR();

        if (!cancelled) {
          setGenerated(true);
        }
      } catch (error) {
        console.error(
          "QR generation error:",
          error
        );

        if (!cancelled) {
          setGenerated(false);
        }
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [
    qrText,
    size,
    foreground,
    background,
    gradientEnabled,
    gradientColor,
    dotStyle,
    cornerStyle,
    borderEnabled,
    borderWidth,
    captionEnabled,
    caption,
    errorLevel,
    logo,
    logoSize,
  ]);

  /*
   * WIFI
   */

  function findWifiNetworks() {
    setShowWifiInfo(true);
  }

  /*
   * PNG
   */

  async function downloadPNG() {
    if (!qrText.trim()) return;

    try {
      setDownloading(true);

      await drawDesignedQR();

      const canvas =
        canvasRef.current;

      if (!canvas) {
        throw new Error(
          "Canvas unavailable"
        );
      }

      const dataUrl =
        canvas.toDataURL(
          "image/png"
        );

      const newWindow =
        window.open(
          "",
          "_blank"
        );

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
                "Segoe UI",
                sans-serif;
            }

            .container {
              width: 100%;
              max-width: 700px;
              text-align: center;
            }

            h1 {
              margin: 0 0 8px;
              font-size: 26px;
            }

            .subtitle {
              color: #94a3b8;
              margin-bottom: 24px;
              font-size: 14px;
            }

            .qr {
              background: white;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
            }

            img {
              display: block;
              max-width: 80vw;
              max-height: 70vh;
              height: auto;
            }

            .info {
              margin-top: 24px;
              padding: 16px;

              border-radius: 16px;

              background: #0f172a;
              border: 1px solid #1e293b;

              color: #cbd5e1;

              font-size: 14px;
              line-height: 1.6;
            }

          </style>

        </head>

        <body>

          <div class="container">

            <h1>QR Pro</h1>

            <div class="subtitle">
              ${size} × ${size} px
              ${logo ? " • Logo" : ""}
              ${gradientEnabled ? " • Gradient" : ""}
            </div>

            <div class="qr">

              <img
                src="${dataUrl}"
                alt="QR Pro"
              />

            </div>

            <div class="info">
              На iPhone нажмите
              <strong>«Поделиться»</strong>
              →
              <strong>«Сохранить изображение»</strong>.
            </div>

          </div>

        </body>

        </html>
      `);

      newWindow.document.close();
    } catch (error) {
      console.error(
        "PNG error:",
        error
      );

      alert(
        "Не удалось создать PNG."
      );
    } finally {
      setDownloading(false);
    }
  }

  /*
   * SVG
   */

  async function downloadSVG() {
    if (!qrText.trim()) return;

    try {
      setDownloading(true);

      let svg =
        await QRCode.toString(
          qrText,
          {
            type: "svg",
            width: size,
            margin: 4,
            errorCorrectionLevel:
              errorLevel,
            color: {
              dark: foreground,
              light: background,
            },
          }
        );

      /*
       * Логотип SVG
       */

      if (logo) {
        const logoPixels =
          size *
          (logoSize / 100);

        const x =
          (size - logoPixels) /
          2;

        const y =
          (size - logoPixels) /
          2;

        const padding =
          logoPixels * 0.12;

        const rectX =
          x - padding;

        const rectY =
          y - padding;

        const rectSize =
          logoPixels +
          padding * 2;

        svg = svg.replace(
          "</svg>",
          `
            <rect
              x="${rectX}"
              y="${rectY}"
              width="${rectSize}"
              height="${rectSize}"
              rx="${logoPixels * 0.12}"
              fill="${background}"
            />

            <image
              href="${logo}"
              x="${x}"
              y="${y}"
              width="${logoPixels}"
              height="${logoPixels}"
              preserveAspectRatio="xMidYMid meet"
            />

          </svg>
          `
        );
      }

      /*
       * SVG caption
       */

      if (captionEnabled) {
        const fontSize =
          Math.max(
            24,
            Math.floor(
              size * 0.035
            )
          );

        svg = svg.replace(
          "</svg>",
          `
            <text
              x="${size / 2}"
              y="${size - 20}"
              text-anchor="middle"
              font-family="Arial, sans-serif"
              font-size="${fontSize}"
              font-weight="700"
              fill="${foreground}"
            >
              ${escapeSvg(caption)}
            </text>

          </svg>
          `
        );
      }

      const blob =
        new Blob(
          [svg],
          {
            type:
              "image/svg+xml;charset=utf-8",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `qr-pro-${mode.toLowerCase()}-${size}x${size}.svg`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 1000);
    } catch (error) {
      console.error(
        "SVG error:",
        error
      );

      alert(
        "Не удалось создать SVG."
      );
    } finally {
      setDownloading(false);
    }
  }

  function escapeSvg(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /*
   * CLEAR
   */

  function clearAll() {
    setText("");

    setWifiSSID("");
    setWifiPassword("");
    setWifiSecurity("WPA");
    setWifiHidden(false);

    setLogo(null);
    setLogoError("");

    setGradientEnabled(false);
    setGradientColor("#6366f1");

    setDotStyle("square");
    setCornerStyle("square");

    setBorderEnabled(false);
    setBorderWidth(20);

    setCaptionEnabled(false);
    setCaption("Сканируй меня");

    setPreset("classic");

    setGenerated(false);
    setShowWifiInfo(false);

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
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
              High Resolution QR Designer
            </p>

          </div>

        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_460px]">

          {/* SETTINGS */}

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-7">

            <h2 className="mb-1 text-xl font-semibold">
              Design Studio
            </h2>

            <p className="mb-6 text-sm text-slate-400">
              Создайте собственный дизайн QR-кода.
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
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
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

            {/* DATA */}

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
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-white"
                    />

                    <button
                      type="button"
                      onClick={findWifiNetworks}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold hover:border-white hover:bg-white hover:text-slate-950"
                    >
                      🔍
                      <span className="hidden sm:inline">
                        {" "}Найти
                      </span>
                    </button>

                  </div>

                </div>

                {showWifiInfo && (

                  <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-4 text-sm text-blue-200">

                    📶 iPhone не разрешает обычным
                    веб-приложениям получать список
                    доступных Wi-Fi сетей.

                    <button
                      type="button"
                      onClick={() =>
                        setShowWifiInfo(false)
                      }
                      className="mt-3 block rounded-lg border border-blue-800 px-3 py-2 text-xs"
                    >
                      Понятно
                    </button>

                  </div>

                )}

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Пароль
                  </label>

                  <input
                    value={wifiPassword}
                    onChange={(e) =>
                      setWifiPassword(
                        e.target.value
                      )
                    }
                    placeholder="Пароль Wi-Fi"
                    disabled={
                      wifiSecurity === "nopass"
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-white disabled:opacity-40"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Защита
                  </label>

                  <select
                    value={wifiSecurity}
                    onChange={(e) =>
                      setWifiSecurity(
                        e.target.value as WifiSecurity
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
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

                <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4">

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

                  <span className="text-sm">
                    Скрытая сеть
                  </span>

                </label>

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
                  className="min-h-36 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 outline-none"
                />

              </div>

            )}

            {/* PRESETS */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                ✨ Пресеты
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                <button
                  onClick={() =>
                    applyPreset("classic")
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    preset === "classic"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  Classic
                </button>

                <button
                  onClick={() =>
                    applyPreset("modern")
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    preset === "modern"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  Modern
                </button>

                <button
                  onClick={() =>
                    applyPreset("neon")
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    preset === "neon"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  Neon
                </button>

                <button
                  onClick={() =>
                    applyPreset("business")
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    preset === "business"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  Business
                </button>

              </div>

            </div>

            {/* COLORS */}

            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">

              <h3 className="mb-4 font-semibold">
                🎨 Цвет
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs text-slate-400">
                    Основной цвет
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
                      className="h-11 w-16 rounded-xl"
                    />

                    <input
                      value={foreground}
                      onChange={(e) =>
                        setForeground(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 uppercase"
                    />

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-xs text-slate-400">
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
                      className="h-11 w-16 rounded-xl"
                    />

                    <input
                      value={background}
                      onChange={(e) =>
                        setBackground(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 uppercase"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* GRADIENT */}

            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">

              <label className="flex cursor-pointer items-center justify-between">

                <div>

                  <div className="font-semibold">
                    🌈 Градиент
                  </div>

                  <div className="text-xs text-slate-500">
                    Плавный переход цвета QR
                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={gradientEnabled}
                  onChange={(e) =>
                    setGradientEnabled(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

              </label>

              {gradientEnabled && (

                <div className="mt-4 flex gap-2">

                  <input
                    type="color"
                    value={gradientColor}
                    onChange={(e) =>
                      setGradientColor(
                        e.target.value
                      )
                    }
                    className="h-11 w-16 rounded-xl"
                  />

                  <input
                    value={gradientColor}
                    onChange={(e) =>
                      setGradientColor(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 uppercase"
                  />

                </div>

              )}

            </div>

            {/* DOT STYLE */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                ⚫ Форма точек
              </label>

              <div className="grid grid-cols-3 gap-2">

                {[
                  ["square", "■ Квадрат"],
                  ["round", "● Круг"],
                  ["soft", "▣ Soft"],
                ].map(
                  ([value, label]) => (

                    <button
                      key={value}
                      onClick={() =>
                        setDotStyle(
                          value as DotStyle
                        )
                      }
                      className={`rounded-xl border p-3 text-sm ${
                        dotStyle === value
                          ? "border-white bg-white text-slate-950"
                          : "border-slate-700"
                      }`}
                    >
                      {label}
                    </button>

                  )
                )}

              </div>

              <p className="mt-2 text-xs text-slate-500">
                Форма отображается как настройка
                дизайна; базовая матрица QR
                сохраняет максимальную совместимость.
              </p>

            </div>

            {/* CORNERS */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                🔲 Углы
              </label>

              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    setCornerStyle("square")
                  }
                  className={`rounded-xl border p-3 ${
                    cornerStyle === "square"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  Классические
                </button>

                <button
                  onClick={() =>
                    setCornerStyle("round")
                  }
                  className={`rounded-xl border p-3 ${
                    cornerStyle === "round"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  Закруглённые
                </button>

              </div>

            </div>

            {/* LOGO */}

            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">

              <h3 className="mb-1 font-semibold">
                🖼️ Логотип
              </h3>

              <p className="mb-4 text-xs text-slate-500">
                Логотип размещается в центре QR.
              </p>

              {!logo ? (

                <>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() =>
                      logoInputRef.current?.click()
                    }
                    className="w-full rounded-xl border border-dashed border-slate-600 p-5 text-sm font-semibold hover:border-white"
                  >
                    🖼️ Загрузить логотип
                  </button>
                </>

              ) : (

                <div className="space-y-4">

                  <div className="flex items-center gap-4">

                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white p-2">

                      <img
                        src={logo}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />

                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">
                        Логотип добавлен
                      </div>

                      <div className="text-xs text-slate-500">
                        Центр QR
                      </div>
                    </div>

                    <button
                      onClick={removeLogo}
                      className="rounded-lg border border-red-900/50 px-3 py-2 text-xs text-red-300"
                    >
                      Удалить
                    </button>

                  </div>

                  <div>

                    <label className="mb-2 block text-xs text-slate-400">
                      Размер логотипа
                    </label>

                    <div className="grid grid-cols-5 gap-2">

                      {logoSizes.map(
                        (value) => (

                          <button
                            key={value}
                            onClick={() =>
                              setLogoSize(
                                value
                              )
                            }
                            className={`rounded-xl border p-3 text-xs ${
                              logoSize ===
                              value
                                ? "border-white bg-white text-slate-950"
                                : "border-slate-700"
                            }`}
                          >
                            {value}%
                          </button>

                        )
                      )}

                    </div>

                  </div>

                </div>

              )}

              {logoError && (

                <p className="mt-3 text-xs text-red-400">
                  {logoError}
                </p>

              )}

            </div>

            {/* BORDER */}

            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">

              <label className="flex items-center justify-between">

                <div>

                  <div className="font-semibold">
                    🖼️ Рамка
                  </div>

                  <div className="text-xs text-slate-500">
                    Добавить рамку вокруг QR
                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={borderEnabled}
                  onChange={(e) =>
                    setBorderEnabled(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

              </label>

              {borderEnabled && (

                <div className="mt-4">

                  <label className="mb-2 block text-xs text-slate-400">
                    Толщина: {borderWidth}px
                  </label>

                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={borderWidth}
                    onChange={(e) =>
                      setBorderWidth(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full"
                  />

                </div>

              )}

            </div>

            {/* CAPTION */}

            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">

              <label className="flex items-center justify-between">

                <div>

                  <div className="font-semibold">
                    ✍️ Текст под QR
                  </div>

                  <div className="text-xs text-slate-500">
                    Например: «Сканируй меня»
                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={captionEnabled}
                  onChange={(e) =>
                    setCaptionEnabled(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

              </label>

              {captionEnabled && (

                <input
                  value={caption}
                  onChange={(e) =>
                    setCaption(
                      e.target.value
                    )
                  }
                  placeholder="Сканируй меня"
                  className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-white"
                />

              )}

            </div>

            {/* SIZE */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                📐 Разрешение
              </label>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">

                {sizes.map((value) => (

                  <button
                    key={value}
                    onClick={() =>
                      setSize(value)
                    }
                    className={`rounded-xl border p-3 text-sm ${
                      size === value
                        ? "border-white bg-white text-slate-950"
                        : "border-slate-700"
                    }`}
                  >
                    {value}
                  </button>

                ))}

              </div>

            </div>

            {/* ERROR */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                🛡️ Коррекция ошибок
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
                      onClick={() =>
                        setErrorLevel(
                          level as ErrorLevel
                        )
                      }
                      className={`rounded-xl border p-3 ${
                        errorLevel ===
                        level
                          ? "border-white bg-white text-slate-950"
                          : "border-slate-700"
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

              {logo && (

                <p className="mt-2 text-xs text-slate-500">
                  Для QR с логотипом рекомендуется H.
                </p>

              )}

            </div>

            {/* DOWNLOAD */}

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={clearAll}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold"
              >
                Очистить
              </button>

              <button
                onClick={downloadPNG}
                disabled={
                  !generated ||
                  downloading
                }
                className="rounded-xl bg-white p-3 text-sm font-bold text-slate-950 disabled:opacity-40"
              >
                {downloading
                  ? "Создание..."
                  : "⬇ PNG"}
              </button>

              <button
                onClick={downloadSVG}
                disabled={
                  !generated ||
                  downloading
                }
                className="rounded-xl border border-white bg-slate-950 p-3 text-sm font-bold disabled:opacity-40"
              >
                {downloading
                  ? "Создание..."
                  : "⬇ SVG"}
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

                    QR

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

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Тип
                  </span>

                  <span>
                    {mode}
                  </span>
                </div>

                <div className="mt-2 flex justify-between">
                  <span className="text-slate-500">
                    Разрешение
                  </span>

                  <span>
                    {size}×{size}
                  </span>
                </div>

                <div className="mt-2 flex justify-between">
                  <span className="text-slate-500">
                    Стиль
                  </span>

                  <span className="capitalize">
                    {preset}
                  </span>
                </div>

                {logo && (

                  <div className="mt-2 flex justify-between">
                    <span className="text-slate-500">
                      Логотип
                    </span>

                    <span>
                      {logoSize}%
                    </span>
                  </div>

                )}

              </div>

            )}

          </section>

        </div>

        <footer className="py-8 text-center text-xs text-slate-600">
          QR Pro • Design Studio
        </footer>

      </div>

    </main>
  );
}
