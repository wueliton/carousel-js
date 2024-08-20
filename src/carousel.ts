import { CarouselOptions } from "./types";

type ApplyStyles = Partial<{
  [k in keyof CSSStyleDeclaration]: CSSStyleDeclaration[k];
}>;

function applyStyles(this: HTMLElement, styles: ApplyStyles) {
  Object.assign(this.style, styles);
}

HTMLElement.prototype.addStyles = applyStyles;

declare global {
  interface HTMLElement {
    addStyles(styles?: ApplyStyles): void;
  }

  interface Element {
    addStyles(styles?: ApplyStyles): void;
  }
}

export class Carousel {
  #element: HTMLElement;
  #options: CarouselOptions | null | undefined;
  #slide = 0;
  #childSize = 0;
  #interval?: number;
  get infiniteScroll() {
    return this.#element.querySelector(".infinite-scroll")!;
  }
  get maxSlides() {
    return (this.infiniteScroll.children.length || 1) - 1;
  }

  constructor(
    el: keyof HTMLElementTagNameMap | string,
    options?: CarouselOptions
  ) {
    this.#element = document.querySelector(el)!;
    this.#options = options;
    this.#element.addEventListener("mousedown", this.onMouseDown);
    this.#element.addEventListener("touchstart", this.onMouseDown);
    window.addEventListener("resize", this.onResize);
    this.setItemsWidth();
    this.changeActiveItem();
    this.autoplay();
  }

  private calculateItemSize() {
    const { width } = this.#element.getBoundingClientRect();
    return width;
  }

  private autoplay = () => {
    if (!this.#options?.autoplay) return;

    this.#interval = setInterval(() => {
      this.next();
    }, this.#options?.interval || 5000);
  };

  private setItemsWidth() {
    const childSize = this.calculateItemSize();
    const childs = Array.from(this.infiniteScroll.children);
    this.#childSize = childSize;
    this.infiniteScroll.addStyles({
      width: `${childs.length * childSize}px`,
      transform: `translateX(${childSize * this.#slide * -1}px)`,
    });
    childs.forEach((child) =>
      child.addStyles({
        width: `${childSize}px`,
        display: "block",
      })
    );
  }

  private onResize = () => {
    this.setItemsWidth();
  };

  private mouseMove(
    eventClientX: number,
    clientX: number,
    transformX: number,
    listWidth: number
  ) {
    let left = eventClientX - clientX + transformX;
    left = left > 0 ? 0 : left < listWidth * -1 ? listWidth * -1 : left;
    this.infiniteScroll.addStyles({
      transform: `translateX(${left}px)`,
    });
  }

  private mouseUp(upClientX: number, clientX: number) {
    const direction = upClientX > clientX ? "previous" : "next";
    this[direction]();
  }

  private onMouseDown = (downEvent: MouseEvent | TouchEvent) => {
    if (
      downEvent.type === "mousedown" &&
      (downEvent as MouseEvent).button !== 0
    )
      return;
    const transformX = this.getScrollTransformX();
    const infiniteScrollWidth =
      this.infiniteScroll.getBoundingClientRect().width - this.#childSize;
    const clientX =
      downEvent.type === "mousedown"
        ? (downEvent as MouseEvent).clientX
        : (downEvent as TouchEvent).touches[0].clientX;

    if (downEvent.type === "mousedown") {
    }

    const mouseMove = (event: MouseEvent | TouchEvent) => {
      this.mouseMove(
        event.type === "mousemove"
          ? (event as MouseEvent).clientX
          : (event as TouchEvent).touches[0].clientX,
        clientX,
        transformX,
        infiniteScrollWidth
      );
    };
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("touchmove", mouseMove);
    const mouseUp = (upEvent: MouseEvent | TouchEvent) => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("touchmove", mouseMove);
      window.removeEventListener("touchend", mouseUp);
      this.mouseUp(
        upEvent.type === "mouseup"
          ? (upEvent as MouseEvent).clientX
          : (upEvent as TouchEvent).changedTouches[0].clientX,
        clientX
      );
    };
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("touchend", mouseUp);
  };

  private getScrollTransformX() {
    const transform = new DOMMatrix(
      window.getComputedStyle(this.infiniteScroll).transform
    );
    const transformX = transform.m41 || 0;
    return transformX;
  }

  private animateTransform(transform: number) {
    this.infiniteScroll.addStyles({
      transform: `translateX(${transform}px)`,
      transition: "transform 0.2s",
    });

    setTimeout(() => {
      this.infiniteScroll.addStyles({
        transition: "none",
      });
    }, 200);
  }

  private changeActiveItem() {
    this.infiniteScroll
      .querySelectorAll(".active")
      .forEach((el) => el.classList.remove("active"));
    this.infiniteScroll.children[this.#slide].classList.add("active");
  }

  next() {
    clearInterval(this.#interval);
    let slide = this.#slide + 1;
    if (slide > this.maxSlides) slide = 0;
    this.#slide = slide;
    this.changeActiveItem();
    this.animateTransform(this.#childSize * slide * -1);
    this.autoplay();
  }

  previous() {
    clearInterval(this.#interval);
    let slide = this.#slide - 1;
    if (slide < 0) slide = 0;
    this.#slide = slide;
    this.changeActiveItem();
    this.animateTransform(this.#childSize * slide * -1);
    this.autoplay();
  }
}

(window as any).createCarousel = (
  el: keyof HTMLElementTagNameMap | string,
  options?: CarouselOptions
) => new Carousel(el, options);
