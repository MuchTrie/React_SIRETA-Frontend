import { Dropdown, Avatar, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  if (!user) {
    return null;
  }

  // Ambil inisial dari email untuk avatar
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Admin' : 'Operasional';
  };

  const profileMenuItems = [
    {
      key: 'email',
      label: (
        <div>
          <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
            {getRoleLabel(user.role)}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {user.email}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
      <Space
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Avatar
          size={36}
          style={{
            backgroundColor:
              user.role === 'admin' ? '#1890ff' : '#52c41a',
            color: '#fff',
          }}
          icon={<UserOutlined />}
        >
          {getInitials(user.email)}
        </Avatar>
        <div style={{ lineHeight: '1.2' }}>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {user.username || user.email.split('@')[0]}
          </div>
        </div>
      </Space>
    </Dropdown>
  );
}
