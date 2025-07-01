import {
  DownloadOutlined
} from '@ant-design/icons';
import type { NotificationArgsProps } from 'antd';
import { Button, notification } from 'antd';
import { createContext, FC, MouseEventHandler, useEffect, useMemo, useRef } from 'react';

const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())

const isIosInStandaloneMode = () =>
  ('standalone' in window.navigator) && (window.navigator.standalone)

const isNonIosStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches

type NotificationPlacement = NotificationArgsProps['placement'];

const Context = createContext({ name: 'Default' });

export const DownloadAppBtn: FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const deferredPromptRef = useRef<any | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIosRef = useRef(isIos());

  useEffect(() => {
    console.log({ isIosRef });

    if (isIosRef.current) return;
    const preservePrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later
      if (!deferredPromptRef) return;
      deferredPromptRef.current = event;
    }

    window.addEventListener('beforeinstallprompt', preservePrompt);

    return () => {
      // Clean up the event listener
      window.removeEventListener('beforeinstallprompt', preservePrompt);
    }
  }, [isIosRef.current])

  useEffect(() => {
    const openDownloadNotification = () => {
      openNotification('top')
    }

    timeoutRef.current = setTimeout(() => {
      if (isIosRef.current) return;
      openDownloadNotification();
    }, 1000);

    return () => {
      if (isIosRef.current) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

  }, []);

  const downloadAppBtnClick: MouseEventHandler<HTMLElement> = async (event) => {
    console.log({ deferredPromptRef });

    if (!deferredPromptRef.current) return;

    // Show the install prompt
    deferredPromptRef.current.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPromptRef.current.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    deferredPromptRef.current = null;
  }

  const openNotification = (placement: NotificationPlacement) => {
    api.info({
      message: `Ներբեռնե՞լ հավելվածը`,
      duration: 0,
      icon: ' ',
      description: <Context.Consumer>{() => {
        return (
          <Button
            type="primary"
            style={{ width: '100%' }}
            onClick={downloadAppBtnClick}
            icon={<DownloadOutlined />}
          >
            Ներբեռնել
          </Button>
        )
      }}</Context.Consumer>,
      placement,
    });
  };

  const contextValue = useMemo(() => ({ name: 'Ant Design' }), []);

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
    </Context.Provider>
  );
};