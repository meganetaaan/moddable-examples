import { NeoMatrixRender } from "neomatrix-render";
import Bitmap from 'commodetto/Bitmap'
import parseBMP from "commodetto/parseBMP";
import Poco from "commodetto/Poco";
import Resource from "Resource";

const heart = parseBMP(new Resource("heart-color.bmp"));
heart.alpha = parseBMP(new Resource("heart-alpha.bmp"));

let display = new NeoMatrixRender({
  width: 16,
  height: 16,
  pixelFormat: Bitmap.RGB565LE,
  pin: 21
});
let render = new Poco(display, {
  pixels: 256
});

const red = render.makeColor(255, 0, 0);
render.begin();
render.fillRectangle(red, 0, 0, 16, 16);
render.drawMasked(heart, 0, 0, 0, 0, 16, 16, heart.alpha, 0, 0);
render.end();
