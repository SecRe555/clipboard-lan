"use client";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { Toaster, toast } from "sonner";
import type { ClipboardItem } from "./api/clipboard/route";

const MAX_TEXTAREA_HEIGHT = 240;
const REFRESH_INTERVAL = 60000;

export default function Home() {
  const [text, setText] = useState("");
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT
    )}px`;
  };

  const fetchClipboard = async () => {
    try {
      const res = await fetch("/api/clipboard");
      if (res.ok) {
        const data: ClipboardItem[] = await res.json();
        setClipboard(data);
        toast.success("Portapales actualizado")
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar")
    }
  };

  const sendText = async () => {
    if (!text.replace(/\s/g, "").length) return;

    try {
      const res = await fetch("/api/clipboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        setText("");
        fetchClipboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyToClipboard = async (item: ClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.text);
      toast.success("¡Copiado al portapapeles!");
    } catch (err) {
      console.error("Error al copiar:", err);
      toast.error("Error al copiar");
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      if (text.trim()) {
        await sendText();
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  useEffect(() => adjustTextareaHeight(), [text]);

  useEffect(() => {
    fetchClipboard();
    const interval = setInterval(fetchClipboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Toaster position="bottom-right" duration={2500} richColors />
      <main className="w-full h-full flex flex-col gap-10 p-10 overflow-hidden">
        <h1 className="text-2xl">Portapapeles compartido GPC</h1>

        <article className="flex flex-col gap-4 w-full border border-gray-500 rounded p-5">
          <header>
            <h2 className="text-xl">Envio de texto</h2>
          </header>
          <div className="flex gap-4 items-center">
            <textarea
              className="w-full border border-gray-500 rounded p-2 box-border"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe algo..."
              style={{
                width: "100%",
                minHeight: "24px",
                overflow: "hidden",
                resize: "none",
              }}
            />
            <button
              className="w-11 h-11 flex justify-center items-center aspect-square bg-gray-500 hover:bg-gray-400 rounded cursor-pointer active:scale-90 transition-transform"
              onClick={sendText}
            >
              <Icon icon="tabler:send" />
            </button>
          </div>
        </article>

        <section className="grow flex flex-col gap-5 border border-gray-500 rounded p-5 overflow-y-auto">
          <span className="flex justify-between items-center">
            <h2 className="text-xl">Portapapeles</h2>
            <button
              className="w-11 h-11 flex justify-center items-center aspect-square bg-gray-500 hover:bg-gray-400 rounded cursor-pointer active:scale-90 transition-transform"
              onClick={fetchClipboard}
            >
              <Icon icon="tabler:reload" />
            </button>
          </span>
          <ul className="flex flex-col gap-2">
            {clipboard.map((item) => (
              <li key={item.id} className="flex gap-2 items-center">
                <div
                  className="grow p-2 border hover:bg-gray-800 border-gray-300 rounded break-words flex flex-col gap-1 cursor-pointer"
                  onClick={() => handleCopyToClipboard(item)}
                >
                  <span className="whitespace-pre-wrap">{item.text}</span>
                  <span className="text-xs text-gray-500">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <button
                  className="w-11 h-11 flex justify-center items-center aspect-square bg-gray-500 hover:bg-gray-400 rounded cursor-pointer active:scale-90 transition-transform"
                  onClick={() => handleCopyToClipboard(item)}
                >
                  <Icon icon="tabler:copy" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
