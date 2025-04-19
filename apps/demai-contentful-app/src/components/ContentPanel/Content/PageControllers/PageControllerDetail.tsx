import React, { useEffect } from "react";
import { Flex } from "@contentful/f36-components";
import ContentPanelHeader from "../../ContentPanelHeader";
import { useContentStateSession } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { NAVIGATION } from "../../../MainNav";
import useAIState from "../../../../contexts/AIStateContext/useAIState";
import LoadingStyles from "../../../Loading/LoadingStyles";
import { useSDK } from "@contentful/react-apps-toolkit";
import { PageAppSDK } from "@contentful/app-sdk";
import { DEMAI_WEBSITE_URL } from "../../../../constants";

const PageControllerDetail = () => {
    const sdk = useSDK<PageAppSDK>();
    const { contentState, loadProperty, loadingState } =
        useContentStateSession();
    const { route, setRoute } = useAIState();

    useEffect(() => {
        loadProperty("pageControllers");
    }, [contentState]);

    const pageController = contentState.pageControllers?.find(
        (page) => page.fields.slug === route?.pageControllerSlug,
    );
    // if (!pageController) {
    //     setRoute({
    //         navigation: "pages",
    //         aiActions: NAVIGATION["pages"].aiActions,
    //         aiActionFocus: 0,
    //     });
    // }
    const isLoading = loadingState.pageControllers === true || !pageController;

    return (
        <>
            <ContentPanelHeader
                title={`${pageController?.fields.title}`}
                invalidate
                goBack={() => {
                    setRoute({
                        navigation: "pages",
                        aiActions: NAVIGATION["pages"].aiActions,
                        aiActionFocus: 0,
                    });
                }}
            />
            <Flex
                flexDirection="column"
                alignItems="center"
                style={{
                    position: "relative",
                    ...LoadingStyles(isLoading),
                    flex: 1,
                }}
            >
                <iframe
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    src={`${DEMAI_WEBSITE_URL}${route?.pageControllerSlug}?space=${sdk.ids.space}&env=${sdk.ids.environment}`}
                ></iframe>
            </Flex>
        </>
    );
};

export default PageControllerDetail;
