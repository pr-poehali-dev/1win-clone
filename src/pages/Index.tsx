import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import CoinAnimation from '@/components/CoinAnimation';
import { playWinSound, playJackpotSound, playBetSound, playLoseSound, playCashoutSound, playSpinSound } from '@/utils/sounds';

interface GameCard {
  id: number;
  title: string;
  provider: string;
  category: string;
  type: 'slot' | 'crash' | 'card' | 'roulette' | 'live';
  hot?: boolean;
  new?: boolean;
}

interface Bet {
  id: number;
  match: string;
  type: string;
  odds: number;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'win' | 'lose';
}

const Index = () => {
  const [balance, setBalance] = useState(50000);
  const [activeCategory, setActiveCategory] = useState('popular');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gameOpen, setGameOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameCard | null>(null);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [slotResult, setSlotResult] = useState(['🍒', '🍋', '🍊']);
  const [crashMultiplier, setCrashMultiplier] = useState(1.00);
  const [crashRunning, setCrashRunning] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [crashCashedOut, setCrashCashedOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allGames: GameCard[] = [
    { id: 1, title: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot', hot: true },
    { id: 2, title: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot', hot: true },
    { id: 3, title: 'Aviator', provider: 'Spribe', category: 'Краш', type: 'crash', hot: true },
    { id: 4, title: 'Lucky Jet', provider: 'Gaming Corps', category: 'Краш', type: 'crash', new: true },
    { id: 5, title: 'The Dog House', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot' },
    { id: 6, title: 'Sugar Rush', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot', new: true },
    { id: 7, title: 'Big Bass Bonanza', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot' },
    { id: 8, title: 'Book of Dead', provider: 'Play n GO', category: 'Слоты', type: 'slot' },
    { id: 9, title: 'Crazy Time', provider: 'Evolution', category: 'Live казино', type: 'live', hot: true },
    { id: 10, title: 'Lightning Roulette', provider: 'Evolution', category: 'Live казино', type: 'live' },
    { id: 11, title: 'Monopoly Live', provider: 'Evolution', category: 'Live казино', type: 'live' },
    { id: 12, title: 'Blackjack', provider: 'Evolution', category: 'Карты', type: 'card' },
    { id: 13, title: 'Mega Ball', provider: 'Evolution', category: 'Live казино', type: 'live' },
    { id: 14, title: 'Fruit Party', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot' },
    { id: 15, title: 'Starlight Princess', provider: 'Pragmatic Play', category: 'Слоты', type: 'slot', hot: true },
    { id: 16, title: 'Fire Joker', provider: 'Play n GO', category: 'Слоты', type: 'slot' },
    { id: 17, title: 'Reactoonz', provider: 'Play n GO', category: 'Слоты', type: 'slot' },
    { id: 18, title: 'Moon Princess', provider: 'Play n GO', category: 'Слоты', type: 'slot' },
    { id: 19, title: 'Jammin Jars', provider: 'Push Gaming', category: 'Слоты', type: 'slot' },
    { id: 20, title: 'Wanted Dead', provider: 'Hacksaw Gaming', category: 'Слоты', type: 'slot', new: true },
    { id: 21, title: 'Mines', provider: 'Spribe', category: 'Краш', type: 'crash' },
    { id: 22, title: 'Plinko', provider: 'Spribe', category: 'Краш', type: 'crash' },
    { id: 23, title: 'Dice', provider: 'Spribe', category: 'Краш', type: 'crash' },
    { id: 24, title: 'European Roulette', provider: 'NetEnt', category: 'Рулетка', type: 'roulette' },
  ];

  const categories = [
    { id: 'popular', icon: 'TrendingUp', label: 'Популярное', count: 24 },
    { id: 'slots', icon: 'CircleDot', label: 'Слоты', count: 150 },
    { id: 'live', icon: 'Video', label: 'Live казино', count: 45 },
    { id: 'crash', icon: 'Rocket', label: 'Краш игры', count: 12 },
    { id: 'jackpot', icon: 'Trophy', label: 'Джекпот', count: 8 },
    { id: 'new', icon: 'Sparkles', label: 'Новые', count: 6 },
    { id: 'table', icon: 'LayoutGrid', label: 'Настольные', count: 32 },
  ];

  const filteredGames = allGames.filter(game => {
    if (searchQuery) {
      return game.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeCategory === 'popular') return game.hot || game.new;
    if (activeCategory === 'slots') return game.type === 'slot';
    if (activeCategory === 'live') return game.type === 'live';
    if (activeCategory === 'crash') return game.type === 'crash';
    if (activeCategory === 'new') return game.new;
    return true;
  });

  const getGameIcon = (game: GameCard) => {
    const icons: Record<string, string> = {
      'Sweet Bonanza': '🍭',
      'Gates of Olympus': '⚡',
      'Aviator': '✈️',
      'Lucky Jet': '🚀',
      'The Dog House': '🐕',
      'Sugar Rush': '🍬',
      'Big Bass Bonanza': '🎣',
      'Book of Dead': '📖',
      'Crazy Time': '🎡',
      'Lightning Roulette': '⚡',
      'Monopoly Live': '🎲',
      'Blackjack': '🃏',
      'Mega Ball': '🔮',
      'Fruit Party': '🍓',
      'Starlight Princess': '👸',
      'Fire Joker': '🃏',
      'Reactoonz': '👾',
      'Moon Princess': '🌙',
      'Jammin Jars': '🍯',
      'Wanted Dead': '🤠',
      'Mines': '💣',
      'Plinko': '🎯',
      'Dice': '🎲',
      'European Roulette': '🎰',
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
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Icon name="Menu" size={24} />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-2xl font-bold text-secondary">WIN</div>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-sm">
                <Icon name="Trophy" size={16} className="mr-2" />
                Спорт
              </Button>
              <Button variant="ghost" size="sm" className="text-sm">
                <Icon name="Radio" size={16} className="mr-2" />
                Live
              </Button>
              <Button variant="default" size="sm" className="text-sm">
                <Icon name="Gamepad2" size={16} className="mr-2" />
                Казино
              </Button>
              <Button variant="ghost" size="sm" className="text-sm">
                <Icon name="Tv" size={16} className="mr-2" />
                Live казино
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск игр..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-muted border-border"
              />
            </div>

            <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
              <Icon name="Wallet" size={18} className="text-primary" />
              <span className="font-semibold">{balance.toLocaleString()} ₽</span>
            </div>

            <Button size="sm" variant="default">
              <Icon name="LogIn" size={16} className="mr-2" />
              Войти
            </Button>
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hidden md:flex">
              Регистрация
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-card border-r border-border h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto`}>
          <div className="p-4 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name={cat.icon as any} size={20} />
                  <span className="font-medium">{cat.label}</span>
                </div>
                <span className="text-xs opacity-70">{cat.count}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {categories.find(c => c.id === activeCategory)?.label || 'Игры'}
            </h1>
            <p className="text-muted-foreground">
              {filteredGames.length} {filteredGames.length === 1 ? 'игра' : 'игр'} доступно
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredGames.map((game) => (
              <Card
                key={game.id}
                onClick={() => openGame(game)}
                className="group relative overflow-hidden cursor-pointer border-border hover:border-primary transition-all hover:scale-105"
              >
                {(game.hot || game.new) && (
                  <Badge
                    className={`absolute top-2 left-2 z-10 ${
                      game.hot ? 'bg-destructive' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {game.hot ? '🔥 ХИТ' : '✨ NEW'}
                  </Badge>
                )}
                
                <div className="aspect-square bg-gradient-to-br from-muted to-background flex items-center justify-center text-6xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10">{getGameIcon(game)}</span>
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{game.provider}</p>
                </div>
              </Card>
            ))}
          </div>
        </main>
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
                  {slotSpinning ? '🎰 Крутим...' : '🎰 SPIN'}
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
                  <div className={`text-7xl font-bold mb-4 ${crashRunning ? 'text-primary' : ''}`}>
                    {crashMultiplier.toFixed(2)}x
                  </div>
                  {activeGame && <div className="text-6xl">{getGameIcon(activeGame)}</div>}
                </div>
                {crashRunning && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent animate-pulse"></div>
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
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-lg h-12 animate-pulse"
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

          {(activeGame?.type === 'card' || activeGame?.type === 'roulette' || activeGame?.type === 'live') && (
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
