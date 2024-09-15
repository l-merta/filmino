import React from 'react';
import { useState } from 'react'
import LinkButton from './Navbar_button'
import LinkSubButton from './Navbar_button_sub'

interface NavbarProps {
  defActiveLink: string
  actSubLink: string
}

const Navbar = ({ defActiveLink, actSubLink }: NavbarProps) => {
  const [activeLink, setActiveLink] = useState(defActiveLink);
  function onLinkClicked(label: string) {
    if(activeLink != label)
      setActiveLink(label);
    else
      setActiveLink("");
  }

  return (
    <nav className='nav-side'>
      <LinkButton label="Domů" activeLink={activeLink} onClicked={onLinkClicked}>
        <LinkSubButton text="Populární" href="" iconCls="" actSubLink={actSubLink}></LinkSubButton>
        <LinkSubButton text="Prdni si" href="" iconCls="" actSubLink={actSubLink}></LinkSubButton>
      </LinkButton>
    </nav>
  )
}

export default Navbar