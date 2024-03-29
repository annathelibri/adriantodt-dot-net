import { ObjectCache } from './ObjectCache';

export class FallingDotImageGenerator {
  private bottleneck?: Promise<any>;

  private cache = new ObjectCache<Promise<ImageBitmap>>(1000);

  async generate(color: string, size: number, speed: number) {
    if (this.bottleneck) {
      await this.bottleneck;
    }
    const key = `${color}///${size}///${speed}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const canvas = document.createElement('canvas');
    let max = speed * size + 1;
    canvas.width = max;
    canvas.height = max;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // ctx.fillStyle = '#ff0000';
    // ctx.fillRect(0,0,canvas.width,canvas.height);
    // ctx.clearRect(1,1,canvas.width-2,canvas.height-2);

    for (let i = 0; i < size * 2; i++) {
      ctx.fillStyle = color;
      const at = max - speed * i, sz = size - Math.floor(i / 1.5);
      if (sz <= 0) {
        break;
      }
      ctx.fillRect(at, at, sz, sz);
      color = FallingDotImageGenerator.darkerShade(color);
    }

    let promise = new Promise<ImageBitmap>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Failed to generate blob'));
          return;
        }
        resolve(
          createImageBitmap(blob).then(bitmap => {
            return bitmap;
          })
        );
      });
    });
    this.cache.set(key, promise);
    this.bottleneck = this.bottleneck ? this.bottleneck.then(async () => await promise && null) : promise.then(() => null);
    return promise;
  }

  private static darkerShade(color: string) {
    const rgb = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)!;
    const r = Math.floor(parseInt(rgb[1], 16) * 0.75);
    const g = Math.floor(parseInt(rgb[2], 16) * 0.75);
    const b = Math.floor(parseInt(rgb[3], 16) * 0.75);
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
}
