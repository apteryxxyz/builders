import { resolveMdnLink } from '@builders/mdn-link-resolver';
import { highlight, Token } from '@code-hike/lighter';
import {
  ExcerptTokenKind,
  type ApiModel,
  type Excerpt,
} from '@microsoft/api-extractor-model';
import * as prettier from 'prettier';

export async function highlightSyntax(
  options: { code: string } | { excerpt: Excerpt; model?: ApiModel },
) {
  let code = 'code' in options ? options.code : '';
  let references = new Map<string, string>();

  if ('excerpt' in options) {
    const embedded = embedExcerptInformation(options.excerpt, options.model);
    code = embedded.code;
    references = embedded.references;
  }

  const formatted = await prettier
    .format(code, { parser: 'typescript', printWidth: 100, semi: false })
    // Sometimes adds a semicolon when formatting types, remove it
    .then((code) => (code.startsWith(';') ? code.slice(1) : code))
    // Sometimes errors when formatting types, just return the original code
    .catch(() => code);

  const highlighted = await highlight(
    formatted.trim(),
    'tsx',
    'material-from-css',
  );

  return highlighted.lines.map((l) => l.map((t) => handleToken(t, references)));
}

function embedExcerptInformation(excerpt: Excerpt, model?: ApiModel) {
  const references = new Map<string, string>();

  const parts = excerpt.spannedTokens.map((token) => {
    if (token.kind !== ExcerptTokenKind.Reference) return token.text;
    const index = String(references.size + 1);

    const source = token.canonicalReference?.source;
    if (source && 'packageName' in source) {
      let url;
      if (source.packageName === 'zod') url = 'https://zod.dev';

      if (url) {
        references.set(index, url);
        return `${token.text}__out_${index}`;
      }
    }

    const item = model?.resolveDeclarationReference(
      token.canonicalReference!,
      model,
    ).resolvedApiItem;
    if (item) {
      const reference = item.canonicalReference.toString();
      const path = reference.split('!')[1].split(':')[0];
      references.set(index, path);
      return `${token.text}__ref_${index}`;
    }

    const url = resolveMdnLink(token.text);
    if (url) {
      references.set(index, url);
      return `${token.text}__out_${index}`;
    }

    return token.text;
  });

  return { code: parts.join(''), references };
}

function handleToken(token: Token, references = new Map<string, string>()) {
  // Remove the font style, don't like italics
  delete token.style.fontStyle;

  // Need to prefix with a space to avoid matching the first character
  const isReference = (' ' + token.content)
    .match(/(.*?)?([a-z0-9]+)__([a-z]+)_([0-9]+)(.*?)?/i)
    ?.map((m, i) => (i === 1 ? m.slice(1) : m));
  if (isReference) {
    const [prefix, content, type, valueIndex, suffix] = isReference.slice(1);
    const value = references.get(valueIndex)!;
    return { ...token, prefix, content, suffix, meta: { type, value } };
  }

  const content = token.content === '' ? '\n' : token.content;
  return { ...token, content, prefix: '', suffix: '', meta: undefined };
}
