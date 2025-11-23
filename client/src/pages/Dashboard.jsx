import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { FiPlus, FiCopy, FiCalendar, FiCheckSquare, FiFileText, FiUsers } from 'react-icons/fi';
import { calendarService, todoService, noteService, familyService } from '../services/api';

const Dashboard = () => {
  const { currentFamily, families, createFamily, joinFamily } = useFamily();
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showJoinFamily, setShowJoinFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [stats, setStats] = useState({ events: 0, todos: 0, notes: 0, members: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentFamily) {
      loadStats();
    }
  }, [currentFamily]);

  const loadStats = async () => {
    if (!currentFamily) return;

    try {
      const [events, todos, notes, members] = await Promise.all([
        calendarService.getEvents(currentFamily.id),
        todoService.getTodos(currentFamily.id),
        noteService.getNotes(currentFamily.id),
        familyService.getMembers(currentFamily.id),
      ]);

      setStats({
        events: events.length,
        todos: todos.filter(t => !t.completed).length,
        notes: notes.length,
        members: members.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      await createFamily(familyName);
      setFamilyName('');
      setShowCreateFamily(false);
    } catch (error) {
      alert('Failed to create family');
    }
  };

  const handleJoinFamily = async (e) => {
    e.preventDefault();
    try {
      await joinFamily(inviteCode);
      setInviteCode('');
      setShowJoinFamily(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to join family');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(currentFamily.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentFamily && families.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUsers className="mx-auto text-6xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Family App!</h2>
        <p className="text-gray-600 mb-8">Create a family group or join an existing one to get started</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => setShowCreateFamily(true)} className="btn-primary">
            <FiPlus className="inline mr-2" />
            Create Family
          </button>
          <button onClick={() => setShowJoinFamily(true)} className="btn-secondary">
            Join Family
          </button>
        </div>

        {showCreateFamily && (
          <div className="mt-8 max-w-md mx-auto card">
            <h3 className="text-xl font-bold mb-4">Create New Family</h3>
            <form onSubmit={handleCreateFamily}>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Family name"
                className="input-field mb-4"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowCreateFamily(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showJoinFamily && (
          <div className="mt-8 max-w-md mx-auto card">
            <h3 className="text-xl font-bold mb-4">Join Family</h3>
            <form onSubmit={handleJoinFamily}>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                className="input-field mb-4"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Join</button>
                <button type="button" onClick={() => setShowJoinFamily(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentFamily?.name || 'Dashboard'}</h1>
        {currentFamily && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Invite Code:</span>
            <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">{currentFamily.invite_code}</code>
            <button
              onClick={copyInviteCode}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
            >
              <FiCopy className="mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/calendar" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FiCalendar className="text-3xl text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.events}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Upcoming Events</h3>
        </Link>

        <Link to="/todos" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FiCheckSquare className="text-3xl text-green-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.todos}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Active Todos</h3>
        </Link>

        <Link to="/notes" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <FiFileText className="text-3xl text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.notes}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Shared Notes</h3>
        </Link>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <FiUsers className="text-3xl text-orange-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.members}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Family Members</h3>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => setShowCreateFamily(!showCreateFamily)} className="btn-primary">
          <FiPlus className="inline mr-2" />
          Create Another Family
        </button>
        <button onClick={() => setShowJoinFamily(!showJoinFamily)} className="btn-secondary">
          Join Another Family
        </button>
      </div>

      {showCreateFamily && (
        <div className="mt-6 max-w-md card">
          <h3 className="text-xl font-bold mb-4">Create New Family</h3>
          <form onSubmit={handleCreateFamily}>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Family name"
              className="input-field mb-4"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Create</button>
              <button type="button" onClick={() => setShowCreateFamily(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showJoinFamily && (
        <div className="mt-6 max-w-md card">
          <h3 className="text-xl font-bold mb-4">Join Family</h3>
          <form onSubmit={handleJoinFamily}>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="input-field mb-4"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">Join</button>
              <button type="button" onClick={() => setShowJoinFamily(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
