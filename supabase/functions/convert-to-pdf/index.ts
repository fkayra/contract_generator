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

    const docxBuffer = await docxFile.arrayBuffer();
    const inputPath = `/tmp/input_${Date.now()}.docx`;
    const outputPath = `/tmp/output_${Date.now()}.pdf`;

    await Deno.writeFile(inputPath, new Uint8Array(docxBuffer));

    const command = new Deno.Command("libreoffice", {
      args: [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        "/tmp",
        inputPath,
      ],
    });

    const { code, stderr } = await command.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`LibreOffice conversion failed: ${errorText}`);
    }

    const expectedOutputPath = inputPath.replace('.docx', '.pdf');
    const pdfBuffer = await Deno.readFile(expectedOutputPath);

    await Deno.remove(inputPath);
    await Deno.remove(expectedOutputPath);

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
