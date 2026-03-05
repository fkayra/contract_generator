import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const docxFile = formData.get("file") as File;

    if (!docxFile) {
      return new Response(
        JSON.stringify({ error: "File is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Google API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const docxBuffer = await docxFile.arrayBuffer();
    const base64Docx = btoa(
      new Uint8Array(docxBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const uploadResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=media&key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
        body: new Uint8Array(docxBuffer),
      }
    );

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload to Google Drive");
    }

    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;

    const exportResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf&key=${GOOGLE_API_KEY}`,
      {
        method: "GET",
      }
    );

    if (!exportResponse.ok) {
      throw new Error("Failed to export PDF");
    }

    const pdfBuffer = await exportResponse.arrayBuffer();

    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?key=${GOOGLE_API_KEY}`,
      {
        method: "DELETE",
      }
    );

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${docxFile.name.replace('.docx', '.pdf')}"`,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
