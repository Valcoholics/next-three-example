declare namespace THREE {
  export class Math extends THREE {
    constructor(degToRad: number);
  }
}

declare module "*.glsl" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

// Add more declarations as needed
