import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

new_problem_fields = """
  title                String?
  problemFormalization String?
  diagramGeneration    String?
  solutionSteps        String? // Stores JSON stringified array of steps
  finalAnswer          String?
  formulasStr          String? // Store simple formulas array as JSON string
"""

content = re.sub(r'(model Problem \{[^}]*?)( \})', r'\1' + new_problem_fields + r'\2', content)

# ensure provider is sqlite
content = content.replace('provider = "prisma-client-js"', 'provider = "prisma-client-js"')
content = content.replace('datasource db {\n  url      = "file:./dev.db"\n  provider = "sqlite"\n\n}', 'datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}')
with open("prisma/schema.prisma", "w") as f:
    f.write(content)
