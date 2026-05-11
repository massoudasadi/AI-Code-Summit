import { render } from 'hono/jsx/dom';
import { App } from './App.tsx';
import './index.css';

const root = document.getElementById('root');
if (root) {
  render(<App />, root);
}
