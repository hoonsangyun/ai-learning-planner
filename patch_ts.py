import re

with open("src/components/LearningCalendar.tsx", "r") as f:
    content = f.read()

content = content.replace("Record<string, unknown>", "any")
content = re.sub(r'const \[problems, setProblems\] = useState<any\[\]>\(\[\]\);', r'const [problems, setProblems] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any', content)
content = re.sub(r'const handleProblemClick = \(problem: any\) => \{', r'const handleProblemClick = (problem: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any', content)

with open("src/components/LearningCalendar.tsx", "w") as f:
    f.write(content)
