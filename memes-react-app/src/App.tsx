import React from 'react';
import './App.css';
import './assets/fonts/fontfaces.css';
import { Button, ConfigProvider, Space, Typography } from 'antd';

function App() {
  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#303030',
        colorTextBase: '#303030',
        borderRadius: 4,
        fontFamily: 'Sequel Sans Body'
      },
    }}
  >
    <div className="App">
      <Space direction="vertical">
        <Typography.Title>Ant Design</Typography.Title>
        <Typography.Text>with custom theme</Typography.Text>
        <Button type="primary">Click Me</Button>
        <div>
          Font test
        </div>
      </Space>
    </div>
  </ConfigProvider>
  );
}

export default App;
