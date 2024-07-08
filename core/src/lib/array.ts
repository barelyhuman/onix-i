export const takeFirst = <T>(arr: T[]) => {
  return arr.slice(0, 1)?.[0]
}

export type CurriedFunction<A extends unknown[], R> = {
  (...args: A): R
  <T extends A[0]>(arg1: T): CurriedFunction<
    A extends [unknown, ...infer Tail] ? Tail : [],
    R
  >
}

/**
 * A simple dynamically typed curry
 * function that handles the most basic cases pretty well
 * It isn't a perfectly typed variant but better than using curry2, curry3 even
 * for the most basic of types
 * @param fn the function definition to be curried
 * @returns a curried function with types infered
 */
export function curry<A extends unknown[], R>(
  fn: (...args: A) => R
): CurriedFunction<A, R> {
  const arity = fn.length
  const curried = (...args: A) => {
    if (args.length >= arity) {
      return fn(...args)
    } else {
      // @ts-expect-error adding any hard inference here will break the
      // initial inference
      return (...nextArgs) => curried(...args, ...nextArgs)
    }
  }
  return curried as CurriedFunction<A, R>
}
