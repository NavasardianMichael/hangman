import {
  DownloadOutlined
} from '@ant-design/icons';
import type { NotificationArgsProps } from 'antd';
import { Button, notification } from 'antd';
import { createContext, MouseEventHandler, useEffect, useMemo, useRef } from 'react';

type NotificationPlacement = NotificationArgsProps['placement'];

const Context = createContext({ name: 'Default' });

let deferredPrompt: Event | null = null;
const preservePrompt = (event: Event) => {
  alert(1)
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();
  // Stash the event so it can be triggered later
  if (!deferredPrompt) return;
  deferredPrompt = event;
}

window.addEventListener('beforeinstallprompt', preservePrompt);
export const DownloadAppBtn = () => {
  const [api, contextHolder] = notification.useNotification();
  const timeout = useRef<NodeJS.Timeout | null>(null);


  // useEffect(() => {

  // return () => {
  //   // Clean up the event listener
  //   window.removeEventListener('beforeinstallprompt', preservePrompt);
  // }
  // }, [])

  useEffect(() => {
    const openDownloadNotification = () => {
      openNotification('top')
    }

    timeout.current = setTimeout(() => {
      openDownloadNotification();
    }, 1000);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    }

  }, []);

  const downloadAppBtnClick: MouseEventHandler<HTMLElement> = async (event) => {
    console.log({ deferredPrompt });

    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    deferredPrompt = null;
  }

  const openNotification = (placement: NotificationPlacement) => {
    api.info({
      message: `Notification ${placement}`,
      description: <Context.Consumer>{() => {
        return (
          <Button
            type="dashed"
            style={{ width: '100%' }}
            onClick={downloadAppBtnClick}
            icon={<DownloadOutlined />}
          >
            Ներբեռնել հավելվածը
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