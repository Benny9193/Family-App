import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { FiHome, FiCalendar, FiCheckSquare, FiFileText, FiLogOut, FiUsers } from 'react-icons/fi';

const Layout = () => {
  const { user, logout } = useAuth();
  const { currentFamily, families, switchFamily } = useFamily();

  const navItems = [
    { to: '/', icon: FiHome, label: 'Dashboard' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/todos', icon: FiCheckSquare, label: 'Todos' },
    { to: '/notes', icon: FiFileText, label: 'Notes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FiUsers className="text-primary-600 text-2xl mr-2" />
                <span className="text-xl font-bold text-gray-900">Family App</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
            <div className="flex items-center space-x-4">
              {currentFamily && families.length > 1 && (
                <select
                  value={currentFamily.id}
                  onChange={(e) => {
                    const family = families.find(f => f.id === parseInt(e.target.value));
                    switchFamily(family);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  {families.map(family => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}
                >
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <FiLogOut className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
