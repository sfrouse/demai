import { Button, Modal } from "@contentful/f36-components";
import useAIState from "../../contexts/AIStateContext/useAIState";
import tokens from "@contentful/f36-tokens";

const InspectedContentModal = () => {
    const { inspectedContent, setInspectedContent } = useAIState();

    if (!inspectedContent) return null;

    return (
        <Modal
            onClose={() => setInspectedContent(undefined)}
            isShown={inspectedContent !== undefined}
            size="large"
        >
            {() => (
                <>
                    <Modal.Header
                        title={`Inspect Content`}
                        onClose={() => setInspectedContent(undefined)}
                    />
                    <Modal.Content
                        style={{
                            backgroundColor: tokens.gray100,
                        }}
                    >
                        <pre
                            style={{
                                fontSize: tokens.fontSizeS,
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                            }}
                            dangerouslySetInnerHTML={{
                                __html: inspectedContent,
                            }}
                        ></pre>
                    </Modal.Content>
                    <Modal.Controls>
                        <Button
                            variant="transparent"
                            size="small"
                            onClick={() => setInspectedContent(undefined)}
                        >
                            Done
                        </Button>
                    </Modal.Controls>
                </>
            )}
        </Modal>
    );
};

export default InspectedContentModal;
