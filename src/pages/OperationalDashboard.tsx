import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';

export default function OperationalDashboard() {
  const navigate = useNavigate();

  return (
    <Result
      icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
      title="Selamat Datang, Operasional!"
      subTitle="Pilih menu di samping untuk mulai bekerja dengan sistem rekonsiliasi."
    />
  );
}