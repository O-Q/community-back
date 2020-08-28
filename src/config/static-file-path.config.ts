export const STATIC_FILE_PATH_FRONT = 'assets';
export let STATIC_FILE_PATH_BACK: string;
if (process.platform === 'win32') {
    STATIC_FILE_PATH_BACK = '../src/assets';
} else {
    STATIC_FILE_PATH_BACK = '/var/www/dev/assets';
}
