export const generateSampleLatex = (): string => {
  return `% 综合测试样本文档
\\documentclass[12pt,a4paper]{article}

\\usepackage{xeCJK} % 中文支持
\\usepackage{amsmath,amsfonts,amssymb} % 数学公式
\\usepackage{graphicx} % 插入图片
\\usepackage{booktabs} % 三线表
\\usepackage{caption} % 图表标题
\\usepackage{fancyhdr} % 页眉页脚
\\usepackage{enumitem} % 列表环境
\\usepackage{cite} % 参考文献

\\setCJKmainfont{SimSun} % 设置主英文字体，模拟环境

% 页眉页脚设置
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[C]{文档排版测试样本}
\\fancyfoot[C]{\\thepage}

\\title{基于深度学习的自然语言处理：系统级格式测试样本}
\\author{测试系统生成}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents
\\newpage

\\begin{abstract}
本文档旨在测试系统的全面格式渲染能力，包括涵盖中文段落排版、数学公式（行内与独立）、列表环境、带题注的图片、结构化的三线表、参考文献引用以及跨层级的章节编号等诸多项目已配置功能的准确性和视觉效果。以下将展示所有相关的格式用例。
\\end{abstract}

\\section{引言}

自然语言处理（NLP）是人工智能领域的重要分支。随着 Transformer\\cite{vaswani2017attention} 架构的提出，NLP 发生了范式转变。在此基础上，BERT\\cite{devlin2018bert} 和 GPT\\cite{radford2019language} 这两种极具代表性的预训练模型应运而生。本章节将展示中英文混排以及行内公式的排版效果，例如 $\\mathcal{O}(n^2)$ 和基础算式 $E = mc^2$ 的显示兼容性。

正文段落应当支持首行缩进，并且其行距、段前段后间距应受左侧面板配置所控制。例如，在此处的段落具有较长的内容，可以用来测试在经过排版工具后，多行文本带来的段落行距以及中文排版是否稳定，不会引起页面异常。

\\section{核心算法结构设计}
\\subsection{多头注意力机制分析}

在注意力机制中，模型可以通过下述公式来重新分配对句中其他词的关注权重：

\\begin{equation}
\\mathrm{Attention}(Q,K,V) = \\mathrm{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V
\\end{equation}

上式展现了一个居中并被自动编号的独立公式排版情况。

\\subsection{列表环境测试}

以下为几种典型的模型变体，用于验证项目中的列表排版效果：
\\begin{itemize}[label=\\textbullet]
    \\item 编码器模型（例如 BERT）：常用于自然语言理解任务，如情感分析。
    \\item 解码器模型（例如 GPT）：在自然语言生成任务上大放异彩。
    \\item 编码器-解码器模型（例如 T5 或 BART）：主要处理序列到序列的任务。
\\end{itemize}

\\section{图表环境支持测试}

在科学和技术文档中，图表（带题注）起着十分关键的作用。以下我们将创建模拟表格与图片插入：

\\subsection{性能对比表（三线表样式）}

对于表格对象，我们需要验证其是否能够被识别为三线表结构、标题字体是否合乎所设的仿宋_GB2312以及标题相对表格的位置关系。

\\begin{table}[htbp]
    \\centering
    \\caption{基础模型在三大测试集上的性能综合对比}
    \\begin{tabular}{lccc}
        \\toprule
        \\textbf{模型名称} & \\textbf{BLEU} & \\textbf{ROUGE-L} & \\textbf{准确率 (\\%)} \\\\
        \\midrule
        Model-Baseline & 28.4 & 41.2 & 89.1 \\\\
        Model-Variant-A & 31.2 & 43.8 & 92.4 \\\\
        Model-Variant-B & 34.5 & 45.1 & 94.7 \\\\
        \\bottomrule
    \\end{tabular}
\\end{table}

\\subsection{流程图示意}

至于图片插入，测试应当确认其在文档中的位置和对应标题排版情况：

\\begin{figure}[htbp]
    \\centering
    \\includegraphics[width=0.6\\textwidth]{images/sample-placeholder.png}
    \\caption{深度学习模型架构示意图}
\\end{figure}

\\section{结论}

经过综合排版处理，文档应呈现标准化、严密且符合学术规范的最终字面效果。各种章节标题不仅需要按项目设定的层次显示（如1.、1.1.等），其字体组合（如黑体字与粗细）都应完美兼容。

\\bibliographystyle{unsrt}
\\bibliography{references}

\\end{document}
`;
};
