export interface CarouselOptions {
  items?: number | { [k in number]: number };
  margin?: number;
  autoplay?: boolean;
  interval?: number;
}
