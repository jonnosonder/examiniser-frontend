export {}

declare global {
  interface Window {
    gtag: Gtag.GtagFunction
  }

  namespace Gtag {
    /**
     * Base structure for GA config parameters
     */
    interface ConfigParams {
      page_title?: string
      page_path?: string
      send_page_view?: boolean
      [key: string]: string | number | boolean | undefined
    }

    /**
     * Base structure for GA event parameters
     */
    interface EventParams {
      event_category?: string
      event_label?: string
      value?: number
      [key: string]: string | number | boolean | undefined
    }

    /**
     * Structure for control parameters (e.g. callback and timeout)
     */
    interface ControlParams {
      send_to?: string
      event_callback?: () => void
      event_timeout?: number
      [key: string]: unknown
    }

    /**
     * Global gtag function definition with overloads
     */
    type GtagFunction = {
      (command: 'js', config: Date): void
      (command: 'config', measurementId: string, config?: ConfigParams): void
      (command: 'event', eventName: string, params?: EventParams | ControlParams): void
    }
  }
}
