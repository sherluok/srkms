// https://2ality.com/2022/10/javascript-decorators.html
type ClassMethodDecorator<This, Args extends any[], Ret> = (
  original: (...args: Args) => Ret,
  context: ClassMethodDecoratorContext<This, (...args: Args) => Ret>,
) => void | ((...args: Args) => Ret);

export function bind() {
  return <This, Args extends any[], Ret>(
    original: (...args: Args) => Ret,
    context: ClassMethodDecoratorContext<This, (...args: Args) => Ret>,
  ) => {
    context.addInitializer(function () {
      (this as any)[context.name] = context.access.get(this).bind(this);
    });
  }
}

export function log() {
  return <This extends object, Args extends any[], Ret>(
    original: (...args: Args) => Ret,
    context: ClassMethodDecoratorContext<This, (...args: Args) => Ret>,
  ) => {
    return function (this: This, ...args: Args): Ret {
      const label = [
        ['\x1b[38;2;78;201;176m', this.constructor.name],
        ['\x1b[38;2;204;204;204m', '.'],
        ['\x1b[38;2;220;220;170m', context.name.toString()],
        ['\x1b[38;2;255;215;0m', '('],
        ['\x1b[38;2;206;145;120m', args.map((arg) => JSON.stringify(arg)).join(', ')],
        ['\x1b[38;2;255;215;0m', ')'],
        ['\x1b[35m', ' %dms'],
        ['\x1b[0m'],
      ].flat().join('');
      const start = performance.now();
      const ret = original.call(this, ...args);
      if (ret instanceof Promise) {
        return ret.finally(() => {
          console.log(label, Math.round(performance.now() - start));
        }) as Ret;
      } else {
        console.log(label, Math.round(performance.now() - start));
        return ret;
      }
    }
  }
}
