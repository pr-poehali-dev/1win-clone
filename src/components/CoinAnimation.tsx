import { useEffect, useState } from 'react';

interface Coin {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

interface CoinAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const CoinAnimation = ({ show, onComplete }: CoinAnimationProps) => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (show) {
      const newCoins: Coin[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5
      }));
      setCoins(newCoins);

      const timer = setTimeout(() => {
        setCoins([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute text-4xl animate-fall"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            animationDelay: `${coin.delay}s`,
            transform: `rotate(${coin.rotation}deg)`
          }}
        >
          💰
        </div>
      ))}
    </div>
  );
};

export default CoinAnimation;
