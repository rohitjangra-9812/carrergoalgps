import os
import re

def rewrite(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Add import if missing
    if "import { GoogleGenAI } from '@google/genai';" not in content:
        content = "import { GoogleGenAI } from '@google/genai';\n" + content
    
    # regex for App.tsx and DoubtSolver.tsx where requestBody is defined
    # We will just find the `const requestBody` and replace it up to the end of the while loop.
    # It's safer to do manual string replace if we know the exact blocks, or a regex for the fetch block.

    pattern = r"const requestBody = \{.*?body: JSON\.stringify\(requestBody\)\s*\};\s*if \(!response\.ok\).*?if \(!response\.body\).*?const reader = response\.body\.getReader\(\);\s*const decoder = new TextDecoder\(\);\s*let (?:botResponse|content) = '';.*?while \(true\) \{.*?\}\s*\}"
    # Wait, regex across multiple lines is tricky in Python, let's use re.DOTALL

    # We will use AST or simpler text replacement. Let's just find the start and end.
