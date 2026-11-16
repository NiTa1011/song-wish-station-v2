import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X, Smartphone } from "lucide-react";

/*
 * QR code that stays visible in the top-left corner next to the form, so people
 * at the whiteboard can type their wish while others scan it with their phone.
 *
 * - Toggle with the "QR-Code" button below the form (only on larger screens).
 * - The choice is remembered on this device, so the whiteboard keeps showing it.
 * - ?qr=1 in the URL turns it on (handy as whiteboard bookmark), ?qr=0 off.
 */

const STORAGE_KEY = "qr-panel-visible";
const EVENT = "qr-panel-toggle";

const readInitial = (): boolean => {
  try {
    const param = new URLSearchParams(window.location.search).get("qr");
    if (param === "1") localStorage.setItem(STORAGE_KEY, "1");
    if (param === "0") localStorage.removeItem(STORAGE_KEY);
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const setVisible = (visible: boolean) => {
  try {
    if (visible) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: visible }));
};

const useQrVisible = () => {
  const [visible, setState] = useState(readInitial);
  useEffect(() => {
    const onToggle = (e: Event) => setState((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, onToggle);
    return () => window.removeEventListener(EVENT, onToggle);
  }, []);
  return visible;
};

/**
 * The button below the form that shows the corner QR code.
 * Once the QR code is visible the button disappears, so nobody at the
 * whiteboard hides it by accident – only the ✕ on the panel closes it.
 */
export const QrCodeToggle = () => {
  const visible = useQrVisible();
  if (visible) return null;
  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="hidden md:inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-semibold"
    >
      <QrCode className="w-4 h-4" />
      <span className="text-sm">QR-Code anzeigen</span>
    </button>
  );
};

/** The QR code itself, pinned to the top-left corner. */
export const QrCodePanel = () => {
  const visible = useQrVisible();
  if (!visible) return null;

  const url = `${window.location.origin}/`;

  return (
    <aside
      className="hidden md:block fixed top-4 left-4 lg:top-6 lg:left-6 z-20 glass-card rounded-3xl p-4 lg:p-5 text-center animate-fade-in"
      aria-label="QR-Code zum Wünschen per Handy"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="QR-Code ausblenden"
        title="QR-Code ausblenden"
      >
        <X className="w-4 h-4" />
      </button>

      <p className="flex items-center justify-center gap-1.5 font-extrabold text-base lg:text-lg mb-3 pr-5">
        <Smartphone className="w-5 h-5 text-primary" />
        Per Handy wünschen
      </p>

      {/* Always dark-on-white with a quiet zone, so every phone can scan it in any theme */}
      <div className="bg-white p-3 rounded-2xl">
        <QRCodeSVG
          value={url}
          level="M"
          marginSize={0}
          bgColor="#ffffff"
          fgColor="#111111"
          className="block w-[clamp(10rem,24vmin,20rem)] h-auto aspect-square"
          title={`QR-Code für ${window.location.host}`}
        />
      </div>

      <p className="mt-3 text-sm lg:text-base font-bold text-foreground/80 break-all max-w-[clamp(10rem,24vmin,20rem)] mx-auto">
        {window.location.host}
      </p>
    </aside>
  );
};
