import React from 'react'
import Hero from '../Components/Hero/Hero.jsx'
import Popular from '../Components/Popular/Popular.jsx'
import Offers from '../Components/Offers/Offers.jsx'
import NewCollections from '../Components/NewCollections/NewCollections.jsx'
import NewsLetter from '../Components/NewLetter/NewsLetter.jsx'
import Chatbot from '../Components/Chatbot/Chatbot.jsx'

const Shop = () => {
  return (
    <div>
        <Hero/>
        <Popular/>
        <Offers/>
        <NewCollections/>
        <NewsLetter/>
        <Chatbot/>
    </div>

  )
}

export default Shop