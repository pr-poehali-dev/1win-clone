import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('live');

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
    { id: 1, title: 'Sweet Bonanza', image: '🍭', category: 'Слоты' },
    { id: 2, title: 'Gates of Olympus', image: '⚡', category: 'Слоты' },
    { id: 3, title: 'Aviator', image: '✈️', category: 'Краш' },
    { id: 4, title: 'Lucky Jet', image: '🚀', category: 'Краш' },
    { id: 5, title: 'Blackjack', image: '🃏', category: 'Карты' },
    { id: 6, title: 'Roulette', image: '🎰', category: 'Рулетка' }
  ];

  const navItems = [
    { icon: 'Home', label: 'Главная', active: true },
    { icon: 'Gamepad2', label: 'Игры', active: false },
    { icon: 'Trophy', label: 'Ставки', active: false },
    { icon: 'User', label: 'Профиль', active: false },
    { icon: 'Gift', label: 'Промоции', active: false },
    { icon: 'Swords', label: 'Турниры', active: false },
    { icon: 'HeadphonesIcon', label: 'Поддержка', active: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                1WIN
              </div>
              <Badge variant="secondary" className="animate-pulse-glow">
                LIVE
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant={item.active ? 'default' : 'ghost'}
                  className="gap-2 transition-all hover:scale-105"
                >
                  <Icon name={item.icon as any} size={18} />
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Icon name="LogIn" size={18} />
                Вход
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                <Icon name="UserPlus" size={18} />
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 md:p-12 border border-primary/30 animate-fade-in">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">
              Ставки на спорт онлайн
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-6">
              Лучшие коэффициенты на футбол, хоккей, баскетбол и другие виды спорта
            </p>
            <div className="flex gap-3">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-accent to-secondary hover:opacity-90 text-lg px-8">
                <Icon name="Zap" size={20} />
                Начать играть
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                <Icon name="Play" size={20} />
                Демо режим
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/30 to-transparent rounded-full blur-3xl"></div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Icon name="Radio" size={32} className="text-accent animate-pulse" />
              Live Ставки
            </h2>
            <div className="flex gap-2">
              <Button variant={activeTab === 'live' ? 'default' : 'outline'} onClick={() => setActiveTab('live')}>
                <Icon name="Tv" size={18} className="mr-2" />
                В эфире
              </Button>
              <Button variant={activeTab === 'upcoming' ? 'default' : 'outline'} onClick={() => setActiveTab('upcoming')}>
                <Icon name="Clock" size={18} className="mr-2" />
                Скоро
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {liveMatches.map((match, index) => (
              <Card 
                key={match.id} 
                className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:scale-[1.01] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="destructive" className="animate-pulse">
                        <Icon name="Circle" size={8} className="mr-1 fill-current" />
                        LIVE
                      </Badge>
                      <span className="text-sm text-muted-foreground">{match.sport}</span>
                      <span className="text-sm font-semibold text-accent">{match.time}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{match.team1}</span>
                        <span className="text-2xl font-bold text-primary">{match.score.split(':')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{match.team2}</span>
                        <span className="text-2xl font-bold text-secondary">{match.score.split(':')[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <Button 
                      className="flex flex-col h-20 w-24 bg-muted hover:bg-primary/20 transition-all hover:scale-105 animate-pulse-glow"
                      variant="outline"
                    >
                      <span className="text-xs text-muted-foreground mb-1">П1</span>
                      <span className="text-2xl font-bold text-primary">{match.odds1}</span>
                    </Button>
                    
                    {match.oddsX > 0 && (
                      <Button 
                        className="flex flex-col h-20 w-24 bg-muted hover:bg-accent/20 transition-all hover:scale-105 animate-pulse-glow"
                        variant="outline"
                        style={{ animationDelay: '0.2s' }}
                      >
                        <span className="text-xs text-muted-foreground mb-1">X</span>
                        <span className="text-2xl font-bold text-accent">{match.oddsX}</span>
                      </Button>
                    )}
                    
                    <Button 
                      className="flex flex-col h-20 w-24 bg-muted hover:bg-secondary/20 transition-all hover:scale-105 animate-pulse-glow"
                      variant="outline"
                      style={{ animationDelay: '0.4s' }}
                    >
                      <span className="text-xs text-muted-foreground mb-1">П2</span>
                      <span className="text-2xl font-bold text-secondary">{match.odds2}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Icon name="Sparkles" size={32} className="text-secondary" />
            Популярные игры
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {games.map((game, index) => (
              <Card 
                key={game.id}
                className="group relative overflow-hidden cursor-pointer transition-all hover:scale-105 hover:border-primary animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-muted to-background flex items-center justify-center text-6xl">
                  {game.image}
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {game.category}
                  </Badge>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Gift" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Бонус 500%</h3>
              <p className="text-muted-foreground">На первый депозит до 100 000 ₽</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Zap" size={32} className="text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Быстрый вывод</h3>
              <p className="text-muted-foreground">Моментальные выплаты 24/7</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Shield" size={32} className="text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Безопасность</h3>
              <p className="text-muted-foreground">Лицензия и защита данных</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-primary">О компании</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">О нас</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Лицензия</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Партнерство</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-secondary">Помощь</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">FAQ</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Служба поддержки</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Правила</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 text-accent">Ставки</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Live ставки</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Линия</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Киберспорт</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Социальные сети</h4>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                  <Icon name="MessageCircle" size={20} />
                </Button>
                <Button size="icon" variant="outline" className="hover:bg-secondary hover:text-secondary-foreground">
                  <Icon name="Send" size={20} />
                </Button>
                <Button size="icon" variant="outline" className="hover:bg-accent hover:text-accent-foreground">
                  <Icon name="AtSign" size={20} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
            <p>© 2024 1WIN. Все права защищены. 18+</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
