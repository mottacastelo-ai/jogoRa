declare module 'react/jsx-runtime' {
  export default any
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
