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

const countryCodes = [
  { code: "+998", country: "🇺🇿 Узбекистан" },
  { code: "+7", country: "🇷🇺 Россия / Казахстан" },
  { code: "+49", country: "🇩🇪 Германия" },
  { code: "+380", country: "🇺🇦 Украина" },
  { code: "+375", country: "🇧🇾 Беларусь" },
  { code: "+996", country: "🇰🇬 Кыргызстан" },
  { code: "+992", country: "🇹🇯 Таджикистан" },
  { code: "+993", country: "🇹🇲 Туркменистан" },
  { code: "+971", country: "🇦🇪 ОАЭ" },
  { code: "+90", country: "🇹🇷 Турция" },
  { code: "+33", country: "🇫🇷 Франция" },
  { code: "+39", country: "🇮🇹 Италия" },
  { code: "+34", country: "🇪🇸 Испания" },
  { code: "+44", country: "🇬🇧 Великобритания" },
  { code: "+1", country: "🇺🇸 США / Канада" },
  { code: "+86", country: "🇨🇳 Китай" },
  { code: "+81", country: "🇯🇵 Япония" },
  { code: "+82", country: "🇰🇷 Южная Корея" },
  { code: "+91", country: "🇮🇳 Индия" },
  { code: "+31", country: "🇳🇱 Нидерланды" },
  { code: "+32", country: "🇧🇪 Бельгия" },
  { code: "+41", country: "🇨🇭 Швейцария" },
  { code: "+43", country: "🇦🇹 Австрия" },
  { code: "+45", country: "🇩🇰 Дания" },
  { code: "+46", country: "🇸🇪 Швеция" },
  { code: "+47", country: "🇳🇴 Норвегия" },
  { code: "+48", country: "🇵🇱 Польша" },
  { code: "+351", country: "🇵🇹 Португалия" },
  { code: "+30", country: "🇬🇷 Греция" },
  { code: "+40", country: "🇷🇴 Румыния" },
  { code: "+359", country: "🇧🇬 Болгария" },
  { code: "+380", country: "🇺🇦 Украина" },
  { code: "+972", country: "🇮🇱 Израиль" },
  { code: "+974", country: "🇶🇦 Катар" },
  { code: "+966", country: "🇸🇦 Саудовская Аравия" },
  { code: "+994", country: "🇦🇿 Азербайджан" },
  { code: "+995", country: "🇬🇪 Грузия" },
  { code: "+98", country: "🇮🇷 Иран" },
  { code: "+93", country: "🇦🇫 Афганистан" },
  { code: "+92", country: "🇵🇰 Пакистан" },
  { code: "+880", country: "🇧🇩 Бангладеш" },
  { code: "+90", country: "🇹🇷 Турция" },
  { code: "+20", country: "🇪🇬 Египет" },
];

type QRMatrix = {
  size: number;
  get: (row: number, col: number) => boolean;
};

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

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCountryCode, setContactCountryCode] =
    useState("+998");

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

  const [logo, setLogo] =
    useState<string | null>(null);

  const [logoSize, setLogoSize] =
    useState(20);

  const [logoError, setLogoError] =
    useState("");

  const [generated, setGenerated] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [showWifiInfo, setShowWifiInfo] =
    useState(false);

  function isValidEmail(email: string) {
    if (!email.trim()) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );
  }

  function escapeWifi(value: string) {
    return value.replace(
      /([\\;,:"])/g,
      "\\$1"
    );
  }

  function escapeVCard(value: string) {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function getQRText() {
    if (mode === "Wi-Fi") {
      return `WIFI:T:${wifiSecurity};S:${escapeWifi(
        wifiSSID
      )};P:${escapeWifi(
        wifiPassword
      )};H:${wifiHidden ? "true" : "false"};;`;
    }

    if (mode === "Контакт") {
      if (
        contactEmail.trim() &&
        !isValidEmail(contactEmail)
      ) {
        return "";
      }

      const cleanPhone =
        contactPhone.replace(/[^\d]/g, "");

      const fullPhone =
        `${contactCountryCode}${cleanPhone}`;

      return `BEGIN:VCARD
VERSION:3.0
FN:${escapeVCard(contactName)}
TEL:${fullPhone}
EMAIL:${contactEmail.trim()}
END:VCARD`;
    }

    return text;
  }

  const qrText = getQRText();

  function hexToRgb(hex: string) {
    const clean = hex.replace("#", "");

    if (clean.length !== 6) {
      return null;
    }

    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }

  function getModuleColor(x: number, y: number) {
    if (!gradientEnabled) {
      return foreground;
    }

    const start = hexToRgb(foreground);
    const end = hexToRgb(gradientColor);

    if (!start || !end) {
      return foreground;
    }

    const t = Math.max(
      0,
      Math.min(1, (x + y) / 2)
    );

    const r = Math.round(
      start.r + (end.r - start.r) * t
    );

    const g = Math.round(
      start.g + (end.g - start.g) * t
    );

    const b = Math.round(
      start.b + (end.b - start.b) * t
    );

    return `rgb(${r}, ${g}, ${b})`;
  }

  function createMatrix(): QRMatrix | null {
    if (!qrText.trim()) {
      return null;
    }

    try {
      const qrCreator =
        QRCode as unknown as {
          create: (
            data: string,
            options: {
              errorCorrectionLevel: ErrorLevel;
            }
          ) => {
            modules: {
              size: number;
              get: (
                row: number,
                col: number
              ) => boolean;
            };
          };
        };

      const qr = qrCreator.create(
        qrText,
        {
          errorCorrectionLevel:
            errorLevel,
        }
      );

      return {
        size: qr.modules.size,
        get: qr.modules.get.bind(
          qr.modules
        ),
      };
    } catch (error) {
      console.error(
        "Matrix error:",
        error
      );

      return null;
    }
  }

  function isFinderArea(
    row: number,
    col: number,
    matrixSize: number
  ) {
    const areas = [
      { row: 0, col: 0 },
      {
        row: 0,
        col: matrixSize - 7,
      },
      {
        row: matrixSize - 7,
        col: 0,
      },
    ];

    return areas.some(
      (area) =>
        row >= area.row &&
        row < area.row + 7 &&
        col >= area.col &&
        col < area.col + 7
    );
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    const r = Math.min(
      radius,
      width / 2,
      height / 2
    );

    ctx.beginPath();

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + r
    );

    ctx.lineTo(
      x + width,
      y + height - r
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - r,
      y + height
    );

    ctx.lineTo(
      x + r,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - r
    );

    ctx.lineTo(x, y + r);

    ctx.quadraticCurveTo(
      x,
      y,
      x + r,
      y
    );

    ctx.closePath();
  }

  function drawFinder(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    module: number,
    color: string
  ) {
    const total = module * 7;

    ctx.save();

    ctx.fillStyle = color;

    if (cornerStyle === "round") {
      roundRect(
        ctx,
        x,
        y,
        total,
        total,
        module * 1.2
      );
      ctx.fill();
    } else {
      ctx.fillRect(
        x,
        y,
        total,
        total
      );
    }

    ctx.fillStyle = background;

    const inner = module * 5;

    if (cornerStyle === "round") {
      roundRect(
        ctx,
        x + module,
        y + module,
        inner,
        inner,
        module
      );
      ctx.fill();
    } else {
      ctx.fillRect(
        x + module,
        y + module,
        inner,
        inner
      );
    }

    ctx.fillStyle = color;

    const center = module * 3;

    if (cornerStyle === "round") {
      roundRect(
        ctx,
        x + module * 2,
        y + module * 2,
        center,
        center,
        module * 0.8
      );
      ctx.fill();
    } else {
      ctx.fillRect(
        x + module * 2,
        y + module * 2,
        center,
        center
      );
    }

    ctx.restore();
  }

  function drawModule(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    module: number,
    color: string
  ) {
    const gap =
      dotStyle === "soft"
        ? module * 0.08
        : 0;

    const px = x + gap;
    const py = y + gap;

    const width = module - gap * 2;

    ctx.fillStyle = color;

    if (dotStyle === "square") {
      ctx.fillRect(
        px,
        py,
        width,
        width
      );
      return;
    }

    if (dotStyle === "round") {
      ctx.beginPath();

      ctx.arc(
        x + module / 2,
        y + module / 2,
        width / 2,
        0,
        Math.PI * 2
      );

      ctx.fill();
      return;
    }

    roundRect(
      ctx,
      px,
      py,
      width,
      width,
      module * 0.28
    );

    ctx.fill();
  }

  async function drawLogo(
    ctx: CanvasRenderingContext2D,
    qrArea: number
  ) {
    if (!logo) return;

    await new Promise<void>(
      (resolve) => {
        const image = new Image();

        image.onload = () => {
          const logoPixels =
            qrArea *
            (logoSize / 100);

          const x =
            (size - logoPixels) / 2;

          const y =
            (qrArea - logoPixels) / 2;

          const padding =
            logoPixels * 0.13;

          ctx.save();

          ctx.fillStyle =
            background;

          roundRect(
            ctx,
            x - padding,
            y - padding,
            logoPixels +
              padding * 2,
            logoPixels +
              padding * 2,
            logoPixels * 0.14
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

        image.onerror = () =>
          resolve();

        image.src = logo;
      }
    );
  }

  function drawCaption(
    ctx: CanvasRenderingContext2D,
    qrArea: number
  ) {
    const fontSize =
      Math.max(
        20,
        Math.floor(size * 0.032)
      );

    ctx.save();

    ctx.fillStyle =
      foreground;

    ctx.font =
      `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      caption,
      size / 2,
      qrArea +
        (size - qrArea) / 2
    );

    ctx.restore();
  }

  async function renderQR() {
    const canvas =
      canvasRef.current;

    if (!canvas || !qrText.trim()) {
      setGenerated(false);
      return;
    }

    const matrix =
      createMatrix();

    if (!matrix) {
      setGenerated(false);
      return;
    }

    const captionSpace =
      captionEnabled
        ? Math.floor(size * 0.12)
        : 0;

    const qrArea =
      size - captionSpace;

    canvas.width = size;
    canvas.height = size;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      size,
      size
    );

    ctx.fillStyle =
      background;

    ctx.fillRect(
      0,
      0,
      size,
      size
    );

    const quiet =
      Math.max(
        12,
        Math.floor(size * 0.035)
      );

    const available =
      qrArea - quiet * 2;

    const module =
      available / matrix.size;

    for (
      let row = 0;
      row < matrix.size;
      row++
    ) {
      for (
        let col = 0;
        col < matrix.size;
        col++
      ) {
        if (
          !matrix.get(
            row,
            col
          )
        ) {
          continue;
        }

        if (
          isFinderArea(
            row,
            col,
            matrix.size
          )
        ) {
          continue;
        }

        const x =
          quiet +
          col * module;

        const y =
          quiet +
          row * module;

        const color =
          getModuleColor(
            col /
              Math.max(
                1,
                matrix.size - 1
              ),
            row /
              Math.max(
                1,
                matrix.size - 1
              )
          );

        drawModule(
          ctx,
          x,
          y,
          module,
          color
        );
      }
    }

    drawFinder(
      ctx,
      quiet,
      quiet,
      module,
      foreground
    );

    drawFinder(
      ctx,
      quiet +
        (matrix.size - 7) *
          module,
      quiet,
      module,
      foreground
    );

    drawFinder(
      ctx,
      quiet,
      quiet +
        (matrix.size - 7) *
          module,
      module,
      foreground
    );

    if (borderEnabled) {
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
        qrArea - borderWidth
      );

      ctx.restore();
    }

    if (logo) {
      await drawLogo(
        ctx,
        qrArea
      );
    }

    if (captionEnabled) {
      drawCaption(
        ctx,
        qrArea
      );
    }

    setGenerated(true);
  }

  function createSvgModule(
    x: number,
    y: number,
    module: number,
    color: string
  ) {
    const gap =
      dotStyle === "soft"
        ? module * 0.08
        : 0;

    const px = x + gap;
    const py = y + gap;

    const width =
      module - gap * 2;

    if (dotStyle === "square") {
      return `<rect x="${px}" y="${py}" width="${width}" height="${width}" fill="${escapeXml(
        color
      )}"/>`;
    }

    if (dotStyle === "round") {
      return `<circle cx="${
        x + module / 2
      }" cy="${
        y + module / 2
      }" r="${
        width / 2
      }" fill="${escapeXml(
        color
      )}"/>`;
    }

    return `<rect x="${px}" y="${py}" width="${width}" height="${width}" rx="${
      module * 0.28
    }" fill="${escapeXml(
      color
    )}"/>`;
  }

  function createSvgFinder(
    x: number,
    y: number,
    module: number,
    color: string
  ) {
    const total =
      module * 7;

    const inner =
      module * 5;

    const center =
      module * 3;

    const radius =
      cornerStyle === "round"
        ? module * 1.2
        : 0;

    const innerRadius =
      cornerStyle === "round"
        ? module
        : 0;

    const centerRadius =
      cornerStyle === "round"
        ? module * 0.8
        : 0;

    return `
<rect
  x="${x}"
  y="${y}"
  width="${total}"
  height="${total}"
  rx="${radius}"
  fill="${escapeXml(color)}"/>

<rect
  x="${x + module}"
  y="${y + module}"
  width="${inner}"
  height="${inner}"
  rx="${innerRadius}"
  fill="${escapeXml(background)}"/>

<rect
  x="${x + module * 2}"
  y="${y + module * 2}"
  width="${center}"
  height="${center}"
  rx="${centerRadius}"
  fill="${escapeXml(color)}"/>`;
  }

  function escapeXml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  async function downloadPNG() {
    if (!qrText.trim()) return;

    try {
      setDownloading(true);

      await renderQR();

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

      const link =
        document.createElement("a");

      link.href = dataUrl;

      link.download =
        `qr-pro-${size}x${size}.png`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );
    } catch (error) {
      console.error(error);

      alert(
        "Не удалось создать PNG."
      );
    } finally {
      setDownloading(false);
    }
  }

  async function downloadSVG() {
    if (!qrText.trim()) return;

    try {
      setDownloading(true);

      const matrix =
        createMatrix();

      if (!matrix) {
        throw new Error(
          "Matrix unavailable"
        );
      }

      const captionSpace =
        captionEnabled
          ? Math.floor(size * 0.12)
          : 0;

      const qrArea =
        size - captionSpace;

      const quiet =
        Math.max(
          12,
          Math.floor(size * 0.035)
        );

      const available =
        qrArea - quiet * 2;

      const module =
        available / matrix.size;

      const parts: string[] = [];

      parts.push(
        `<rect x="0" y="0" width="${size}" height="${size}" fill="${escapeXml(
          background
        )}"/>`
      );

      for (
        let row = 0;
        row < matrix.size;
        row++
      ) {
        for (
          let col = 0;
          col < matrix.size;
          col++
        ) {
          if (
            !matrix.get(
              row,
              col
            )
          ) {
            continue;
          }

          if (
            isFinderArea(
              row,
              col,
              matrix.size
            )
          ) {
            continue;
          }

          const x =
            quiet +
            col * module;

          const y =
            quiet +
            row * module;

          const color =
            getModuleColor(
              col /
                Math.max(
                  1,
                  matrix.size - 1
                ),
              row /
                Math.max(
                  1,
                  matrix.size - 1
                )
            );

          parts.push(
            createSvgModule(
              x,
              y,
              module,
              color
            )
          );
        }
      }

      parts.push(
        createSvgFinder(
          quiet,
          quiet,
          module,
          foreground
        )
      );

      parts.push(
        createSvgFinder(
          quiet +
            (matrix.size - 7) *
              module,
          quiet,
          module,
          foreground
        )
      );

      parts.push(
        createSvgFinder(
          quiet,
          quiet +
            (matrix.size - 7) *
              module,
          module,
          foreground
        )
      );

      if (borderEnabled) {
        parts.push(
          `<rect x="${
            borderWidth / 2
          }" y="${
            borderWidth / 2
          }" width="${
            size - borderWidth
          }" height="${
            qrArea - borderWidth
          }" fill="none" stroke="${
            gradientEnabled
              ? gradientColor
              : foreground
          }" stroke-width="${borderWidth}"/>`
        );
      }

      if (logo) {
        const logoPixels =
          qrArea *
          (logoSize / 100);

        const x =
          (size - logoPixels) / 2;

        const y =
          (qrArea - logoPixels) / 2;

        const padding =
          logoPixels * 0.13;

        parts.push(
          `<rect x="${
            x - padding
          }" y="${
            y - padding
          }" width="${
            logoPixels +
            padding * 2
          }" height="${
            logoPixels +
            padding * 2
          }" rx="${
            logoPixels * 0.14
          }" fill="${escapeXml(
            background
          )}"/>`
        );

        parts.push(
          `<image href="${escapeXml(
            logo
          )}" x="${x}" y="${y}" width="${logoPixels}" height="${logoPixels}" preserveAspectRatio="xMidYMid meet"/>`
        );
      }

      if (captionEnabled) {
        const fontSize =
          Math.max(
            20,
            Math.floor(
              size * 0.032
            )
          );

        parts.push(
          `<text x="${
            size / 2
          }" y="${
            qrArea +
            (size - qrArea) / 2
          }" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="${escapeXml(
            foreground
          )}">${escapeXml(
            caption
          )}</text>`
        );
      }

      const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
width="${size}"
height="${size}"
viewBox="0 0 ${size} ${size}">
${parts.join("\n")}
</svg>`;

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
        document.createElement("a");

      link.href = url;

      link.download =
        `qr-pro-${size}x${size}.svg`;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      setTimeout(
        () =>
          URL.revokeObjectURL(url),
        1000
      );
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

  function handleLogoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setLogoError("");

    if (
      !file.type.startsWith("image/")
    ) {
      setLogoError(
        "Можно загружать только изображения."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setLogoError(
        "Размер логотипа не должен превышать 5 МБ."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setLogo(
          reader.result
        );
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
      logoInputRef.current.value =
        "";
    }
  }

  function applyPreset(
    value: Preset
  ) {
    setPreset(value);

    if (value === "classic") {
      setForeground("#000000");
      setBackground("#ffffff");
      setGradientEnabled(false);
      setDotStyle("square");
      setCornerStyle("square");
      setBorderEnabled(false);
      setCaptionEnabled(false);
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
    }

    if (value === "neon") {
      setForeground("#7c3aed");
      setBackground("#050505");
      setGradientEnabled(true);
      setGradientColor("#06b6d4");
      setDotStyle("round");
      setCornerStyle("round");
      setBorderEnabled(true);
      setBorderWidth(20);
      setCaptionEnabled(true);
      setCaption("SCAN ME");
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

  function clearAll() {
    setText("");

    setWifiSSID("");
    setWifiPassword("");
    setWifiSecurity("WPA");
    setWifiHidden(false);

    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setContactCountryCode("+998");

    setLogo(null);
    setLogoError("");

    setForeground("#000000");
    setBackground("#ffffff");

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
      logoInputRef.current.value =
        "";
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!qrText.trim()) {
        setGenerated(false);
        return;
      }

      try {
        if (!cancelled) {
          await renderQR();
        }
      } catch (error) {
        console.error(
          "QR render error:",
          error
        );

        if (!cancelled) {
          setGenerated(false);
        }
      }
    }

    run();

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

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

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

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-7">

            <h2 className="mb-1 text-xl font-semibold">
              Design Studio
            </h2>

            <p className="mb-6 text-sm text-slate-400">
              Создайте собственный QR-код.
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
                    setText(
                      e.target.value
                    )
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

            {/* CONTACT */}

            {mode === "Контакт" && (

              <div className="mb-6 space-y-4">

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    👤 ФИО
                  </label>

                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) =>
                      setContactName(
                        e.target.value
                      )
                    }
                    placeholder="Иван Иванов"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    📱 Номер телефона
                  </label>

                  <div className="flex gap-2">

                    <select
                      value={
                        contactCountryCode
                      }
                      onChange={(e) =>
                        setContactCountryCode(
                          e.target.value
                        )
                      }
                      className="w-[155px] shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-white"
                    >

                      {countryCodes.map(
                        (item) => (

                          <option
                            key={`${item.country}-${item.code}`}
                            value={item.code}
                          >
                            {item.country}{" "}
                            {item.code}
                          </option>

                        )
                      )}

                    </select>

                    <input
                      type="tel"
                      value={
                        contactPhone
                      }
                      onChange={(e) =>
                        setContactPhone(
                          e.target.value
                        )
                      }
                      placeholder="90 123 45 67"
                      className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Выберите код страны и введите номер без кода страны.
                  </p>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    📧 Email
                  </label>

                  <input
                    type="email"
                    value={
                      contactEmail
                    }
                    onChange={(e) =>
                      setContactEmail(
                        e.target.value
                      )
                    }
                    placeholder="example@mail.com"
                    className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 ${
                      contactEmail &&
                      !isValidEmail(
                        contactEmail
                      )
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-700 focus:border-white"
                    }`}
                  />

                  {contactEmail &&
                    !isValidEmail(
                      contactEmail
                    ) && (

                      <div className="mt-2 rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-400">
                        ❌ Неверный Email. Используйте формат: example@mail.com
                      </div>

                    )}

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-500">
                  💡 После сканирования пользователь сможет добавить этот контакт прямо в телефон.
                </div>

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
                      value={
                        wifiSSID
                      }
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
                      onClick={() =>
                        setShowWifiInfo(
                          true
                        )
                      }
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

                    📶 Веб-приложение на iPhone не может получить список доступных Wi-Fi сетей.

                    <button
                      type="button"
                      onClick={() =>
                        setShowWifiInfo(
                          false
                        )
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
                    value={
                      wifiPassword
                    }
                    onChange={(e) =>
                      setWifiPassword(
                        e.target.value
                      )
                    }
                    disabled={
                      wifiSecurity ===
                      "nopass"
                    }
                    placeholder="Пароль Wi-Fi"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-white disabled:opacity-40"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Защита
                  </label>

                  <select
                    value={
                      wifiSecurity
                    }
                    onChange={(e) =>
                      setWifiSecurity(
                        e.target
                          .value as WifiSecurity
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
                    checked={
                      wifiHidden
                    }
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

            {/* PRESETS */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                ✨ Пресеты
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                {(
                  [
                    ["classic", "Classic"],
                    ["modern", "Modern"],
                    ["neon", "Neon"],
                    ["business", "Business"],
                  ] as [
                    Preset,
                    string
                  ][]
                ).map(
                  ([value, label]) => (

                    <button
                      key={value}
                      onClick={() =>
                        applyPreset(
                          value
                        )
                      }
                      className={`rounded-xl border p-3 text-sm ${
                        preset === value
                          ? "border-white bg-white text-slate-950"
                          : "border-slate-700"
                      }`}
                    >
                      {label}
                    </button>

                  )
                )}

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
                    Цвет QR
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="color"
                      value={
                        foreground
                      }
                      onChange={(e) =>
                        setForeground(
                          e.target.value
                        )
                      }
                      className="h-11 w-16 rounded-xl"
                    />

                    <input
                      value={
                        foreground
                      }
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
                      value={
                        background
                      }
                      onChange={(e) =>
                        setBackground(
                          e.target.value
                        )
                      }
                      className="h-11 w-16 rounded-xl"
                    />

                    <input
                      value={
                        background
                      }
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

              <label className="flex items-center justify-between">

                <div>

                  <div className="font-semibold">
                    🌈 Градиент
                  </div>

                  <div className="text-xs text-slate-500">
                    Только модули QR
                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={
                    gradientEnabled
                  }
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
                    value={
                      gradientColor
                    }
                    onChange={(e) =>
                      setGradientColor(
                        e.target.value
                      )
                    }
                    className="h-11 w-16 rounded-xl"
                  />

                  <input
                    value={
                      gradientColor
                    }
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

            {/* DOTS */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                ⚫ Форма точек
              </label>

              <div className="grid grid-cols-3 gap-2">

                <button
                  onClick={() =>
                    setDotStyle(
                      "square"
                    )
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    dotStyle === "square"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  ■ Квадрат
                </button>

                <button
                  onClick={() =>
                    setDotStyle(
                      "round"
                    )
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    dotStyle === "round"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  ● Круг
                </button>

                <button
                  onClick={() =>
                    setDotStyle(
                      "soft"
                    )
                  }
                  className={`rounded-xl border p-3 text-sm ${
                    dotStyle === "soft"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  ▣ Soft
                </button>

              </div>

            </div>

            {/* CORNERS */}

            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                🔲 Углы
              </label>

              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    setCornerStyle(
                      "square"
                    )
                  }
                  className={`rounded-xl border p-3 ${
                    cornerStyle === "square"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  ■ Квадратные
                </button>

                <button
                  onClick={() =>
                    setCornerStyle(
                      "round"
                    )
                  }
                  className={`rounded-xl border p-3 ${
                    cornerStyle === "round"
                      ? "border-white bg-white text-slate-950"
                      : "border-slate-700"
                  }`}
                >
                  ● Круглые
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
                    onChange={
                      handleLogoUpload
                    }
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
                      onClick={
                        removeLogo
                      }
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
                              logoSize === value
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
                    Рамка вокруг QR
                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={
                    borderEnabled
                  }
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
                    value={
                      borderWidth
                    }
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
                  checked={
                    captionEnabled
                  }
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
                  value={
                    caption
                  }
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

                {sizes.map(
                  (value) => (

                    <button
                      key={value}
                      onClick={() =>
                        setSize(
                          value
                        )
                      }
                      className={`rounded-xl border p-3 text-sm ${
                        size === value
                          ? "border-white bg-white text-slate-950"
                          : "border-slate-700"
                      }`}
                    >
                      {value}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* ERROR LEVEL */}

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
                        errorLevel === level
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

            </div>

            {/* DOWNLOAD */}

            <div className="grid grid-cols-2 gap-3">

              <button
                onClick={
                  clearAll
                }
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm font-semibold"
              >
                Очистить
              </button>

              <button
                onClick={
                  downloadPNG
                }
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
                onClick={
                  downloadSVG
                }
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
                ref={
                  canvasRef
                }
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
                    Точки
                  </span>

                  <span>
                    {dotStyle === "square"
                      ? "Квадрат"
                      : dotStyle === "round"
                      ? "Круг"
                      : "Soft"}
                  </span>

                </div>

                <div className="mt-2 flex justify-between">

                  <span className="text-slate-500">
                    Углы
                  </span>

                  <span>
                    {cornerStyle === "square"
                      ? "Квадратные"
                      : "Круглые"}
                  </span>

                </div>

                {mode === "Контакт" &&
                  contactPhone && (

                    <div className="mt-2 flex justify-between">

                      <span className="text-slate-500">
                        Телефон
                      </span>

                      <span>
                        {contactCountryCode}{" "}
                        {contactPhone}
                      </span>

                    </div>

                  )}

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
