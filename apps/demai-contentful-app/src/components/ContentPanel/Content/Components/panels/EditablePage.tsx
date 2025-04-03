import tokens from "@contentful/f36-tokens";

import Editor from "@monaco-editor/react";

interface EditablePageProps {
  value: any;
  language: string;
  onChange: (value: any) => void;
}

const EditablePage: React.FC<EditablePageProps> = ({
  value,
  language,
  onChange,
}) => {
  const handleChange = (e: { target: { value: any } }) => {
    try {
      //   const parsed = JSON.parse(e.target.value);
      onChange(e.target.value);
    } catch {
      // Ignore errors to prevent breaking input while typing
    }
  };

  return (
    // <textarea
    //   value={value}
    //   onChange={handleChange}
    //   style={{
    //     width: "100%",
    //     height: "100%",
    //     whiteSpace: "pre",
    //     fontFamily: "monospace",
    //     border: "1px solid #ccc",
    //     padding: "10px",
    //     background: tokens.gray900,
    //     color: tokens.colorWhite,
    //     resize: "vertical",
    //     outline: "none",
    //     caretColor: tokens.blue400,
    //     cursor: "text",
    //   }}
    //   spellCheck={false}
    //   autoCorrect="off"
    //   autoCapitalize="off"
    //   autoComplete="off"
    // />
    <Editor
      defaultLanguage={language}
      value={value}
      onChange={(value) => onChange(value || "")}
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
