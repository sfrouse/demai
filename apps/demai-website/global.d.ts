declare namespace React.JSX {
  interface IntrinsicElements {
    [key: `demai-${string}`]: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      label?: string;
      [key: string]: any; // optional for extra props
    };
    [key: `dmai-${string}`]: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      label?: string;
      [key: string]: any; // optional for extra props
    };
  }
}
