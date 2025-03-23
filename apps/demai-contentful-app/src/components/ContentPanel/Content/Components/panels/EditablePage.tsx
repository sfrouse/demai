import tokens from "@contentful/f36-tokens";

interface EditablePageProps {
  value: any;
  onChange: (value: any) => void;
}

const EditablePage: React.FC<EditablePageProps> = ({ value, onChange }) => {
  const handleChange = (e: { target: { value: any } }) => {
    try {
      //   const parsed = JSON.parse(e.target.value);
      onChange(e.target.value);
    } catch {
      // Ignore errors to prevent breaking input while typing
    }
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      style={{
        width: "100%",
        height: "100%",
        whiteSpace: "pre",
        fontFamily: "monospace",
        border: "1px solid #ccc",
        padding: "10px",
        background: tokens.gray900,
        color: tokens.colorWhite,
        resize: "vertical",
        outline: "none",
        caretColor: tokens.blue400,
        cursor: "text",
      }}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
    />
  );
};

export default EditablePage;
