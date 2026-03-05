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

    const CLOUDCONVERT_API_KEY = Deno.env.get("CLOUDCONVERT_API_KEY");

    if (!CLOUDCONVERT_API_KEY) {
      return new Response(
        JSON.stringify({ error: "CloudConvert API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const docxBuffer = await docxFile.arrayBuffer();
    const base64Docx = btoa(String.fromCharCode(...new Uint8Array(docxBuffer)));

    const jobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOUDCONVERT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "import-docx": {
            operation: "import/base64",
            file: base64Docx,
            filename: docxFile.name,
          },
          "convert-to-pdf": {
            operation: "convert",
            input: "import-docx",
            output_format: "pdf",
          },
          "export-pdf": {
            operation: "export/url",
            input: "convert-to-pdf",
          },
        },
      }),
    });

    if (!jobResponse.ok) {
      const errorText = await jobResponse.text();
      throw new Error(`CloudConvert job creation failed: ${errorText}`);
    }

    const jobData = await jobResponse.json();
    const jobId = jobData.data.id;

    let jobStatus = jobData.data.status;
    let attempts = 0;
    const maxAttempts = 30;

    while (jobStatus !== "finished" && jobStatus !== "error" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
        headers: {
          "Authorization": `Bearer ${CLOUDCONVERT_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error("Failed to check job status");
      }

      const statusData = await statusResponse.json();
      jobStatus = statusData.data.status;
      attempts++;

      if (jobStatus === "finished") {
        const exportTask = statusData.data.tasks.find((t: any) => t.name === "export-pdf");
        if (exportTask && exportTask.result && exportTask.result.files && exportTask.result.files.length > 0) {
          const pdfUrl = exportTask.result.files[0].url;

          const pdfResponse = await fetch(pdfUrl);
          if (!pdfResponse.ok) {
            throw new Error("Failed to download PDF");
          }

          const pdfBuffer = await pdfResponse.arrayBuffer();

          return new Response(pdfBuffer, {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${docxFile.name.replace('.docx', '.pdf')}"`,
            },
          });
        }
      }
    }

    if (jobStatus === "error") {
      throw new Error("CloudConvert job failed");
    }

    if (attempts >= maxAttempts) {
      throw new Error("Conversion timeout");
    }

    throw new Error("Unexpected error in conversion process");

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
