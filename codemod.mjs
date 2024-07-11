import { parse, print } from 'recast'
import { transformFromAstSync } from '@babel/core'

function babelRecast(code) {
  const ast = parse(code, { parser: require('recast/parsers/babel') })
  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: [sanitizeExports],
  }
  const { ast: transformedAST } = transformFromAstSync(ast, code, options)
  const result = print(transformedAST).code
  return result
}

function sanitizeExports(babel) {
  const { types: t } = babel

  return {
    name: 'ast-transform', // not required
    visitor: {
      AssignmentExpression(path) {
        if (path.node.left.type === 'MemberExpression') {
          if (
            path.node.left.object.name === 'module' &&
            path.node.left.property.name === 'exports'
          ) {
            if (t.isExpression(path)) {
              path.parentPath.replaceWith(
                t.exportDefaultDeclaration(path.node.right)
              )
            }
          }
        }
      },
    },
  }
}

export default function jsCodeShift(file) {
  console.log({
    d: file.source,
  })
  const transformedSource = babelRecast(file.source, file.path)
  return transformedSource
}
