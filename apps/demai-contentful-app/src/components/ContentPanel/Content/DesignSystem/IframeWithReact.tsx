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
