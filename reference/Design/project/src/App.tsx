import { useState } from 'react';
import { TopBar, BottomNav } from '@/components/navigation';
import { Composer } from '@/components/composer';
import { HomeScreen } from '@/screens/home';
import { DiscoverScreen } from '@/screens/discover';
import { SearchScreen } from '@/screens/search';
import { ProfileScreen } from '@/screens/profile';
import { MessagesScreen } from '@/screens/messages';

export type Screen = 'home' | 'discover' | 'search' | 'profile' | 'messages';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [composerOpen, setComposerOpen] = useState(false);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="grain" />
        <div className="app-shell">
          <TopBar onSearch={() => go('search')} />
          <div className="content-area">
            {screen === 'home' && <HomeScreen onCompose={() => setComposerOpen(true)} />}
            {screen === 'discover' && <DiscoverScreen />}
            {screen === 'search' && <SearchScreen onBack={() => go('home')} />}
            {screen === 'profile' && <ProfileScreen />}
            {screen === 'messages' && <MessagesScreen />}
          </div>
          <BottomNav screen={screen} go={go} onCompose={() => setComposerOpen(true)} />
        </div>
        {composerOpen && <Composer onClose={() => setComposerOpen(false)} />}
      </div>
    </div>
  );
}

export default App;
