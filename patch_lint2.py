import re
with open("src/components/LearningCalendar.tsx", "r") as f:
    content = f.read()

content = content.replace("Record<string, any>", "Record<string, unknown>")

with open("src/components/LearningCalendar.tsx", "w") as f:
    f.write(content)
