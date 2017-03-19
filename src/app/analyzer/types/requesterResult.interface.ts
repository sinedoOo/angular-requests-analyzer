export interface RequesterResult {
    count: number,
    interrupts: number,
    delay: {
        min: number,
        avg: number,
        max: number
    }
}
