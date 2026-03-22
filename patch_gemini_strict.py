import glob

files = glob.glob("src/app/api/**/route.ts", recursive=True)
for file in files:
    with open(file, "r") as f:
        content = f.read()

    # The user is probably passing "gemini-1.5-flash". We want to mutate this before it hits the API if it's strictly that string.
    # Actually, the user can just be given `model: (process.env.GEMINI_MODEL === "gemini-1.5-flash" ? "gemini-1.5-flash-latest" : process.env.GEMINI_MODEL) || "gemini-1.5-flash-latest"`
    # But let's just do it right before `generateContent`

    content = content.replace(
        'model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest",',
        'model: process.env.GEMINI_MODEL === "gemini-1.5-flash" ? "gemini-1.5-flash-latest" : (process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"),'
    )
    # The previous string was `process.env.GEMINI_MODEL || "gemini-1.5-flash"` originally.
    content = content.replace(
        'model: process.env.GEMINI_MODEL || "gemini-1.5-flash",',
        'model: process.env.GEMINI_MODEL === "gemini-1.5-flash" ? "gemini-1.5-flash-latest" : (process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"),'
    )

    with open(file, "w") as f:
        f.write(content)
