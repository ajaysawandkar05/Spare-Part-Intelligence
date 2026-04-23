import { FaHome, FaInfoCircle, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <ul className="navbar-list navbar-list--horizontal" style={{ display: 'flex', gap: '18px', listStyle: 'none', margin: 0, padding: 0 }}>
        <li>
          <Link to="/" className="navbar-link" style={{ display: 'flex', alignItems: 'center', padding: '0 18px', height: 48, color: 'var(--amber)', textDecoration: 'none', fontWeight: 600, fontSize: 17, borderRadius: 8, transition: 'background 0.2s, color 0.2s' }}>
            <FaHome style={{ marginRight: 8, fontSize: 18 }} /> Home
          </Link>
        </li>
        <li>
          <Link to="/about" className="navbar-link" style={{ display: 'flex', alignItems: 'center', padding: '0 18px', height: 48, color: 'var(--amber)', textDecoration: 'none', fontWeight: 600, fontSize: 17, borderRadius: 8, transition: 'background 0.2s, color 0.2s' }}>
            <FaInfoCircle style={{ marginRight: 8, fontSize: 18 }} /> About
          </Link>
        </li>
        <li>
          <Link to="/contact" className="navbar-link" style={{ display: 'flex', alignItems: 'center', padding: '0 18px', height: 48, color: 'var(--amber)', textDecoration: 'none', fontWeight: 600, fontSize: 17, borderRadius: 8, transition: 'background 0.2s, color 0.2s' }}>
            <FaEnvelope style={{ marginRight: 8, fontSize: 18 }} /> Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
