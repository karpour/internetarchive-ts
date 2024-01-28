export default function sleepMs(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}