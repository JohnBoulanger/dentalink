import { Link } from "react-router-dom";
import "./style.css";

export default function NotFound() {
  return (
    <div className="NotFound page-enter">
      <h1>404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link to="/">Go home</Link>
    </div>
  );
}
