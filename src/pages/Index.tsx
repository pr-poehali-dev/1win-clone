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

interface LiveMatch {
  id: number;
  sport: string;
  team1: string;
  team2: string;
  score: string;
  time: string;
  odds1: number;
  oddsX: number;
  odds2: number;
  isLive: boolean;
}

interface GameCard {
  id: number;
  title: string;
  image: string;
  category: string;
  type: 'slot' | 'crash' | 'card' | 'roulette';
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
  const [balance, setBalance] = useState(10000);
  const [activeTab, setActiveTab] = useState('live');
  const [betSlipOpen, setBetSlipOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ match: LiveMatch; type: string; odds: number } | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [bets, setBets] = useState<Bet[]>([]);
  const [gameOpen, setGameOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameCard | null>(null);
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [slotResult, setSlotResult] = useState(['🍒', '🍋', '🍊']);
  const [crashMultiplier, setCrashMultiplier] = useState(1.00);
  const [crashRunning, setCrashRunning] = useState(false);
  const [crashBetAmount, setCrashBetAmount] = useState('');
  const [crashCashedOut, setCrashCashedOut] = useState(false);

  const liveMatches: LiveMatch[] = [
    {
      id: 1,
      sport: 'Футбол',
      team1: 'Реал Мадрид',
      team2: 'Барселона',
      score: '2:1',
      time: "45'",
      odds1: 2.45,
      oddsX: 3.20,
      odds2: 2.80,
      isLive: true
    },
    {
      id: 2,
      sport: 'Баскетбол',
      team1: 'Лейкерс',
      team2: 'Уорриорз',
      score: '87:92',
      time: "3Q 8:24",
      odds1: 1.95,
      oddsX: 0,
      odds2: 1.87,
      isLive: true
    },
    {
      id: 3,
      sport: 'Теннис',
      team1: 'Д. Медведев',
      team2: 'К. Алькарас',
      score: '6:4, 3:2',
      time: "2 сет",
      odds1: 1.65,
      oddsX: 0,
      odds2: 2.25,
      isLive: true
    },
    {
      id: 4,
      sport: 'Хоккей',
      team1: 'ЦСКА',
      team2: 'СКА',
      score: '1:2',
      time: "2 период",
      odds1: 2.10,
      oddsX: 3.80,
      odds2: 3.15,
      isLive: true
    }
  ];

  const games: GameCard[] = [
    { id: 1, title: 'Sweet Bonanza', image: '🍭', category: 'Слоты', type: 'slot' },
    { id: 2, title: 'Gates of Olympus', image: '⚡', category: 'Слоты', type: 'slot' },
    { id: 3, title: 'Aviator', image: '✈️', category: 'Краш', type: 'crash' },
    { id: 4, title: 'Lucky Jet', image: '🚀', category: 'Краш', type: 'crash' },
    { id: 5, title: 'Blackjack', image: '🃏', category: 'Карты', type: 'card' },
    { id: 6, title: 'Roulette', image: '🎰', category: 'Рулетка', type: 'roulette' }
  ];

  const handleBetClick = (match: LiveMatch, type: string, odds: number) => {
    setSelectedBet({ match, type, odds });
    setBetSlipOpen(true);
  };

  const placeBet = () => {
    if (!selectedBet || !betAmount) return;
    
    const amount = parseFloat(betAmount);
    if (amount > balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setBalance(balance - amount);
    
    const newBet: Bet = {
      id: Date.now(),
      match: `${selectedBet.match.team1} vs ${selectedBet.match.team2}`,
      type: selectedBet.type,
      odds: selectedBet.odds,
      amount,
      timestamp: new Date(),
      status: 'pending'
    };

    setBets([newBet, ...bets]);
    
    setTimeout(() => {
      const isWin = Math.random() > 0.5;
      setBets(prev => prev.map(bet => 
        bet.id === newBet.id 
          ? { ...bet, status: isWin ? 'win' : 'lose' }
          : bet
      ));
      
      if (isWin) {
        const winAmount = amount * selectedBet.odds;
        setBalance(prev => prev + winAmount);
        playWinSound();
        setShowCoinAnimation(true);
        toast({ 
          title: "Выигрыш!", 
          description: `Вы выиграли ${winAmount.toFixed(2)} ₽` 
        });
      } else {
        playLoseSound();
        toast({ 
          title: "Проигрыш", 
          description: "В следующий раз повезёт!",
          variant: "destructive"
        });
      }
    }, 5000);

    setBetSlipOpen(false);
    setBetAmount('');
    playBetSound();
    toast({ title: "Ставка принята!" });
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
    if (!crashBetAmount || crashRunning) return;
    
    const amount = parseFloat(crashBetAmount);
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
    
    const amount = parseFloat(crashBetAmount);
    const winAmount = amount * crashMultiplier;
    setBalance(prev => prev + winAmount);
    
    playCashoutSound();
    setShowCoinAnimation(true);
    toast({ 
      title: "✅ Вывод успешен!", 
      description: `Выигрыш: ${winAmount.toFixed(2)} ₽ (${crashMultiplier.toFixed(2)}x)` 
    });
    setCrashBetAmount('');
  };

  return (
    <div className="min-h-screen bg-[#0f212e]">
      <nav className="sticky top-0 z-50 bg-[#1a2c38] border-b border-[#2f4553]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-bold text-[#00e701]">1WIN</div>
              
              <div className="hidden lg:flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-white hover:bg-[#2f4553] gap-2">
                  <Icon name="Home" size={16} />
                  Главная
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2f4553] gap-2">
                  <Icon name="Trophy" size={16} />
                  Спорт
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2f4553] gap-2">
                  <Icon name="Radio" size={16} />
                  Live
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2f4553] gap-2">
                  <Icon name="Gamepad2" size={16} />
                  Казино
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2f4553] gap-2">
                  <Icon name="Zap" size={16} />
                  Слоты
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#2f4553] px-4 py-2 rounded-lg flex items-center gap-2">
                <Icon name="Wallet" size={18} className="text-[#00e701]" />
                <span className="text-white font-semibold">{balance.toFixed(2)} ₽</span>
              </div>
              <Button size="sm" className="bg-[#00e701] text-black hover:bg-[#00c501] font-semibold">
                Войти
              </Button>
              <Button size="sm" className="bg-[#ff6b00] text-white hover:bg-[#ff5500] font-semibold">
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Card className="col-span-2 bg-gradient-to-r from-[#ff6b00] to-[#ff8c00] border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Приветственный бонус</h2>
                <p className="text-white/90 text-lg mb-4">+500% к первому депозиту</p>
                <Button className="bg-white text-[#ff6b00] hover:bg-gray-100 font-bold">
                  Получить бонус
                </Button>
              </div>
              <div className="text-6xl">🎁</div>
            </div>
          </Card>

          <Card className="bg-[#1a2c38] border-[#2f4553] p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-[#00e701]" />
              Мои ставки
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {bets.slice(0, 3).map(bet => (
                <div key={bet.id} className="bg-[#0f212e] p-2 rounded text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{bet.match}</span>
                    <Badge 
                      variant={bet.status === 'win' ? 'default' : bet.status === 'lose' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {bet.status === 'win' ? '✓' : bet.status === 'lose' ? '✗' : '●'}
                    </Badge>
                  </div>
                  <div className="text-white font-semibold">{bet.amount} ₽ × {bet.odds}</div>
                </div>
              ))}
              {bets.length === 0 && (
                <p className="text-gray-500 text-sm">Нет активных ставок</p>
              )}
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Live события
            </h2>
            <Button 
              variant={activeTab === 'live' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('live')}
              className={activeTab === 'live' ? 'bg-[#00e701] text-black' : 'text-gray-400 border-[#2f4553]'}
            >
              В эфире
            </Button>
            <Button 
              variant={activeTab === 'upcoming' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('upcoming')}
              className={activeTab === 'upcoming' ? 'bg-[#00e701] text-black' : 'text-gray-400 border-[#2f4553]'}
            >
              Скоро
            </Button>
          </div>

          <div className="space-y-3">
            {liveMatches.map((match) => (
              <Card key={match.id} className="bg-[#1a2c38] border-[#2f4553] p-4 hover:border-[#00e701] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-red-500 text-white text-xs">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                        LIVE
                      </Badge>
                      <span className="text-gray-400 text-sm">{match.sport}</span>
                      <span className="text-[#ff6b00] text-sm font-semibold">{match.time}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-white">
                        <span className="font-semibold">{match.team1}</span>
                        <span className="text-2xl font-bold text-[#00e701]">{match.score.split(':')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between text-white">
                        <span className="font-semibold">{match.team2}</span>
                        <span className="text-2xl font-bold text-[#ff6b00]">{match.score.split(':')[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => handleBetClick(match, 'П1', match.odds1)}
                      className="flex flex-col items-center justify-center w-20 h-16 bg-[#0f212e] hover:bg-[#00e701]/20 border-2 border-transparent hover:border-[#00e701] rounded transition-all"
                    >
                      <span className="text-gray-400 text-xs mb-1">П1</span>
                      <span className="text-white text-xl font-bold">{match.odds1}</span>
                    </button>
                    
                    {match.oddsX > 0 && (
                      <button
                        onClick={() => handleBetClick(match, 'X', match.oddsX)}
                        className="flex flex-col items-center justify-center w-20 h-16 bg-[#0f212e] hover:bg-[#00e701]/20 border-2 border-transparent hover:border-[#00e701] rounded transition-all"
                      >
                        <span className="text-gray-400 text-xs mb-1">X</span>
                        <span className="text-white text-xl font-bold">{match.oddsX}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleBetClick(match, 'П2', match.odds2)}
                      className="flex flex-col items-center justify-center w-20 h-16 bg-[#0f212e] hover:bg-[#00e701]/20 border-2 border-transparent hover:border-[#00e701] rounded transition-all"
                    >
                      <span className="text-gray-400 text-xs mb-1">П2</span>
                      <span className="text-white text-xl font-bold">{match.odds2}</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="Sparkles" size={24} className="text-[#ff6b00]" />
            Популярные игры
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {games.map((game) => (
              <Card 
                key={game.id}
                onClick={() => openGame(game)}
                className="group bg-[#1a2c38] border-[#2f4553] cursor-pointer hover:border-[#00e701] transition-all hover:scale-105 overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-[#2f4553] to-[#0f212e] flex items-center justify-center text-6xl">
                  {game.image}
                </div>
                <div className="p-3">
                  <Badge className="bg-[#00e701] text-black text-xs mb-2">
                    {game.category}
                  </Badge>
                  <h3 className="text-white font-semibold text-sm group-hover:text-[#00e701] transition-colors">
                    {game.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={betSlipOpen} onOpenChange={setBetSlipOpen}>
        <DialogContent className="bg-[#1a2c38] border-[#2f4553] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Купон ставки</DialogTitle>
          </DialogHeader>
          {selectedBet && (
            <div className="space-y-4">
              <div className="bg-[#0f212e] p-4 rounded-lg">
                <p className="text-gray-400 text-sm">{selectedBet.match.sport}</p>
                <p className="text-white font-semibold">{selectedBet.match.team1} vs {selectedBet.match.team2}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">{selectedBet.type}</span>
                  <span className="text-[#00e701] text-xl font-bold">{selectedBet.odds}</span>
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Сумма ставки</label>
                <Input
                  type="number"
                  placeholder="Введите сумму"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-[#0f212e] border-[#2f4553] text-white"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 5000].map(amount => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      onClick={() => setBetAmount(amount.toString())}
                      className="text-white border-[#2f4553] hover:bg-[#2f4553]"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {betAmount && (
                <div className="bg-[#0f212e] p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Возможный выигрыш:</span>
                    <span className="text-[#00e701] font-bold">
                      {(parseFloat(betAmount) * selectedBet.odds).toFixed(2)} ₽
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={placeBet}
                className="w-full bg-[#00e701] text-black hover:bg-[#00c501] font-bold"
                disabled={!betAmount || parseFloat(betAmount) > balance}
              >
                Сделать ставку
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={gameOpen} onOpenChange={setGameOpen}>
        <DialogContent className="bg-[#1a2c38] border-[#2f4553] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">{activeGame?.title}</DialogTitle>
          </DialogHeader>
          
          {activeGame?.type === 'slot' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#ff6b00] to-[#ff8c00] p-8 rounded-xl">
                <div className="flex justify-center gap-4 mb-6">
                  {slotResult.map((symbol, i) => (
                    <div key={i} className="bg-white w-24 h-24 rounded-lg flex items-center justify-center text-5xl shadow-2xl">
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
                  className="bg-[#0f212e] border-[#2f4553] text-white"
                  disabled={slotSpinning}
                />
                
                <Button 
                  onClick={spinSlot}
                  disabled={slotSpinning || !betAmount}
                  className="w-full bg-[#00e701] text-black hover:bg-[#00c501] font-bold text-lg h-12"
                >
                  {slotSpinning ? '🎰 Крутим...' : '🎰 SPIN'}
                </Button>
              </div>

              <div className="bg-[#0f212e] p-4 rounded-lg text-sm text-gray-400">
                <p>🎯 3 одинаковых символа = ×10</p>
                <p>🎯 2 одинаковых символа = ×3</p>
              </div>
            </div>
          )}

          {activeGame?.type === 'crash' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0f212e] to-[#1a2c38] p-8 rounded-xl border-2 border-[#2f4553] relative overflow-hidden">
                <div className="text-center">
                  <div className={`text-7xl font-bold mb-4 ${crashRunning ? 'text-[#00e701]' : 'text-white'}`}>
                    {crashMultiplier.toFixed(2)}x
                  </div>
                  {activeGame.image && <div className="text-6xl">{activeGame.image}</div>}
                </div>
                {crashRunning && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00e701]/20 to-transparent animate-pulse"></div>
                )}
              </div>

              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Сумма ставки"
                  value={crashBetAmount}
                  onChange={(e) => setCrashBetAmount(e.target.value)}
                  className="bg-[#0f212e] border-[#2f4553] text-white"
                  disabled={crashRunning}
                />
                
                {!crashRunning && !crashCashedOut && (
                  <Button 
                    onClick={startCrash}
                    disabled={!crashBetAmount}
                    className="w-full bg-[#00e701] text-black hover:bg-[#00c501] font-bold text-lg h-12"
                  >
                    🚀 СТАРТ
                  </Button>
                )}

                {crashRunning && (
                  <Button 
                    onClick={cashOut}
                    className="w-full bg-[#ff6b00] text-white hover:bg-[#ff5500] font-bold text-lg h-12 animate-pulse"
                  >
                    💰 ЗАБРАТЬ {(parseFloat(crashBetAmount) * crashMultiplier).toFixed(2)} ₽
                  </Button>
                )}
              </div>

              <div className="bg-[#0f212e] p-4 rounded-lg text-sm text-gray-400">
                <p>🎯 Нажмите ЗАБРАТЬ до того как произойдет крах!</p>
                <p>🎯 Чем выше множитель, тем больше выигрыш</p>
              </div>
            </div>
          )}

          {(activeGame?.type === 'card' || activeGame?.type === 'roulette') && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{activeGame.image}</div>
              <p className="text-gray-400">Игра в разработке</p>
              <p className="text-sm text-gray-500 mt-2">Скоро появится!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CoinAnimation show={showCoinAnimation} onComplete={() => setShowCoinAnimation(false)} />
    </div>
  );
};

export default Index;