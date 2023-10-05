import { nextTick, ref } from "vue";
import { isReadyAsync } from "./useReadyAsync";

const tuple = <T extends string[]>(...args: T) => args;

/**
 *
 * @param waitUntil 0 を指定した時はロックが解除されるまで待ちます
 * @param keys
 */
export function useExclusiveOperation<T extends string[]>(
  waitUntil: number,
  ...keys: T
) {
  const keyTuple = tuple(...keys);

  const lockedKeyMap = ref<{ [key: string]: boolean }>(
    keyTuple.reduce<{ [key: string]: boolean }>(
      (pre, cur) => ({
        ...pre,
        [cur]: false,
      }),
      {},
    ),
  );

  const lock = (key: (typeof keyTuple)[number]) => {
    lockedKeyMap.value = {
      ...lockedKeyMap.value,
      [key]: true,
    };
  };

  const release = (key: (typeof keyTuple)[number]) => {
    lockedKeyMap.value = {
      ...lockedKeyMap.value,
      [key]: false,
    };
  };

  const doOperation = async (
    key: (typeof keyTuple)[number],
    operation: () => void | Promise<void>,
    onTimeout?: () => void | Promise<void>,
  ) => {
    if (!(await isReadyAsync(() => !lockedKeyMap.value[key], waitUntil))) {
      if (onTimeout) await onTimeout();
      return;
    }
    lock(key);
    await nextTick();

    try {
      await operation();
    } catch (error) {
      console.error("An error occurred while processing operation.", error);
      throw error;
    } finally {
      release(key);
    }
    await nextTick();
  };

  return {
    doOperation,
  };
}
