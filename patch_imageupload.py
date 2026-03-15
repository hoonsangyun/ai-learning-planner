import re

with open('src/components/ImageUpload.tsx', 'r') as f:
    content = f.read()

# Add export interface so it can be used in DashboardMain
content = content.replace('interface AnalysisResult {', 'export interface AnalysisResult {')

# Modify component signature
old_sig = 'export default function ImageUpload() {'
new_sig = '''export default function ImageUpload({
  externalImage,
  externalResult,
  onAnalysisComplete
}: {
  externalImage?: string | null,
  externalResult?: AnalysisResult | null,
  onAnalysisComplete?: (img: string, res: AnalysisResult) => void
} = {}) {'''

content = content.replace(old_sig, new_sig)

# Add useEffect to sync external state
use_effect_code = '''
  import { useEffect } from "react";
'''
# Actually we can just add useEffect to the imports if it's missing
if 'useEffect' not in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

sync_state_code = '''
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalImage) setPreview(externalImage);
    if (externalResult) setResult(externalResult);
  }, [externalImage, externalResult]);
'''
content = content.replace('  const [error, setError] = useState<string | null>(null);', sync_state_code)

# Update handleAnalyze to call onAnalysisComplete
analyze_success = '''
      setResult(data);
'''
new_analyze_success = '''
      setResult(data);
      if (onAnalysisComplete && preview) {
        onAnalysisComplete(preview, data);
      }
'''
content = content.replace(analyze_success, new_analyze_success)

with open('src/components/ImageUpload.tsx', 'w') as f:
    f.write(content)
