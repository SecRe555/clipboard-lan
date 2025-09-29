// app/api/clipboard/route.ts
import { NextRequest, NextResponse } from "next/server";

export type ClipboardItem = {
  id: number;
  text: string;
  createdAt: string; // ISO string
};

let clipboard: ClipboardItem[] = [];

// GET: devuelve todos los items
export async function GET() {
  try {
    return NextResponse.json(clipboard);
  } catch (err) {
    console.error("Error en GET:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: agrega un item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Texto vacío" },
        { status: 400 }
      );
    }

    const id = Date.now();
    const createdAt = new Date().toISOString(); // guardamos la fecha/hora actual
    clipboard.unshift({ id, text, createdAt });

    // Borrar después de 5 minutos
    setTimeout(() => {
      clipboard = clipboard.filter((item) => item.id !== id);
    }, 5 * 60 * 1000);

    return NextResponse.json({ success: true, id, text, createdAt });
  } catch (err) {
    console.error("Error en POST:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
