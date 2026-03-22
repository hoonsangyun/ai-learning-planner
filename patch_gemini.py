import glob

files = glob.glob("src/app/api/**/route.ts", recursive=True)
for file in files:
    with open(file, "r") as f:
        content = f.read()

    # We will override the fallback and force gemini-1.5-flash-latest if the value is gemini-1.5-flash
    # Or just use process.env.GEMINI_MODEL === "gemini-1.5-flash" ? "gemini-1.5-flash-latest" : process.env.GEMINI_MODEL

    replacement = 'process.env.GEMINI_MODEL === "gemini-1.5-flash" ? "gemini-1.5-flash-latest" : (process.env.GEMINI_MODEL || "gemini-1.5-flash-latest")'

    content = content.replace('process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"', replacement)

    with open(file, "w") as f:
        f.write(content)
