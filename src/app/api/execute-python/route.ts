import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "No Python code provided" }, { status: 400 });
    }

    // We inject a snippet to capture plt.show() into a base64 string and print it to stdout.
    const codeWithNoShow = code.replace(/plt\.show\(\)/g, "");

    const modifiedCode = `
import io
import sys
import base64
import matplotlib
matplotlib.use('Agg') # Ensure no GUI popup
import matplotlib.pyplot as plt

${codeWithNoShow}

# Save plot to base64
buf = io.BytesIO()
plt.savefig(buf, format='png', bbox_inches='tight')
buf.seek(0)
img_base64 = base64.b64encode(buf.read()).decode('utf-8')
print("BASE64_START")
print(img_base64)
print("BASE64_END")
`;

    // Create a temporary file
    const tempDir = os.tmpdir();
    const fileName = "plot_" + Date.now() + "_" + Math.floor(Math.random() * 10000) + ".py";
    const filePath = path.join(tempDir, fileName);

    await fs.writeFile(filePath, modifiedCode, "utf-8");

    try {
      // Execute the python script with a timeout of 10 seconds
      const { stdout, stderr } = await execAsync("python3 " + filePath, { timeout: 10000 });

      // Extract base64 string
      const match = stdout.match(/BASE64_START\n([\s\S]*?)\nBASE64_END/);
      if (match && match[1]) {
        const base64Data = match[1].trim();
        return NextResponse.json({ base64: base64Data });
      } else {
        console.error("Python Execution Stderr:", stderr);
        console.error("Python Execution Stdout:", stdout);
        return NextResponse.json({ error: "Failed to generate image from code", details: stderr }, { status: 500 });
      }
    } catch (execError: any) {
      console.error("Execution error:", execError);
      return NextResponse.json({ error: "Python execution failed", details: execError.message }, { status: 500 });
    } finally {
      // Cleanup temp file
      await fs.unlink(filePath).catch(e => console.error("Failed to delete temp file:", e));
    }
  } catch (error) {
    console.error("Python API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
