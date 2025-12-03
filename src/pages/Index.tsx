import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import CoinAnimation from '@/components/CoinAnimation';
import { playWinSound, playJackpotSound, playLoseSound, playCashoutSound, playSpinSound } from '@/utils/sounds';

interface GameCard {
  id: number;
  title: string;
  provider: string;
  category: string;
  type: 'slot' | 'crash' | 'mines' | 'plinko' | 'dice';
  hot?: boolean;
}

const Index = () => {
  const [balance, setBalance] = useState(100000);
  const [activeCategory, setActiveCategory] = useState('all');
  const [gameOpen, setGameOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameCard | null>(null);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [slotResult, setSlotResult] = useState(['🍒', '🍋', '🍊']);
  const [crashMultiplier, setCrashMultiplier] = useState(1.00);
  const [crashRunning, setCrashRunning] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [crashCashedOut, setCrashCashedOut] = useState(false);

  const allGames: GameCard[] = [
    { id: 1, title: 'Crash', provider: 'Clubber', category: 'Оригинальные', type: 'crash', hot: true },
    { id: 2, title: 'Mines', provider: 'Clubber', category: 'Оригинальные', type: 'mines', hot: true },
    { id: 3, title: 'Plinko', provider: 'Clubber', category: 'Оригинальные', type: 'plinko' },
    { id: 4, title: 'Dice', provider: 'Clubber', category: 'Оригинальные', type: 'dice' },
    { id: 5, title: 'Limbo', provider: 'Clubber', category: 'Оригинальные', type: 'crash' },
    { id: 6, title: 'Hilo', provider: 'Clubber', category: 'Оригинальные', type: 'slot' },
    { id: 7, title: 'Keno', provider: 'Clubber', category: 'Оригинальные', type: 'slot' },
    { id: 8, title: 'Tower', provider: 'Clubber', category: 'Оригинальные', type: 'slot' },
    { id: 9, title: 'Wheel', provider: 'Clubber', category: 'Оригинальные', type: 'slot' },
    { id: 10, title: 'Video Poker', provider: 'Clubber', category: 'Оригинальные', type: 'slot' },
    { id: 11, title: 'Coinflip', provider: 'Clubber', category: 'Оригинальные', type: 'slot', hot: true },
    { id: 12, title: 'Roulette', provider: 'Clubber', category: 'Оригинальные', type: 'slot' },
  ];

  const categories = [
    { id: 'all', label: 'Все игры', count: 12 },
    { id: 'original', label: 'Оригинальные', count: 12 },
    { id: 'hot', label: 'Популярные', count: 3 },
  ];

  const filteredGames = allGames.filter(game => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'hot') return game.hot;
    if (activeCategory === 'original') return game.category === 'Оригинальные';
    return true;
  });

  const getGameIcon = (game: GameCard) => {
    const icons: Record<string, string> = {
      'Crash': '🚀',
      'Mines': '💣',
      'Plinko': '🎯',
      'Dice': '🎲',
      'Limbo': '🌊',
      'Hilo': '🎴',
      'Keno': '🔢',
      'Tower': '🗼',
      'Wheel': '🎡',
      'Video Poker': '🃏',
      'Coinflip': '🪙',
      'Roulette': '🎰',
    };
    return icons[game.title] || '🎮';
  };

  const openGame = (game: GameCard) => {
    setActiveGame(game);
    setGameOpen(true);
    if (game.type === 'slot') {
      setSlotResult(['🍒', '🍋', '🍊']);
    } else if (game.type === 'crash') {
      setCrashMultiplier(1.00);
      setCrashRunning(false);
      setCrashCashedOut(false);
    }
  };

  const spinSlot = () => {
    if (!betAmount || slotSpinning) return;
    
    const amount = parseFloat(betAmount);
    if (amount > balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setBalance(balance - amount);
    setSlotSpinning(true);
    playSpinSound();

    const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'];
    let spins = 0;
    const interval = setInterval(() => {
      setSlotResult([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
      spins++;
      
      if (spins >= 20) {
        clearInterval(interval);
        const finalResult = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];
        setSlotResult(finalResult);
        setSlotSpinning(false);

        if (finalResult[0] === finalResult[1] && finalResult[1] === finalResult[2]) {
          const winAmount = amount * 10;
          setBalance(prev => prev + winAmount);
          playJackpotSound();
          setShowCoinAnimation(true);
          toast({ 
            title: "🎉 ДЖЕКПОТ!", 
            description: `Выигрыш: ${winAmount} ₽` 
          });
        } else if (finalResult[0] === finalResult[1] || finalResult[1] === finalResult[2]) {
          const winAmount = amount * 3;
          setBalance(prev => prev + winAmount);
          playWinSound();
          setShowCoinAnimation(true);
          toast({ 
            title: "Выигрыш!", 
            description: `+${winAmount} ₽` 
          });
        } else {
          playLoseSound();
          toast({ 
            title: "Почти получилось!", 
            variant: "destructive" 
          });
        }
        setBetAmount('');
      }
    }, 100);
  };

  const startCrash = () => {
    if (!betAmount || crashRunning) return;
    
    const amount = parseFloat(betAmount);
    if (amount > balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setBalance(balance - amount);
    setCrashRunning(true);
    setCrashCashedOut(false);
    setCrashMultiplier(1.00);

    const crashPoint = 1 + Math.random() * 9;
    const interval = setInterval(() => {
      setCrashMultiplier(prev => {
        const next = prev + 0.01;
        if (next >= crashPoint) {
          clearInterval(interval);
          setCrashRunning(false);
          if (!crashCashedOut) {
            playLoseSound();
            toast({ 
              title: "💥 КРАХ!", 
              description: `Множитель достиг ${crashPoint.toFixed(2)}x`,
              variant: "destructive" 
            });
          }
          return crashPoint;
        }
        return next;
      });
    }, 50);
  };

  const cashOut = () => {
    if (!crashRunning || crashCashedOut) return;
    
    setCrashCashedOut(true);
    setCrashRunning(false);
    
    const amount = parseFloat(betAmount);
    const winAmount = amount * crashMultiplier;
    setBalance(prev => prev + winAmount);
    
    playCashoutSound();
    setShowCoinAnimation(true);
    toast({ 
      title: "✅ Вывод успешен!", 
      description: `Выигрыш: ${winAmount.toFixed(2)} ₽ (${crashMultiplier.toFixed(2)}x)` 
    });
    setBetAmount('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="text-2xl font-bold text-foreground">CLUBBER</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Button variant="default" size="sm">
                <Icon name="Gamepad2" size={16} className="mr-2" />
                Казино
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Trophy" size={16} className="mr-2" />
                Спорт
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Radio" size={16} className="mr-2" />
                Live
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Gift" size={16} className="mr-2" />
                Акции
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
              <Icon name="Wallet" size={18} className="text-primary" />
              <span className="font-semibold">{balance.toLocaleString()} ₽</span>
            </div>

            <Button size="sm" variant="default">
              Войти
            </Button>
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hidden md:flex">
              Регистрация
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
              >
                {cat.label}
                <Badge variant="secondary" className="ml-2">{cat.count}</Badge>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              onClick={() => openGame(game)}
              className="group relative overflow-hidden cursor-pointer border-border hover:border-primary transition-all hover:scale-105"
            >
              {game.hot && (
                <Badge className="absolute top-2 right-2 z-10 bg-destructive">
                  🔥
                </Badge>
              )}
              
              <div className="aspect-square bg-gradient-to-br from-card to-muted flex items-center justify-center text-6xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">{getGameIcon(game)}</span>
              </div>
              
              <div className="p-3 bg-card">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
                <p className="text-xs text-muted-foreground">{game.provider}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={gameOpen} onOpenChange={setGameOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <span className="text-4xl">{activeGame && getGameIcon(activeGame)}</span>
              {activeGame?.title}
            </DialogTitle>
          </DialogHeader>
          
          {activeGame?.type === 'slot' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-xl border-2 border-primary/30">
                <div className="flex justify-center gap-4 mb-6">
                  {slotResult.map((symbol, i) => (
                    <div key={i} className="bg-card w-24 h-24 rounded-lg flex items-center justify-center text-5xl shadow-2xl border-2 border-border">
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Сумма ставки"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-muted border-border"
                  disabled={slotSpinning}
                />
                
                <Button 
                  onClick={spinSlot}
                  disabled={slotSpinning || !betAmount}
                  className="w-full bg-primary hover:bg-primary/90 font-bold text-lg h-12"
                >
                  {slotSpinning ? '🎰 Крутим...' : '🎰 ИГРАТЬ'}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                <p>🎯 3 одинаковых символа = ×10</p>
                <p>🎯 2 одинаковых символа = ×3</p>
              </div>
            </div>
          )}

          {activeGame?.type === 'crash' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-background to-muted p-8 rounded-xl border-2 border-border relative overflow-hidden">
                <div className="text-center">
                  <div className={`text-7xl font-bold mb-4 ${crashRunning ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                    {crashMultiplier.toFixed(2)}x
                  </div>
                  {activeGame && <div className="text-6xl">{getGameIcon(activeGame)}</div>}
                </div>
                {crashRunning && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Сумма ставки"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-muted border-border"
                  disabled={crashRunning}
                />
                
                {!crashRunning && !crashCashedOut && (
                  <Button 
                    onClick={startCrash}
                    disabled={!betAmount}
                    className="w-full bg-primary hover:bg-primary/90 font-bold text-lg h-12"
                  >
                    🚀 СТАРТ
                  </Button>
                )}

                {crashRunning && (
                  <Button 
                    onClick={cashOut}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg h-12"
                  >
                    💰 ЗАБРАТЬ {(parseFloat(betAmount) * crashMultiplier).toFixed(2)} ₽
                  </Button>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                <p>🎯 Нажмите ЗАБРАТЬ до того как произойдет крах!</p>
                <p>🎯 Чем выше множитель, тем больше выигрыш</p>
              </div>
            </div>
          )}

          {(activeGame?.type === 'mines' || activeGame?.type === 'plinko' || activeGame?.type === 'dice') && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{activeGame && getGameIcon(activeGame)}</div>
              <p className="text-muted-foreground">Игра в разработке</p>
              <p className="text-sm text-muted-foreground mt-2">Скоро появится!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CoinAnimation show={showCoinAnimation} onComplete={() => setShowCoinAnimation(false)} />
    </div>
  );
};

export default Index;
