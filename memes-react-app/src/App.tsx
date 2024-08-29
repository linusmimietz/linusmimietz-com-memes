import React from 'react';
import './App.css';
import { Button, ConfigProvider, Space } from 'antd';
import './assets/fonts/fontfaces.css';

function App() {
  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#303030',
        colorTextBase: '#303030',
        borderRadius: 4,
      },
    }}
  >
    <div className="App">
      <h1>Ant Design</h1>
      <p>with custom theme</p>
      <Space>
        <Button type="primary">Click Me</Button>
        </Space>

    </div>
  </ConfigProvider>
  );
}

export default App;
