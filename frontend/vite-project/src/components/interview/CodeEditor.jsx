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
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      padding: { top: 16 }
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
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 16 }
      }}
      loading={<div className="editor-loading">Loading editor...</div>}
    />
  );
}