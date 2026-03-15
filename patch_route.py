with open("src/app/api/problems/[id]/route.ts", "r") as f:
    content = f.read()

content = content.replace("params }: { params: { id: string } }", "params }: { params: Promise<{ id: string }> }")
with open("src/app/api/problems/[id]/route.ts", "w") as f:
    f.write(content)
