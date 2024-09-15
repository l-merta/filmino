import React from 'react';

interface ButtonSubProps {
  text: string,
  iconCls: string,
  href: string,
  actSubLink: string
}

const Navbar_button_sub = ({ text, iconCls, href, actSubLink }: ButtonSubProps) => {
  return (
    <>
    <div className={"sub-link " + (actSubLink == text ? "sub-link-active" : "")}>
      <a href={href}>
        <i className={iconCls}></i>
        <span>{text}</span>
      </a>
    </div>
    </>
  )
}

export default Navbar_button_sub