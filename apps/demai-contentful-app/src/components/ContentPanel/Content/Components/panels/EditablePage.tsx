import Editor, { OnMount } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import { useEffect, useRef } from "react";

interface EditablePageProps {
  value: any;
  language: string;
  onChange: (value: any) => void;
  onSave?: () => void;
}

const EditablePage: React.FC<EditablePageProps> = ({
  value,
  language,
  onChange,
  onSave,
}) => {
  const onSaveRef = useRef<() => void>();

  // Keep ref updated
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    const preventDefaultSave = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventDefaultSave);
    return () => window.removeEventListener("keydown", preventDefaultSave);
  }, []);

  const handleEditorWillMount = (monaco: typeof monacoEditor) => {
    // Optional: configure monaco here
  };

  const handleEditorDidMount: OnMount = (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSaveRef.current?.(); // ✅ Always the latest
    });
  };

  return (
    <Editor
      defaultLanguage={language}
      value={value}
      onChange={(value) => onChange(value || "")}
      onMount={handleEditorDidMount}
      beforeMount={handleEditorWillMount}
      theme="vs-dark"
      options={{
        fontSize: 12,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
};

export default EditablePage;
