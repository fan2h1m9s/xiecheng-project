import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import HotelList from './pages/HotelList'
import HotelEdit from './pages/HotelEdit'
import HotelReview from './pages/HotelReview'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/hotels" replace />} />
          <Route path="hotels" element={<HotelList />} />
          <Route path="hotels/new" element={<HotelEdit />} />
          <Route path="hotels/edit/:id" element={<HotelEdit />} />
          <Route path="hotels/review" element={<HotelReview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
