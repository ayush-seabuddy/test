// hooks/useExitOnBack.ts
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

type UseExitOnBackProps = {
  onConfirmExit: () => void;
};

export const useExitOnBack = ({ onConfirmExit }: UseExitOnBackProps) => {
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      // Only intercept if we CANNOT go back (i.e., we're at root)
      if (!router.canGoBack()) {
        onConfirmExit(); // Show your modal
        return true; // Prevent default back action
      }
      return false; // Let normal navigation happen
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [router, onConfirmExit]);
};