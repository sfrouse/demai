import { Button, Modal } from "@contentful/f36-components";
import useAIState from "../../contexts/AIStateContext/useAIState";
import AIActionDescription from "../AIActionDescription/AIActionDescription";
import { AIAction, useAIAction } from "../../ai/AIAction/AIAction";
import AIActionDescriptionToolbar from "../AIActionDescription/components/AIActionDescriptionToolbar";

const AIActionInspectorModalModal = () => {
    const { inspectedAIAction, setInspectedAIAction } = useAIState();
    const aiActionSnapshot = useAIAction(inspectedAIAction);

    if (!inspectedAIAction || !aiActionSnapshot) return null;

    return (
        <Modal
            onClose={() => setInspectedAIAction(undefined)}
            isShown={inspectedAIAction !== undefined}
            size="large"
        >
            {() => (
                <>
                    <Modal.Header
                        title={`${
                            (inspectedAIAction.constructor as typeof AIAction)
                                .label
                        } Action`}
                        onClose={() => setInspectedAIAction(undefined)}
                    />
                    <Modal.Content>
                        <AIActionDescription
                            aiAction={inspectedAIAction}
                            aiActionSnapshot={aiActionSnapshot}
                        />
                    </Modal.Content>
                    <AIActionDescriptionToolbar
                        aiAction={inspectedAIAction}
                        aiActionSnapshot={aiActionSnapshot}
                    />
                    <Modal.Controls>
                        <Button
                            variant="transparent"
                            size="small"
                            onClick={() => console.log(inspectedAIAction)}
                        >
                            Console
                        </Button>
                        <Button
                            variant="transparent"
                            size="small"
                            onClick={() => setInspectedAIAction(undefined)}
                        >
                            Done
                        </Button>
                    </Modal.Controls>
                </>
            )}
        </Modal>
    );
};

export default AIActionInspectorModalModal;
