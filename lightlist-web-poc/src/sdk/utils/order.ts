/**
 * 浮動小数を利用した order フィールド管理
 *
 * 整数 order（0, 1, 2, ...）の問題点：
 * - 並び替え時に複数の order を更新する必要がある
 * - 並行更新時に競合が発生しやすい
 * - 小数 order（1.5, 2.25, ...）を利用することで、
 *   ドラッグされたタスク1件のみの order 更新で完結する
 */

/**
 * order の最小間隔（reindex の判定閾値）
 * これより小さい間隔になったら reindex が必要
 */
export const MIN_ORDER_GAP = 0.0001;

/**
 * order が枯渇しているかチェック
 * @param prevOrder 前の order
 * @param nextOrder 次の order
 * @returns reindex が必要か
 */
export function needsReindex(prevOrder: number, nextOrder: number): boolean {
  return Math.abs(nextOrder - prevOrder) < MIN_ORDER_GAP;
}

/**
 * タスク配列から order リストを抽出・ソート
 * @param tasks タスク配列
 * @returns order 配列（昇順）
 */
function getOrdersFromTasks(tasks: Array<{ order: number }>): number[] {
  return tasks.map((task) => task.order).sort((a, b) => a - b);
}

/**
 * 新規タスク挿入時の order を計算
 * @param tasks 既存タスク配列
 * @param insertPosition 挿入位置 ("top" | "bottom")
 * @param targetTaskId 中間挿入時の対象タスク ID（指定時は prevTaskId との中間に挿入）
 * @param prevTaskId 前のタスク ID（中間挿入時）
 * @returns 計算された order 値
 */
export function calculateOrderForInsert(
  tasks: Array<{ id: string; order: number }>,
  insertPosition: "top" | "bottom" = "bottom",
  targetTaskId?: string,
  prevTaskId?: string,
): number {
  if (tasks.length === 0) {
    return 1.0;
  }

  const orders = getOrdersFromTasks(tasks);

  // 中間挿入（ドラッグ&ドロップ時）
  if (targetTaskId && prevTaskId) {
    const targetTask = tasks.find((t) => t.id === targetTaskId);
    const prevTask = tasks.find((t) => t.id === prevTaskId);

    if (targetTask && prevTask) {
      const newOrder = (prevTask.order + targetTask.order) / 2;

      // reindex が必要かチェック
      if (needsReindex(prevTask.order, targetTask.order)) {
        // 後述の reindexOrders で処理するため、一時的な値を返す
        // 実装では reindex フローで対応
        return newOrder;
      }

      return newOrder;
    }
  }

  // 先頭挿入
  if (insertPosition === "top") {
    const firstOrder = Math.min(...orders);
    return firstOrder / 2;
  }

  // 末尾挿入
  const lastOrder = Math.max(...orders);
  return lastOrder + 1.0;
}

/**
 * reindex: order の再割り当て
 * 小数が密集した場合、全タスクの order を再割り当てする
 * @param tasks タスク配列
 * @returns order が再割り当てされた新しいタスク配列
 */
export function reindexOrders(
  tasks: Array<{ id: string; order: number }>,
): Array<{ id: string; order: number }> {
  // order でソートして、1.0, 2.0, 3.0, ... に再割り当て
  const sorted = [...tasks].sort((a, b) => a.order - b.order);

  return sorted.map((task, index) => ({
    ...task,
    order: (index + 1) * 1.0,
  }));
}

/**
 * ドラッグ&ドロップ時の order 計算（改善版）
 * 1件のタスク移動時のみ order を計算
 * @param tasks タスク配列（order でソート済み）
 * @param draggedTaskId ドラッグされたタスク ID
 * @param targetTaskId ドロップ先のタスク ID（この前に挿入）
 * @returns { newOrder, needsReindexing }
 */
export function calculateDragDropOrder(
  tasks: Array<{ id: string; order: number }>,
  draggedTaskId: string,
  targetTaskId: string,
): {
  newOrder: number;
  needsReindexing: boolean;
} {
  const draggedTask = tasks.find((t) => t.id === draggedTaskId);
  const targetTask = tasks.find((t) => t.id === targetTaskId);

  if (!draggedTask || !targetTask) {
    throw new Error("Task not found");
  }

  // ドラッグされたタスクが対象の前に来る場合
  if (draggedTask.order > targetTask.order) {
    // 対象の前のタスクを探す
    const prevTask = tasks
      .filter((t) => t.order < targetTask.order)
      .sort((a, b) => b.order - a.order)[0];

    if (prevTask) {
      const newOrder = (prevTask.order + targetTask.order) / 2;
      const reindex = needsReindex(prevTask.order, targetTask.order);
      return { newOrder, needsReindexing: reindex };
    } else {
      // 先頭に挿入
      const newOrder = targetTask.order / 2;
      return { newOrder, needsReindexing: false };
    }
  } else {
    // ドラッグされたタスクが対象の後ろに来る場合
    const nextTask = tasks
      .filter((t) => t.order > targetTask.order)
      .sort((a, b) => a.order - b.order)[0];

    if (nextTask) {
      const newOrder = (targetTask.order + nextTask.order) / 2;
      const reindex = needsReindex(targetTask.order, nextTask.order);
      return { newOrder, needsReindexing: reindex };
    } else {
      // 末尾に挿入
      const newOrder = targetTask.order + 1.0;
      return { newOrder, needsReindexing: false };
    }
  }
}

/**
 * 複数の order に対して reindex が必要か総合判定
 * @param orders order 配列
 * @returns reindex が必要か
 */
export function shouldReindex(orders: number[]): boolean {
  const sorted = [...orders].sort((a, b) => a - b);

  for (let i = 0; i < sorted.length - 1; i++) {
    if (needsReindex(sorted[i], sorted[i + 1])) {
      return true;
    }
  }

  return false;
}
