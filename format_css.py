import re

def format_css(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove multiple spaces/newlines
    content = re.sub(r'\s+', ' ', content)
    
    out_lines = []
    i = 0
    buffer = ""
    in_comment = False
    brace_depth = 0
    
    while i < len(content):
        if content[i:i+2] == '/*':
            in_comment = True
            if len(out_lines) > 0 and out_lines[-1] != "":
                out_lines.append("")
            buffer = "/*"
            i += 2
            continue
            
        if in_comment and content[i:i+2] == '*/':
            in_comment = False
            buffer += "*/"
            out_lines.append(buffer.strip())
            out_lines.append("") # add blank line after comment
            buffer = ""
            i += 2
            continue
            
        if in_comment:
            buffer += content[i]
            i += 1
            continue
            
        if content[i] == '{':
            brace_depth += 1
            buffer += '{'
            if brace_depth == 1 and buffer.strip().startswith('@media'):
                buffer += '\n'
            i += 1
            continue
            
        if content[i] == '}':
            brace_depth -= 1
            buffer += '}'
            if brace_depth == 0:
                out_lines.append(buffer.strip())
                buffer = ""
            elif brace_depth > 0:
                buffer += '\n'
            i += 1
            continue
            
        buffer += content[i]
        i += 1
        
    if buffer.strip():
        out_lines.append(buffer.strip())
        
    final_lines = []
    for block in out_lines:
        if block == "":
            if len(final_lines) > 0 and final_lines[-1] != "":
                final_lines.append("")
            continue
            
        if block.startswith("/*"):
            final_lines.append(block)
            continue
            
        block_lines = block.split('\n')
        cleaned_block = []
        for line in block_lines:
            line = line.strip()
            if not line:
                continue
            line = re.sub(r'\s*{\s*', ' { ', line)
            line = re.sub(r'\s*}\s*', ' }', line)
            line = re.sub(r'\s*:\s*', ': ', line)
            line = re.sub(r'\s*;\s*', '; ', line)
            line = re.sub(r'\s*,\s*', ', ', line)
            cleaned_block.append(line)
            
        if cleaned_block[0].startswith('@media'):
            final_lines.append(cleaned_block[0])
            for cl in cleaned_block[1:]:
                if cl == '}':
                    final_lines.append(cl)
                else:
                    final_lines.append("  " + cl)
        else:
            final_lines.append(cleaned_block[0])
            
    with open(file_path, 'w', encoding='utf-8') as f:
        # clean up multiple empty lines
        clean_final = []
        for line in final_lines:
            if line == "" and (len(clean_final) == 0 or clean_final[-1] == ""):
                continue
            clean_final.append(line)
            
        for line in clean_final:
            f.write(line.rstrip() + '\n')

format_css('d:\\Portpolio\\css\\style.css')
