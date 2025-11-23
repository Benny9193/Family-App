import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { FiHome, FiCalendar, FiCheckSquare, FiFileText, FiLogOut, FiUsers, FiMenu, FiX, FiUser } from 'react-icons/fi';
import AvatarUpload from './AvatarUpload';

const Layout = () => {
  const { user, logout } = useAuth();
  const { currentFamily, families, switchFamily } = useFamily();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { to: '/', icon: FiHome, label: 'Dashboard' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/todos', icon: FiCheckSquare, label: 'Todos' },
    { to: '/notes', icon: FiFileText, label: 'Notes' },
  ];

  const handleAvatarUpload = () => {
    window.location.reload(); // Reload to show new avatar
  };

  const avatarSrc = user?.avatarUrl ? `${window.location.origin}${user.avatarUrl}` : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FiUsers className="text-primary-600 text-2xl mr-2" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Family App</span>
                <span className="text-xl font-bold text-gray-900 sm:hidden">Family</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <item.icon className="mr-2" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {currentFamily && families.length > 1 && (
                <select
                  value={currentFamily.id}
                  onChange={(e) => {
                    const family = families.find(f => f.id === parseInt(e.target.value));
                    switchFamily(family);
                  }}
                  className="hidden sm:block px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
                  style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.fullName}</span>
              </button>
              <button
                onClick={logout}
                className="hidden md:block p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <FiLogOut className="text-xl" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="mr-3 text-xl" />
                  {item.label}
                </NavLink>
              ))}
              {currentFamily && families.length > 1 && (
                <div className="px-3 py-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Switch Family</label>
                  <select
                    value={currentFamily.id}
                    onChange={(e) => {
                      const family = families.find(f => f.id === parseInt(e.target.value));
                      switchFamily(family);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {families.map(family => (
                      <option key={family.id} value={family.id}>
                        {family.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-3 text-left text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                <FiLogOut className="mr-3 text-xl" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Profile</h2>
              <button onClick={() => setShowProfile(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload onUploadSuccess={handleAvatarUpload} />

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{user?.fullName}</h3>
                <p className="text-sm text-gray-500">@{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              {currentFamily && (
                <div className="w-full pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Current Family</div>
                  <div className="font-medium text-gray-900">{currentFamily.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Invite Code: <code className="bg-gray-100 px-2 py-1 rounded">{currentFamily.invite_code}</code>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowProfile(false)}
              className="mt-6 w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
