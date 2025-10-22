/**
 * Polling Coordinator - Manages intervals with web-standard Page Visibility API
 * Automatically pauses/resumes based on tab visibility
 */

interface PollingConfig {
  activeInterval: number;
  backgroundInterval: number;
  pauseOnHidden?: boolean;
}

interface PollingTask {
  id: string;
  fn: () => void | Promise<void>;
  config: PollingConfig;
  intervalId?: number;
  isActive: boolean;
}

export class PollingCoordinator {
  private tasks = new Map<string, PollingTask>();
  private isDocumentVisible = true;
  private visibilityHandler?: () => void;

  constructor() {
    this.setupVisibilityHandling();
  }

  /**
   * Register a polling task
   */
  register(id: string, fn: () => void | Promise<void>, config: PollingConfig): void {
    // Clear existing task if it exists
    this.unregister(id);

    const task: PollingTask = {
      id,
      fn,
      config: {
        pauseOnHidden: true,
        ...config
      },
      isActive: true
    };

    this.tasks.set(id, task);
    this.startTask(task);
  }

  /**
   * Unregister a polling task
   */
  unregister(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      this.stopTask(task);
      this.tasks.delete(id);
    }
  }

  /**
   * Pause a specific task
   */
  pause(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.isActive = false;
      this.stopTask(task);
    }
  }

  /**
   * Resume a specific task
   */
  resume(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.isActive = true;
      this.startTask(task);
    }
  }

  /**
   * Pause all tasks
   */
  pauseAll(): void {
    this.tasks.forEach(task => {
      task.isActive = false;
      this.stopTask(task);
    });
  }

  /**
   * Resume all tasks
   */
  resumeAll(): void {
    this.tasks.forEach(task => {
      task.isActive = true;
      this.startTask(task);
    });
  }

  /**
   * Get task status
   */
  getTaskStatus(id: string): { isRegistered: boolean; isActive: boolean; interval?: number } {
    const task = this.tasks.get(id);
    if (!task) {
      return { isRegistered: false, isActive: false };
    }

    return {
      isRegistered: true,
      isActive: task.isActive && !!task.intervalId,
      interval: this.getTaskInterval(task)
    };
  }

  /**
   * Get all registered tasks
   */
  getTasks(): string[] {
    return Array.from(this.tasks.keys());
  }

  /**
   * Cleanup all tasks (call on unmount)
   */
  destroy(): void {
    this.tasks.forEach(task => this.stopTask(task));
    this.tasks.clear();
    this.removeVisibilityHandling();
  }

  private startTask(task: PollingTask): void {
    if (!task.isActive) return;

    // Don't start if document is hidden and task should pause
    if (!this.isDocumentVisible && task.config.pauseOnHidden) {
      return;
    }

    const interval = this.getTaskInterval(task);

    task.intervalId = window.setInterval(async () => {
      try {
        await task.fn();
      } catch (error) {
        console.error(`Polling task ${task.id} failed:`, error);
      }
    }, interval);
  }

  private stopTask(task: PollingTask): void {
    if (task.intervalId) {
      clearInterval(task.intervalId);
      task.intervalId = undefined;
    }
  }

  private getTaskInterval(task: PollingTask): number {
    return this.isDocumentVisible
      ? task.config.activeInterval
      : task.config.backgroundInterval;
  }

  private setupVisibilityHandling(): void {
    if (typeof document === 'undefined') return;

    // Use standard Page Visibility API
    const handleVisibilityChange = () => {
      this.isDocumentVisible = !document.hidden;

      if (this.isDocumentVisible) {
        this.handleDocumentVisible();
      } else {
        this.handleDocumentHidden();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Store reference for cleanup
    this.visibilityHandler = handleVisibilityChange;
  }

  private removeVisibilityHandling(): void {
    if (typeof document === 'undefined') return;

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = undefined;
    }
  }

  private handleDocumentVisible(): void {
    // Restart all tasks with active intervals
    this.tasks.forEach(task => {
      if (task.isActive && task.config.pauseOnHidden) {
        this.stopTask(task);
        this.startTask(task);
      }
    });
  }

  private handleDocumentHidden(): void {
    // Switch all tasks to background intervals or pause them
    this.tasks.forEach(task => {
      if (task.isActive && task.config.pauseOnHidden) {
        this.stopTask(task);
        this.startTask(task);
      }
    });
  }
}

// Default instance
export const pollingCoordinator = new PollingCoordinator();
