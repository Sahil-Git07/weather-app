import React from 'react'
import './styles.css'
import NavBar from './components/NavBar'
import { createBrowserRouter , RouterProvider } from 'react-router-dom'
import Home from './pages/Home'

const route = createBrowserRouter([
  {
    path: '/',
    element:
    <div>
      <NavBar />
        <Home/>
    </div>
  },
  // {
  //   path: '/search-weather',
  // element:
  //   <div>
  //     <NavBar />
  //       <SearchWeather/>
  //   </div>
  // }
])

const App = () => {
  return (
    <div >
         <RouterProvider router = {route} />
    </div>
  )
}

export default App
