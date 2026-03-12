"use client";

import { useState, useEffect } from "react";
import { Download, Copy, Check, QrCode } from "lucide-react";
import Image from "next/image";

interface QRGeneratorProps {
  url: string;
  onClose?: () => void;
}

export default function QRGenerator({ url, onClose }: QRGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadQR = async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: { dark: "#262d2e", light: "#FFFFFF" },
        });
        setQrDataUrl(dataUrl);
      } catch {
        // 폴백
      }
    };
    loadQR();
  }, [url]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `metabook-qr-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 폴백
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-mono-900 mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary-500" />
          QR 코드
        </h3>

        {/* QR 미리보기 */}
        <div className="bg-white border border-mono-200 rounded-xl p-4 flex items-center justify-center mb-4">
          {qrDataUrl ? (
            <Image src={qrDataUrl} alt="QR Code" width={192} height={192} unoptimized />
          ) : (
            <div className="w-48 h-48 bg-mono-100 rounded-xl animate-pulse flex items-center justify-center">
              <QrCode className="w-12 h-12 text-mono-300" />
            </div>
          )}
        </div>

        {/* URL 표시 */}
        <p className="text-xs text-mono-500 bg-mono-50 p-3 rounded-lg break-all mb-4">
          {url}
        </p>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-mono-200 rounded-xl text-sm font-medium hover:bg-mono-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-primary-500" /> 복사됨
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> URL 복사
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" /> PNG 저장
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-mono-500 hover:text-mono-700"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
