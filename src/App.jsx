import { useState } from 'react'
import './App.css'
import MovieApp from './components/MovieApp';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
         <MovieApp/>
      </div>
    </>
  )
}

export default App
