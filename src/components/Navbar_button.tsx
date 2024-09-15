import React from 'react';
import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode,
  label: string,
  activeLink: string,
  onClicked: (label: string) => void
}

const Navbar_button = ({ children, label, activeLink, onClicked }: ButtonProps) => {
  return (
    <>
    <div className={"nav-link " + (activeLink == label ? "nav-link-active" : "")}>
      <div className="main" onClick={()=>{onClicked(label)}}>
        <img src="images/arrow_right.png" alt="Arrow right icon" />
        <a href="">Domů</a>
      </div>
      <div className="subLinkCont">
        {children}
      </div>
    </div>
    </>
  )
}

export default Navbar_button