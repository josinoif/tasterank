import Link from 'next/link';
import './home.css';
import ApiTest from '@/components/ApiTest';

export default function Home() {
  return (
    <>
      <div className="home-container">
        <section className="hero">
          <h1>Bem-vindo ao TasteRank</h1>
          <p>Descubra e avalie os melhores restaurantes da sua região</p>
          <Link href="/restaurantes" className="cta-button">
            Ver Restaurantes
          </Link>
        </section>
        
        <section className="features">
          <div className="feature">
            <h3>🔍 Busque</h3>
            <p>Encontre restaurantes por categoria e localização</p>
          </div>
          <div className="feature">
            <h3>⭐ Avalie</h3>
            <p>Compartilhe sua experiência com a comunidade</p>
          </div>
          <div className="feature">
            <h3>🏆 Descubra</h3>
            <p>Conheça os mais bem avaliados</p>
          </div>
        </section>
      </div>
      <ApiTest />
    </>
  );
}