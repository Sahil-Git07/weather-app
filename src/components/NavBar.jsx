import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MdDarkMode } from "react-icons/md";

const NavBar = () => {
  let [mode,setMode ] = useState(false)

  const handleClick = () =>{
     setMode(true)
  }

  return (
    <div className='nav-container'>
        <div className='logo-container'>
       <p className='logo'>Weather App</p>
        </div>
   
   <div className='button-container'>
     <NavLink to='/' className='button'>Home</NavLink>
      <NavLink to='/search-weather' className='button'>SearchWeather</NavLink>
       <MdDarkMode className='mode-button' onClick={handleClick}/>
   </div>
      
    </div>
  )
}

export default NavBar
