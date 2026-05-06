import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, Header, Footer, TableOfContents, ImageRun } from "docx";

export const generateMergedDocx = async (latex: string, bib: string, imagesMap?: Record<string, Uint8Array>, isBeautified: boolean = false): Promise<Blob> => {
  // Pre-parse bibliography to build citations map
  const bibMap: Record<string, number> = {};
  const bibEntries = bib ? bib.split(/@[a-zA-Z]+\{/g).slice(1) : [];
  const bibReferences: string[] = [];
  
  for (let i = 0; i < bibEntries.length; i++) {
     let entryText = bibEntries[i].replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();
     const firstComma = entryText.indexOf(',');
     if (firstComma > -1) {
         const citeKey = entryText.substring(0, firstComma).trim();
         bibMap[citeKey] = i + 1;
     }

     const authorMatch = entryText.match(/author\s*=\s*[{"']*([^}"']+)[}"']*/i);
     const titleMatch2 = entryText.match(/title\s*=\s*[{"']*([^}"']+)[}"']*/i);
     const yearMatch = entryText.match(/year\s*=\s*[{"']*([^}"']+)[}"']*/i);
     
     let refStr = `[${i+1}] `;
     if (authorMatch) refStr += `${authorMatch[1]}, `;
     if (titleMatch2) refStr += `"${titleMatch2[1]}", `;
     if (yearMatch) refStr += `${yearMatch[1]}.`;
     
     if (!authorMatch && !titleMatch2) {
        refStr += entryText.substring(firstComma + 1, 100) + '...'; // fallback
     }
     bibReferences.push(refStr);
  }

  // Extract Title
  const titleMatch = latex.match(/\\title\{([^}]*)\}/);
  const titleText = titleMatch ? titleMatch[1] : "Converted LaTeX Document";

  let body = latex;
  const docMatch = latex.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (docMatch) {
    body = docMatch[1];
  }

  // Check if we need TOC
  const hasToc = body.includes('\\tableofcontents');

  const paragraphs: (Paragraph | Table | TableOfContents)[] = [
    new Paragraph({
      text: titleText,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  ];

  if (hasToc) {
    paragraphs.push(new Paragraph({
      text: "目录",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));
    paragraphs.push(new TableOfContents("目录", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }));
    paragraphs.push(new Paragraph({ text: "", spacing: { after: 400 } }));
  }

  // Basic cleanup
  body = body.replace(/(^|[^\\])%.*$/gm, '$1'); // Remove comments, ignore escaped %
  body = body.replace(/\\\$/g, '&#36;'); // Protect escaped dollar
  
  // Collect labels for references
  let eqCount = 0;
  let figCount = 0;
  let tabCount = 0;
  const labelMap: Record<string, string> = {};

  const eqRegex = /\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g;
  let m;
  while ((m = eqRegex.exec(body)) !== null) {
      eqCount++;
      const lblMatch = m[1].match(/\\label\{([^}]+)\}/);
      if (lblMatch) labelMap[lblMatch[1]] = String(eqCount);
  }

  const figRegex = /\\begin\{figure\*?\}([\s\S]*?)\\end\{figure\*?\}/g;
  while ((m = figRegex.exec(body)) !== null) {
      figCount++;
      const lblMatch = m[1].match(/\\label\{([^}]+)\}/);
      if (lblMatch) labelMap[lblMatch[1]] = String(figCount);
  }

  const tabRegex = /\\begin\{table\*?\}([\s\S]*?)\\end\{table\*?\}/g;
  while ((m = tabRegex.exec(body)) !== null) {
      tabCount++;
      const lblMatch = m[1].match(/\\label\{([^}]+)\}/);
      if (lblMatch) labelMap[lblMatch[1]] = String(tabCount);
  }

  // Replace tilde with spaces and handle references
  body = body.replace(/~/g, ' ');
  body = body.replace(/\\ref\{([^}]+)\}/g, (_, key) => labelMap[key] || '1');
  body = body.replace(/\\eqref\{([^}]+)\}/g, (_, key) => `(${labelMap[key] || '1'})`);
  body = body.replace(/\\label\{[^}]+\}/g, '');
  
  // Clean up various layout macros
  body = body.replace(/\\clearpage/g, '');
  body = body.replace(/\\newpage/g, '');
  body = body.replace(/\\vspace(?:\*|[^{])(?:\{[^}]*\})?/g, '');
  body = body.replace(/\\hspace(?:\*|[^{])(?:\{[^}]*\})?/g, '');
  body = body.replace(/\\centering/g, '');
  body = body.replace(/\\maketitle/g, '');
  body = body.replace(/\\tableofcontents/g, '');
  body = body.replace(/\\noindent/g, '');
  body = body.replace(/\\indent/g, '');
  body = body.replace(/\\thispagestyle\{[^}]*\}/g, '');
  body = body.replace(/\\pagestyle\{[^}]*\}/g, '');
  body = body.replace(/\\appendix/g, '');
  body = body.replace(/``/g, '"');
  body = body.replace(/''/g, '"');
  body = body.replace(/\\rule(?:\[[^\]]*\])?(?:\{[^}]*\})*/g, '');
  body = body.replace(/\\hfill/g, '');
  body = body.replace(/\\vfill/g, '');
  body = body.replace(/\\fill/g, '');
  body = body.replace(/\\protect/g, '');
  body = body.replace(/\\Huge/gi, '');
  body = body.replace(/\\huge/gi, '');
  body = body.replace(/\\LARGE/gi, '');
  body = body.replace(/\\Large/gi, '');
  body = body.replace(/\\large/gi, '');
  body = body.replace(/\\normalsize/gi, '');
  body = body.replace(/\\small/gi, '');
  body = body.replace(/\\footnotesize/gi, '');
  body = body.replace(/\\scriptsize/gi, '');
  body = body.replace(/\\tiny/gi, '');
  body = body.replace(/\\raggedright/g, '');
  body = body.replace(/\\raggedleft/g, '');
  body = body.replace(/\\flushright/g, '');
  body = body.replace(/\\flushleft/g, '');
  
  // Collapse table wrappers so tabular doesn't get split
  // Support both table and table* 
  body = body.replace(/\\begin\{table\*?\}([\s\S]*?)\\begin\{tabular\}/g, (match, prefix) => {
     let caption = "";
     const capMatch = prefix.match(/\\caption\{([^}]*)\}/);
     if (capMatch) caption = `\\caption{${capMatch[1]}}\n`;
     return caption + '\\begin{tabular}';
  });
  body = body.replace(/\\end\{tabular\}([\s\S]*?)\\end\{table\*?\}/g, (match, postfix) => {
     let caption = "";
     const capMatch = postfix.match(/\\caption\{([^}]*)\}/);
     if (capMatch) caption = `\n\\caption{${capMatch[1]}}`;
     return '\\end{tabular}' + caption;
  });

  const blocks = body.split(/\n\s*\n/);
  
  let figureIndex = 1;
  let tableIndex = 1;
  let equationIndex = 1;
  
const getImageDimensions = async (data: Uint8Array): Promise<{width: number, height: number}> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
         URL.revokeObjectURL(url);
         const maxWidth = 600; // max width for docx page roughly
         let w = img.width;
         let h = img.height;
         // Scale down if too large, retaining aspect ratio and making it sharp
         if (w > maxWidth) {
           h = Math.round((maxWidth / w) * h);
           w = maxWidth;
         }
         resolve({ width: w || 300, height: h || 300 });
      };
      img.onerror = () => {
         URL.revokeObjectURL(url);
         resolve({ width: 300, height: 300 });
      };
      img.src = url;
    } else {
      resolve({ width: 300, height: 300 });
    }
  });
};

const processMathString = (mathStr: string): TextRun[] => {
  const replacements: Record<string, string> = {
    '\\cdot': '·', '\\sum': '∑', '\\pi': 'π', '\\alpha': 'α',
    '\\beta': 'β', '\\gamma': 'γ', '\\theta': 'θ', '\\infty': '∞',
    '\\approx': '≈', '\\neq': '≠', '\\leq': '≤', '\\geq': '≥',
    '\\times': '×', '\\div': '÷', '\\pm': '±', '\\rightarrow': '→',
    '\\leftarrow': '←', '\\Rightarrow': '⇒', '\\Leftarrow': '⇐',
    '\\Delta': 'Δ', '\\nabla': '∇', '\\sqrt': '√', '\\lambda': 'λ', 
    '\\mu': 'μ', '\\sigma': 'σ', '\\omega': 'ω', '\\phi': 'φ', '\\epsilon': 'ε',
    '\\partial': '∂', '\\int': '∫', '\\prod': '∏', '\\in': '∈', '\\notin': '∉',
    '\\subset': '⊂', '\\supset': '⊃', '\\cup': '∪', '\\cap': '∩',
    '\\sim': '∼', '\\propto': '∝', '\\equiv': '≡', '\\le': '≤', '\\ge': '≥',
    '\\forall': '∀', '\\exists': '∃', '\\emptyset': '∅', '\\oplus': '⊕', '\\otimes': '⊗', '\\circ': '∘', '\\setminus': '∖',
    '\\widehat': '^', '\\widetilde': '~', '\\bar': '¯', '\\vec': '→',
    '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\exp': 'exp', '\\log': 'log', '\\ln': 'ln', '\\min': 'min', '\\max': 'max', '\\arg': 'arg',
    '\\limits': '', '\\left': '', '\\right': '', '\\,': ' ', '\\;': ' ', '\\!': '',
    '\\begin{aligned}': '', '\\end{aligned}': '', '\\begin{align*}': '', '\\end{align*}': '',
    '\\begin{align}': '', '\\end{align}': '',
    '\\begin{cases}': '', '\\end{cases}': '',
    '\\begin{pmatrix}': '(', '\\end{pmatrix}': ')',
    '\\begin{bmatrix}': '[', '\\end{bmatrix}': ']',
    '\\begin{vmatrix}': '|', '\\end{vmatrix}': '|',
    '\\begin{matrix}': '', '\\end{matrix}': '',
    '\\quad': '  ', '\\qquad': '    ', '\\displaystyle': '', '\\textstyle': '', '\\:': ' '
  };
  let s = mathStr.replace(/[\n\r]+/g, ' ');
  for (const [k, v] of Object.entries(replacements)) {
    s = s.split(k).join(v);
  }
  s = s.replace(/\\\\/g, '  '); // replace math newlines with spaces
  s = s.replace(/&/g, ' ');     // replace math tab alignment with spaces
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
  s = s.replace(/\\mathbb\{R\}/g, 'ℝ');
  s = s.replace(/\\mathbb\{Z\}/g, 'ℤ');
  s = s.replace(/\\mathbb\{N\}/g, 'ℕ');
  s = s.replace(/\\mathbb\{Q\}/g, 'ℚ');
  s = s.replace(/\\mathbb\{C\}/g, 'ℂ');
  s = s.replace(/\\mathbb\{P\}/g, 'ℙ');
  s = s.replace(/\\mathbb\{E\}/g, '𝔼');
  s = s.replace(/\\mathbb\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  s = s.replace(/\\boldsymbol\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathcal\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');
  
  const runs: TextRun[] = [];
  const regex = /_\{([^}]+)\}|_([a-zA-Z0-9])|\^\{([^}]+)\}|\^([a-zA-Z0-9])/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(s)) !== null) {
      if (match.index > lastIndex) {
          runs.push(new TextRun({ text: s.substring(lastIndex, match.index), italics: true }));
      }
      if (match[1] || match[2]) {
          // If the script content itself contains an underscore (e.g., d_k), it gets printed literally 
          // because docx TextRun doesn't recursively format scripts. We'll replace it with a space or leave it.
          // The user's q_ik_i has separate sub/superscripts. So it will be fine.
          let content = match[1] || match[2];
          content = content.replace(/_/g, ' '); 
          runs.push(new TextRun({ text: content, subScript: true, italics: true }));
      } else if (match[3] || match[4]) {
          let content = match[3] || match[4];
          content = content.replace(/_/g, ' '); 
          runs.push(new TextRun({ text: content, superScript: true, italics: true }));
      }
      lastIndex = regex.lastIndex;
  }
  if (lastIndex < s.length) {
      const rem = s.substring(lastIndex).trim();
      if (rem) runs.push(new TextRun({ text: rem, italics: true }));
  }
  return runs.length > 0 ? runs : [new TextRun({ text: s, italics: true })];
};

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;
    
    // Ignore some environment blocks we don't handle well in this simple mock
    if (block.includes('\\begin{figure}')) {
      const imgMatch = block.match(/\\includegraphics(?:\[.*?\])?\{([^}]+)\}/);
      const capMatch = block.match(/\\caption\{([^}]+)\}/);
      
      const children = [];
      if (imgMatch) {
        let imgName = imgMatch[1];
        let imgData: Uint8Array | undefined = undefined;
        let actualType = "png";
        let foundKey = "";
        
        if (imagesMap) {
          if (imagesMap[imgName]) foundKey = imgName;
          else if (imagesMap[imgName + '.png']) foundKey = imgName + '.png';
          else if (imagesMap[imgName + '.jpg']) foundKey = imgName + '.jpg';
          else if (imagesMap[imgName + '.jpeg']) foundKey = imgName + '.jpeg';
          else {
            foundKey = Object.keys(imagesMap).find(k => k.endsWith(imgName) || k.endsWith(imgName + '.png') || k.endsWith(imgName + '.jpg') || k.endsWith(imgName + '.jpeg')) || "";
          }
          if (foundKey) {
             imgData = imagesMap[foundKey];
             if (foundKey.toLowerCase().endsWith('.jpg') || foundKey.toLowerCase().endsWith('.jpeg')) {
                 actualType = "jpeg";
             } else if (foundKey.toLowerCase().endsWith('.gif')) {
                 actualType = "gif";
             } else if (foundKey.toLowerCase().endsWith('.bmp')) {
                 actualType = "bmp";
             }
          }
        }
      
        if (!imgData) {
          // If not found, use a fallback empty transparent pixel
          const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
          const binaryString = window.atob(base64);
          const len = binaryString.length;
          imgData = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            imgData[i] = binaryString.charCodeAt(i);
          }
        }

        const dims = await getImageDimensions(imgData);

        children.push(new ImageRun({
          data: imgData,
          transformation: { width: dims.width, height: dims.height },
          type: actualType as any,
        }));
      }

      paragraphs.push(new Paragraph({
         children,
         alignment: AlignmentType.CENTER,
         spacing: { before: 200, after: 100 }
      }));
      
      if (capMatch) {
        paragraphs.push(new Paragraph({
          text: `图 ${figureIndex}: ${capMatch[1]}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }));
      }
      figureIndex++;
      continue;
    }

    if (block.includes('\\begin{tabular}')) {
      // Find caption if we injected it
      let captionText = "";
      const capMatch = block.match(/\\caption\{([^}]*)\}/);
      if (capMatch) captionText = capMatch[1];

      // Support \begin{tabular}{...} and \begin{tabular*}{...}{...} complex args
      // We will match \begin{tabular*} anything \end{tabular*} and clean up the start inside.
      const tabularMatch = block.match(/\\begin\{tabular\*?\}([\s\S]*?)\\end\{tabular\*?\}/);
      if (tabularMatch) {
        // Tabular body parsing
        let tabInner = tabularMatch[1].trim();
        // The inner content usually starts with something like {c|l|c} or {c*{3}{c}}.
        // We can crudely remove the first sequence of {} brackets by looking for the first & or \\
        // and stripping braces before it, or just a targeted replacement.
        // Let's just remove a leading {...} block if it looks like column definitions (no \ or & inside)
        tabInner = tabInner.replace(/^\{[^{}\\]*\}/, ''); 
        
        // Sometimes there are two sets if it's tabular* with width, e.g. {1\textwidth}{c|c}
        tabInner = tabInner.replace(/^\{[^{}\\]*\}/, ''); 
        
        const rows = tabInner.split('\\\\');
        const tableRows: TableRow[] = [];
        
        let actualRowIdx = 0;
        for (let r = 0; r < rows.length; r++) {
          const rowText = rows[r].trim();
          if (!rowText || (rowText.includes('\\hline') && rowText.replace(/\\hline/g, '').trim().length === 0)) continue; 
          
          let cleanRowText = rowText.replace(/\\hline/g, '').replace(/\\midrule/g, '').replace(/\\toprule/g, '').replace(/\\bottomrule/g, '').trim();
          if (!cleanRowText) continue;

          const cols = cleanRowText.split('&');
          const tableCells: TableCell[] = [];
          
          const isHeader = (actualRowIdx === 0);
          const topBorder = isHeader ? { style: BorderStyle.SINGLE, size: 10, color: "000000" } : { style: BorderStyle.NIL };
          
          for (let col of cols) {
             let rawText = col
                .replace(/\\rule(?:\[[^\]]*\])?(?:\{[^}]*\})*/g, '')
                .replace(/\\multicolumn\{[^}]*\}\{[^}]*\}/g, '')
                .replace(/\\multirow\{[^}]*\}\{[^}]*\}/g, '')
                .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
                .replace(/\\url\{([^}]*)\}/g, '$1')
                .replace(/\\textbf\{([^}]*)\}/g, '**$1**')
                .replace(/\\textit\{([^}]*)\}/g, '*$1*')
                .replace(/\\emph\{([^}]*)\}/g, '*$1*')
                .replace(/\\underline\{([^}]*)\}/g, '_$1_')
                .replace(/\\textsuperscript\{([^}]*)\}/g, '^$1^')
                .replace(/\\textsubscript\{([^}]*)\}/g, '~$1~')
                .replace(/\\textsf\{([^}]*)\}/g, '$1')
                .replace(/\\texttt\{([^}]*)\}/g, '$1')
                .replace(/\\textsc\{([^}]*)\}/g, '$1')
                .replace(/\\footnote\{([^}]*)\}/g, ' [$1]')
                .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
                .replace(/\{|\}/g, '')
                .replace(/&#36;/g, '$')
                .trim();
                
             const cellChildren = [];
             const parts = rawText.split(/(\$.*?\$)/g);
             for (let p of parts) {
               if (p.startsWith('$') && p.endsWith('$')) {
                 cellChildren.push(...processMathString(p.replace(/\$/g, '')));
               } else {
                 if (p) {
                   let tokens = p.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\^[^^]+\^|~[^~]+~)/g);
                   for (let t of tokens) {
                      if (t.startsWith('**') && t.endsWith('**')) {
                         cellChildren.push(new TextRun({ text: t.replace(/\*\*/g, '').replace(/\\/g, ''), bold: true }));
                      } else if (t.startsWith('*') && t.endsWith('*')) {
                         cellChildren.push(new TextRun({ text: t.replace(/\*/g, '').replace(/\\/g, ''), italics: true }));
                      } else if (t.startsWith('_') && t.endsWith('_')) {
                         cellChildren.push(new TextRun({ text: t.replace(/_/g, '').replace(/\\/g, ''), underline: {} }));
                      } else if (t.startsWith('^') && t.endsWith('^')) {
                         cellChildren.push(new TextRun({ text: t.replace(/\^/g, '').replace(/\\/g, ''), superScript: true }));
                      } else if (t.startsWith('~') && t.endsWith('~')) {
                         cellChildren.push(new TextRun({ text: t.replace(/~/g, '').replace(/\\/g, ''), subScript: true }));
                      } else if (t) {
                         cellChildren.push(new TextRun({ text: t.replace(/\\/g, ''), bold: isHeader }));
                      }
                   }
                 }
               }
             }

             tableCells.push(new TableCell({
               children: [new Paragraph({ 
                  children: cellChildren,
                  alignment: AlignmentType.CENTER 
               })],
               borders: { 
                 top: topBorder, 
                 bottom: isHeader ? { style: BorderStyle.SINGLE, size: 5, color: "000000" } : { style: BorderStyle.NIL },
                 left: { style: BorderStyle.NIL }, 
                 right: { style: BorderStyle.NIL } 
               }
             }));
          }
          tableRows.push(new TableRow({ children: tableCells }));
          actualRowIdx++;
        }

        if (tableRows.length > 0) {
          paragraphs.push(new Paragraph({
            children: [
              new TextRun({ text: captionText ? `表 ${tableIndex}: ${captionText}` : `表 ${tableIndex} (自动美化为三线表)`, bold: true })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 150 }
          }));
          tableIndex++;
          
          paragraphs.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              left: { style: BorderStyle.NIL },
              right: { style: BorderStyle.NIL },
              insideVertical: { style: BorderStyle.NIL },
              insideHorizontal: { style: BorderStyle.NIL },
            },
            rows: tableRows
          }));
          paragraphs.push(new Paragraph({ text: "", spacing: { after: 200 } }));
        }
        continue;
      }
    }

    const chapterMatch = block.match(/\\chapter\*?\{([^}]+)\}/);
    const sectionMatch = block.match(/\\section\*?\{([^}]+)\}/);
    const subSectionMatch = block.match(/\\subsection\*?\{([^}]+)\}/);
    const subSubSectionMatch = block.match(/\\subsubsection\*?\{([^}]+)\}/);
    const paragraphMatch = block.match(/\\paragraph\*?\{([^}]+)\}/);

    if (chapterMatch) {
      paragraphs.push(new Paragraph({
        text: chapterMatch[1],
        heading: HeadingLevel.TITLE,
        spacing: { before: 400, after: 200 },
      }));
    } else if (sectionMatch) {
      paragraphs.push(new Paragraph({
        text: sectionMatch[1],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }));
    } else if (subSectionMatch) {
      paragraphs.push(new Paragraph({
        text: subSectionMatch[1],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }));
    } else if (subSubSectionMatch) {
      paragraphs.push(new Paragraph({
        text: subSubSectionMatch[1],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
    } else if (paragraphMatch) {
      paragraphs.push(new Paragraph({
        text: paragraphMatch[1],
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 200, after: 100 },
      }));
    } else {
      // Find block equations (like $$ ... $$, \begin{equation}...\end{equation}, \[...\])
      // For simple parsing, let's just make the whole block centered if it contains large equations, or separate them.
      let isBlockMath = false;
      let cleanText = block;
      
      if (block.includes('\\begin{equation}') || block.startsWith('$$') || block.startsWith('\\[')) {
        isBlockMath = true;
        cleanText = block
           .replace(/\\begin\{equation\*?\}/g, '')
           .replace(/\\end\{equation\*?\}/g, '')
           .replace(/\$\$/g, '')
           .replace(/\\\[/g, '')
           .replace(/\\\]/g, '')
           .trim();
      } else {
        // We shouldn't strip formatting right away before extracting math and citations.
        // But for a simple processor, we can just leave cleanText as block for now.
        // We will strip unwanted macros later after extracting math and citations.
        cleanText = block
          .replace(/\\begin\{(itemize|enumerate|quote|quotation|center|flushleft|flushright)\}/g, '')
          .replace(/\\end\{(itemize|enumerate|quote|quotation|center|flushleft|flushright)\}/g, '')
          .trim();
      }

      if (cleanText) {
        // Replace citations first
        cleanText = cleanText.replace(/\\cite[a-zA-Z]*(?:\[[^\]]*\])?\{([^}]+)\}/g, (match, keysStr) => {
           const keys = keysStr.split(',').map(k => k.trim());
           const ids = keys.map(k => bibMap[k] ? bibMap[k] : '?');
           return `[${ids.join(', ')}]`;
        });

        if (isBlockMath) {
           const runs = processMathString(cleanText);
           if (block.includes('\\begin{equation}')) {
               runs.push(new TextRun({ text: `    (${equationIndex})` }));
               equationIndex++;
           }
           paragraphs.push(new Paragraph({
             children: runs,
             alignment: AlignmentType.CENTER,
             spacing: { before: 200, after: 200 }
           }));
        } else {
           // Parse \item lists and inline math
           const items = cleanText.split(/\\item/g);
           let listIndex = 1;
           for (let i = 0; i < items.length; i++) {
               let itemText = items[i].replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
               if (!itemText) continue;
               
               const isList = block.includes('\\item') && i > 0 || (i === 0 && block.trim().startsWith('\\item'));
               let prefix = "";
               if (isList) {
                   if (block.includes('\\begin{enumerate}')) {
                       prefix = `${listIndex}. `;
                       listIndex++;
                   } else {
                       prefix = "• ";
                   }
               }

               const textRuns = [];
               if (prefix) {
                   textRuns.push(new TextRun({ text: prefix }));
               }

               const parts = itemText.split(/(\$.*?\$)/g);
               for (let p of parts) {
                 if (p.startsWith('$') && p.endsWith('$')) {
                   textRuns.push(...processMathString(p.replace(/\$/g, '')));
                 } else {
                   if (p) {
                     // Cleanup normal text
                     let normPart = p;
                     
                     // We can't do full nested bold/italics easily in this simple string splitter,
                     // but we can extract them roughly if they are the whole text or split them.
                     // A basic approach is just strip them and make it plain, OR we can split by patterns.
                     // The requirement is just stable formatting and removing LaTeX syntax.
                     // I will just use the simple replace since we might not have pure text runs easily.
                     normPart = normPart
                       .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
                       .replace(/\\url\{([^}]*)\}/g, '$1')
                       .replace(/\\textbf\{([^}]*)\}/g, '**$1**')
                       .replace(/\\textit\{([^}]*)\}/g, '*$1*')
                       .replace(/\\emph\{([^}]*)\}/g, '*$1*')
                       .replace(/\\underline\{([^}]*)\}/g, '_$1_')
                       .replace(/\\textsuperscript\{([^}]*)\}/g, '^$1^')
                       .replace(/\\textsubscript\{([^}]*)\}/g, '~$1~')
                       .replace(/\\textsf\{([^}]*)\}/g, '$1')
                       .replace(/\\texttt\{([^}]*)\}/g, '$1')
                       .replace(/\\textsc\{([^}]*)\}/g, '$1')
                       .replace(/\\footnote\{([^}]*)\}/g, ' [$1]')
                       .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
                       .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
                       .replace(/\\/g, '')
                       .replace(/&#36;/g, '$');
                       
                     // Now split by ** and * to create bold/italic runs
                     let tokens = normPart.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\^[^^]+\^|~[^~]+~)/g);
                     for (let t of tokens) {
                        if (t.startsWith('**') && t.endsWith('**')) {
                           textRuns.push(new TextRun({ text: t.replace(/\*\*/g, ''), bold: true }));
                        } else if (t.startsWith('*') && t.endsWith('*')) {
                           textRuns.push(new TextRun({ text: t.replace(/\*/g, ''), italics: true }));
                        } else if (t.startsWith('_') && t.endsWith('_')) {
                           textRuns.push(new TextRun({ text: t.replace(/_/g, ''), underline: {} }));
                        } else if (t.startsWith('^') && t.endsWith('^')) {
                           textRuns.push(new TextRun({ text: t.replace(/\^/g, ''), superScript: true }));
                        } else if (t.startsWith('~') && t.endsWith('~')) {
                           textRuns.push(new TextRun({ text: t.replace(/~/g, ''), subScript: true }));
                        } else if (t) {
                           textRuns.push(new TextRun({ text: t }));
                        }
                     }
                   }
                 }
               }

               paragraphs.push(new Paragraph({
                 children: textRuns,
                 spacing: { after: 120 },
                 indent: isList ? { left: 720 } : undefined
               }));
           }
        }
      }
    }
  }

  if (bibReferences.length > 0) {
    paragraphs.push(new Paragraph({
      text: "References",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }));
    
    for (const refStr of bibReferences) {
        paragraphs.push(new Paragraph({
          text: refStr,
          spacing: { after: 120 }
        }));
    }
  }

  const docStyles = isBeautified ? {
    default: {
      heading1: { run: { size: 44, bold: true, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimHei" } }, paragraph: { spacing: { before: 400, after: 200 } } },
      heading2: { run: { size: 36, bold: true, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimHei" } }, paragraph: { spacing: { before: 300, after: 150 } } },
      heading3: { run: { size: 32, bold: true, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimHei" } }, paragraph: { spacing: { before: 200, after: 100 } } },
      document: {
        run: { size: 24, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimSun" } },
        paragraph: { spacing: { line: 360, before: 100, after: 100 }, alignment: AlignmentType.JUSTIFIED }
      }
    }
  } : undefined;

  const doc = new Document({
    creator: "WorkflowHub Pandoc Simulator",
    title: titleText,
    styles: docStyles,
    sections: [
      {
        properties: {
          page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const generateSampleDocx = async (isBeautified: boolean = false): Promise<Blob> => {
  const docStyles = isBeautified ? {
    default: {
      heading1: { run: { size: 44, bold: true, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimHei" } }, paragraph: { spacing: { before: 400, after: 200 } } },
      heading2: { run: { size: 36, bold: true, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimHei" } }, paragraph: { spacing: { before: 300, after: 150 } } },
      heading3: { run: { size: 32, bold: true, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimHei" } }, paragraph: { spacing: { before: 200, after: 100 } } },
      document: {
        run: { size: 24, font: { name: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "SimSun" } },
        paragraph: { spacing: { line: 360, before: 100, after: 100 }, alignment: AlignmentType.JUSTIFIED }
      }
    }
  } : undefined;

  const doc = new Document({
    creator: "WorkflowHub Test System",
    title: "基于深度学习的自然语言处理：系统级格式测试样本",
    styles: docStyles,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: "文档排版测试样本",
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                text: "1",
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            text: "基于深度学习的自然语言处理：系统级格式测试样本",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "测试系统生成",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "目录",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new TableOfContents("目录", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({
            text: "摘要",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("本文档旨在测试系统的全面格式渲染能力，包括涵盖中文段落排版、数学公式（行内与独立）、列表环境、带题注的图片、结构化的三线表、参考文献引用以及跨层级的章节编号等诸多项目已配置功能的准确性和视觉效果。以下将展示所有相关的格式用例。")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 }, // 1.5 line spacing
          }),
          new Paragraph({
            text: "1 引言",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("自然语言处理（NLP）是人工智能领域的重要分支。随着 Transformer[1] 架构的提出，NLP 发生了范式转变。本章节将展示中英文混排以及行内公式的排版效果，例如 O(n²) 和基础算式 E = mc² 的显示兼容性。")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun("正文段落应当支持首行缩进，并且其行距、段前段后间距应受左侧面板配置所控制。例如，在此处的段落具有较长的内容，可以用来测试在经过排版工具后，多行文本带来的段落行距以及中文排版是否稳定，不会引起页面异常。")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "2 核心算法结构设计",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "2.1 多头注意力机制分析",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("在注意力机制中，模型可以通过下述公式来重新分配对句中其他词的关注权重：")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) V    (1)",
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("上式展现了一个居中并被自动编号的独立公式排版情况。")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "2.2 列表环境测试",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("以下为几种典型的模型变体，用于验证项目中的列表排版效果：")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "• 编码器模型（例如 BERT）：常用于自然语言理解任务，如情感分析。",
            indent: { left: 720 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "• 解码器模型（例如 GPT）：在自然语言生成任务上大放异彩。",
            indent: { left: 720 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "• 编码器-解码器模型（例如 T5 或 BART）：主要处理序列到序列的任务。",
            indent: { left: 720 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "3 图表环境支持测试",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("在科学和技术文档中，图表（带题注）起着十分关键的作用。以下我们将创建模拟表格与图片插入：")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "3.1 性能对比表（三线表样式）",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "表 1.1 基础模型在三大测试集上的性能综合对比", bold: true })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
              left: { style: BorderStyle.NIL },
              right: { style: BorderStyle.NIL },
              insideHorizontal: { style: BorderStyle.NIL },
              insideVertical: { style: BorderStyle.NIL },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "模型名称", bold: true })], alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "BLEU", bold: true })], alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ROUGE-L", bold: true })], alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "准确率 (%)", bold: true })], alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Model-Baseline", alignment: AlignmentType.CENTER })], borders: { top: { style: BorderStyle.SINGLE, size: 5, color: "000000" } } }),
                  new TableCell({ children: [new Paragraph({ text: "28.4", alignment: AlignmentType.CENTER })], borders: { top: { style: BorderStyle.SINGLE, size: 5, color: "000000" } } }),
                  new TableCell({ children: [new Paragraph({ text: "41.2", alignment: AlignmentType.CENTER })], borders: { top: { style: BorderStyle.SINGLE, size: 5, color: "000000" } } }),
                  new TableCell({ children: [new Paragraph({ text: "89.1", alignment: AlignmentType.CENTER })], borders: { top: { style: BorderStyle.SINGLE, size: 5, color: "000000" } } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Model-Variant-A", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "31.2", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "43.8", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "92.4", alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Model-Variant-B", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "34.5", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "45.1", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "94.7", alignment: AlignmentType.CENTER })] }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: "3.2 流程图示意",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: (() => {
                  const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
                  const binaryString = window.atob(base64);
                  const len = binaryString.length;
                  const bytes = new Uint8Array(len);
                  for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  return bytes.buffer;
                })(),
                transformation: {
                  width: 300,
                  height: 300,
                },
                type: "png",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "图 1.1 深度学习模型架构示意图", bold: true })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
          }),
          new Paragraph({
            text: "4 结论",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun("经过综合排版处理，文档应呈现标准化、严密且符合学术规范的最终字面效果。各种章节标题不仅需要按项目设定的层次显示（如1.、1.1.等），其字体组合（如黑体字与粗细）都应完美兼容。")
            ],
            indent: { firstLine: 480 },
            spacing: { line: 360 },
          }),
          new Paragraph({
            text: "参考文献",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "[1] Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. " }),
              new TextRun({ text: "Advances in neural information processing systems", italics: true }),
              new TextRun({ text: ", 30." })
            ],
            indent: { left: 480, hanging: 480 },
            spacing: { line: 360 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
