import {Toast} from '@shopify/polaris';
import {useCallback, useState} from 'react';

interface ShowToastParams {
  content: string;
  timeout?: number;
}
interface ShowToast {
  (args: ShowToastParams): void;
}

interface StateItem {
  id: string;
  content: string;
}

export function useToast(): [ShowToast, JSX.Element | null] {
  const [state, setState] = useState<StateItem[]>([]);

  const remove = useCallback((id: string) => {
    setState((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const removeFirst = useCallback((state: StateItem[]) => {
    if (state.length > 0) {
      return state.slice(1);
    }
    return state;
  }, []);

  const show = useCallback(
    ({content, timeout = 3_000}: ShowToastParams) => {
      setState((state) => {
        const id = getRandomNumber();

        window.setTimeout(() => remove(id), timeout);

        const newState = state.concat({id, content});
        return state.length > 4 ? removeFirst(newState) : newState;
      });
    },
    [remove, removeFirst],
  );

  const toastMarkup =
    state.length > 0
      ? state.map(({id, content}) => (
          <Toast
            key={id}
            content={content}
            onDismiss={() => {
              remove(id);
            }}
          />
        ))
      : null;

  return [show, toastMarkup as unknown as JSX.Element];
}

export function getRandomNumber() {
  return (
    String(Date.now()) +
    Math.floor(Math.random() * 9e15)
      .toString(16)
      .padStart(15, '0')
      .toUpperCase()
  );
}
