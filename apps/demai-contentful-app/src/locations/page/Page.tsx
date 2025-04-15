import React, { useEffect, useState } from "react";
import { Flex, Heading, Modal } from "@contentful/f36-components";
import { PageAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppInstallationParameters } from "../config/ConfigScreen";
import tokens from "@contentful/f36-tokens";
import MainNav, { NAVIGATION } from "../../components/MainNav";
import ContentPanel from "../../components/ContentPanel/ContentPanel";
import { AIStateConfig } from "../../ai/AIState/AIStateTypes";
import { useContentStateSession } from "../../contexts/ContentStateContext/ContentStateContext";
import useAIState from "../../contexts/AIStateContext/useAIState";
import LoadingIcon from "../../components/Loading/LoadingIcon";
import testCPA from "./utils/testCPA";
import getPreviewAccessKey from "./utils/getPreviewAccessKey";
import { useError } from "../../contexts/ErrorContext/ErrorContext";
import AIActionPanel from "../../components/AIActionPanel/AIActionPanel";
import AIActionInspector from "../../components/AIActionInspector/AIActionInspector";

const Page = () => {
    const sdk = useSDK<PageAppSDK>();
    const { spaceStatus, validateSpace, setCPA } = useContentStateSession();
    const { addError, errors } = useError();
    const { setAIStateConfig, setRoute, route, findAndSetAIAction } =
        useAIState();
    const [configReady, setConfigReady] = useState<boolean>(false);

    // MAIN AISTATE MANEGEMENT
    useEffect(() => {
        if (route) {
            if (route.aiActions.length > 0) {
                const newAIActionConstructor =
                    route.aiActions[route.aiActionFocus || 0];
                findAndSetAIAction(newAIActionConstructor, route);
            }
        }
    }, [route]);

    useEffect(() => {
        const dialogError = errors.find((error) => error.showDialog === true);
        if (dialogError) {
            // sdk.dialogs.openAlert({
            //   title: `${error.service}`,
            //   message: error.message,
            //   confirmLabel: "OK",
            // });
            sdk.notifier.error(
                `${dialogError.service}: ${dialogError.message}`,
            );
        }
    }, [errors]);

    useEffect(() => {
        (async () => {
            try {
                const params = {
                    ...(sdk.parameters
                        .installation as AppInstallationParameters),
                };
                if (!params.cma) {
                    addError({
                        service: "Looking for CMA",
                        message:
                            "No CMA found, got to config and enter your CMA.",
                        showDialog: true,
                    });
                    return;
                }
                const cpaResult = await getPreviewAccessKey(
                    params.cma,
                    sdk.ids.space,
                    sdk.ids.environment,
                );
                if (cpaResult) {
                    const isValidCPA = await testCPA(cpaResult, sdk);
                    if (isValidCPA) {
                        setCPA(cpaResult);
                    } else {
                        addError({
                            service: "Test CPA",
                            message:
                                "CPA is not valid for this space double check permissions.",
                            showDialog: true,
                        });
                        return;
                    }
                } else {
                    addError({
                        service: "Get Preview Access Key",
                        message:
                            "No CPA key found, please create an API key for the space.",
                        showDialog: true,
                    });
                    return;
                }

                // Build and Save Config...pass on to AI State Context
                const newAIConfig: AIStateConfig = {
                    cma: params.cma,
                    openAiApiKey: params.openai,
                    spaceId: sdk.ids.space,
                    environmentId: sdk.ids.environment,
                    cpa: cpaResult,
                };
                setAIStateConfig(newAIConfig);
                validateSpace();
                setRoute({
                    navigation: "prospect",
                    aiActions: NAVIGATION["prospect"].aiActions,
                    aiActionFocus: 0,
                });
                setConfigReady(true);
            } catch (err: any) {
                addError({
                    service: "Initializing App",
                    message: "Something went wrong initializing app.",
                    details: `${err} ${err} ${err} ${err} ${err}`,
                    showDialog: true,
                });
            }
        })();
    }, []);

    useEffect(() => {
        if (spaceStatus?.valid === false) {
            setRoute({
                navigation: "space",
                aiActions: NAVIGATION["space"].aiActions,
                aiActionFocus: 0,
            });
        }
    }, [spaceStatus]);

    return (
        <Flex
            flexDirection="row"
            style={{
                width: "100vw",
                height: "100vh",
                boxSizing: "border-box",
            }}
            alignItems="stretch"
        >
            <AIActionInspector />
            <Flex
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    boxShadow:
                        "rgba(25, 37, 50, 0.1) 0px 6px 16px -2px, rgba(25, 37, 50, 0.15) 0px 3px 6px -3px",
                    boxSizing: "border-box",
                    backgroundColor: tokens.colorWhite,
                    marginLeft: tokens.spacingM,
                    marginRight: tokens.spacingL,
                }}
            >
                {configReady === false ? (
                    <Flex
                        style={{ width: "100%", height: "100%" }}
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                    >
                        <Heading
                            style={{
                                fontSize: tokens.fontSizeL,
                            }}
                        >
                            DemAI
                        </Heading>
                        <LoadingIcon />
                    </Flex>
                ) : (
                    <>
                        <MainNav />
                        <ContentPanel />
                        {/* <ConversationPanel /> */}
                        <AIActionPanel />
                    </>
                )}
            </Flex>
        </Flex>
    );
};

export default Page;
