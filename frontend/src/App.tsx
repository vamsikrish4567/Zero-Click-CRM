import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Connectors from './pages/Connectors'
import Activity from './pages/Activity'
import Upload from './pages/Upload'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/connectors" element={<Connectors />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </Layout>
  )
}

export default App

