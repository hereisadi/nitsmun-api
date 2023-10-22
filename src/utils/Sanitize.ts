import { JSDOM } from "jsdom";
import DOMPurify, { DOMPurifyI } from "dompurify";

let window: any;
let DOMPurifyInstance: DOMPurifyI;

export const Globals = () => {
  const { window: newWindow } = new JSDOM("");
  window = newWindow;
  DOMPurifyInstance = DOMPurify(window);
};

export const sanitizeInput = (input: string): string => {
  return DOMPurifyInstance.sanitize(input);
};
