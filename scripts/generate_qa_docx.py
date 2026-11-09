import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
import os
import re

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D0DED5", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_p_rtl(p):
    pPr = p._p.get_or_add_pPr()
    bidi = OxmlElement('w:bidi')
    bidi.set(qn('w:val'), '1')
    pPr.append(bidi)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

def set_table_rtl(table):
    tblPr = table._tbl.tblPr
    bidi = OxmlElement('w:bidiVisual')
    bidi.set(qn('w:val'), '1')
    tblPr.append(bidi)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

def build_docx():
    doc = docx.Document()
    
    # Page Setup (Margins: 0.8 inch)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        
    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
    
    # Read the markdown
    md_path = r"E:\Future Center\Future-Center\senior_qa_master_test_plan.md"
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    
    # Document Header Box
    title_p = doc.add_paragraph()
    set_p_rtl(title_p)
    title_run = title_p.add_run("خطة وضمان الجودة الشاملة للمشروع\n(Senior Software QA Master Test Plan & Audit)")
    title_run.font.name = 'Segoe UI'
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(0x06, 0x3E, 0x32)
    title_p.paragraph_format.space_after = Pt(4)
    title_p.paragraph_format.space_before = Pt(8)

    sub_p = doc.add_paragraph()
    set_p_rtl(sub_p)
    sub_run = sub_p.add_run("مركز المستقبل للتغذية والتخسيس — إشراف طبي: د. رنا ياسر الشوري")
    sub_run.font.name = 'Segoe UI'
    sub_run.font.size = Pt(12)
    sub_run.font.bold = True
    sub_run.font.color.rgb = RGBColor(0x18, 0x4E, 0x3F)
    sub_p.paragraph_format.space_after = Pt(16)

    # Divider line
    div_p = doc.add_paragraph()
    set_p_rtl(div_p)
    div_run = div_p.add_run("―" * 50)
    div_run.font.color.rgb = RGBColor(0xBB, 0xD4, 0xC4)
    div_p.paragraph_format.space_after = Pt(12)

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty or initial headers already handled
        if not line or line.startswith('# خطة وضمان') or 'د. رنا ياسر' in line or line == '---':
            i += 1
            continue
            
        # Heading 1 (##)
        if line.startswith('## '):
            text = line.replace('## ', '').strip()
            p = doc.add_paragraph()
            set_p_rtl(p)
            r = p.add_run(text)
            r.font.name = 'Segoe UI'
            r.font.size = Pt(15)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x06, 0x3E, 0x32)
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(6)
            i += 1
            continue
            
        # Heading 2 (###)
        if line.startswith('### '):
            text = line.replace('### ', '').strip()
            p = doc.add_paragraph()
            set_p_rtl(p)
            r = p.add_run(text)
            r.font.name = 'Segoe UI'
            r.font.size = Pt(13)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x18, 0x4E, 0x3F)
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            i += 1
            continue

        # Markdown Table Detection
        if line.startswith('|') and '|' in line[1:]:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
                
            # Filter out separator row (| :--- |)
            cleaned_rows = [r for r in table_lines if not re.match(r'^\|[\s:-]+\|$', r)]
            if cleaned_rows:
                header_cells = [c.strip() for c in cleaned_rows[0].split('|')[1:-1]]
                data_rows = [[c.strip() for c in r.split('|')[1:-1]] for r in cleaned_rows[1:]]
                
                table = doc.add_table(rows=len(data_rows) + 1, cols=len(header_cells))
                set_table_rtl(table)
                set_table_borders(table)
                
                # Header formatting
                hdr_row = table.rows[0]
                for idx, text in enumerate(header_cells):
                    cell = hdr_row.cells[idx]
                    set_cell_background(cell, "184E3F")
                    set_cell_margins(cell, top=140, bottom=140, left=160, right=160)
                    p = cell.paragraphs[0]
                    set_p_rtl(p)
                    r = p.add_run(re.sub(r'\*\*(.*?)\*\*', r'\1', text))
                    r.font.name = 'Segoe UI'
                    r.font.size = Pt(10)
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                    
                # Data rows formatting
                for r_idx, row_data in enumerate(data_rows):
                    row = table.rows[r_idx + 1]
                    bg_color = "F7FAF8" if r_idx % 2 == 1 else "FFFFFF"
                    for c_idx, text in enumerate(row_data):
                        if c_idx < len(row.cells):
                            cell = row.cells[c_idx]
                            set_cell_background(cell, bg_color)
                            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                            p = cell.paragraphs[0]
                            set_p_rtl(p)
                            # Handle bold
                            clean_text = text.replace('`', '')
                            parts = re.split(r'(\*\*.*?\*\*)', clean_text)
                            for part in parts:
                                if part.startswith('**') and part.endswith('**'):
                                    r = p.add_run(part[2:-2])
                                    r.font.bold = True
                                else:
                                    r = p.add_run(part)
                                r.font.name = 'Calibri'
                                r.font.size = Pt(9.5)
                                r.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
                                
                spacer = doc.add_paragraph()
                spacer.paragraph_format.space_before = Pt(4)
                spacer.paragraph_format.space_after = Pt(6)
            continue

        # Code block or mermaid
        if line.startswith('```'):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            i += 1 # skip closing
            
            p = doc.add_paragraph()
            set_p_rtl(p)
            for cl in code_lines:
                r = p.add_run(cl + '\n')
                r.font.name = 'Consolas'
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(0x1B, 0x4D, 0x3E)
            p.paragraph_format.space_after = Pt(6)
            continue

        # Bullet list
        if line.startswith('* ') or line.startswith('- '):
            text = line[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            set_p_rtl(p)
            # bold tags
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = p.add_run(part)
                r.font.name = 'Calibri'
                r.font.size = Pt(10.5)
            p.paragraph_format.space_after = Pt(3)
            i += 1
            continue

        # Numbered list (e.g. "1. ")
        num_match = re.match(r'^(\d+)\.\s+(.*)$', line)
        if num_match:
            num = num_match.group(1)
            text = num_match.group(2)
            p = doc.add_paragraph()
            set_p_rtl(p)
            p.add_run(f"{num}. ").font.bold = True
            parts = re.split(r'(\*\*.*?\*\*)', text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    r = p.add_run(part)
                r.font.name = 'Calibri'
                r.font.size = Pt(10.5)
            p.paragraph_format.space_after = Pt(3)
            i += 1
            continue

        # Blockquote / Alert
        if line.startswith('> '):
            text = line[2:].strip()
            p = doc.add_paragraph()
            set_p_rtl(p)
            r = p.add_run("❝ " + text.replace('**', ''))
            r.font.name = 'Segoe UI'
            r.font.size = Pt(11)
            r.font.italic = True
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x06, 0x3E, 0x32)
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(8)
            i += 1
            continue

        # Regular paragraph
        p = doc.add_paragraph()
        set_p_rtl(p)
        parts = re.split(r'(\*\*.*?\*\*)', line)
        for part in parts:
            if part.startswith('**') and part.endswith('**'):
                r = p.add_run(part[2:-2])
                r.font.bold = True
            else:
                r = p.add_run(part)
            r.font.name = 'Calibri'
            r.font.size = Pt(10.5)
        p.paragraph_format.space_after = Pt(4)
        i += 1

    # Save to both target locations
    out1 = r"E:\Future Center\Future-Center\senior_qa_master_test_plan.docx"
    out2 = r"E:\Future Center\senior_qa_master_test_plan.docx"
    doc.save(out1)
    doc.save(out2)
    print(f"Successfully generated Word documents:\n1: {out1}\n2: {out2}")

if __name__ == "__main__":
    build_docx()
