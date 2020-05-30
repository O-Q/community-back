import { File } from 'fastify-multer/lib/interfaces';
import * as jimp from 'jimp';

export function isImageFile(file: File) {
    return ['image/jpeg', 'image/png'].includes(file.mimetype);
}

export function getFileFormat(file: File) {
    return file.mimetype.split('/')[1];
}

export async function resizeImage(address: string, _: { width: number, height: number }) {
    const { width, height } = _;
    const image = await jimp.read(address);
    image.resize(width, height);
    image.quality(90);
    await image.writeAsync(address);
}
