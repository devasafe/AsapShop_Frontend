import React from 'react'
import Hero from '../Components/Hero/Hero'
import DropNext from '../Components/DropNext/DropNext'
import DropAtual from '../Components/DropAtual/DropAtual'
import DropsPassados from '../Components/DropsPassados/DropsPassados'
import DropEnd from '../Components/DropEnd/DropEnd' 

const Inicio = () => {
  return (
    <div>
      <div style={{ paddingTop: '92px' }}></div>
      <Hero/>
      <DropEnd/>
      <DropAtual/>
      <DropsPassados/>
      <DropNext />


    </div>
  )
}


export default Inicio;
