import React from 'react'
import { NavLink } from 'react-router-dom'

export default function MyLogo() {
  return (
    <>
      <div className='w-[120px]'>
        <NavLink to={"/"} >
<img className='w-full rounded-[20px]' src="./img/Logo.png" alt="" /> 
       </NavLink>
      </div>
    </>
  )
}