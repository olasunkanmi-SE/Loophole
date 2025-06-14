declare namespace JSX {
  interface IntrinsicElements {
    'gmp-map': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      center?: string;
      zoom?: number;
      mapId?: string;
      'map-id'?: string;
      slot?: string;
    }, HTMLElement>;
    'gmp-place-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      selectable?: boolean;
      style?: React.CSSProperties;
    }, HTMLElement>;
    'gmp-place-details': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      style?: React.CSSProperties;
    }, HTMLElement>;
    'gmp-place-details-place-request': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      place?: string;
    }, HTMLElement>;
    'gmp-place-all-content': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
