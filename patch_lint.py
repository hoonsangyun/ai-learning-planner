with open("src/components/LearningCalendar.tsx", "r") as f:
    content = f.read()

content = content.replace("const [problems, setProblems] = useState<any[]>([]);", "const [problems, setProblems] = useState<Record<string, any>[]>([]);")
content = content.replace("const handleProblemClick = (problem: any) => {", "const handleProblemClick = (problem: Record<string, any>) => {")

with open("src/components/LearningCalendar.tsx", "w") as f:
    f.write(content)
