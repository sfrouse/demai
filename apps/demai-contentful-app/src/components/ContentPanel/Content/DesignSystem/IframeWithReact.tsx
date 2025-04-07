import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const IframeWithReact = ({ children }: { children: React.ReactNode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentDocument) {
      setIframeDoc(iframe.contentDocument);
    }
  }, []);

  useEffect(() => {
    if (!iframeDoc) return;

    // Clone all <link> and <style> elements from parent
    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((styleNode) => {
        iframeDoc.head.appendChild(styleNode.cloneNode(true));
      });

    // Add your own custom <style> tag
    const customStyle = iframeDoc.createElement("style");
    customStyle.textContent = `
html, body {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 100, 100, 0.4) transparent;
}

/* WebKit Browsers (Chrome, Safari, Edge) */
html::-webkit-scrollbar,
body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

html::-webkit-scrollbar-track,
body::-webkit-scrollbar-track {
    background: transparent;
}

html::-webkit-scrollbar-thumb,
body::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 100, 0.4);
    border-radius: 3px;
}

html::-webkit-scrollbar-thumb:hover,
body::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 100, 100, 0.6);
}
  `;
    iframeDoc.head.appendChild(customStyle);
  }, [iframeDoc]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
    >
      {iframeDoc && ReactDOM.createPortal(children, iframeDoc.body)}
    </iframe>
  );
};

export default IframeWithReact;
