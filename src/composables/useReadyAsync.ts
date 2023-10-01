const _intervalMsec = 100;

export function isReadyAsync(isReady: () => boolean, timeout: number = 0) {
  return new Promise<boolean>((resolve) => {
    if (isReady()) {
      resolve(true);
      return;
    }
    // eslint-disable-next-line no-undef-init
    let timeoutId = undefined;
    const intervalId = setInterval(() => {
      if (isReady()) {
        if (timeoutId) clearTimeout(timeoutId);
        clearInterval(intervalId);
        resolve(true);
      }
    }, _intervalMsec);

    if (timeout) {
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        resolve(false);
      }, timeout);
    }
  });
}

export function useReadyAsync(isReady: () => boolean, timeout: number = 0) {
  const ready = () => isReadyAsync(isReady, timeout);
  return {
    ready,
  };
}
