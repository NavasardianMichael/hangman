import {
  DownloadOutlined
} from '@ant-design/icons';
import type { NotificationArgsProps } from 'antd';
import { Button, Carousel, Modal, notification } from 'antd';
import { createContext, FC, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hint1Img from "assets/images/hint1.png";
import Hint2Img from "assets/images/hint2.png";
import Hint3Img from "assets/images/hint3.png";

const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
let deferredPrompt: any = null;

const isIosInStandaloneMode = () =>
  ('standalone' in window.navigator) && (window.navigator.standalone)

const isNonIosStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches

type NotificationPlacement = NotificationArgsProps['placement'];

const Context = createContext({ name: 'Default' });

export const DownloadAppBtn: FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const [showIosDownloadAppHintModal, setShowIosDownloadAppHintModal] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIosRef = useRef(isIos());
  const isAppInstalledRef = useRef(localStorage.getItem('pwa-installed') === 'true');

  const setAppInstalled = useCallback(() => {
    localStorage.setItem('pwa-installed', 'true')
    isAppInstalledRef.current = true;
  }, [isAppInstalledRef.current])

  useEffect(() => {
    if (isAppInstalledRef.current) return setAppInstalled();

    if (isIosRef.current) {
      if (isIosInStandaloneMode()) return setAppInstalled();;
      setShowIosDownloadAppHintModal(true)
      return
    };

    if (isNonIosStandaloneMode()) return setAppInstalled();;

    const preservePrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = event;
    }
    window.addEventListener('beforeinstallprompt', preservePrompt);

    return () => {
      if (isIosRef.current) return;
      window.removeEventListener('beforeinstallprompt', preservePrompt);
    }
  }, [])

  useEffect(() => {
    window.addEventListener('appinstalled', setAppInstalled)
    return () => window.removeEventListener('appinstalled', setAppInstalled);
  }, [])

  useEffect(() => {
    if (isAppInstalledRef.current) return;

    const openDownloadNotification = () => {
      openNotification('top')
    }

    if (!isIosRef.current) {
      timeoutRef.current = setTimeout(() => {
        openDownloadNotification();
      }, 1000);
    }

    return () => {
      if (isIosRef.current) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  const downloadAppBtnClick: MouseEventHandler<HTMLElement> = async (event) => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') setAppInstalled()

    deferredPrompt = null;
  }

  const openNotification = (placement: NotificationPlacement) => {
    api.info({
      message: <b>Ներբեռնե՞լ հավելվածը</b>,
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
    <>
      {
        <Modal
          title="Ինչպե՞ս ներբեռնել հավելվածը"
          centered
          width={'80%'}
          open={showIosDownloadAppHintModal}
          onCancel={() => setShowIosDownloadAppHintModal(false)}
          okButtonProps={{
            style: { display: 'none' }
          }}
          cancelButtonProps={{
            style: { display: 'none' }
          }}
        >
          <div style={{ maxHeight: '80vh', boxSizing: 'border-box' }}>

            <Carousel autoplay arrows dots dotPosition='bottom' >
              <div>
                <img src={Hint1Img} alt="Hint 1" style={{ margin: 'auto', maxWidth: '100%', maxHeight: '80vh', objectFit: 'cover' }} />
              </div>
              <div>
                <img src={Hint2Img} alt="Hint 2" style={{ margin: 'auto', maxWidth: '100%', maxHeight: '80vh', objectFit: 'cover' }} />
              </div>
              <div>
                <img src={Hint3Img} alt="Hint 3" style={{ margin: 'auto', maxWidth: '100%', maxHeight: '80vh', objectFit: 'cover' }} />
              </div>
            </Carousel>
          </div>
        </Modal>
      }
      <Context.Provider value={contextValue}>
        {contextHolder}
      </Context.Provider>
    </>
  );
};