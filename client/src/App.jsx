import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Todos from './pages/Todos';
import Notes from './pages/Notes';
import Layout from './components/Layout';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

      <Route element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/notes" element={<Notes />} />
      </Route>
    </Routes>
  );
}

export default App;
