import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import CoinAnimation from '@/components/CoinAnimation';
import { playWinSound, playJackpotSound, playLoseSound, playCashoutSound } from '@/utils/sounds';

interface User {
  id: number;
  email: string;
  name: string;
  balance: number;
}

const BACKEND_URLS = {
  auth: 'https://functions.poehali.dev/57db90f5-1df4-45f5-9729-d1dc43cf9a14',
  deposit: 'https://functions.poehali.dev/aa035a4f-acb4-48cb-acc2-5b1e87624710',
  withdraw: 'https://functions.poehali.dev/70f4ce1f-5608-46e5-a0dd-e5f77b1f0945',
  game: 'https://functions.poehali.dev/1299c880-8d99-433b-becd-1241bdd90f6d'
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<'rocket' | 'mines' | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  
  const [crashMultiplier, setCrashMultiplier] = useState(1.00);
  const [crashRunning, setCrashRunning] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [crashCashedOut, setCrashCashedOut] = useState(false);
  
  const [minesGrid, setMinesGrid] = useState<Array<'hidden' | 'gem' | 'mine'>>(Array(25).fill('hidden'));
  const [minesRevealed, setMinesRevealed] = useState(0);
  const [minesMultiplier, setMinesMultiplier] = useState(1.0);
  const [minesGameActive, setMinesGameActive] = useState(false);
  const [minePositions, setMinePositions] = useState<number[]>([]);

  const depositAmounts = [100, 200, 400, 600, 1000];
  const [selectedDeposit, setSelectedDeposit] = useState(100);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('card');
  const [withdrawDetails, setWithdrawDetails] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleGoogleAuth = async () => {
    const mockEmail = `user_${Date.now()}@gmail.com`;
    
    try {
      const response = await fetch(BACKEND_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          token: 'demo_token',
          email: mockEmail,
          name: 'Google User',
          avatar: '',
          provider_id: Date.now().toString()
        })
      });

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthOpen(false);
      toast({ title: "Успешная авторизация!", description: `Добро пожаловать, ${data.user.name}` });
    } catch (error) {
      toast({ title: "Ошибка авторизации", variant: "destructive" });
    }
  };

  const handleVkAuth = async () => {
    const mockEmail = `user_${Date.now()}@vk.com`;
    
    try {
      const response = await fetch(BACKEND_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'vk',
          token: 'demo_token',
          email: mockEmail,
          name: 'VK User',
          avatar: '',
          provider_id: Date.now().toString()
        })
      });

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthOpen(false);
      toast({ title: "Успешная авторизация!", description: `Добро пожаловать, ${data.user.name}` });
    } catch (error) {
      toast({ title: "Ошибка авторизации", variant: "destructive" });
    }
  };

  const handleDeposit = async () => {
    if (!user) return;

    try {
      const response = await fetch(BACKEND_URLS.deposit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: selectedDeposit
        })
      });

      const data = await response.json();
      
      toast({ 
        title: "Инструкция по пополнению", 
        description: `Переведите ${selectedDeposit} ₽ на номер ${data.phone} с комментарием: ID${user.id}`,
        duration: 10000
      });
      
      setTimeout(() => {
        const newBalance = user.balance + selectedDeposit;
        setUser({ ...user, balance: newBalance });
        localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
        toast({ title: "Баланс пополнен!", description: `+${selectedDeposit} ₽` });
        setShowCoinAnimation(true);
      }, 3000);
      
      setDepositOpen(false);
    } catch (error) {
      toast({ title: "Ошибка пополнения", variant: "destructive" });
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount || !withdrawDetails) {
      toast({ title: "Заполните все поля", variant: "destructive" });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > user.balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(BACKEND_URLS.withdraw, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: amount,
          payment_method: withdrawMethod,
          payment_details: withdrawDetails
        })
      });

      const data = await response.json();
      
      const newBalance = user.balance - amount;
      setUser({ ...user, balance: newBalance });
      localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
      
      toast({ title: "Заявка на вывод создана", description: data.message });
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
    } catch (error) {
      toast({ title: "Ошибка вывода", variant: "destructive" });
    }
  };

  const startCrash = () => {
    if (!user || !betAmount || crashRunning) return;
    
    const amount = parseFloat(betAmount);
    if (amount > user.balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setUser({ ...user, balance: user.balance - amount });
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

  const cashOut = async () => {
    if (!user || !crashRunning || crashCashedOut) return;
    
    setCrashCashedOut(true);
    setCrashRunning(false);
    
    const amount = parseFloat(betAmount);
    const winAmount = amount * crashMultiplier;
    
    try {
      await fetch(BACKEND_URLS.game, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          game_type: 'rocket',
          bet_amount: amount,
          win_amount: winAmount,
          multiplier: crashMultiplier,
          result: 'win'
        })
      });
    } catch (error) {
      console.error('Game save error:', error);
    }
    
    const newBalance = user.balance + winAmount;
    setUser({ ...user, balance: newBalance });
    localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
    
    playCashoutSound();
    setShowCoinAnimation(true);
    toast({ 
      title: "✅ Вывод успешен!", 
      description: `Выигрыш: ${winAmount.toFixed(2)} ₽ (${crashMultiplier.toFixed(2)}x)` 
    });
    setBetAmount('');
  };

  const startMines = () => {
    if (!user || !betAmount || minesGameActive) return;
    
    const amount = parseFloat(betAmount);
    if (amount > user.balance) {
      toast({ title: "Недостаточно средств", variant: "destructive" });
      return;
    }

    setUser({ ...user, balance: user.balance - amount });
    setMinesGameActive(true);
    setMinesRevealed(0);
    setMinesMultiplier(1.0);
    setMinesGrid(Array(25).fill('hidden'));
    
    const mines: number[] = [];
    while (mines.length < 5) {
      const pos = Math.floor(Math.random() * 25);
      if (!mines.includes(pos)) mines.push(pos);
    }
    setMinePositions(mines);
  };

  const revealMineCell = async (index: number) => {
    if (!user || !minesGameActive || minesGrid[index] !== 'hidden') return;

    const newGrid = [...minesGrid];
    
    if (minePositions.includes(index)) {
      newGrid[index] = 'mine';
      setMinesGrid(newGrid);
      setMinesGameActive(false);
      playLoseSound();
      
      minePositions.forEach(pos => {
        newGrid[pos] = 'mine';
      });
      setMinesGrid(newGrid);
      
      toast({ title: "💣 Мина!", description: "Вы проиграли", variant: "destructive" });
      
      try {
        await fetch(BACKEND_URLS.game, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            game_type: 'mines',
            bet_amount: parseFloat(betAmount),
            win_amount: 0,
            multiplier: 0,
            result: 'lose'
          })
        });
      } catch (error) {
        console.error('Game save error:', error);
      }
      
      setBetAmount('');
    } else {
      newGrid[index] = 'gem';
      setMinesGrid(newGrid);
      const revealed = minesRevealed + 1;
      setMinesRevealed(revealed);
      const newMultiplier = 1 + (revealed * 0.3);
      setMinesMultiplier(newMultiplier);
      playWinSound();
    }
  };

  const cashOutMines = async () => {
    if (!user || !minesGameActive) return;

    const amount = parseFloat(betAmount);
    const winAmount = amount * minesMultiplier;
    
    try {
      await fetch(BACKEND_URLS.game, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          game_type: 'mines',
          bet_amount: amount,
          win_amount: winAmount,
          multiplier: minesMultiplier,
          result: 'win'
        })
      });
    } catch (error) {
      console.error('Game save error:', error);
    }
    
    const newBalance = user.balance + winAmount;
    setUser({ ...user, balance: newBalance });
    localStorage.setItem('user', JSON.stringify({ ...user, balance: newBalance }));
    
    setMinesGameActive(false);
    playCashoutSound();
    setShowCoinAnimation(true);
    toast({ 
      title: "✅ Успешно!", 
      description: `Выигрыш: ${winAmount.toFixed(2)} ₽ (${minesMultiplier.toFixed(2)}x)` 
    });
    setBetAmount('');
    
    minePositions.forEach(pos => {
      const newGrid = [...minesGrid];
      newGrid[pos] = 'mine';
      setMinesGrid(newGrid);
    });
  };

  const openGame = (game: 'rocket' | 'mines') => {
    if (!user) {
      setAuthOpen(true);
      toast({ title: "Требуется авторизация", variant: "destructive" });
      return;
    }
    setActiveGame(game);
    setGameOpen(true);
    setBetAmount('');
    
    if (game === 'rocket') {
      setCrashMultiplier(1.00);
      setCrashRunning(false);
      setCrashCashedOut(false);
    } else if (game === 'mines') {
      setMinesGrid(Array(25).fill('hidden'));
      setMinesRevealed(0);
      setMinesMultiplier(1.0);
      setMinesGameActive(false);
      setMinePositions([]);
    }
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
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <Button size="sm" variant="outline" onClick={() => setDepositOpen(true)}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Пополнить
                </Button>
                <Button size="sm" variant="outline" onClick={() => setWithdrawOpen(true)}>
                  <Icon name="Minus" size={16} className="mr-2" />
                  Вывести
                </Button>
                <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
                  <Icon name="Wallet" size={18} className="text-primary" />
                  <span className="font-semibold">{user.balance.toFixed(2)} ₽</span>
                </div>
                <div className="text-sm text-muted-foreground">{user.name}</div>
              </>
            )}
            
            {!user && (
              <Button size="sm" variant="default" onClick={() => setAuthOpen(true)}>
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Крипто Казино
          </h1>
          <p className="text-muted-foreground text-lg">Играй и выигрывай реальные деньги</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card
            onClick={() => openGame('rocket')}
            className="group relative overflow-hidden cursor-pointer border-border hover:border-primary transition-all hover:scale-105 p-0"
          >
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-8xl mb-4 relative z-10">🚀</div>
              <h3 className="text-3xl font-bold relative z-10 group-hover:text-primary transition-colors">Ракета</h3>
              <p className="text-muted-foreground mt-2">До ×10 множителя</p>
            </div>
          </Card>

          <Card
            onClick={() => openGame('mines')}
            className="group relative overflow-hidden cursor-pointer border-border hover:border-primary transition-all hover:scale-105 p-0"
          >
            <div className="aspect-square bg-gradient-to-br from-destructive/20 to-secondary/20 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-8xl mb-4 relative z-10">💎</div>
              <h3 className="text-3xl font-bold relative z-10 group-hover:text-primary transition-colors">Mines</h3>
              <p className="text-muted-foreground mt-2">Найди все алмазы</p>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Авторизация</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={handleGoogleAuth}
              className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold"
            >
              <Icon name="Mail" size={20} className="mr-3" />
              Войти через Google
            </Button>

            <Button 
              onClick={handleVkAuth}
              className="w-full h-12 bg-[#0077FF] hover:bg-[#0066DD] text-white font-semibold"
            >
              <Icon name="AtSign" size={20} className="mr-3" />
              Войти через ВКонтакте
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Входя на сайт, вы соглашаетесь с правилами использования
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Пополнение баланса</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Выберите сумму пополнения:</p>
              <div className="grid grid-cols-3 gap-3">
                {depositAmounts.map(amount => (
                  <Button
                    key={amount}
                    onClick={() => setSelectedDeposit(amount)}
                    variant={selectedDeposit === amount ? 'default' : 'outline'}
                    className="h-16 text-lg font-bold"
                  >
                    {amount} ₽
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm mb-2">Инструкция:</p>
              <p className="text-xs text-muted-foreground">
                1. Переведите {selectedDeposit} ₽ на номер <span className="font-bold text-primary">+79047275294</span> (Тинькофф)
              </p>
              <p className="text-xs text-muted-foreground">
                2. В комментарии укажите: <span className="font-bold">ID{user?.id || '---'}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Деньги поступят автоматически в течение 1-3 минут
              </p>
            </div>

            <Button 
              onClick={handleDeposit}
              className="w-full h-12 bg-primary hover:bg-primary/90 font-bold text-lg"
            >
              Я оплатил {selectedDeposit} ₽
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Вывод средств</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Сумма вывода</label>
              <Input
                type="number"
                placeholder="Введите сумму"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-muted border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Доступно: {user?.balance.toFixed(2)} ₽
              </p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Способ вывода</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setWithdrawMethod('card')}
                  variant={withdrawMethod === 'card' ? 'default' : 'outline'}
                >
                  Карта
                </Button>
                <Button
                  onClick={() => setWithdrawMethod('phone')}
                  variant={withdrawMethod === 'phone' ? 'default' : 'outline'}
                >
                  Телефон
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {withdrawMethod === 'card' ? 'Номер карты' : 'Номер телефона'}
              </label>
              <Input
                type="text"
                placeholder={withdrawMethod === 'card' ? '0000 0000 0000 0000' : '+7 (900) 000-00-00'}
                value={withdrawDetails}
                onChange={(e) => setWithdrawDetails(e.target.value)}
                className="bg-muted border-border"
              />
            </div>

            <Button 
              onClick={handleWithdraw}
              className="w-full h-12 bg-primary hover:bg-primary/90 font-bold text-lg"
            >
              Вывести
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Вывод обрабатывается в течение 1-24 часов
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gameOpen} onOpenChange={setGameOpen}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <span className="text-4xl">{activeGame === 'rocket' ? '🚀' : '💎'}</span>
              {activeGame === 'rocket' ? 'Ракета' : 'Mines'}
            </DialogTitle>
          </DialogHeader>
          
          {activeGame === 'rocket' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-background to-muted p-12 rounded-xl border-2 border-border relative overflow-hidden">
                <div className="text-center">
                  <div className={`text-8xl font-bold mb-6 ${crashRunning ? 'text-primary animate-pulse' : 'text-foreground'}`}>
                    {crashMultiplier.toFixed(2)}x
                  </div>
                  <div className="text-7xl">🚀</div>
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
                  className="bg-muted border-border h-12 text-lg"
                  disabled={crashRunning}
                />
                
                {!crashRunning && !crashCashedOut && (
                  <Button 
                    onClick={startCrash}
                    disabled={!betAmount}
                    className="w-full bg-primary hover:bg-primary/90 font-bold text-xl h-14"
                  >
                    🚀 СТАРТ
                  </Button>
                )}

                {crashRunning && (
                  <Button 
                    onClick={cashOut}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xl h-14"
                  >
                    💰 ЗАБРАТЬ {(parseFloat(betAmount || '0') * crashMultiplier).toFixed(2)} ₽
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeGame === 'mines' && (
            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-xl">
                <div className="grid grid-cols-5 gap-2">
                  {minesGrid.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => revealMineCell(index)}
                      disabled={!minesGameActive || cell !== 'hidden'}
                      className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all ${
                        cell === 'hidden' 
                          ? 'bg-card hover:bg-primary/20 cursor-pointer' 
                          : cell === 'gem'
                          ? 'bg-primary/30'
                          : 'bg-destructive/30'
                      }`}
                    >
                      {cell === 'gem' && '💎'}
                      {cell === 'mine' && '💣'}
                    </button>
                  ))}
                </div>

                {minesGameActive && (
                  <div className="mt-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      Множитель: {minesMultiplier.toFixed(2)}x
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Открыто: {minesRevealed} / 20
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {!minesGameActive && (
                  <>
                    <Input
                      type="number"
                      placeholder="Сумма ставки"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-muted border-border h-12 text-lg"
                    />
                    
                    <Button 
                      onClick={startMines}
                      disabled={!betAmount}
                      className="w-full bg-primary hover:bg-primary/90 font-bold text-xl h-14"
                    >
                      💎 НАЧАТЬ ИГРУ
                    </Button>
                  </>
                )}

                {minesGameActive && (
                  <Button 
                    onClick={cashOutMines}
                    disabled={minesRevealed === 0}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xl h-14"
                  >
                    💰 ЗАБРАТЬ {(parseFloat(betAmount || '0') * minesMultiplier).toFixed(2)} ₽
                  </Button>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                <p>🎯 Открывайте клетки и находите алмазы</p>
                <p>🎯 5 мин из 25 клеток - избегайте их!</p>
                <p>🎯 Каждый алмаз увеличивает множитель</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CoinAnimation show={showCoinAnimation} onComplete={() => setShowCoinAnimation(false)} />
    </div>
  );
};

export default Index;
