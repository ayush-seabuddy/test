import { store } from '@/src/redux/store';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';

export default function HomeLayout() {

  
  return (
     <Provider store={store}>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
    </Provider>
  );
}