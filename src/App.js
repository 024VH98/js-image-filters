import { Layout, Typography, Breadcrumb, Card }  from 'antd';
import ImageFiltersContent from "./ImageFiltersContent";

import './App.css';

const { Title } = Typography;
const { Header, Content, Footer } = Layout;
const App = () => (
  <Layout>
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <Title level={2} style={{color: "white", paddingTop: "10px"}}>Robotica - App</Title>
    </Header>
    <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Image</Breadcrumb.Item>
        <Breadcrumb.Item>Filters</Breadcrumb.Item>
      </Breadcrumb>
      <div className="site-layout-background" style={{ padding: "10px 24px", minHeight: "100vh" }}>
        <Card style={{ width: "100%" }}>
          <ImageFiltersContent />
        </Card>
      </div>
    </Content>
  </Layout>
);

export default App;