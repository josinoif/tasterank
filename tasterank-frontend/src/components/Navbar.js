'use client'; // Client Component

import Link from 'next/link';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="header">
      <nav className="navbar">
        <Link href="/" className="logo">
          <h1>🍽️ TasteRank</h1>
        </Link>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/restaurantes">Restaurantes</Link></li>
        </ul>
      </nav>
    </header>
  );
}