import './widget/styles/style.css';

import { WidgetContainer } from './widget/components/widget-container.tsx';

function App() {
  return (
    <>
      <WidgetContainer clientKey={'test-key'} />
    </>
  );
}

export default App;
