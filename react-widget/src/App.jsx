
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(
  () => Number(window.stayNestPropertyCount ?? 0)
);

  useEffect(() => {
  function handlePropertyCount(event) {
    setCount(Number(event.detail?.count ?? 0));
  }

  window.addEventListener(
    'staynest:property-count',
    handlePropertyCount
  );

  // Read the latest count in case the initial event fired before React started.
  if (typeof window.stayNestPropertyCount === 'number') {
    setCount(window.stayNestPropertyCount);
  }

  return () => {
    window.removeEventListener(
      'staynest:property-count',
      handlePropertyCount
    );
  };
}, []);

  return (
    <div className="results-summary" aria-live="polite">
      <strong>{count}</strong>{' '}
      {count === 1 ? 'property matches' : 'properties match'} your search.
    </div>
  );
}

export default App;
