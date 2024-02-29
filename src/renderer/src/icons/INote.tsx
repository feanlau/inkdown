import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    className="icon"
    viewBox="0 0 1024 1024"
    fill={'currentColor'}
    {...props}
  >
    <path d="M288 320h448a32 32 0 0 0 0-64H288a32 32 0 0 0 0 64zm0 224h448a32 32 0 0 0 0-64H288a32 32 0 0 0 0 64zm256 160H288a32 32 0 0 0 0 64h256a32 32 0 0 0 0-64z" />
    <path d="M896 132.928C896 77.28 851.552 32 796.928 32H227.04C172.448 32 128 77.28 128 132.928v758.144C128 946.72 172.448 992 227.04 992h435.008c1.568 0 2.912-.672 4.416-.896 8.96 1.6 18.464-.256 25.984-6.528l192-160a31.424 31.424 0 0 0 10.816-27.2c.16-1.184.736-2.208.736-3.424V132.928zM192 891.072V132.928C192 112.576 207.712 96 227.04 96h569.888C816.288 96 832 112.576 832 132.928V736h-96a96 96 0 0 0-96 96v96H227.04c-19.328 0-35.04-16.576-35.04-36.928zM814.016 800 704 891.68V832a32 32 0 0 1 32-32h78.016z" />
  </svg>
)
export default SvgComponent
