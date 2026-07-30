import Editor from '@monaco-editor/react';

const CODE_TEMPLATES = {
  javascript: `function solution(input) {
  // Write your solution here
  // input contains the JSON object from test case
  // Example: input = {"nums":[2,7,11,15],"target":9}
  // Access: input.nums, input.target
  return [];
}`
};

export default function CodeEditor({ language, code, onChange }) {
  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    // Define custom dark theme to match our IDE
    monaco.editor.defineTheme('ide-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'variable', foreground: 'ffa657' },
        { token: 'type', foreground: '7ee787' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editor.lineHighlightBackground': '#161b22',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#58a6ff',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#c9d1d9',
        'editor.inactiveSelectionBackground': '#264f7855',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#6e768133',
        'scrollbarSlider.hoverBackground': '#6e768155',
        'scrollbarSlider.activeBackground': '#6e768177',
      }
    });

    // Apply the custom dark theme
    monaco.editor.setTheme('ide-dark');

    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      padding: { top: 16, bottom: 16 },
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
    });
  };

  // Get template for the language
  const getTemplate = (lang) => {
    return CODE_TEMPLATES[lang] || CODE_TEMPLATES.javascript;
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={code || getTemplate(language)}
      onChange={handleEditorChange}
      onMount={handleEditorMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
      }}
      loading={<div className="editor-loading">Loading editor...</div>}
    />
  );
}
