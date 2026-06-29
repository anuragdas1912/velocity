import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AppProvider } from '@/context/AppContext';

export default function TabLayout() {
  return (
    <AppProvider>
      <ThemeProvider value={DarkTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </AppProvider>
  );
}
