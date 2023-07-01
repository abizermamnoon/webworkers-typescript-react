import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from "./SidebarData";
import { IconContext } from "react-icons/lib";
 
const Nav = styled.div`
  background: white;
  height: 30px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
 
const NavIcon = styled(Link)`
  margin-left: 1rem;
  font-size: 1rem;
  height: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  top: 1;
  left: 1;
`;
 
const SidebarNav = styled.nav`
  background: lightgrey;
  width: 150px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: ${({ sidebar }) => (sidebar ? "0" : "-100%")};
  z-index: 10;
`;
 
const SidebarWrap = styled.div`
  width: 50%;
`;

const SidebarItem = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 2rem 1rem;
  color: black;
  &:hover {
    background-color: yellow;
  }
`;
 
const Sidebar = () => {
  const [sidebar, setSidebar] = useState(false);
 
  const showSidebar = () => setSidebar(!sidebar);
 
  return (
    <>
      <IconContext.Provider value={{ color: "black" }}>
      <Nav>
          <NavIcon to="#">
            <FaIcons.FaBars onClick={showSidebar} />
          </NavIcon>   
       </Nav>
        <SidebarNav sidebar={sidebar}>
          <SidebarWrap>
            <NavIcon to="#">
              <AiIcons.AiOutlineClose onClick={showSidebar} />
            </NavIcon>
            {SidebarData.map((item, index) => (
              <SidebarItem to={item.path} key={index}>
                {/* {item.icon} */}
                <span>{item.title}</span>
              </SidebarItem>
            ))}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};
 
export default Sidebar;