import { Button, Modal } from "@contentful/f36-components";
import useAIState from "../../contexts/AIStateContext/useAIState";
import AIActionDescription from "../AIActionDescription/AIActionDescription";
import { AIAction, useAIAction } from "../../ai/AIAction/AIAction";
import AutoBenchAIAction from "../AIActionAutoBench/components/AutoBenchAIAction";

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
                        } Action (${inspectedAIAction.constructor.name})`}
                        onClose={() => setInspectedAIAction(undefined)}
                    />
                    <Modal.Content>
                        <AIActionDescription
                            aiAction={inspectedAIAction}
                            aiActionSnapshot={aiActionSnapshot}
                            robust={true}
                        />
                    </Modal.Content>
                    <AutoBenchAIAction
                        aiAction={inspectedAIAction}
                        corners={false}
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
