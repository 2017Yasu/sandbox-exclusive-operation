import { nextTick, ref } from "vue";
import { isReadyAsync } from "./useReadyAsync";

const tuple = <T extends string[]>(...args: T) => args;

/**
 *
 * @param waitUntil 0 を指定した時はロックが解除されるまで待つ
 * @param keys
 */
export function useExclusiveOperation<T extends string[]>(
  waitUntil: number,
  ...keys: T
) {
  const keyTuple = tuple(...keys);

  const lockedKeyMap = ref<{ [key: string]: boolean }>({});

  const doOperation = async (
    key: (typeof keyTuple)[number],
    operation: () => void | Promise<void>,
    onTimeout?: () => void | Promise<void>,
  ) => {
    if (!(await isReadyAsync(() => !lockedKeyMap.value[key], waitUntil))) {
      if (onTimeout) await onTimeout();
      return;
    }
    lockedKeyMap.value = {
      ...lockedKeyMap.value,
      [key]: true,
    };
    await nextTick();
    await operation();
    lockedKeyMap.value = {
      ...lockedKeyMap.value,
      [key]: false,
    };
    await nextTick();
  };

  return {
    doOperation,
  };
}
