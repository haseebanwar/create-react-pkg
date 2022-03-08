import { useEffect } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  useEffect(() => {
    console.log('called');
  });

  return (
    <div>
      <p>this is an apps</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
